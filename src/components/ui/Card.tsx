import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
  tone?: "paper" | "dark" | "muted";
};

const tones = {
  dark: "border-white/10 bg-white/10 text-stone-50",
  muted: "border-stone-200 bg-stone-50 text-forest-950",
  paper: "border-stone-200 bg-white text-forest-950 shadow-sm",
};

export function Card({ as: Component = "article", className, tone = "paper", ...props }: CardProps) {
  return <Component className={cn("rounded-lg border p-5", tones[tone], className)} {...props} />;
}
