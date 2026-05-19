"use client";

/**
 * NaLIIconTile — Natural Intelligence mark.
 * Concept: an organic evidence-leaf pulse forming an "N".
 */
export function NaLIIconTile() {
  return (
    <div className="relative mx-auto mb-8 sm:mb-9">
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] sm:h-24 sm:w-24 sm:rounded-[28px]"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(245,249,255,0.9) 38%, rgba(239,238,255,0.88) 100%)",
          boxShadow:
            "0 26px 70px rgba(37,99,235,0.14), 0 12px 34px rgba(124,58,237,0.13), 0 2px 10px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.96)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden rounded-[24px] sm:rounded-[28px]">
          <div
            className="nali-atmosphere-breathe absolute -inset-8 opacity-85"
            style={{
              background:
                "radial-gradient(circle at 26% 28%, rgba(96,165,250,0.28) 0%, transparent 34%), radial-gradient(circle at 78% 20%, rgba(124,58,237,0.22) 0%, transparent 35%), radial-gradient(circle at 56% 82%, rgba(20,184,166,0.18) 0%, transparent 42%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.28) 70%)",
            }}
          />
        </div>

        <div className="absolute inset-0 rounded-[24px] ring-1 ring-slate-950/[0.045] sm:rounded-[28px]" />
        <div className="absolute inset-[1px] rounded-[23px] shadow-inner shadow-white/70 sm:rounded-[27px]" />

        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-12 w-12 sm:h-14 sm:w-14"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nali-organic-n" x1="14" y1="16" x2="66" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="48%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="nali-pulse" x1="18" y1="58" x2="58" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#2563eb" />
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
          <circle cx="63.5" cy="20" r="7" stroke="#14b8a6" strokeOpacity="0.16" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
