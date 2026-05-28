"use client";

import type { ReactNode } from "react";
import { CodexMagicBackground } from "./CodexMagicBackground";
import { CodexNav } from "./CodexNav";

export function PricingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#060b08] text-white">
      <CodexMagicBackground />
      <CodexNav />
      {children}
    </div>
  );
}
