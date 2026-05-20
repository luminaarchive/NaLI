"use client";

/**
 * NaLIIconTile — Redesigned modern, professional Natural Intelligence mark.
 * Concept: A premium dark glass tile with an underlying emerald/cyan/indigo glow,
 * hosting an organic evidence-leaf pulse forming a geometric, professional "N".
 */
export function NaLIIconTile() {
  return (
    <div className="relative mx-auto mb-8 sm:mb-9">
      {/* Underlying premium glow */}
      <div className="absolute -inset-2 rounded-[34px] bg-gradient-to-tr from-emerald-500/20 via-cyan-500/25 to-indigo-600/30 opacity-90 blur-lg" />
      
      {/* Main glass tile container */}
      <div
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] sm:h-[112px] sm:w-[112px] sm:rounded-[32px] backdrop-blur-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow:
            "0 32px 64px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Inner atmospheric micro-glow */}
        <div className="absolute inset-0 overflow-hidden rounded-[28px] sm:rounded-[32px]">
          <div
            className="absolute -inset-8 opacity-50 bg-gradient-to-tr from-emerald-500/25 via-cyan-500/25 to-indigo-500/35"
            style={{
              filter: "blur(14px)",
            }}
          />
        </div>

        {/* Inner emerald/cyan glow borders */}
        <div className="absolute inset-0 rounded-[28px] sm:rounded-[32px] border border-emerald-500/20 pointer-events-none" />
        <div className="absolute inset-px rounded-[27px] sm:rounded-[31px] bg-gradient-to-tr from-emerald-500/5 via-cyan-500/8 to-transparent pointer-events-none" />

        {/* Subtle glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

        {/* NaLI organic N mark */}
        <svg
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-14 w-14 sm:h-[68px] sm:w-[68px]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gradient-emerald-teal" x1="20" y1="20" x2="34" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-cyan-indigo" x1="44" y1="20" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <linearGradient id="gradient-pulse" x1="24" y1="22" x2="56" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          
          {/* Left leaf stem (Nature) */}
          <path
            d="M24 58 C21 45 21 33 24 22 C29 22 30 38 30 58 Z"
            fill="url(#gradient-emerald-teal)"
            opacity="0.95"
          />
          
          {/* Right leaf stem (Intelligence) */}
          <path
            d="M50 58 C50 38 51 22 56 22 C59 33 59 45 56 58 Z"
            fill="url(#gradient-cyan-indigo)"
            opacity="0.95"
          />
          
          {/* Diagonal connecting pulse line (Evidence Link) representing the middle of N */}
          <path
            d="M27 24 L53 56"
            stroke="url(#gradient-pulse)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Glowing pulse indicator dot (Evidence node) */}
          <circle cx="53" cy="22" r="3.5" fill="#22d3ee" className="animate-pulse" />
          <circle cx="53" cy="22" r="7.5" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}
