"use client";

/**
 * NaLIIconTile — Option C: Nature Intelligence Mark.
 * Abstract terrain/topography contour lines subtly forming the letter "N".
 * 2-3 flowing strokes with emerald #10b981 to violet #7c3aed gradient.
 * Dark glass tile: 80x80 desktop, 72x72 mobile.
 */
export function NaLIIconTile() {
  return (
    <div className="relative mx-auto mb-4 sm:mb-5">
      {/* Underlying premium glow */}
      <div className="absolute -inset-3 rounded-[28px] opacity-70 blur-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-violet-600/20" />

      {/* Main glass tile */}
      <div
        className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl sm:h-[80px] sm:w-[80px] sm:rounded-[20px] backdrop-blur-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(18, 20, 28, 0.95) 0%, rgba(10, 12, 20, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 24px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Inner atmospheric glow */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-[20px]">
          <div
            className="absolute -inset-6 opacity-40 bg-gradient-to-tr from-emerald-500/25 via-cyan-500/15 to-violet-500/25"
            style={{ filter: "blur(12px)" }}
          />
        </div>

        {/* Inner glow border */}
        <div className="absolute inset-px rounded-[15px] sm:rounded-[19px] bg-gradient-to-tr from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none" />

        {/* Nature Intelligence Mark — Option C */}
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 h-10 w-10 sm:h-12 sm:w-12"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="nali-tile-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          {/* Stroke 1: Left vertical rise */}
          <path
            d="M 144 400 C 144 400, 128 300, 136 240 C 144 180, 152 160, 156 128 C 160 108, 156 96, 160 88"
            stroke="url(#nali-tile-grad)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Stroke 2: Diagonal connector */}
          <path
            d="M 168 112 C 192 160, 228 240, 264 296 C 300 352, 332 380, 348 400"
            stroke="url(#nali-tile-grad)"
            strokeWidth="32"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Stroke 3: Right vertical rise */}
          <path
            d="M 352 400 C 352 392, 356 340, 360 280 C 364 220, 368 160, 364 120 C 362 100, 358 92, 356 84"
            stroke="url(#nali-tile-grad)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Intelligence node dot */}
          <circle cx="356" cy="76" r="10" fill="url(#nali-tile-grad)" />
        </svg>
      </div>
    </div>
  );
}
