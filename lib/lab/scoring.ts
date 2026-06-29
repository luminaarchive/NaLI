import type { LabSignal } from "./leads";

/* -------------------------------------------------------------------------- */
/*  Lazarus Score (Bucket C, Step 3.3)                                         */
/*                                                                            */
/*  A PRIORITIZATION HEURISTIC, not a probability of existence. It answers one */
/*  question: "how much does this taxon's silence merit a human's time?" It    */
/*  never claims a species survives. The output is deterministic and ships a   */
/*  full `breakdown` so every point is explainable and contestable.            */
/*                                                                            */
/*  Inputs are the raw, normalized (0..1) `signals` the harvesters gathered    */
/*  (gap, scarcity, IUCN status, recent observations). This module assigns the */
/*  transparent weights; it invents nothing.                                   */
/* -------------------------------------------------------------------------- */

export interface ScoreComponent {
  key: string;
  label: string;
  /** Raw signal magnitude 0..1, or null when the source had no data. */
  signalValue: number | null;
  /** Weight applied to this signal. */
  weight: number;
  /** Whether the component raises ("boost") or lowers ("penalty") priority. */
  direction: "boost" | "penalty";
  /** Signed points this component contributes to the 0..100 score (pre-clamp). */
  points: number;
  note: string;
}

export interface ScoredResult {
  score: number; // 0..100
  breakdown: ScoreComponent[];
  /** True when the raw total was clamped into [0,100]. */
  clamped: boolean;
}

/** Transparent weight table. Positive weights sum to MAX_POSITIVE. */
export const LAZARUS_WEIGHTS = {
  gbif_gap: { weight: 0.45, direction: "boost" as const, label: "Jeda waktu (GBIF)" },
  gbif_scarcity: { weight: 0.2, direction: "boost" as const, label: "Kelangkaan rekaman" },
  iucn_status: { weight: 0.25, direction: "boost" as const, label: "Status ancaman IUCN" },
  inat_recent_obs: {
    weight: 0.3,
    direction: "penalty" as const,
    label: "Observasi riset terbaru",
  },
} as const;

const MAX_POSITIVE = Object.values(LAZARUS_WEIGHTS)
  .filter((w) => w.direction === "boost")
  .reduce((s, w) => s + w.weight, 0); // 0.90

const SCALE = 100 / MAX_POSITIVE; // map full positive evidence -> 100 before penalty
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * One-line, plain-language explanation of the method, for the dashboard.
 */
export const LAZARUS_METHOD_NOTE =
  "Skor = bobot x sinyal, dinormalkan ke 0-100. Jeda waktu paling berat (0,45), " +
  "lalu status IUCN (0,25) dan kelangkaan (0,20); observasi riset terbaru MENURUNKAN " +
  "skor (-0,30) karena spesies yang masih terlihat bukan lagi prioritas pencarian. " +
  "Ini heuristik prioritas, bukan probabilitas keberadaan.";

/**
 * Compute the Lazarus Score + breakdown from a lead's raw signals.
 * Deterministic and pure. Missing positive signals simply contribute 0 (less
 * corroboration -> lower priority), which is shown explicitly in the breakdown.
 */
export function scoreLead(signals: LabSignal[]): ScoredResult {
  const byKey = new Map(signals.map((s) => [s.key, s]));
  const breakdown: ScoreComponent[] = [];
  let total = 0;

  for (const [key, cfg] of Object.entries(LAZARUS_WEIGHTS)) {
    const sig = byKey.get(key);
    const hasData = sig != null && typeof sig.value === "number";
    const v = hasData ? clamp01(sig.value) : 0;
    const signed = cfg.direction === "penalty" ? -1 : 1;
    const points = Number((signed * cfg.weight * v * SCALE).toFixed(1));
    total += points;
    breakdown.push({
      key,
      label: cfg.label,
      signalValue: hasData ? v : null,
      weight: cfg.weight,
      direction: cfg.direction,
      points,
      note: hasData ? sig.note ?? "" : "Data tidak tersedia (sumber kosong)",
    });
  }

  const clampedScore = Math.max(0, Math.min(100, total));
  return {
    score: Math.round(clampedScore),
    breakdown,
    clamped: clampedScore !== total,
  };
}

/** Coarse band for visual grouping. Never implies certainty. */
export function scoreBand(score: number): { key: string; label: string } {
  if (score >= 70) return { key: "high", label: "Prioritas tinggi" };
  if (score >= 40) return { key: "mid", label: "Prioritas sedang" };
  return { key: "low", label: "Prioritas rendah" };
}
