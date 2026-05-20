"use client";

import {
  BookOpen,
  Download,
  FilePlus2,
  FileText,
  ListChecks,
  Lock,
  Settings,
  Table2,
} from "lucide-react";
import type { ReactNode } from "react";

const sidebarItems = [
  { label: "New report", icon: FilePlus2, active: true },
  { label: "Evidence queue", icon: ListChecks },
  { label: "Sources", icon: BookOpen },
  { label: "Export", icon: Download },
  { label: "Settings", icon: Settings },
];

const structureItems = [
  { label: "Intro", done: true },
  { label: "Methods", done: true },
  { label: "Evidence", done: true },
  { label: "Sources", done: false },
  { label: "Review", done: false },
];

function CitationChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 md:text-[12px]">
      {children}
    </span>
  );
}

export function CodexProductPreview() {
  return (
    <div className="relative mx-auto h-[280px] w-[calc(100%_-_40px)] max-w-[350px] md:h-[440px] md:w-[min(1100px,calc(100vw_-_48px))] md:max-w-none">
      <div
        className="h-full overflow-hidden rounded-2xl"
        style={{
          background: "#0f1117",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="flex h-9 items-center gap-3 px-4"
          style={{
            background: "#0c0e14",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="min-w-0 truncate text-[13px] font-medium text-white/[0.55]">
            NaLI: Create Report
          </div>
        </div>

        <div className="grid h-[244px] min-w-0 md:h-[404px] md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside
            className="hidden md:block"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="px-4 pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
              Workspace
            </div>
            <div className="mt-4 space-y-0.5 px-3">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`flex h-10 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium ${
                      item.active
                        ? "border-l-2 border-emerald-500 bg-white/[0.08] text-white"
                        : "text-white/50"
                    }`}
                    key={item.label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col p-4 md:p-6">
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-bold text-white md:text-[24px]">
                Laporan Observasi Burung
              </h2>
              <div className="mt-1 truncate text-[12px] text-white/40 md:text-[13px]">
                draft workspace / Laporan Observasi
              </div>
            </div>

            <div className="mt-4 min-w-0 space-y-3 text-white/70 md:mt-5 md:space-y-5">
              <div>
                <h3 className="text-[14px] font-semibold text-white md:text-[18px]">
                  1. Pendahuluan
                </h3>
                <p className="mt-1.5 text-[12px] leading-[1.65] text-white/60 md:text-[15px] md:leading-[1.7]">
                  Pengamatan dilakukan di jalur tepi hutan dengan catatan waktu,
                  cuaca, dan aktivitas spesies yang perlu ditinjau ulang.{" "}
                  <CitationChip>Catatan lapangan, 15 Mei</CitationChip>
                </p>
              </div>

              <div className="hidden md:block">
                <h3 className="text-[18px] font-semibold text-white">
                  2. Metode Pengamatan
                </h3>
                <p className="mt-1.5 text-[15px] leading-[1.7] text-white/60">
                  Metode transek line digunakan untuk merapikan catatan observasi,
                  foto pendukung, dan batas sumber sebelum export.{" "}
                  <CitationChip>foto_evidence_07.jpg</CitationChip>
                </p>
              </div>
            </div>

            <div className="mt-auto flex h-9 items-center gap-3 border-t border-white/[0.06] pt-3 text-white/40">
              <span className="text-[12px] font-semibold">B</span>
              <span className="text-[12px] italic">I</span>
              <FileText className="h-4 w-4" />
              <Table2 className="h-4 w-4" />
              <span className="text-[15px] leading-none">≡</span>
            </div>
          </section>

          <aside
            className="hidden lg:block"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="p-5">
              <div className="text-[14px] font-semibold text-white">Report Structure</div>
              <div className="mt-4 space-y-2">
                {structureItems.map((item) => (
                  <div className="flex items-center gap-2.5 py-1" key={item.label}>
                    {item.done ? (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-[10px] text-emerald-400">
                        ✓
                      </span>
                    ) : (
                      <span className="h-4 w-4 rounded-full border border-white/20" />
                    )}
                    <span className={item.done ? "text-[14px] text-white/75" : "text-[14px] text-white/40"}>
                      {item.label}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 py-1">
                  <Lock className="h-4 w-4 text-white/20" />
                  <span className="text-[14px] text-white/30">Export Gate</span>
                </div>
              </div>

              <div className="mt-6 border-t border-white/[0.08] pt-5">
                <div className="text-[12px] font-medium text-white/60">
                  Project Evidence Hash
                </div>
                <div className="mt-2 font-mono text-[12px] text-cyan-300">
                  Hash: 0x8f2a...9c
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.10]">
                  <div className="h-full w-3/5 rounded-full bg-emerald-500" />
                </div>
                <div className="mt-2 text-[12px] text-white/40">3/5</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
