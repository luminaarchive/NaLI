import type { Confidence } from "./types";

/** Public wording for the confidence labels, used across cards, daily, shelves. */
export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "Terverifikasi kuat",
  medium: "Didukung sumber",
  low: "Terbatas",
  "needs-verification": "Belum cukup bukti",
};

export function confidenceLabel(c: Confidence): string {
  return CONFIDENCE_LABEL[c] ?? CONFIDENCE_LABEL["needs-verification"];
}
