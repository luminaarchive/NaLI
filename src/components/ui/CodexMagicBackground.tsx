"use client";

import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

/**
 * CodexMagicBackground — Animated Codex-style ambient glow.
 *
 * 5 animated glow blobs + Magic UI GridPattern + noise texture.
 * All animation is CSS-only (transform + opacity), zero JS frames.
 * prefers-reduced-motion handled globally in globals.css.
 */
export function CodexMagicBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* Magic UI Grid Pattern */}
      <GridPattern
        width={64}
        height={64}
        strokeDasharray="0"
        className={cn(
          "absolute inset-0 h-full w-full",
          "fill-white/[0.02] stroke-white/[0.04]",
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        )}
      />

      {/* ====== ANIMATED GLOW BLOBS ====== */}

      {/* 1. Bottom center bloom — large indigo, breathes behind command box */}
      <div
        className="ambient-blob ambient-bloom absolute bottom-[-20%] left-1/2 h-[600px] w-[1100px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0.15) 45%, transparent 70%)",
        }}
      />

      {/* 2. Right violet — drifts diagonally, melting feel */}
      <div
        className="ambient-blob ambient-drift-medium absolute -right-[8%] -top-[10%] h-[550px] w-[750px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0.1) 45%, transparent 70%)",
        }}
      />

      {/* 3. Left cyan — rises and falls slowly */}
      <div
        className="ambient-blob ambient-drift-fast absolute -left-[12%] top-[25%] h-[450px] w-[550px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0.08) 45%, transparent 70%)",
        }}
      />

      {/* 4. Center indigo — expands slowly behind hero area */}
      <div
        className="ambient-blob ambient-drift-slow absolute left-[20%] top-[10%] h-[500px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
        }}
      />

      {/* 5. Top-right soft accent — morphing shape-shift */}
      <div
        className="ambient-blob ambient-morph absolute right-[10%] top-[-5%] h-[350px] w-[450px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0.06) 50%, transparent 70%)",
        }}
      />

      {/* Noise texture overlay for premium depth */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top-edge fade for nav readability */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#09090b]/60 to-transparent" />
    </div>
  );
}
