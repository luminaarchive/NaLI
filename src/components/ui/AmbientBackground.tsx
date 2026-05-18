"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Primary ambient blob - indigo/blue */}
      <motion.div
        className="absolute -left-[20%] -top-[10%] h-[70vh] w-[70vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 80, 30, 0],
                y: [0, 60, -20, 0],
                scale: [1, 1.1, 0.95, 1],
              }
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary ambient blob - violet */}
      <motion.div
        className="absolute -right-[10%] top-[20%] h-[60vh] w-[60vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)",
          filter: "blur(100px)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -60, 20, 0],
                y: [0, -40, 60, 0],
                scale: [1, 0.9, 1.05, 1],
              }
        }
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary ambient blob - cyan/blue accent */}
      <motion.div
        className="absolute bottom-[10%] left-[30%] h-[50vh] w-[50vh] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.08) 0%, rgba(56,189,248,0.03) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 40, -30, 0],
                y: [0, -50, 30, 0],
                scale: [1, 1.08, 0.92, 1],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Very subtle noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top fade for readability */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#09090b] to-transparent" />
    </div>
  );
}
