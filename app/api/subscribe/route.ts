import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Newsletter subscribe endpoint (F4.1). Validates server-side, then stores the
 * address in Supabase (`subscribers`, insert-only RLS). The handler is kept
 * provider-agnostic: swap the storage block for Buttondown/Resend later without
 * touching the client. Founder decision: keep Supabase.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }
  let email = "";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email tidak valid", code: "invalid" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Layanan belum dikonfigurasi" }, { status: 503 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase
    .from("subscribers")
    .insert({ email, source: "web", locale: "id" });

  if (!error) return NextResponse.json({ ok: true });
  if (error.code === "23505") {
    return NextResponse.json({ ok: true, code: "dupe" });
  }
  return NextResponse.json({ error: "Gagal mendaftar" }, { status: 500 });
}
