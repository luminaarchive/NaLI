import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "dark" | "green" | "cyan" | "amber" | "paper" | "glass";
};

const tones = {
  amber: "border-[#D8A033]/30 bg-[#FFF7DF] text-[#7A520F]",
  cyan: "border-[#49A7B8]/30 bg-[#E9F7F8] text-[#1B6170]",
  dark: "border-[#173D2B]/20 bg-[#173D2B] text-white",
  glass: "border-[#DDD5C7] bg-white/65 text-[#5F6B62]",
  green: "border-[#315F45]/25 bg-[#E8EFE4] text-[#173D2B]",
  paper: "border-[#DDD5C7] bg-[#FCFAF4] text-[#5F6B62]",
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
