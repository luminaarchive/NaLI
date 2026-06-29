import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Ghost Signals data layer (Bucket C, Step 3.5)                              */
/*                                                                            */
/*  Reads public.ghost_signals (admin-only RLS, no anon policy). Falls back to */
/*  a committed real-data snapshot so /lab/signals is verifiable without infra.*/
/*  NEVER imported by a public route (check-lab-isolation.mjs enforces it).    */
/* -------------------------------------------------------------------------- */

export type GhostSource = "youtube" | "xeno-canto" | "inaturalist";
export type GhostStatus = "signal" | "investigating" | "promoted" | "dismissed";
export type GhostProvenance = "api" | "curated" | "sample";

export interface GhostBreakdown {
  key: string;
  label: string;
  value: number;
  weight: number;
  points: number;
  note: string;
}

/** Snake_case DB / fixture row. */
export interface GhostSignalRow {
  id?: number;
  source: GhostSource;
  external_id: string;
  title: string;
  url: string;
  observed_on: string | null;
  location_label: string | null;
  taxon_hint: string | null;
  summary: string | null;
  score: number | null;
  signals: GhostBreakdown[];
  provenance: GhostProvenance;
  status?: GhostStatus;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GhostSignal {
  id: number;
  source: GhostSource;
  externalId: string;
  title: string;
  url: string;
  observedOn: string | null;
  locationLabel: string | null;
  taxonHint: string | null;
  summary: string | null;
  score: number;
  signals: GhostBreakdown[];
  provenance: GhostProvenance;
  status: GhostStatus;
}

export type GhostSource_Result = "db" | "sample" | "empty";

export interface GhostResult {
  signals: GhostSignal[];
  source: GhostSource_Result;
}

function mapRow(row: GhostSignalRow, fallbackId: number): GhostSignal {
  return {
    id: row.id ?? fallbackId,
    source: row.source,
    externalId: row.external_id,
    title: row.title,
    url: row.url,
    observedOn: row.observed_on ?? null,
    locationLabel: row.location_label ?? null,
    taxonHint: row.taxon_hint ?? null,
    summary: row.summary ?? null,
    score: row.score ?? 0,
    signals: Array.isArray(row.signals) ? row.signals : [],
    provenance: row.provenance ?? "api",
    status: row.status ?? "signal",
  };
}

/**
 * All ghost signals, highest score first. DB (admin RLS) -> committed snapshot.
 * `source` tells the UI which it got, so provenance can be shown honestly.
 */
export async function getGhostSignals(): Promise<GhostResult> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb.from("ghost_signals").select("*");
    if (!error && Array.isArray(data) && data.length > 0) {
      return {
        signals: (data as GhostSignalRow[]).map((r, i) => mapRow(r, i + 1)).sort((a, b) => b.score - a.score),
        source: "db",
      };
    }
  } catch {
    /* fall through */
  }

  try {
    const { SAMPLE_GHOST_SIGNALS } = await import("./sample-signals");
    if (SAMPLE_GHOST_SIGNALS.length > 0) {
      return {
        signals: SAMPLE_GHOST_SIGNALS.map((r, i) => mapRow(r, i + 1)).sort((a, b) => b.score - a.score),
        source: "sample",
      };
    }
  } catch {
    /* no fixture yet */
  }

  return { signals: [], source: "empty" };
}

/** Look up a single signal by id (for the promote route). */
export async function getGhostSignalById(id: number): Promise<GhostSignal | null> {
  const { signals } = await getGhostSignals();
  return signals.find((s) => s.id === id) ?? null;
}
