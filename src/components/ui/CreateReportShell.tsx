"use client";

import type { ReactNode } from "react";
import { CodexMagicBackground } from "./CodexMagicBackground";

export function CreateReportShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-white">
      <CodexMagicBackground />
      {children}
    </div>
  );
}
