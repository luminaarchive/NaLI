import type { SVGProps } from "react";

/**
 * NaLI gunungan (kayon) emblem, recreated as a clean monochrome SVG.
 *
 * Stylised, not a pixel-trace of the raster logo: a pointed gunungan silhouette
 * with a radiant sun, a central tree of life with leaf nodes, paired birds, two
 * facing animals (harimau / banteng), and a temple-gate base with two guardians.
 * Everything is drawn in `currentColor` so it reads navy on paper and white on
 * the dark hero, matching the brand lockup either way.
 */
export function NaliMark({
  title = "NaLI",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 200 300"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* radiant sun at the apex */}
        <g strokeWidth={1.6}>
          {Array.from({ length: 13 }).map((_, i) => {
            const a = (-90 + (i - 6) * 13) * (Math.PI / 180);
            const r1 = 13;
            const r2 = i % 2 === 0 ? 22 : 18;
            const cx = 100;
            const cy = 26;
            return (
              <line
                key={i}
                x1={cx + Math.cos(a) * r1}
                y1={cy + Math.sin(a) * r1}
                x2={cx + Math.cos(a) * r2}
                y2={cy + Math.sin(a) * r2}
              />
            );
          })}
        </g>

        {/* gunungan outline */}
        <path
          d="M100 40
             C 82 76 56 116 46 164
             C 38 202 50 228 78 238
             L 122 238
             C 150 228 162 202 154 164
             C 144 116 118 76 100 40 Z"
          strokeWidth={3}
        />
      </g>

      <g fill="currentColor">
        {/* tree of life: trunk */}
        <path
          d="M97 238 L97 96 C97 86 103 86 103 96 L103 238 Z"
          opacity={0.95}
        />
        {/* central crown leaf */}
        <path d="M100 60 C96 70 96 80 100 88 C104 80 104 70 100 60 Z" />

        {/* symmetric branches with leaf nodes */}
        <g
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
        >
          {/* upper boughs */}
          <path d="M100 104 C84 104 74 116 70 132" />
          <path d="M100 104 C116 104 126 116 130 132" />
          {/* mid boughs */}
          <path d="M100 132 C80 134 66 146 62 162" />
          <path d="M100 132 C120 134 134 146 138 162" />
        </g>
        {/* leaf nodes (small discs) */}
        {[
          [70, 132],
          [130, 132],
          [62, 162],
          [138, 162],
          [82, 118],
          [118, 118],
          [76, 150],
          [124, 150],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4.2} />
        ))}

        {/* paired birds near the upper third */}
        {[78, 122].map((cx, i) => (
          <path
            key={i}
            transform={i === 1 ? `translate(${cx}, 96) scale(-1,1)` : `translate(${cx}, 96)`}
            d="M0 0 C4 -3 9 -3 12 1 C14 -1 17 -1 18 1 C16 3 13 3 12 2 C10 5 4 6 1 3 Z"
          />
        ))}

        {/* facing animals: harimau (left), banteng (right), simplified silhouettes */}
        {/* harimau */}
        <path
          d="M52 196
             C54 190 60 188 66 188
             C70 184 76 184 80 188
             C84 188 88 190 90 194
             L90 200 L86 200 L86 205 L82 205 L82 200
             L66 200 L66 205 L62 205 L62 200 L56 200
             C53 200 51 199 52 196 Z"
        />
        {/* banteng */}
        <path
          transform="translate(200,0) scale(-1,1)"
          d="M52 196
             C54 190 60 189 66 189
             C68 184 72 182 76 184
             C73 187 75 189 79 188
             C84 188 88 190 90 194
             L90 200 L86 200 L86 205 L82 205 L82 200
             L66 200 L66 205 L62 205 L62 200 L56 200
             C53 200 51 199 52 196 Z"
        />

        {/* temple-gate base */}
        <g>
          {/* plinth */}
          <rect x="58" y="246" width="84" height="6" rx="1" />
          {/* central gate */}
          <path d="M92 246 L92 224 C92 218 108 218 108 224 L108 246 Z" />
          <rect x="96" y="230" width="8" height="16" fill="none" stroke="currentColor" strokeWidth={1.6} />
          {/* two guardians flanking the gate */}
          {[68, 132].map((cx, i) => (
            <g key={i} transform={`translate(${cx},226)`}>
              <circle cx="0" cy="4" r="4" />
              <rect x="-5" y="9" width="10" height="14" rx="2" />
              <rect x="-6" y="24" width="12" height="4" rx="1" />
            </g>
          ))}
          {/* gate columns */}
          <rect x="80" y="226" width="6" height="20" rx="1" />
          <rect x="114" y="226" width="6" height="20" rx="1" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Full brand lockup: emblem + wordmark, stacked or inline. Uses currentColor.
 */
export function NaliLockup({
  className = "",
  markClassName = "",
  showTagline = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <NaliMark className={markClassName || "h-7 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight">
          NaLI
        </span>
        {showTagline && (
          <span className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-70">
            Nature Life Intelligence
          </span>
        )}
      </span>
    </span>
  );
}
