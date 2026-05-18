"use client";

import type { ReactNode } from "react";
import { AmbientBackground } from "./AmbientBackground";

export function CreateReportShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-white">
      <AmbientBackground />
      {children}
    </div>
  );
}
