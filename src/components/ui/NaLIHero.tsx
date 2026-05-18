"use client";

import { motion } from "framer-motion";
import { AnnouncementPill } from "./AnnouncementPill";
import { Sparkles } from "lucide-react";

export function NaLIHero() {
  return (
    <div className="flex flex-col items-center">
      <AnnouncementPill icon={<Sparkles className="h-3 w-3" />}>
        Evidence-based AI
      </AnnouncementPill>

      <motion.h1
        className="mt-8 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        NaLI
      </motion.h1>

      <motion.p
        className="mt-4 max-w-[480px] text-base leading-7 text-white/50 sm:text-lg sm:leading-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        Evidence-based AI for reports, learning, and field intelligence.
      </motion.p>

      <motion.p
        className="mt-2 text-sm text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        Turn notes, files, sources, and observations into structured drafts.
      </motion.p>
    </div>
  );
}
