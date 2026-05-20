import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { createManualFulfillmentJob, scoreReportComplexity } from "@/lib/manualFulfillment/jobs";

export async function POST(req: NextRequest) {
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { report_id, reason, user_scope_note, estimated_turnaround_hours } = body || {};

  if (!report_id || typeof report_id !== "string") {
    return NextResponse.json({ error: "Missing or invalid report_id." }, { status: 400 });
  }

  // Validate report_id is a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(report_id)) {
    return NextResponse.json({ error: "Invalid report_id format (must be UUID)." }, { status: 400 });
  }

  // Verify the report exists in reports table
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("id, guest_session_id_hash, input")
    .eq("id", report_id)
    .maybeSingle();

  if (reportError) {
    return NextResponse.json({ error: "Database error during report verification." }, { status: 500 });
  }

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  // Calculate complexity score using helper
  const complexityScore = scoreReportComplexity(report.input);

  const result = await createManualFulfillmentJob({
    reportId: report_id,
    guestSessionIdHash: report.guest_session_id_hash,
    complexityScore,
    reason,
    userScopeNote: user_scope_note,
    estimatedTurnaroundHours: estimated_turnaround_hours,
  });

  if (!result.created) {
    return NextResponse.json({ error: result.error || "Failed to create manual fulfillment job." }, { status: 500 });
  }

  const job = result.job;
  if (job) {
    // Sanitize job to not expose guest_session_id_hash
    delete job.guest_session_id_hash;
  }

  return NextResponse.json({ job }, { status: 201 });
}
