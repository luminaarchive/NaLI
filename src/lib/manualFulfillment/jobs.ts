import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export type ManualFulfillmentStatus = "queued" | "in_review" | "waiting_user" | "completed" | "cancelled";

export interface ManualFulfillmentJob {
  id: string;
  report_id: string;
  guest_session_id_hash?: string | null;
  status: ManualFulfillmentStatus;
  complexity_score: number;
  reason?: string | null;
  founder_note?: string | null;
  user_scope_note?: string | null;
  estimated_turnaround_hours?: number | null;
  revision_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Scores the complexity of a report based on the input text, mode, location, etc.
 * Complexity score goes from 0 to 100.
 */
export function scoreReportComplexity(input: any, _output?: any): number {
  if (!input) return 0;
  
  let score = 0;

  // 1. Text length of mainText/notes
  const mainText = input.mainText || input.notes || "";
  const textLength = mainText.length;
  score += Math.min(Math.floor(textLength / 150), 30); // Max 30 points

  // 2. Number of source URLs
  const urls = Array.isArray(input.sourceUrls) ? input.sourceUrls : [];
  score += Math.min(urls.length * 10, 30); // Max 30 points

  // 3. Location is provided
  if (input.location && input.location.trim().length > 0) {
    score += 10;
  }

  // 4. File description is provided
  if (input.fileDescription && input.fileDescription.trim().length > 0) {
    score += 10;
  }

  // 5. Mode is draft_from_materials (more complex than start_from_zero)
  if (input.mode === "draft_from_materials") {
    score += 20;
  }

  // 6. Keywords indicating research complexity
  const complexKeywords = [
    "analisis mendalam",
    "hukum",
    "regulasi",
    "sertifikasi",
    "riset ilmiah",
    "keanekaragaman hayati",
    "biodiversitas",
    "konservasi",
    "amdal",
    "profesional",
    "perusahaan",
  ];
  const combinedText = `${mainText} ${input.topic || ""} ${input.title || ""}`.toLowerCase();
  if (complexKeywords.some((keyword) => combinedText.includes(keyword))) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Suggest manual fulfillment if complexity score is high (>= 50).
 */
export function shouldSuggestManualFulfillment(report: { input: any; output?: any }): boolean {
  if (!report || !report.input) return false;
  const score = scoreReportComplexity(report.input, report.output);
  return score >= 50;
}

/**
 * Insert a manual fulfillment job.
 */
export async function createManualFulfillmentJob(params: {
  reportId: string;
  guestSessionIdHash?: string | null;
  complexityScore: number;
  reason?: string;
  userScopeNote?: string;
  estimatedTurnaroundHours?: number;
}) {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) {
    return { created: false, reason: "supabase_unconfigured" };
  }

  const { data, error } = await supabase
    .from("manual_fulfillment_jobs")
    .insert({
      report_id: params.reportId,
      guest_session_id_hash: params.guestSessionIdHash || null,
      status: "queued",
      complexity_score: params.complexityScore,
      reason: params.reason || null,
      user_scope_note: params.userScopeNote || null,
      estimated_turnaround_hours: params.estimatedTurnaroundHours || null,
    })
    .select()
    .single();

  if (error) {
    console.warn("createManualFulfillmentJob failed", error);
    return { created: false, error: error.message };
  }

  return { created: true, job: data as ManualFulfillmentJob };
}

/**
 * List all manual fulfillment jobs ordered by created_at DESC.
 */
export async function listManualFulfillmentJobs(): Promise<ManualFulfillmentJob[] | null> {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("manual_fulfillment_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("listManualFulfillmentJobs failed", error);
    return [];
  }

  return data as ManualFulfillmentJob[];
}

/**
 * Update the status and other fields of a manual fulfillment job.
 */
export async function updateManualFulfillmentJobStatus(
  jobId: string,
  status: ManualFulfillmentStatus,
  notes?: {
    founder_note?: string;
    user_scope_note?: string;
    estimated_turnaround_hours?: number;
    revision_count?: number;
  }
) {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) {
    return { updated: false, reason: "supabase_unconfigured" };
  }

  const updateFields: Record<string, any> = { status };

  if (notes) {
    if (notes.founder_note !== undefined) updateFields.founder_note = notes.founder_note;
    if (notes.user_scope_note !== undefined) updateFields.user_scope_note = notes.user_scope_note;
    if (notes.estimated_turnaround_hours !== undefined) updateFields.estimated_turnaround_hours = notes.estimated_turnaround_hours;
    if (notes.revision_count !== undefined) updateFields.revision_count = notes.revision_count;
  }

  const { data, error } = await supabase
    .from("manual_fulfillment_jobs")
    .update(updateFields)
    .eq("id", jobId)
    .select()
    .single();

  if (error) {
    console.warn("updateManualFulfillmentJobStatus failed", error);
    return { updated: false, error: error.message };
  }

  return { updated: true, job: data as ManualFulfillmentJob };
}
