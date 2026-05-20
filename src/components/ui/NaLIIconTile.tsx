"use client";

interface NaLIMarkProps {
  className?: string;
  gradientId?: string;
}

export function NaLIMark({
  className = "h-6 w-6",
  gradientId = "nali-mark-gradient",
}: NaLIMarkProps) {
  const gradientUrl = `url(#${gradientId})`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="8"
          x2="40"
          y1="42"
          y2="6"
        >
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="48%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M13.5 39.5C12.2 31.8 12.8 19.5 15.8 8.5"
        stroke={gradientUrl}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.8"
      />
      <path
        d="M17.2 9.8C22.6 19.1 27.8 29.4 34.6 38.6"
        stroke={gradientUrl}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.4"
      />
      <path
        d="M35.2 39.4C37.2 29.8 36.6 18.4 33.2 8.2"
        stroke={gradientUrl}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.8"
      />
    </svg>
  );
}

export function NaLIIconTile() {
  return (
    <div
      className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl md:h-20 md:w-20"
      style={{
        background: "#0f1117",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 18px 42px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -26px 48px rgba(16,185,129,0.08)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 28% 78%, rgba(16,185,129,0.16), transparent 38%), radial-gradient(circle at 78% 20%, rgba(124,58,237,0.14), transparent 42%)",
        }}
      />
      <NaLIMark
        className="relative h-12 w-12 md:h-[52px] md:w-[52px]"
        gradientId="nali-hero-mark-gradient"
      />
    </div>
  );
}
