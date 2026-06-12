import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ ok: false });
  let path = "";
  let referrer: string | null = null;
  try {
    const body = await req.json();
    path = typeof body.path === "string" ? body.path : "";
    referrer = typeof body.referrer === "string" ? body.referrer : null;
  } catch {
    return NextResponse.json({ ok: false });
  }
  if (!path || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: false });
  }
  await supabase.from("page_views").insert({
    path: path.slice(0, 512),
    referrer: referrer ? referrer.slice(0, 1024) : null,
  });
  return NextResponse.json({ ok: true });
}
