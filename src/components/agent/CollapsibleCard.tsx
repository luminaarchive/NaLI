"use client";

import { type ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  title: string;
  /** Shown in the header row, right of the title, when collapsed or always. */
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  /** Optional accent color for a small leading dot. */
  dotColor?: string;
}

export function CollapsibleCard({ title, summary, defaultOpen = false, children, dotColor }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition hover:bg-white/[0.02]"
      >
        {dotColor && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: dotColor }} />}
        <span className="text-[13px] font-semibold text-white/80">{title}</span>
        {summary && <span className="ml-1 truncate text-[12px] text-white/45">{summary}</span>}
        <ChevronDown
          className={cn("ml-auto h-4 w-4 shrink-0 text-white/30 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="border-t border-white/[0.05] px-4 py-4">{children}</div>}
    </div>
  );
}
