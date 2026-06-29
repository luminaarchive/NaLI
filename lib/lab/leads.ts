import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Lab leads data layer (Bucket C, Step 3.1)                                  */
/*                                                                            */
/*  Reads public.lab_leads. RLS is admin-only (no anon policy), so this only   */
/*  returns data to an admin session and [] otherwise. NEVER imported by a     */
/*  public route (enforced by scripts/check-lab-isolation.mjs).                */
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

function mapRow(row: Record<string, unknown>): LabLead {
  return {
    id: row.id as number,
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

/** All leads, highest score first. Returns [] for non-admins (RLS) or on error. */
export async function getAllLeads(): Promise<LabLead[]> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb
      .from("lab_leads")
      .select("*")
      .order("score", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}
