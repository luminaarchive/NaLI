import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "dark" | "green" | "cyan" | "amber" | "paper" | "glass" | "teal";
};

const tones = {
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  dark: "border-white/10 bg-white/5 text-white/70",
  glass: "border-white/[0.08] bg-white/[0.04] text-white/60 backdrop-blur-sm",
  green: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  paper: "border-white/10 bg-white/5 text-white/50",
  teal: "border-[#00FFB3]/25 bg-[#00FFB3]/10 text-[#00FFB3]",
};

export function Badge({ className, tone = "paper", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold leading-none",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
