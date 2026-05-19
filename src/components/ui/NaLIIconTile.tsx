"use client";

/**
 * NaLIIconTile — Unique NaLI identity icon.
 * Concept: "natural evidence intelligence"
 * Visual motif: abstract leaf outline + pulse/evidence line + subtle "N" negative space.
 * Rounded square tile with white/glass background, blue/violet inner glow, soft shadow.
 * Symbol in blue/violet/teal gradient, SVG inline, premium feel.
 */
export function NaLIIconTile() {
  return (
    <div className="relative mx-auto mb-8">
      {/* Outer tile — rounded square like premium app icon */}
      <div
        className="relative flex h-20 w-20 items-center justify-center rounded-[22px] sm:h-24 sm:w-24 sm:rounded-[26px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,244,255,0.9) 50%, rgba(245,243,255,0.92) 100%)",
          boxShadow:
            "0 8px 40px rgba(99,102,241,0.12), 0 2px 12px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* Subtle ring */}
        <div className="absolute inset-0 rounded-[22px] ring-1 ring-black/[0.04] sm:rounded-[26px]" />

        {/* Inner subtle blue/violet glow */}
        <div
          className="absolute inset-[2px] rounded-[20px] sm:rounded-[24px]"
          style={{
            background:
              "radial-gradient(ellipse at 30% 30%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(139,92,246,0.05) 0%, transparent 60%)",
          }}
        />

        {/* Inner shadow */}
        <div className="absolute inset-[1px] rounded-[21px] shadow-inner shadow-black/[0.02] sm:rounded-[25px]" />

        {/* NaLI Symbol SVG — leaf + pulse + evidence node */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative h-10 w-10 sm:h-12 sm:w-12"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nali-grad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="nali-grad-light" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          {/* Left leaf stroke — curves up from bottom-left */}
          <path
            d="M12 38 C14 28, 18 18, 24 10"
            stroke="url(#nali-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right leaf stroke — curves up from bottom-right */}
          <path
            d="M36 38 C34 28, 30 18, 24 10"
            stroke="url(#nali-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central vein / evidence pulse line — the "N" diagonal */}
          <path
            d="M18 32 L18 18 L30 32 L30 18"
            stroke="url(#nali-grad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Small glowing evidence node at top */}
          <circle
            cx="24"
            cy="10"
            r="2.5"
            fill="url(#nali-grad)"
            opacity="0.9"
          />

          {/* Tiny intelligence spark */}
          <circle
            cx="24"
            cy="10"
            r="4"
            fill="none"
            stroke="url(#nali-grad-light)"
            strokeWidth="0.8"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
