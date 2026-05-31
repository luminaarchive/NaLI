import type { ParsedNaLIOutput, AvailStatus } from "./parse-nali-output";

export interface PalantirScore {
  overall: number;
  level: string;
  genetic: number;
  visual: number;
  habitat: number;
  integrity: number;
  linguisticMultiplier: number;
  temporalDecay: number;
  rawScore: number;
}

const WEIGHTS = {
  genetic: 0.6,
  visual: 0.2,
  habitat: 0.15,
  integrity: 0.1,
} as const;

const BIOME_LAMBDA: Record<string, number> = {
  rainforest: 0.08,
  montane: 0.06,
  seasonal_forest: 0.045,
  savanna: 0.03,
  mangrove: 0.07,
  karst: 0.025,
  alpine: 0.02,
  default: 0.05,
};

function pillarScore(availability: AvailStatus | undefined): number {
  switch (availability) {
    case "ADA":
      return 0.75;
    case "KURANG":
      return 0.3;
    case "TIDAK_ADA":
    default:
      return 0;
  }
}

function linguisticMultiplier(bahasa: string): number {
  switch (bahasa) {
    case "Objektif":
      return 1.15;
    case "Campuran":
      return 0.9;
    case "Bias":
      return 0.6;
    default:
      return 1.0;
  }
}

function temporalDecay(kualitasBukti: string, biome?: string, daysSince?: number): number {
  if (kualitasBukti === "Rendah") return 1.0;
  if (!daysSince || daysSince <= 0) return 1.0;
  const lambda = BIOME_LAMBDA[biome ?? "default"] ?? BIOME_LAMBDA.default;
  return Math.max(0.3, Math.exp(-lambda * daysSince));
}

export function calculatePalantirScore(
  parsed: ParsedNaLIOutput,
  biome?: string,
  daysSinceObservation?: number,
): PalantirScore {
  const h = parsed.header;
  if (!h) {
    return {
      overall: 0,
      level: "TIDAK DAPAT DIHITUNG",
      genetic: 0,
      visual: 0,
      habitat: 0,
      integrity: 0,
      linguisticMultiplier: 1,
      temporalDecay: 1,
      rawScore: 0,
    };
  }

  const ea = h.evidenceAvailability;

  const geneticBase = pillarScore(ea.genetik);

  let visualBase = pillarScore(ea.visual);
  if (h.kualitasBukti === "Kuat") visualBase = Math.max(visualBase, 0.6);
  if (h.kualitasBukti === "Forensik") visualBase = Math.max(visualBase, 0.85);

  let habitatBase = 0.3;
  if (ea.lokasi_gps === "ADA") habitatBase += 0.35;
  if (ea.timestamp === "ADA") habitatBase += 0.15;
  habitatBase = Math.min(habitatBase, 1.0);

  let integrityBase = 0.2;
  if (ea.multiple_observer === "ADA") integrityBase += 0.3;
  if (ea.metode === "ADA") integrityBase += 0.25;
  if (h.kualitasBukti === "Forensik") integrityBase = Math.max(integrityBase, 0.8);
  integrityBase = Math.min(integrityBase, 1.0);

  const rawScore =
    geneticBase * WEIGHTS.genetic +
    visualBase * WEIGHTS.visual +
    habitatBase * WEIGHTS.habitat +
    integrityBase * WEIGHTS.integrity;

  const li = linguisticMultiplier(h.bahasaUser);
  const decay = temporalDecay(h.kualitasBukti, biome, daysSinceObservation);
  const final = rawScore * li * decay;

  const overall = Math.round(Math.min(final * 100, 100));

  let level: string;
  if (overall >= 80) level = "FORENSIK GRADE";
  else if (overall >= 60) level = "INVESTIGASI AKTIF";
  else if (overall >= 40) level = "INDIKASI AWAL";
  else if (overall >= 20) level = "SINYAL LEMAH";
  else level = "TIDAK KONKLUSIF";

  return {
    overall,
    level,
    genetic: Math.round(geneticBase * 100) / 100,
    visual: Math.round(visualBase * 100) / 100,
    habitat: Math.round(habitatBase * 100) / 100,
    integrity: Math.round(integrityBase * 100) / 100,
    linguisticMultiplier: Math.round(li * 100) / 100,
    temporalDecay: Math.round(decay * 100) / 100,
    rawScore: Math.round(rawScore * 100) / 100,
  };
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return "#00FFB3";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#FB7185";
}

export function getConfidenceLabel(score: number): string {
  if (score >= 80) return "Forensik Grade";
  if (score >= 60) return "Investigasi Aktif";
  if (score >= 40) return "Indikasi Awal";
  if (score >= 20) return "Sinyal Lemah";
  return "Tidak Konklusif";
}
