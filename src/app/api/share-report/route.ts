import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Public base for the shareable URL. The /r/[id] route itself works on any host,
// but the copied link points at the canonical production domain.
const SHARE_BASE = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://naliai.vercel.app").replace(/\/$/, "");

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Non-guessable, URL-safe, non-sequential token (~16 chars). Prevents enumeration.
function makeShareId(): string {
  return randomBytes(12).toString("base64url");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Request tidak valid." });
  }

  const id = typeof body?.id === "string" ? (body.id as string).trim() : "";
  if (!id) return json(400, { error: "ID laporan tidak diberikan." });

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only the authenticated owner can share their own report.
  if (!user) return json(401, { error: "Harus login untuk membagikan laporan." });

  const { data: row } = await supabase
    .from("report_sessions")
    .select("id, share_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!row) return json(404, { error: "Laporan tidak ditemukan." });

  let shareId: string | null = (row.share_id as string | null) ?? null;

  // Idempotent: generate + persist only if not already shared. The `.is(share_id, null)`
  // guard + unique index make concurrent calls converge to one token.
  for (let attempt = 0; attempt < 5 && !shareId; attempt++) {
    const candidate = makeShareId();
    const { data: updated, error: upErr } = await supabase
      .from("report_sessions")
      .update({ share_id: candidate })
      .eq("id", id)
      .eq("user_id", user.id)
      .is("share_id", null)
      .select("share_id")
      .maybeSingle();

    if (!upErr && updated?.share_id) {
      shareId = updated.share_id as string;
      break;
    }
    // Either a unique collision or a concurrent call already set it — re-read.
    const { data: reread } = await supabase
      .from("report_sessions")
      .select("share_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (reread?.share_id) {
      shareId = reread.share_id as string;
      break;
    }
  }

  if (!shareId) return json(500, { error: "Gagal membuat link berbagi." });

  return json(200, { shareId, url: `${SHARE_BASE}/r/${shareId}` });
}
