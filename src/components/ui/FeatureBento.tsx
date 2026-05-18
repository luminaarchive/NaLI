"use client";

import { motion } from "framer-motion";
import { FileText, Radar, Microscope } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BentoItem {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accent: string;
  span?: string;
}

const items: BentoItem[] = [
  {
    title: "Learn & Report",
    description: "Turn raw notes, sources, and observations into structured evidence-based drafts.",
    icon: FileText,
    href: "/learn-report",
    accent: "from-indigo-500/20 to-indigo-500/0",
    span: "md:col-span-2",
  },
  {
    title: "Field Intelligence",
    description: "Professional observation memory, review queues, and Darwin Core export.",
    icon: Radar,
    href: "/field-intelligence",
    accent: "from-violet-500/20 to-violet-500/0",
  },
  {
    title: "Evidence Engine",
    description: "Evidence tables, uncertainty notes, and integrity markers for every draft.",
    icon: Microscope,
    href: "/learn-report",
    accent: "from-cyan-500/15 to-cyan-500/0",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.5 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeatureBento() {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-3"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {items.map((card) => (
        <motion.div key={card.title} variants={item} className={cn(card.span)}>
          <Link href={card.href} className="group block h-full">
            <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
              {/* Accent glow */}
              <div
                className={cn(
                  "pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
                  card.accent,
                )}
              />
              {/* Top highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

              <div className="relative z-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
                  <card.icon className="h-5 w-5 text-white/60" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{card.description}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
