import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scoreLead, type ScoreComponent } from "./scoring";

/* -------------------------------------------------------------------------- */
/*  Lab leads data layer (Bucket C, Steps 3.1 + 3.3)                           */
/*                                                                            */
/*  Reads public.lab_leads. RLS is admin-only (no anon policy), so this only   */
/*  returns DB data to an admin session. The Lazarus Score is computed at READ */
/*  time from each lead's `signals` (single-source formula, never stale).      */
/*                                                                            */
/*  Fallback chain (so the dashboard is verifiable without infra): DB rows ->  */
/*  committed SAMPLE_LEAD_ROWS snapshot (real harvested data, shown as CONTOH).*/
/*  NEVER imported by a public route (enforced by check-lab-isolation.mjs).    */
/* -------------------------------------------------------------------------- */

export type LabLeadStatus = "lead" | "investigating" | "promoted" | "dismissed";

/** A single signal in the Lazarus Score breakdown (transparent, sourced). */
export interface LabSignal {
  key: string;
  label: string;
  /** Normalized 0..1 contribution. */
  value: number;
  note?: string;
}

export interface LabSource {
  label: string;
  url?: string;
}

/** Snake_case DB/fixture row shape (what Supabase and the sample fixture hold). */
export interface LabLeadRow {
  id?: number;
  taxon_name: string;
  taxon_rank: string | null;
  common_name: string | null;
  iucn_status: string | null;
  last_record_year: number | null;
  score: number | null;
  signals: LabSignal[];
  sources: LabSource[];
  status: LabLeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabLead {
  id: number;
  taxonName: string;
  taxonRank: string | null;
  commonName: string | null;
  iucnStatus: string | null;
  lastRecordYear: number | null;
  score: number | null;
  signals: LabSignal[];
  sources: LabSource[];
  status: LabLeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** A lead with the Lazarus Score + breakdown computed from its signals. */
export interface ScoredLead extends LabLead {
  score: number;
  breakdown: ScoreComponent[];
}

export type LeadsSource = "db" | "sample" | "empty";

export interface LeadsResult {
  leads: ScoredLead[];
  /** Where the data came from, so the UI can label provenance honestly. */
  source: LeadsSource;
}

function mapRow(row: Record<string, unknown>): LabLead {
  return {
    id: (row.id as number) ?? 0,
    taxonName: row.taxon_name as string,
    taxonRank: (row.taxon_rank as string | null) ?? null,
    commonName: (row.common_name as string | null) ?? null,
    iucnStatus: (row.iucn_status as string | null) ?? null,
    lastRecordYear: (row.last_record_year as number | null) ?? null,
    score: (row.score as number | null) ?? null,
    signals: Array.isArray(row.signals) ? (row.signals as LabSignal[]) : [],
    sources: Array.isArray(row.sources) ? (row.sources as LabSource[]) : [],
    status: row.status as LabLeadStatus,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Attach the computed Lazarus Score + breakdown. */
function score(lead: LabLead): ScoredLead {
  const { score, breakdown } = scoreLead(lead.signals);
  return { ...lead, score, breakdown };
}

function sortByScore(a: ScoredLead, b: ScoredLead): number {
  return b.score - a.score;
}

/**
 * All leads with Lazarus Score, highest first. Tries the DB (admin RLS); if it
 * returns nothing (empty table, or non-admin in dev), falls back to the
 * committed real-data snapshot so the dashboard is never blank. `source` tells
 * the UI which it got.
 */
export async function getScoredLeads(): Promise<LeadsResult> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb.from("lab_leads").select("*");
    if (!error && Array.isArray(data) && data.length > 0) {
      return { leads: data.map(mapRow).map(score).sort(sortByScore), source: "db" };
    }
  } catch {
    /* fall through to sample */
  }

  // Fallback: committed snapshot of real harvested data (labeled CONTOH in UI).
  try {
    const { SAMPLE_LEAD_ROWS } = await import("./sample-leads");
    if (SAMPLE_LEAD_ROWS.length > 0) {
      const leads = SAMPLE_LEAD_ROWS.map((r, i) => mapRow({ id: i + 1, ...r }))
        .map(score)
        .sort(sortByScore);
      return { leads, source: "sample" };
    }
  } catch {
    /* no sample fixture present */
  }

  return { leads: [], source: "empty" };
}
