"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { NALI_TIERS, tierById } from "@/lib/nali-models";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedId, onSelect, disabled }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = tierById(selectedId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      {/* Chip */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/[0.1] hover:text-white disabled:opacity-40",
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: active.dot }} />
        <span className="max-w-[110px] truncate">{active.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown (opens upward) */}
      {open && (
        <div
          role="listbox"
          className="absolute bottom-[calc(100%+8px)] left-0 z-50 w-[320px] rounded-xl border border-white/[0.12] bg-[#161616] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <p className="px-2 pt-1 pb-1.5 text-[10px] font-semibold tracking-wider text-white/35 uppercase">Mode NaLI</p>
          {NALI_TIERS.map((t) => {
            const isActive = t.id === selectedId;
            return (
              <button
                key={t.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onSelect(t.id);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.04]"
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.dot }} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-white/85">{t.label}</span>
                    {isActive && (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#00FFB3]">
                        <Check className="h-3 w-3" />
                        aktif
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-white/40">{t.tagline}</span>
                </span>
              </button>
            );
          })}
          <p className="px-2 pt-2 pb-1 text-[10px] leading-relaxed text-white/30 italic">
            Mode gratis mungkin lebih lambat saat permintaan tinggi.
          </p>
        </div>
      )}
    </div>
  );
}
