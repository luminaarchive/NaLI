"use client";

import { BookOpen, Download, FilePlus2, FileText, ListChecks, SearchCheck, Table2 } from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";

const sidebarItems = [
  { label: "New report", icon: FilePlus2, active: true },
  { label: "Evidence queue", icon: ListChecks },
  { label: "Sources", icon: BookOpen },
  { label: "Export", icon: Download },
];

/**
 * CodexProductPreview — Product surface in normal document flow below hero.
 * Desktop: 1100px wide, ~440px tall, 3-panel layout.
 * Mobile: calc(100% - 40px) wide, simplified 2-panel layout.
 * No absolute positioning. No overlap with hero CTA.
 */
export function CodexProductPreview() {
  return (
    <div className="relative mx-auto w-[min(1100px,calc(100%-40px))] sm:w-[min(1100px,calc(100%-48px))]">
      {/* Soft glow haze behind */}
      <div
        className="absolute -top-16 left-1/2 h-[300px] w-[min(900px,80vw)] -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-500/15 via-indigo-500/20 to-violet-500/12 blur-[80px] mix-blend-screen pointer-events-none opacity-80"
        style={{ willChange: "transform, opacity" }}
      />

      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "#0f1117",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
        }}
      >
        <BorderBeam
          className="opacity-[0.25]"
          colorFrom="rgba(16,185,129,0.4)"
          colorTo="rgba(124,58,237,0.3)"
          duration={18}
          size={300}
        />

        {/* Title bar — 36px */}
        <div
          className="relative z-10 flex h-9 items-center gap-3 px-4 sm:px-5"
          style={{
            background: "#0c0e14",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-[6px]">
            <span className="h-[10px] w-[10px] rounded-full bg-[#ff5f57] sm:h-3 sm:w-3" />
            <span className="h-[10px] w-[10px] rounded-full bg-[#febc2e] sm:h-3 sm:w-3" />
            <span className="h-[10px] w-[10px] rounded-full bg-[#28c840] sm:h-3 sm:w-3" />
          </div>
          <div className="min-w-0 text-[11px] font-medium text-white/55 sm:text-[13px]">
            NaLI: Create Report
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/60">
              Open
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium text-white/60">
              Export
            </span>
          </div>
        </div>

        {/* Main layout — 3-panel desktop, simplified mobile */}
        <div className="grid min-h-[280px] sm:min-h-[380px] sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          {/* Left sidebar */}
          <aside
            className="hidden p-4 sm:block"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
              Workspace
            </div>
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] ${
                      item.active
                        ? "border-l-2 border-emerald-500 bg-white/[0.08] text-white/90"
                        : "text-white/45"
                    }`}
                    key={item.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg border border-white/[0.06] bg-black/[0.15] p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-white/60">
                <SearchCheck className="h-3.5 w-3.5 text-cyan-300/70" />
                Review required
              </div>
              <p className="text-[11px] leading-5 text-white/35">
                Human verification remains final before export.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <section className="min-w-0 p-4 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-cyan-300/90">NaLI</span>
              <span className="text-white/20">/</span>
              <span className="text-white/42">draft workspace</span>
              <span className="text-white/20">/</span>
              <span className="text-white/42">Laporan Observasi</span>
            </div>

            <div className="max-w-[580px]">
              <h2 className="text-[18px] font-semibold tracking-normal text-white/95 sm:text-[22px]">
                Laporan Observasi Burung
              </h2>
              <p className="mt-2 text-[12px] leading-6 text-white/45 sm:text-[13px]">
                Draft from uploaded notes, sources, files, and observations.
              </p>
            </div>

            {/* Inline content preview */}
            <div className="mt-4 max-w-[580px] space-y-3 text-[13px] leading-[1.7] text-white/60">
              <div>
                <h3 className="text-[14px] font-semibold text-white/80">1. Pendahuluan</h3>
                <p className="mt-1.5 text-[12px] leading-6 text-white/50">
                  Pengamatan dilakukan di kawasan konservasi pada periode Mei 2026
                  dengan metode transek line.{" "}
                  <span className="inline-flex items-center rounded-md bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                    Catatan lapangan, 15 Mei 2026
                  </span>
                </p>
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-white/80">2. Metode Pengamatan</h3>
                <p className="mt-1.5 text-[12px] leading-6 text-white/50">
                  Metode transek line digunakan dengan interval pengamatan 50m.{" "}
                  <span className="inline-flex items-center rounded-md bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                    foto_evidence_07.jpg
                  </span>
                </p>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="mt-4 flex items-center gap-3 border-t border-white/[0.06] pt-3 text-white/30">
              <span className="text-[11px] font-semibold">B</span>
              <span className="text-[11px]">I</span>
              <FileText className="h-3.5 w-3.5" />
              <Table2 className="h-3.5 w-3.5" />
            </div>
          </section>

          {/* Right sidebar — Report Structure */}
          <aside
            className="hidden p-5 lg:block"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
              Report structure
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: "Introduction", done: true },
                { label: "Methods", done: true },
                { label: "Evidence Table", done: false },
                { label: "Source Coverage", done: false },
                { label: "Review Status", done: false },
              ].map((item) => (
                <div
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2"
                  key={item.label}
                >
                  {item.done ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">✓</span>
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/20" />
                  )}
                  <span className={`text-[12px] ${item.done ? "text-white/70" : "text-white/40"}`}>
                    {item.label}
                  </span>
                </div>
              ))}
              {/* Export Gate — locked */}
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 opacity-50">
                <span className="flex h-4 w-4 items-center justify-center text-[10px] text-white/20">🔒</span>
                <span className="text-[12px] text-white/30">Export Gate</span>
              </div>
            </div>

            {/* Source Coverage */}
            <div className="mt-5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="text-[11px] font-medium text-white/60">Source Coverage</div>
              <div className="mt-2 font-mono text-[10px] text-cyan-300">Hash: 0x8f2a...9c</div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.08]">
                <div className="h-full w-3/5 rounded-full bg-emerald-500/60" />
              </div>
              <div className="mt-1 text-[10px] text-white/35">3/5 sources verified</div>
            </div>

            {/* Export Gate status */}
            <div className="mt-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-3">
              <div className="text-[11px] font-medium text-amber-300">Export Gate</div>
              <p className="mt-1 text-[10px] text-white/40">
                Status: Review required. 2 items need attention.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
