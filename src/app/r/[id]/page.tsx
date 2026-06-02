import { createAnonSupabaseClient } from "@/lib/supabase/anon";
import { PublicReportView } from "@/components/report/PublicReportView";
import { PublicReportNotFound } from "@/components/report/PublicReportNotFound";

// Always fetch fresh by share_id; never prerender or cache a private report.
export const dynamic = "force-dynamic";

export default async function PublicReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shareId = (id || "").trim();
  if (!shareId) return <PublicReportNotFound />;

  // Forced-anon read. RLS + column grants ensure only shared rows and only
  // non-PII columns are reachable; we select the minimum we render.
  const supabase = createAnonSupabaseClient();
  const { data } = await supabase.from("report_sessions").select("title, result").eq("share_id", shareId).maybeSingle();

  if (!data || !data.result) return <PublicReportNotFound />;

  const title = (data.title as string)?.trim() || "Laporan NaLI";
  return <PublicReportView title={title} result={data.result as string} />;
}
