"use client";

import { useEffect, useRef } from "react";

/**
 * ScrollDarkenOverlay — A performant scroll-linked darkening gradient.
 * 
 * As the user scrolls down through the hero section, a dark overlay
 * gradually increases in opacity from 0 → 0.35, creating the illusion
 * that the atmospheric background gets darker toward the product preview.
 * 
 * Uses requestAnimationFrame + transform for GPU compositing.
 * Only reads scrollY, writes to a single element's opacity.
 */
export function ScrollDarkenOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!ref.current) {
          ticking = false;
          return;
        }
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        // Start darkening at 20% scroll, reach max at 90%
        const progress = Math.min(1, Math.max(0, (scrollY - vh * 0.2) / (vh * 0.7)));
        ref.current.style.opacity = String(progress * 0.4);
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // Initial call
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] transform-gpu"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, transparent 20%, rgba(15,10,40,0.15) 45%, rgba(15,10,40,0.5) 70%, rgba(15,10,40,0.8) 90%, rgba(15,10,40,0.95) 100%)",
        opacity: 0,
        willChange: "opacity",
      }}
    />
  );
}
