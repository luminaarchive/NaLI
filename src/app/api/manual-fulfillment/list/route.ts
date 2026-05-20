import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { listManualFulfillmentJobs } from "@/lib/manualFulfillment/jobs";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  if (!env.admin.viewEnabled) {
    return NextResponse.json(
      { error: "Manual fulfillment API is disabled (ADMIN_VIEW_ENABLED is false)." },
      { status: 503 }
    );
  }

  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase database is unconfigured." },
      { status: 503 }
    );
  }

  const jobs = await listManualFulfillmentJobs();

  if (jobs === null) {
    return NextResponse.json({ error: "Failed to load manual fulfillment jobs." }, { status: 500 });
  }

  // Sanitize jobs to not expose guest_session_id_hash
  const sanitizedJobs = jobs.map((job) => {
    const { guest_session_id_hash: _, ...rest } = job;
    return rest;
  });

  return NextResponse.json({ jobs: sanitizedJobs }, { status: 200 });
}
