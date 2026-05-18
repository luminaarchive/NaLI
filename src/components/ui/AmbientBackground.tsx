"use client";

/**
 * AmbientBackground — CSS-only ambient glow layer.
 *
 * Performance rules applied:
 * - CSS animations only (transform + opacity) — no JS animation frames
 * - No filter:blur() in animation loop — pre-blurred via large border-radius + gradient
 * - will-change scoped to animated blobs only
 * - prefers-reduced-motion kills all animation
 * - Max 3 blobs
 * - Pointer-events disabled, aria-hidden
 */
export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
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

      {/* Blob 1 — indigo, top-left */}
      <div
        className="ambient-blob absolute -left-[15%] -top-[10%] h-[60vh] w-[60vh] rounded-full opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
          animationDelay: "0s",
          animationDuration: "25s",
        }}
      />

      {/* Blob 2 — violet, right */}
      <div
        className="ambient-blob absolute -right-[10%] top-[15%] h-[55vh] w-[55vh] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)",
          animationDelay: "-8s",
          animationDuration: "30s",
        }}
      />

      {/* Blob 3 — cyan accent, bottom */}
      <div
        className="ambient-blob absolute bottom-[5%] left-[25%] h-[45vh] w-[45vh] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(56,189,248,0.04) 50%, transparent 70%)",
          animationDelay: "-15s",
          animationDuration: "22s",
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
