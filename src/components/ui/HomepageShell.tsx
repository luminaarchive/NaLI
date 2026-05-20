"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { CodexNav } from "./CodexNav";

export function HomepageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const prevBg = body.style.backgroundColor;
    const prevColor = body.style.color;
    body.style.backgroundColor = "#F7F3EA";
    body.style.color = "#111814";
    return () => {
      body.style.backgroundColor = prevBg;
      body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F3EA] text-[#111814]">
      <CodexNav />
      {children}
    </div>
  );
}
