import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPersistedReport } from "@/lib/reports/persistence";
import { logUsageEvent } from "@/lib/usage/logging";

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
    return NextResponse.json(
      {
        message: "Feedback belum tersimpan karena persistence belum aktif.",
        stored: false,
      },
      { status: 202 },
    );
  }

  const reportAccessKey =
    typeof input.report_access_key === "string"
      ? input.report_access_key
      : typeof input.report_access_token === "string"
        ? input.report_access_token
        : typeof input.access_key === "string"
          ? input.access_key
          : "";

  const persisted = await getPersistedReport({
    reportAccessToken: reportAccessKey,
    reportId: id,
  });

  if (!persisted.found) {
    const status = persisted.reason === "missing_token" ? 401 : persisted.reason === "supabase_unconfigured" ? 503 : 404;

    return NextResponse.json(
      {
        error:
          status === 401
            ? "Feedback untuk laporan tersimpan membutuhkan access key yang valid."
            : "Laporan tersimpan belum tersedia untuk menerima feedback.",
      },
      { status },
    );
  }

  const { error } = await supabase.from("report_feedback").insert({
    comment: cleanComment(input.comment) || null,
    rating,
    report_id: id,
  });

  if (error) {
    console.warn("NaLI feedback capture skipped", {
      code: error.code,
      message: error.message,
    });
    return NextResponse.json(
      {
        message: "Feedback belum tersimpan karena persistence belum aktif.",
        stored: false,
      },
      { status: 202 },
    );
  }

  void logUsageEvent({
    actionType: "feedback_capture",
    reportId: id,
    status: "stored",
  });

  return NextResponse.json({
    message: "Feedback tersimpan. Terima kasih sudah membantu NaLI membaik.",
    stored: true,
  });
}
