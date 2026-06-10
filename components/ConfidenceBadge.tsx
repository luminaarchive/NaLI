import type { Confidence } from "@/lib/types";
import { CONFIDENCE_LABEL } from "@/lib/types";

const STYLES: Record<Confidence, { dot: string; text: string; ring: string }> = {
  high: {
    dot: "bg-confidence-high",
    text: "text-teal-dark",
    ring: "ring-confidence-high/40",
  },
  medium: {
    dot: "bg-confidence-medium",
    text: "text-[#B45309]",
    ring: "ring-confidence-medium/40",
  },
  low: {
    dot: "bg-confidence-low",
    text: "text-[#C2410C]",
    ring: "ring-confidence-low/40",
  },
  "needs-verification": {
    dot: "bg-confidence-unverified",
    text: "text-[#DC2626]",
    ring: "ring-confidence-unverified/40",
  },
};

export function ConfidenceBadge({
  confidence,
  size = "md",
}: {
  confidence: Confidence;
  size?: "sm" | "md";
}) {
  const s = STYLES[confidence];
  const pad = size === "sm" ? "px-2 py-0.5 text-[0.62rem]" : "px-2.5 py-1 text-[0.68rem]";
  return (
    <span
      title={`Tingkat keyakinan: ${CONFIDENCE_LABEL[confidence]}`}
      className={`inline-flex items-center gap-1.5 rounded-full bg-white ${pad} font-mono uppercase tracking-label ring-1 ${s.ring} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}
