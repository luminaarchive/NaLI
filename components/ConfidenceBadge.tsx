import type { Confidence } from "@/lib/types";
import { CONFIDENCE_LABEL } from "@/lib/types";

const STYLES: Record<Confidence, { dot: string; text: string; border: string }> = {
  high: {
    dot: "bg-confidence-high",
    text: "text-ink-deep",
    border: "border-ink/60",
  },
  medium: {
    dot: "bg-confidence-medium",
    text: "text-[#8a5a08] dark:text-[#e8c277]",
    border: "border-[#c98f1f]/60",
  },
  low: {
    dot: "bg-confidence-low",
    text: "text-[#9c3c08] dark:text-[#f0a36e]",
    border: "border-[#d96a23]/60",
  },
  "needs-verification": {
    dot: "bg-confidence-unverified",
    text: "text-[#a31515] dark:text-[#f09090]",
    border: "border-[#d33]/60",
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
  const pad = size === "sm" ? "px-2 py-0.5 text-[0.6rem]" : "px-2.5 py-1 text-[0.66rem]";
  return (
    <span
      title={`Tingkat keyakinan: ${CONFIDENCE_LABEL[confidence]}`}
      className={`inline-flex items-center gap-1.5 border border-dashed bg-paper ${pad} font-mono uppercase tracking-label ${s.border} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 ${s.dot}`} aria-hidden />
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}
