"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin reading-progress bar pinned to the top of the viewport. Driven by
 * framer-motion's scroll motion value (no per-frame React state, no scroll
 * listener), so it stays cheap. Decorative, hidden from assistive tech.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-ink"
      aria-hidden
    />
  );
}
