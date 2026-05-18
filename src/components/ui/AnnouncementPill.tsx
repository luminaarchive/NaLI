"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AnnouncementPillProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function AnnouncementPill({ children, className, icon }: AnnouncementPillProps) {
  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-white/60 backdrop-blur-sm",
        className,
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {icon && <span className="text-indigo-400">{icon}</span>}
      {children}
    </motion.div>
  );
}
