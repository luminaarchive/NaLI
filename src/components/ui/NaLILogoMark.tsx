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
        "relative flex items-center justify-center overflow-hidden rounded-lg border border-[#DDD5C7] bg-white/75 shadow-[0_12px_30px_rgba(17,24,20,0.08)]",
        sizes[size],
        className,
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Image
        src="/logo-nali.png"
        alt="NaLI"
        fill
        className="object-contain p-1.5"
        sizes="80px"
        unoptimized
      />
    </motion.div>
  );
}
