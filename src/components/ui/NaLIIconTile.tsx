"use client";

/**
 * NaLIIconTile — Clean, minimal NaLI identity icon.
 * Concept: a single stylized "N" formed by two rising field lines,
 * conveying "natural evidence intelligence" in one clear stroke.
 * Animated atmospheric cloud interior like Codex icon tile.
 */
export function NaLIIconTile() {
  return (
    <div className="relative mx-auto mb-8">
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] sm:h-24 sm:w-24 sm:rounded-[26px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(240,244,255,0.82) 50%, rgba(237,232,255,0.88) 100%)",
          boxShadow:
            "0 8px 40px rgba(99,102,241,0.14), 0 2px 12px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Animated cloud interior */}
        <div className="absolute inset-0 overflow-hidden rounded-[22px] sm:rounded-[26px]">
          <div
            className="codex-cloud codex-drift-1 absolute rounded-full"
            style={{
              left: "-40%",
              top: "-30%",
              width: "160%",
              height: "140%",
              background:
                "radial-gradient(ellipse at 40% 50%, rgba(96,165,250,0.45) 0%, rgba(139,188,255,0.2) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="codex-cloud codex-drift-2 absolute rounded-full"
            style={{
              right: "-30%",
              top: "-20%",
              width: "140%",
              height: "130%",
              background:
                "radial-gradient(ellipse at 60% 40%, rgba(139,124,255,0.4) 0%, rgba(196,181,253,0.18) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="codex-cloud codex-bloom absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              width: "80%",
              height: "80%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 40%, transparent 65%)",
              filter: "blur(4px)",
            }}
          />
        </div>

        {/* Ring + inner shadow */}
        <div className="absolute inset-0 rounded-[22px] ring-1 ring-black/[0.04] sm:rounded-[26px]" />
        <div className="absolute inset-[1px] rounded-[21px] shadow-inner shadow-black/[0.03] sm:rounded-[25px]" />

        {/* Clean NaLI symbol — single stylized "N" */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-9 w-9 sm:h-11 sm:w-11"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nali-g" x1="8" y1="6" x2="32" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {/*
            Clean "N" mark:
            - Left vertical stroke
            - Diagonal connecting stroke
            - Right vertical stroke
            Rounded caps, generous weight, unmistakable at any size.
          */}
          <path
            d="M11 32 L11 10 L29 32 L29 10"
            stroke="url(#nali-g)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
