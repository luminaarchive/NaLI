"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface NaLIMarkProps {
  size?: number;
  className?: string;
  monochrome?: boolean;
  gradientId?: string;
}

export function NaLIMark({ size = 24, className }: NaLIMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex shrink-0 overflow-hidden", className)}
      style={className ? undefined : { height: size, width: size }}
    >
      <Image
        alt=""
        className="object-contain"
        fill
        priority={size >= 64}
        sizes={`${size}px`}
        src="/logo-nali.png"
        unoptimized
      />
    </span>
  );
}

export function NaLIIconTile() {
  return (
    <div className="relative mx-auto flex h-[68px] w-[92px] items-center justify-center overflow-hidden rounded-lg border border-[#DDD5C7] bg-white/75 shadow-[0_18px_40px_rgba(17,24,20,0.08)] md:h-[78px] md:w-[108px]">
      <NaLIMark className="h-[48px] w-[72px] md:h-[56px] md:w-[84px]" size={84} />
    </div>
  );
}
