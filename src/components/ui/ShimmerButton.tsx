"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function ShimmerButton({
  children,
  className,
  shimmerColor = "rgba(255,255,255,0.1)",
  shimmerSize = "0.1em",
  shimmerDuration = "2.5s",
  disabled,
  type = "button",
  onClick,
}: ShimmerButtonProps) {
  return (
    <motion.button
      className={cn(
        "group relative inline-flex min-h-12 items-center justify-center gap-2.5 overflow-hidden rounded-full px-6 text-sm font-semibold text-white transition-all",
        "bg-gradient-to-b from-white/[0.08] to-transparent",
        "border border-white/[0.08] backdrop-blur-sm",
        "hover:border-white/[0.15] hover:from-white/[0.12]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      <div
        className="shimmer-effect absolute inset-0 overflow-hidden rounded-[inherit]"
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
          } as React.CSSProperties
        }
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
