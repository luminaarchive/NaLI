"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fixed, full-viewport atmosphere that sits BEHIND all page content
 * (-z-10, pointer-events-none). It adds motion without touching legibility:
 * the page's solid theme color + text render on top. Dimmed in light mode so
 * it reads as a tint, lusher in dark mode. Under prefers-reduced-motion it
 * removes itself entirely and the page falls back to its static theme texture.
 */
export function PageBackdrop({
  children,
  className,
  light = "opacity-[0.30]",
  dark = "dark:opacity-[0.55]",
}: {
  children: ReactNode;
  className?: string;
  /** Tailwind opacity class for light mode (keep low for readability). */
  light?: string;
  /** Tailwind opacity class for dark mode. */
  dark?: string;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className={cn("absolute inset-0 h-full w-full", light, dark, className)}>
        {children}
      </div>
      {/* legibility vignette: paper fades in at the top and bottom so the nav,
          hero heading and footer stay readable over the motion */}
      <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/10 to-paper/75 dark:from-paper/55 dark:via-paper/10 dark:to-paper/70" />
    </div>
  );
}
