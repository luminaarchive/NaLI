"use client";

import type { ReactNode } from "react";
import { CodexMagicBackground } from "./CodexMagicBackground";
import { SiteNav } from "./SiteNav";

export function LearnReportShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-white">
      <CodexMagicBackground />
      <SiteNav />
      {children}
    </div>
  );
}
