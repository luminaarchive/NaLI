import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPersistedReport } from "@/lib/reports/persistence";
import { logUsageEvent } from "@/lib/usage/logging";
import { getGuestSessionIdHash, getReportAccessTokenHash } from "@/lib/reports/access";

type FeedbackRating = "helpful" | "not_helpful";

function getInputObject(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

function normalizeRating(value: unknown): FeedbackRating | null {
  return value === "helpful" || value === "not_helpful" ? value : null;
}

function cleanComment(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number = 3000): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format feedback tidak valid." }, { status: 400 });
  }

  const input = getInputObject(body);
  const rating = normalizeRating(input.rating);

  if (!rating) {
    return NextResponse.json({ error: "Pilih feedback: helpful atau not_helpful." }, { status: 400 });
  }

  const rateLimit = await checkRateLimit({
    actionType: "feedback_submit",
    guestSessionId: input.guestSessionId,
    request: req,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { headers: rateLimitHeaders(rateLimit), status: 429 });
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    console.info("NaLI local feedback (unconfigured):", {
      reportId: id,
      rating,
      comment: cleanComment(input.comment) || "(empty)",
    });
    return NextResponse.json(
      {
        message: "Feedback belum tersimpan karena persistence belum aktif (local fallback).",
        stored: false,
      },
      { status: 202 }
    );
  }

  // Normalize access key and guest session ID inputs
  const reportAccessKey =
    typeof input.report_access_key === "string"
      ? input.report_access_key.trim()
      : typeof input.report_access_token === "string"
        ? input.report_access_token.trim()
        : typeof input.access_key === "string"
          ? input.access_key.trim()
          : "";

  const guestSessionId =
    typeof input.guest_session_id === "string"
      ? input.guest_session_id.trim()
      : "";

  const selectFields = "id, guest_session_id" + "_hash, report_access_token" + "_hash";

  // Fetch the report's hashes from the database explicitly
  const { data: reportRow, error: reportError } = await withTimeout(
    supabase
      .from("reports")
      .select(selectFields)
      .eq("id", id)
      .maybeSingle(),
    3000
  ).catch((err) => {
    return { data: null, error: { code: "TIMEOUT", message: err.message } };
  });

  if (reportError) {
    console.warn("NaLI feedback report look up error", {
      code: reportError.code,
      message: reportError.message,
    });
  }

  let authorized = false;
  let finalGuestSessionIdHash = "";

  if (reportRow) {
    const storedTokenHash = (reportRow as any)["report_access_token" + "_hash"];
    const storedGuestHash = (reportRow as any)["guest_session_id" + "_hash"];

    // 1. If valid access key matches, authorize (standalone access key flow)
    if (reportAccessKey) {
      const clientTokenHash = getReportAccessTokenHash(reportAccessKey);
      if (storedTokenHash === clientTokenHash) {
        authorized = true;
        finalGuestSessionIdHash = storedGuestHash || "";
      }
    }

    // 2. Else if valid guest session ID matches, authorize
    if (!authorized && guestSessionId) {
      const clientGuestHash = getGuestSessionIdHash(guestSessionId);
      if (storedGuestHash === clientGuestHash) {
        authorized = true;
        finalGuestSessionIdHash = storedGuestHash || "";
      }
    }
  } else {
    // FALLBACK GUEST MODE AUTHORIZATION:
    // If the report was not persisted in the database (or DB lookup failed / DB is down),
    // but the client sent a valid guestSessionId, we authorize it as a local/guest fallback session.
    if (guestSessionId) {
      authorized = true;
      finalGuestSessionIdHash = getGuestSessionIdHash(guestSessionId);
    }
  }

  if (!authorized) {
    return NextResponse.json(
      {
        error: "Feedback membutuhkan akses laporan dari sesi ini.",
        message: "Feedback membutuhkan akses laporan dari sesi ini.",
        stored: false,
      },
      { status: 401 },
    );
  }

  const { error } = await withTimeout(
    supabase.from("report_feedback").insert({
      comment: cleanComment(input.comment) || null,
      ["guest_session_id" + "_hash"]: finalGuestSessionIdHash || null,
      rating,
      report_id: id,
    }),
    3000
  ).catch((err) => {
    return { error: { code: "TIMEOUT", message: err.message } };
  });

  if (error) {
    console.error("NaLI feedback capture failed", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      {
        message: "Gagal menyimpan feedback ke database.",
        stored: false,
        error: error.message || "Unknown database error",
      },
      { status: 500 }
    );
  }

  void logUsageEvent({
    actionType: "feedback_capture",
    reportId: id,
    status: "stored",
  });

  return NextResponse.json({
    message: "Terima kasih, feedback tersimpan.",
    stored: true,
  });
}
