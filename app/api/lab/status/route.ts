import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLabStatus } from "@/lib/lab/status";

/* -------------------------------------------------------------------------- */
/*  GET /api/lab/status : real-time machine state for the /lab operator.       */
/*                                                                            */
/*  Admin-only (or the production-impossible dev bypass). Returns the derived  */
/*  state from lab_harvest_runs. Cached 10s at the edge so polling every 30s   */
/*  never hammers the DB. Under app/api/lab = a lab path, so importing lib/lab */
/*  is allowed by the isolation guard.                                         */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

function devBypass(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.LAB_DEV_BYPASS === "1";
}

export async function GET(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }

  if (!devBypass()) {
    const sb = createSupabaseServerClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    const { data: isAdmin, error } = await sb.rpc("is_current_user_admin");
    if (error || isAdmin !== true) {
      return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
  }

  const status = await getLabStatus();
  return NextResponse.json(status, {
    headers: { "cache-control": "private, max-age=10" },
  });
}
