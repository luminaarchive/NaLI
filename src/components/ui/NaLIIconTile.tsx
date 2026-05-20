"use client";

import Image from "next/image";

interface NaLIMarkProps {
  size?: number;
  className?: string;
  monochrome?: boolean;
  gradientId?: string;
}

export function NaLIMark({
  size = 24,
  className,
  monochrome = false,
  gradientId = "nali-mark-gradient",
}: NaLIMarkProps) {
  const gradientUrl = `url(#${gradientId})`;
  const strokeColor = monochrome ? "currentColor" : gradientUrl;
  const fillColor = monochrome ? "currentColor" : gradientUrl;

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradientId}
          x1="11"
          x2="52"
          y1="55"
          y2="8"
        >
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="46%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path
        d="M16.7 53.5C18.9 46.5 19.6 39.2 18 32.6C16.5 26.4 19.2 18.7 23.5 9.7"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.8"
      />
      <path
        d="M23.2 10.4C26.3 18.6 28.5 26.2 32.4 31.7C37.4 38.7 41.1 46 46.4 53"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.2"
      />
      <path
        d="M46.6 53.2C42.7 45.1 43.4 37 46.2 29.6C49.1 22.1 46.8 14.9 41.2 8.7"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.8"
      />
      <path
        d="M27.1 18.6C30.2 25.7 33.3 32.7 37.7 40.4"
        opacity="0.38"
        stroke={strokeColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="42.4" cy="8.8" fill={fillColor} r="2.4" />
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
      <Image
        src="/images/nali-logo-mark.png"
        alt="NaLI"
        fill
        className="object-cover p-1.5"
        sizes="80px"
        unoptimized
      />
    </div>
  );
}
