"use client";

/**
 * CodexAtmosphericBackground — Light, cloudy, atmospheric canvas.
 * Inspired by premium AI product landing pages.
 * CSS-only animations. No JS loops, no canvas, no filter:blur animation.
 */
export function CodexAtmosphericBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft off-white / pale blue base */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #f0f4ff 0%, #f8fbff 30%, #eef0ff 60%, #f5f3ff 100%)",
        }}
      />

      {/* Large left blue cloud wash */}
      <div
        className="atmos-blob atmos-drift-left absolute -left-[15%] top-[5%] h-[900px] w-[1200px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(147,180,255,0.55) 0%, rgba(147,180,255,0.2) 35%, rgba(191,219,254,0.08) 60%, transparent 75%)",
        }}
      />

      {/* Large right violet/lavender cloud wash */}
      <div
        className="atmos-blob atmos-drift-right absolute -right-[10%] top-[0%] h-[850px] w-[1100px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(139,92,246,0.4) 0%, rgba(196,181,253,0.25) 30%, rgba(196,181,253,0.08) 55%, transparent 75%)",
        }}
      />

      {/* Center white glow bloom behind hero */}
      <div
        className="atmos-blob atmos-bloom absolute left-1/2 top-[15%] h-[700px] w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 30%, rgba(238,240,255,0.15) 60%, transparent 75%)",
        }}
      />

      {/* Bottom blue/violet fade — where product preview rises */}
      <div
        className="atmos-blob atmos-drift-bottom absolute bottom-[-10%] left-1/2 h-[500px] w-[1400px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 35%, rgba(186,230,253,0.06) 60%, transparent 75%)",
        }}
      />

      {/* Very subtle noise texture for premium depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
