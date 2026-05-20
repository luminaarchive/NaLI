"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CodexNav } from "./CodexNav";
import { GeminiGlowBackground } from "./GeminiGlowBackground";
import { ScrollDarkenOverlay } from "./ScrollDarkenOverlay";

/**
 * HomepageShell — Wraps homepage content with:
 * 1. Gemini fluid ambient glow background
 * 2. Scroll-linked darkening overlay
 * 3. Transparent/dark glass nav
 * 4. Body color overrides for dark mode context
 */
export function HomepageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const prevBg = body.style.backgroundColor;
    const prevColor = body.style.color;
    body.style.backgroundColor = "#07090e";
    body.style.color = "#ffffff";
    return () => {
      body.style.backgroundColor = prevBg;
      body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="relative min-h-screen text-white bg-[#07090e]">
      <GeminiGlowBackground />
      <ScrollDarkenOverlay />
      <CodexNav />
      {children}
    </div>
  );
}
