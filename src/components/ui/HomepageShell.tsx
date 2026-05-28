"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CodexNav } from "./CodexNav";
import { FluidVideoBackground } from "./FluidVideoBackground";

/**
 * HomepageShell: wraps homepage content with:
 * 1. Fluid video ambient glow background (with CSS fallback)
 * 2. Transparent/dark glass nav
 * 3. Body color overrides for dark mode context
 */
export function HomepageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const prevBg = body.style.backgroundColor;
    const prevColor = body.style.color;
    body.style.backgroundColor = "#060b08";
    body.style.color = "#ffffff";
    return () => {
      body.style.backgroundColor = prevBg;
      body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060b08] text-white">
      <FluidVideoBackground />
      <CodexNav />
      {children}
    </div>
  );
}
