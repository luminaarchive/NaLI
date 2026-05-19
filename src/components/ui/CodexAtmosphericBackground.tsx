"use client";

/**
 * CodexAtmosphericBackground — Rich, deep, cloudy atmospheric canvas.
 * Matches the OpenAI Codex reference:
 * - Deep lavender/royal blue/periwinkle clouds with strong presence
 * - Multi-layered translucent cloud shapes that drift slowly
 * - Much more saturated than a typical pale gradient
 * - Fine film grain noise overlay
 * - CSS-only animations (transform + opacity)
 */
export function CodexAtmosphericBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Base gradient — periwinkle / lavender wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(168deg, #dde4ff 0%, #e4eaff 10%, #eef2ff 20%, #f0f4ff 35%, #ede8ff 50%, #e8edff 65%, #edf2ff 80%, #f5f8ff 100%)",
        }}
      />

      {/* Layer 2: Deep left blue cloud — dominant, large */}
      <div
        className="codex-cloud codex-drift-1 absolute rounded-full"
        style={{
          left: "-15%",
          top: "-10%",
          width: "1600px",
          height: "1300px",
          background:
            "radial-gradient(ellipse at 40% 50%, rgba(96,165,250,0.7) 0%, rgba(139,188,255,0.5) 12%, rgba(96,165,250,0.35) 25%, rgba(167,216,255,0.2) 42%, rgba(186,230,253,0.08) 60%, transparent 78%)",
          filter: "blur(40px)",
        }}
      />

      {/* Layer 3: Deep right violet/indigo cloud — strong, rich */}
      <div
        className="codex-cloud codex-drift-2 absolute rounded-full"
        style={{
          right: "-10%",
          top: "-15%",
          width: "1500px",
          height: "1200px",
          background:
            "radial-gradient(ellipse at 55% 40%, rgba(99,102,241,0.6) 0%, rgba(139,124,255,0.45) 12%, rgba(167,139,250,0.3) 25%, rgba(196,181,253,0.15) 45%, rgba(196,181,253,0.05) 65%, transparent 80%)",
          filter: "blur(45px)",
        }}
      />

      {/* Layer 4: Top-right lavender mass — visible, cloudy */}
      <div
        className="codex-cloud codex-drift-4 absolute rounded-full"
        style={{
          right: "-5%",
          top: "5%",
          width: "1100px",
          height: "800px",
          background:
            "radial-gradient(ellipse at center, rgba(196,181,253,0.5) 0%, rgba(167,139,250,0.3) 25%, rgba(139,124,255,0.12) 50%, transparent 72%)",
          filter: "blur(35px)",
        }}
      />

      {/* Layer 5: Bottom-left blue wash — extends upward */}
      <div
        className="codex-cloud codex-drift-3 absolute rounded-full"
        style={{
          left: "-8%",
          bottom: "-20%",
          width: "1400px",
          height: "900px",
          background:
            "radial-gradient(ellipse at 38% 55%, rgba(96,165,250,0.5) 0%, rgba(139,188,255,0.3) 22%, rgba(186,230,253,0.12) 48%, transparent 72%)",
          filter: "blur(50px)",
        }}
      />

      {/* Layer 6: Center white luminous bloom — behind icon/title */}
      <div
        className="codex-cloud codex-bloom absolute rounded-full"
        style={{
          left: "50%",
          top: "8%",
          width: "1200px",
          height: "1000px",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.75) 12%, rgba(248,250,255,0.45) 28%, rgba(240,244,255,0.2) 48%, rgba(237,240,255,0.08) 65%, transparent 80%)",
          filter: "blur(12px)",
        }}
      />

      {/* Layer 7: Bottom-right indigo/violet accent */}
      <div
        className="codex-cloud codex-drift-5 absolute rounded-full"
        style={{
          right: "-5%",
          bottom: "-15%",
          width: "1100px",
          height: "750px",
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.18) 28%, rgba(196,181,253,0.06) 55%, transparent 75%)",
          filter: "blur(45px)",
        }}
      />

      {/* Layer 8: Top periwinkle cloud accent */}
      <div
        className="codex-cloud codex-drift-1 absolute rounded-full"
        style={{
          left: "15%",
          top: "-20%",
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(167,216,255,0.4) 0%, rgba(186,230,253,0.2) 35%, transparent 65%)",
          filter: "blur(30px)",
          animationDelay: "-10s",
        }}
      />

      {/* Layer 9: Mid-field lavender haze — fills the gap between big clouds */}
      <div
        className="codex-cloud codex-drift-4 absolute rounded-full"
        style={{
          left: "20%",
          top: "25%",
          width: "800px",
          height: "500px",
          background:
            "radial-gradient(ellipse at center, rgba(196,181,253,0.25) 0%, rgba(167,139,250,0.12) 35%, transparent 65%)",
          filter: "blur(30px)",
          animationDelay: "-15s",
        }}
      />

      {/* Layer 10: Film grain/noise for premium analog feel */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
