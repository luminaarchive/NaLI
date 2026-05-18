import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "dark" | "green" | "cyan" | "amber" | "paper";
};

const tones = {
  amber: "border-[#D8B98B] bg-[#FFF7E8] text-[#8A4F2D]",
  cyan: "border-[#D4E0D1] bg-[#E8EFE4] text-[#173D2B]",
  dark: "border-[#DDD5C7] bg-[#FCFAF4] text-[#111814]",
  green: "border-[#D4E0D1] bg-[#E8EFE4] text-[#173D2B]",
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
