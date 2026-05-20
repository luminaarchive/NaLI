import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { updateManualFulfillmentJobStatus, type ManualFulfillmentStatus } from "@/lib/manualFulfillment/jobs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const { id: jobId } = await params;

  if (!jobId || typeof jobId !== "string") {
    return NextResponse.json({ error: "Missing or invalid job ID." }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { status, founder_note, user_scope_note, estimated_turnaround_hours, revision_count } = body || {};

  if (!status || typeof status !== "string") {
    return NextResponse.json({ error: "Missing or invalid status." }, { status: 400 });
  }

  const allowedStatuses = ["queued", "in_review", "waiting_user", "completed", "cancelled"];
  if (!allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  // Check if job exists first
  const { data: existingJob, error: getError } = await supabase
    .from("manual_fulfillment_jobs")
    .select("id")
    .eq("id", jobId)
    .maybeSingle();

  if (getError) {
    return NextResponse.json({ error: "Database error during job verification." }, { status: 500 });
  }

  if (!existingJob) {
    return NextResponse.json({ error: "Manual fulfillment job not found." }, { status: 404 });
  }

  const result = await updateManualFulfillmentJobStatus(jobId, status as ManualFulfillmentStatus, {
    founder_note,
    user_scope_note,
    estimated_turnaround_hours,
    revision_count,
  });

  if (!result.updated) {
    return NextResponse.json({ error: result.error || "Failed to update manual fulfillment job." }, { status: 500 });
  }

  const job = result.job;
  if (job) {
    // Sanitize job to not expose guest_session_id_hash
    delete job.guest_session_id_hash;
  }

  return NextResponse.json({ job }, { status: 200 });
}
