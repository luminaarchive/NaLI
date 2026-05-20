"use client";

import type { ReactNode } from "react";

export function CreateReportShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F3EA] text-[#111814]">
      {children}
    </div>
  );
}
