"use client";

/**
 * CodexAtmosphericBackground — Rich, cloudy, dimensional atmospheric canvas.
 * Approximates the OpenAI Codex landing page background:
 * - Deep lavender/royal blue/periwinkle gradient mesh
 * - Multi-layered translucent cloud shapes that drift slowly
 * - Fine film grain noise overlay
 * - CSS-only animations (transform + opacity), no JS loops/canvas/particles
 * - Supports prefers-reduced-motion
 */
export function CodexAtmosphericBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Layer 1: Base gradient — white to pale blue to lavender */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(175deg, #f0f4ff 0%, #f7fbff 15%, #edf0ff 35%, #f5f3ff 55%, #eef5ff 75%, #f8faff 100%)",
        }}
      />

      {/* Layer 2: Deep left blue cloud — large, organic */}
      <div
        className="codex-cloud codex-drift-1 absolute rounded-full"
        style={{
          left: "-20%",
          top: "-5%",
          width: "1400px",
          height: "1100px",
          background:
            "radial-gradient(ellipse at 45% 55%, rgba(139,188,255,0.6) 0%, rgba(96,165,250,0.35) 20%, rgba(167,216,255,0.2) 40%, rgba(186,230,253,0.08) 60%, transparent 78%)",
          filter: "blur(40px)",
        }}
      />

      {/* Layer 3: Deep right violet/indigo cloud */}
      <div
        className="codex-cloud codex-drift-2 absolute rounded-full"
        style={{
          right: "-15%",
          top: "-10%",
          width: "1300px",
          height: "1000px",
          background:
            "radial-gradient(ellipse at 55% 45%, rgba(139,124,255,0.5) 0%, rgba(99,102,241,0.3) 20%, rgba(167,139,250,0.2) 40%, rgba(196,181,253,0.08) 60%, transparent 78%)",
          filter: "blur(45px)",
        }}
      />

      {/* Layer 4: Center white luminous bloom — behind icon/title */}
      <div
        className="codex-cloud codex-bloom absolute rounded-full"
        style={{
          left: "50%",
          top: "12%",
          width: "1000px",
          height: "800px",
          transform: "translateX(-50%)",
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 20%, rgba(240,244,255,0.4) 40%, rgba(237,240,255,0.15) 60%, transparent 78%)",
          filter: "blur(20px)",
        }}
      />

      {/* Layer 5: Bottom-left blue wash */}
      <div
        className="codex-cloud codex-drift-3 absolute rounded-full"
        style={{
          left: "-5%",
          bottom: "-20%",
          width: "1200px",
          height: "700px",
          background:
            "radial-gradient(ellipse at 40% 60%, rgba(96,165,250,0.35) 0%, rgba(139,188,255,0.2) 30%, rgba(186,230,253,0.1) 55%, transparent 75%)",
          filter: "blur(50px)",
        }}
      />

      {/* Layer 6: Top-right lavender haze */}
      <div
        className="codex-cloud codex-drift-4 absolute rounded-full"
        style={{
          right: "5%",
          top: "20%",
          width: "800px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(196,181,253,0.3) 0%, rgba(167,139,250,0.15) 35%, rgba(139,124,255,0.06) 60%, transparent 78%)",
          filter: "blur(35px)",
        }}
      />

      {/* Layer 7: Bottom-right indigo accent */}
      <div
        className="codex-cloud codex-drift-5 absolute rounded-full"
        style={{
          right: "-10%",
          bottom: "-15%",
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.12) 30%, rgba(196,181,253,0.05) 55%, transparent 75%)",
          filter: "blur(45px)",
        }}
      />

      {/* Layer 8: Very subtle noise/grain texture for premium depth */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Layer 9: Very faint grid at near-invisible opacity */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
