import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Lab harvest log data layer (audit trail for Step 3.2 harvests)             */
/*                                                                            */
/*  Reads public.lab_harvest_runs. RLS is admin-only (no anon policy), so this */
/*  only returns data to an admin session. Each row is a verifiable record of  */
/*  one harvest run: when, what triggered it, per-provider counts, and the     */
/*  longest silences seen. NEVER imported by a public route (check-lab-        */
/*  isolation.mjs enforces this).                                              */
/* -------------------------------------------------------------------------- */

export type HarvestTrigger = "manual" | "cron" | "dev" | "backfill";
export type HarvestStatus = "success" | "partial" | "failed";

export interface HarvestProvider {
  source: string;
  records: number;
  ok: boolean;
  provenance?: string;
}

export interface HarvestHighlight {
  taxon: string;
  gap_years: number | null;
  note?: string;
}

export interface HarvestRun {
  id: number;
  ranAt: string;
  trigger: HarvestTrigger;
  status: HarvestStatus;
  taxaCount: number;
  leadsUpserted: number;
  providers: HarvestProvider[];
  highlights: HarvestHighlight[];
  notes: string | null;
}

export type HarvestLogSource = "db" | "empty";

export interface HarvestLogResult {
  runs: HarvestRun[];
  source: HarvestLogSource;
}

function mapRow(row: Record<string, unknown>): HarvestRun {
  return {
    id: (row.id as number) ?? 0,
    ranAt: row.ran_at as string,
    trigger: (row.trigger as HarvestTrigger) ?? "manual",
    status: (row.status as HarvestStatus) ?? "success",
    taxaCount: (row.taxa_count as number) ?? 0,
    leadsUpserted: (row.leads_upserted as number) ?? 0,
    providers: Array.isArray(row.providers) ? (row.providers as HarvestProvider[]) : [],
    highlights: Array.isArray(row.highlights) ? (row.highlights as HarvestHighlight[]) : [],
    notes: (row.notes as string | null) ?? null,
  };
}

/**
 * Harvest runs, newest first. Returns `source: "empty"` when the table has no
 * rows or the caller is not an admin (RLS returns nothing) , the page renders an
 * honest empty state rather than guessing.
 */
export async function getHarvestRuns(limit = 50): Promise<HarvestLogResult> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb
      .from("lab_harvest_runs")
      .select("*")
      .order("ran_at", { ascending: false })
      .limit(limit);
    if (!error && Array.isArray(data) && data.length > 0) {
      return { runs: data.map(mapRow), source: "db" };
    }
  } catch {
    /* fall through to empty */
  }
  return { runs: [], source: "empty" };
}
