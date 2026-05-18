"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  hover?: boolean;
};

export function GlassCard({
  children,
  className,
  hover = true,
  ...props
}: GlassCardProps) {
  const content = (
    <>
      {/* Inner glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.02] to-transparent" />
      <div className="relative z-10">{children}</div>
    </>
  );

  const classes = cn(
    "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-xl",
    "transition-all duration-300",
    hover && "hover:border-white/[0.12] hover:bg-white/[0.05]",
    className,
  );

  if (hover) {
    return (
      <motion.div
        className={classes}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {content}
    </div>
  );
}

// Keep backward compatible Card export
type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
  tone?: "paper" | "dark" | "muted" | "glass";
};

const tones = {
  dark: "border-white/[0.06] bg-white/[0.03] text-white",
  glass: "border-white/[0.06] bg-white/[0.03] text-white backdrop-blur-xl",
  muted: "border-white/[0.04] bg-white/[0.02] text-white/80",
  paper: "border-white/[0.06] bg-white/[0.03] text-white",
};

export function Card({ as: Component = "article", className, tone = "paper", ...props }: CardProps) {
  return <Component className={cn("rounded-2xl border p-5", tones[tone], className)} {...props} />;
}
