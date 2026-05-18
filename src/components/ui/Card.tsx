import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
  tone?: "paper" | "dark" | "muted";
};

const tones = {
  dark: "border-[#27382f] bg-[#07100B] text-stone-50",
  muted: "border-[#DDD5C7] bg-[#FCFAF4] text-[#111814]",
  paper: "border-[#DDD5C7] bg-white text-[#111814]",
};

export function Card({ as: Component = "article", className, tone = "paper", ...props }: CardProps) {
  return <Component className={cn("rounded-lg border p-5", tones[tone], className)} {...props} />;
}
