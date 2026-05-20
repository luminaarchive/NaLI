"use client";

import { motion } from "framer-motion";
import { AnnouncementPill } from "./AnnouncementPill";
import { Sparkles } from "lucide-react";

export function NaLIHero() {
  return (
    <div className="flex flex-col items-center">
      <AnnouncementPill icon={<Sparkles className="h-3 w-3" />}>
        Asisten laporan berbasis bukti
      </AnnouncementPill>

      <motion.h1
        className="mt-8 text-5xl font-semibold tracking-normal text-[#111814] sm:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        NaLI
      </motion.h1>

      <motion.p
        className="mt-4 max-w-[520px] text-base leading-7 text-[#5F6B62] sm:text-lg sm:leading-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        Ubah catatan menjadi laporan berbasis bukti.
      </motion.p>

      <motion.p
        className="mt-2 text-sm text-[#5F6B62]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        NaLI membantu menyusun draf atau panduan awal tanpa mengarang data.
      </motion.p>
    </div>
  );
}
