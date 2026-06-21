"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePresence } from "framer-motion";

/**
 * Sand / particle dissolve image transition built on SVG displacement filters.
 * Adapted from the neo-museum reference: an entering image resolves from blown
 * sand (quartic ease-out), an exiting one scatters upward (cubic ease-in).
 * Each instance gets a unique filter id so several can run at once.
 */
export function SandTransitionImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const rawId = useId().replace(/[:]/g, "");
  const filterId = `sand-${rawId}`;
  const [progress, setProgress] = useState(isPresent ? 0 : 1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const DURATION = 900;
    const start = performance.now();
    const entering = isPresent;

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // entering: quartic ease-out settling to crisp; exiting: cubic ease-in
      const eased = entering ? 1 - Math.pow(1 - t, 4) : Math.pow(t, 3);
      setProgress(entering ? 1 - eased : eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!entering) {
        safeToRemove?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPresent, safeToRemove]);

  // progress 0 = crisp, 1 = fully dissolved
  const p = progress;
  const displace = 150 * p;
  const dy = isPresent ? -80 * p : 120 * p;
  const dx = (isPresent ? -30 : 30) * p;
  const blur = 6 * p;
  const opacity = Math.max(0, 1 - p * 1.2);

  return (
    <div className={className} style={{ opacity }}>
      <svg
        width="0"
        height="0"
        aria-hidden
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.8"
            numOctaves="4"
            seed="7"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={displace}
            xChannelSelector="R"
            yChannelSelector="G"
            result="disp"
          />
          <feOffset in="disp" dx={dx} dy={dy} result="off" />
          <feGaussianBlur in="off" stdDeviation={blur} />
        </filter>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className="nm-sand-img h-full w-full object-contain"
        style={{ filter: p > 0.001 ? `url(#${filterId})` : "none" }}
      />
    </div>
  );
}
