import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "dark" | "green" | "cyan" | "amber" | "paper";
};

const tones = {
  amber: "border-warning-amber/50 bg-warning-amber/15 text-warning-amber",
  cyan: "border-data-cyan/40 bg-data-cyan/10 text-data-cyan",
  dark: "border-white/15 bg-white/10 text-stone-100",
  green: "border-olive-300/50 bg-olive-100 text-forest-900",
  paper: "border-stone-300 bg-stone-50 text-forest-800",
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
