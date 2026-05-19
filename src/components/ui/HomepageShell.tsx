"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CodexNav } from "./CodexNav";
import { NaLICodexBackground } from "./NaLICodexBackground";
import { ScrollDarkenOverlay } from "./ScrollDarkenOverlay";

/**
 * HomepageShell — Wraps homepage content with:
 * 1. Rich atmospheric fixed background
 * 2. Scroll-linked darkening overlay
 * 3. Transparent nav
 * 4. Body color overrides for homepage context
 */
export function HomepageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const prevBg = body.style.backgroundColor;
    const prevColor = body.style.color;
    body.style.backgroundColor = "#17103a";
    body.style.color = "#ffffff";
    return () => {
      body.style.backgroundColor = prevBg;
      body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      <NaLICodexBackground />
      <ScrollDarkenOverlay />
      <CodexNav />
      {children}
    </div>
  );
}
