"use client";

import type { ReactNode } from "react";
import { AmbientBackground } from "./AmbientBackground";
import { SiteNav } from "./SiteNav";

export function FieldIntelligenceShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-white">
      <AmbientBackground />
      <SiteNav />
      {children}
    </div>
  );
}
