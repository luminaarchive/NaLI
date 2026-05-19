"use client";

/**
 * NaLIIconTile — Natural Intelligence mark.
 * Concept: an organic evidence-leaf pulse forming an "N".
 * Designed to sit on dark atmospheric background with frosted glass effect.
 */
export function NaLIIconTile() {
  return (
    <div className="relative mx-auto mb-8 sm:mb-9">
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] sm:h-[92px] sm:w-[92px] sm:rounded-[26px]"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.88) 0%, rgba(240,238,250,0.82) 38%, rgba(230,225,248,0.78) 100%)",
          boxShadow:
            "0 28px 80px rgba(80,60,180,0.25), 0 14px 40px rgba(100,80,200,0.2), 0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Inner atmospheric glow */}
        <div className="absolute inset-0 overflow-hidden rounded-[22px] sm:rounded-[26px]">
          <div
            className="nali-atmosphere-breathe absolute -inset-8 opacity-80"
            style={{
              background:
                "radial-gradient(circle at 26% 28%, rgba(100,80,220,0.3) 0%, transparent 36%), radial-gradient(circle at 78% 20%, rgba(130,100,240,0.25) 0%, transparent 38%), radial-gradient(circle at 56% 82%, rgba(20,184,166,0.2) 0%, transparent 44%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.2) 70%)",
            }}
          />
        </div>

        {/* Subtle ring + inner glow */}
        <div className="absolute inset-0 rounded-[22px] ring-1 ring-black/[0.06] sm:rounded-[26px]" />
        <div className="absolute inset-[1px] rounded-[21px] shadow-inner shadow-white/60 sm:rounded-[25px]" />

        {/* NaLI organic N mark */}
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-11 w-11 sm:h-[52px] sm:w-[52px]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nali-organic-n" x1="14" y1="16" x2="66" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4338ca" />
              <stop offset="48%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="nali-pulse" x1="18" y1="58" x2="58" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#4338ca" />
            </linearGradient>
          </defs>
          <path
            d="M23 63 C21.5 48 22.5 31 30.5 18.5 C39.5 33.5 49 47.5 59 62 C59.5 48 59.5 32 66 20"
            stroke="url(#nali-organic-n)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 20 C39 18 48 21 55 29"
            stroke="url(#nali-pulse)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.86"
          />
          <path d="M18 53 C26 49 33 50 41 55" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          <circle cx="63.5" cy="20" r="3.4" fill="#14b8a6" />
          <circle cx="63.5" cy="20" r="7" stroke="#14b8a6" strokeOpacity="0.18" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
