"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NaLILogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

export function NaLILogoMark({ size = "md", className }: NaLILogoMarkProps) {
  return (
    <motion.div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-sm",
        sizes[size],
        className,
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Subtle inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-emerald-400/10 to-transparent" />
      <Image
        src="/nali-logo.png"
        alt="NaLI"
        fill
        className="object-cover p-1.5"
        sizes="80px"
        unoptimized
      />
    </motion.div>
  );
}
