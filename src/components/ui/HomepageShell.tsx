"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CodexNav } from "./CodexNav";
import { NaLICodexBackground } from "./NaLICodexBackground";

/**
 * HomepageShell — Wraps homepage content with light atmospheric background,
 * nav, and body overrides to ensure the homepage is light-themed despite
 * the app's default dark body.
 */
export function HomepageShell({ children }: { children: ReactNode }) {
  /* Override the dark body background/color on mount, restore on unmount */
  useEffect(() => {
    const body = document.body;
    const prevBg = body.style.backgroundColor;
    const prevColor = body.style.color;
    body.style.backgroundColor = "#f7fbff";
    body.style.color = "#0f172a";
    return () => {
      body.style.backgroundColor = prevBg;
      body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f7fbff] text-[#0f172a]">
      <NaLICodexBackground />
      <CodexNav />
      {children}
    </div>
  );
}
