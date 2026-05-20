"use client";

import type { ReactNode } from "react";
import { SiteNav } from "./SiteNav";

export function PricingShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F7F3EA] text-[#111814]">
      <SiteNav />
      {children}
    </div>
  );
}
