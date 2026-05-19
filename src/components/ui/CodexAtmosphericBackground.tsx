"use client";

/**
 * CodexAtmosphericBackground — Volumetric, luminous cloud atmosphere.
 * Rebuilt to completely avoid the "obvious blobs" look.
 * Creates an immersive, diffuse misty environment with soft tonal transitions.
 * 
 * Layers:
 * 1. Base Canvas - Very light, pale cool wash.
 * 2. Far Cloud Field - Huge amorphous gradients, very low contrast.
 * 3. Middle Masses - Soft overlapping blue/lavender atmospheric volumes.
 * 4. Near Mist Veil - Unifies layers and softens boundaries.
 * 5. Subtle Texture - Faint film grain.
 */
export function CodexAtmosphericBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#fbfdff]"
      aria-hidden="true"
    >
      {/* LAYER 1 — Base canvas wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(145deg, #f0f4ff 0%, #f9faff 40%, #f3f5ff 70%, #edf1ff 100%)",
        }}
      />

      {/* LAYER 2 — Large far cloud field (cool cyan/blue) */}
      <div
        className="codex-field-1 absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(100% 120% at 30% 20%, rgba(186, 230, 253, 0.4) 0%, rgba(200, 235, 255, 0.2) 35%, rgba(240, 248, 255, 0) 70%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* LAYER 3 — Large far cloud field (lavender/violet) */}
      <div
        className="codex-field-2 absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 110% at 80% 80%, rgba(196, 181, 253, 0.35) 0%, rgba(210, 200, 255, 0.15) 45%, rgba(240, 248, 255, 0) 80%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* LAYER 4 — Middle mass (richer periwinkle on left) */}
      <div
        className="codex-mass-1 absolute -inset-[20%]"
        style={{
          background:
            "radial-gradient(ellipse at 20% 70%, rgba(139, 188, 255, 0.25) 0%, rgba(167, 216, 255, 0.15) 35%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      {/* LAYER 5 — Middle mass (deep violet on right/top) */}
      <div
        className="codex-mass-2 absolute -inset-[20%]"
        style={{
          background:
            "radial-gradient(ellipse at 75% 25%, rgba(167, 139, 250, 0.2) 0%, rgba(196, 181, 253, 0.1) 40%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* LAYER 6 — Center Luminous Bloom (creates bright airy feel in middle) */}
      <div
        className="codex-bloom absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 30%, transparent 65%)",
          mixBlendMode: "screen",
        }}
      />

      {/* LAYER 7 — Near mist veil (soft unifier across bottom) */}
      <div
        className="codex-mist absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(to top, rgba(240, 245, 255, 0.6) 0%, rgba(248, 250, 255, 0.2) 30%, transparent 100%)",
        }}
      />

      {/* LAYER 8 — Subtle Film Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
