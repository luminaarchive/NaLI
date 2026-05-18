"use client";

import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";

/**
 * CodexMagicBackground — Magic UI-first ambient background layer.
 * Combines: GridPattern + static radial glow blobs + noise.
 * Performance: GridPattern is SVG (no JS animation), glow blobs are static CSS.
 */
export function CodexMagicBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* Magic UI Grid Pattern — subtle visible grid */}
      <GridPattern
        width={64}
        height={64}
        strokeDasharray="0"
        className={cn(
          "absolute inset-0 h-full w-full",
          "fill-white/[0.02] stroke-white/[0.04]",
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        )}
      />

      {/* === STATIC GLOW BLOBS — high visibility, no animation cost === */}

      {/* Primary glow — large indigo, center-bottom */}
      <div
        className="absolute bottom-[-25%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0.15) 40%, transparent 70%)",
          opacity: 0.55,
        }}
      />

      {/* Secondary glow — violet, top-right */}
      <div
        className="absolute -right-[10%] -top-[15%] h-[500px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0.1) 45%, transparent 70%)",
          opacity: 0.45,
        }}
      />

      {/* Tertiary glow — cyan accent, left */}
      <div
        className="absolute -left-[10%] top-[30%] h-[400px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0.08) 45%, transparent 70%)",
          opacity: 0.4,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top-edge fade for nav readability */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#09090b]/80 to-transparent" />
    </div>
  );
}
