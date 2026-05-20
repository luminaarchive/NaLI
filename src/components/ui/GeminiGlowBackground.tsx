"use client";

/**
 * GeminiGlowBackground — Premium Gemini / Google Assistant-inspired fluid ambient glow.
 * 
 * Features:
 * 1. Dark near-black base (#07090e).
 * 2. 3 main animated blurred blobs (Emerald, Cyan, Indigo) rising from the bottom area.
 * 3. Soft liquid movement and organic breathing using CSS-only GPU-accelerated keyframes.
 * 4. Premium noise texture overlay for high-fidelity aesthetics.
 * 5. Performance-optimized (only translates and scale, utilizes will-change and transform-gpu).
 * 6. Responsive sizes and blur levels optimized for desktop and mobile.
 * 7. Graceful static fallback when prefers-reduced-motion is active.
 */
export function GeminiGlowBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen overflow-hidden bg-[#07090e]"
    >
      {/* Glow blobs container */}
      <div className="absolute inset-0 h-full w-full">
        {/* Layer 1: Emerald glow (left/bottom) */}
        <div
          className="animate-fluid-1 absolute -bottom-[10%] -left-[10%] h-[75vw] w-[75vw] max-w-[700px] max-h-[700px] rounded-full bg-emerald-500/32 blur-[100px] mix-blend-screen transform-gpu sm:h-[50vw] sm:w-[50vw] sm:blur-[160px]"
          style={{ willChange: "transform, opacity" }}
        />

        {/* Layer 2: Cyan/teal glow (center/bottom) */}
        <div
          className="animate-fluid-2 absolute -bottom-[12%] left-[15%] h-[85vw] w-[85vw] max-w-[850px] max-h-[850px] rounded-full bg-cyan-500/26 blur-[110px] mix-blend-screen transform-gpu sm:h-[60vw] sm:w-[60vw] sm:blur-[180px]"
          style={{ willChange: "transform, opacity" }}
        />

        {/* Layer 3: Indigo/violet glow (right/bottom) */}
        <div
          className="animate-fluid-3 absolute -bottom-[10%] -right-[10%] h-[70vw] w-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/24 blur-[90px] mix-blend-screen transform-gpu sm:h-[50vw] sm:w-[50vw] sm:blur-[140px]"
          style={{ willChange: "transform, opacity" }}
        />

        {/* Layer 4: Soft blue upper haze */}
        <div
          className="animate-fluid-breathe absolute -top-[10%] left-[20%] h-[60vw] w-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-900/12 blur-[120px] mix-blend-screen transform-gpu"
          style={{ willChange: "transform, opacity" }}
        />
      </div>

      {/* Layer 5: Subtle noise overlay for premium texture */}
      <div
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette/radial gradient overlay to darken edges and focus content */}
      <div 
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          background: "radial-gradient(circle at 50% 40%, transparent 20%, rgba(7, 9, 14, 0.4) 65%, rgba(7, 9, 14, 0.9) 100%)"
        }}
      />
    </div>
  );
}
