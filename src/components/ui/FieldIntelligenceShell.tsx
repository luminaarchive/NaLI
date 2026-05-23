"use client";

import type { ReactNode } from "react";
import { CodexMagicBackground } from "./CodexMagicBackground";
import { CodexNav } from "./CodexNav";

export function FieldIntelligenceShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#07090e] text-white">
      <CodexMagicBackground />
      <CodexNav />
      {children}
    </div>
  );
}
