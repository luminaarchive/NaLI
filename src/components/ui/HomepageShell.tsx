"use client";

import type { ReactNode } from "react";
import { CodexAtmosphericBackground } from "./CodexAtmosphericBackground";
import { CodexNav } from "./CodexNav";

export function HomepageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-gray-900">
      <CodexAtmosphericBackground />
      <CodexNav />
      {children}
    </div>
  );
}
