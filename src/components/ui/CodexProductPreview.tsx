"use client";

import { BookOpen, Download, FilePlus2, FileText, ListChecks, SearchCheck, Table2 } from "lucide-react";
import { BorderBeam } from "@/components/ui/BorderBeam";

const sidebarItems = [
  { label: "New report", icon: FilePlus2, active: true },
  { label: "Evidence queue", icon: ListChecks },
  { label: "Sources", icon: BookOpen },
  { label: "Export", icon: Download },
];

const evidenceChips = ["Notes", "Source", "File", "Review"];

/**
 * CodexProductPreview — Large product surface rising from bottom of hero.
 * Positioned so only the top ~220px is visible in the first viewport,
 * with the rest extending below the fold. Matches Codex composition
 * where the preview starts at ~72% viewport height.
 */
export function CodexProductPreview() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[-300px] z-0 flex justify-center px-3 sm:bottom-[-240px] sm:px-4 lg:bottom-[-220px]">
      {/* Soft cyan/indigo glow haze behind the card */}
      <div
        className="absolute bottom-[200px] left-[50%] h-[350px] w-[min(900px,80vw)] -translate-x-[50%] rounded-full bg-gradient-to-r from-cyan-500/22 via-indigo-500/28 to-purple-500/18 blur-[90px] mix-blend-screen transform-gpu pointer-events-none opacity-90"
        style={{ willChange: "transform, opacity" }}
      />

      <div
        className="relative h-[420px] w-[min(1280px,calc(100vw-24px))] overflow-hidden rounded-t-[20px] sm:h-[520px] sm:w-[min(1280px,calc(100vw-48px))] sm:rounded-t-[24px]"
        style={{
          background: "linear-gradient(180deg, rgba(20,18,35,0.98) 0%, rgba(14,12,28,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderBottom: "0",
          boxShadow:
            "0 -2px 0 rgba(255,255,255,0.08) inset, 0 -40px 120px rgba(40,30,80,0.35), 0 32px 100px rgba(20,15,50,0.5), 0 0 200px rgba(100,80,200,0.08)",
        }}
      >
        <BorderBeam
          className="opacity-[0.3]"
          colorFrom="rgba(120,100,230,0.5)"
          colorTo="rgba(80,120,220,0.4)"
          duration={18}
          size={300}
        />

        {/* Title bar */}
        <div
          className="absolute inset-x-0 top-0 z-10 flex h-12 items-center gap-3 px-4 sm:h-14 sm:px-5"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-3 min-w-0 text-xs font-medium text-white/55 sm:text-[13px]">
            NaLI: Create Report
          </div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/70">
              Open
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/70">
              Export
            </span>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid h-full pt-12 sm:grid-cols-[200px_minmax(0,1fr)] sm:pt-14 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
          {/* Left sidebar */}
          <aside
            className="hidden p-4 sm:block"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
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
                      item.active ? "bg-white/[0.1] text-white/90" : "text-white/45"
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
                <SearchCheck className="h-3.5 w-3.5 text-cyan-200/70" />
                Review required
              </div>
              <p className="text-[11px] leading-5 text-white/35">
                Human verification remains final before export.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <section className="min-w-0 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-blue-300/90">NaLI</span>
              <span className="text-white/20">/</span>
              <span className="text-white/42">draft workspace</span>
            </div>

            <div className="max-w-[620px]">
              <h2 className="text-[20px] font-semibold tracking-normal text-white/95 sm:text-[22px]">
                Create NaLI report
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-white/45 sm:text-sm">
                Draft from uploaded notes, sources, files, and observations.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {evidenceChips.map((chip) => (
                <span
                  className="rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-white/60"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.78fr]">
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-300/70" />
                  <span className="text-[12px] font-medium text-white/58">
                    Draft from uploaded notes...
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/[0.1]" />
                  <div className="h-2 w-5/6 rounded-full bg-white/[0.08]" />
                  <div className="h-2 w-2/3 rounded-full bg-white/[0.06]" />
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-black/[0.15] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-teal-200/70" />
                  <span className="text-[12px] font-medium text-white/58">Evidence table</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-white/35">
                  <span>Claim</span>
                  <span>Evidence</span>
                  <span>Limit</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="h-2 rounded-full bg-white/[0.1]" />
                    <span className="h-2 rounded-full bg-blue-300/18" />
                    <span className="h-2 rounded-full bg-white/[0.07]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="h-2 rounded-full bg-white/[0.07]" />
                    <span className="h-2 rounded-full bg-violet-300/15" />
                    <span className="h-2 rounded-full bg-white/[0.06]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[12px] leading-5 text-white/38">
              Source verification belum aktif di MVP ini. Review evidence before export.
            </div>
          </section>

          {/* Right sidebar */}
          <aside
            className="hidden p-5 lg:block"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/30 uppercase">
              Report structure
            </div>
            <div className="mt-4 space-y-2">
              {["Context", "Evidence", "Uncertainty", "Next steps"].map((item, index) => (
                <div
                  className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.035] px-3 py-2.5"
                  key={item}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.07] text-[10px] text-white/50">
                    {index + 1}
                  </span>
                  <span className="text-[12px] text-white/58">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-teal-200/10 bg-teal-200/[0.05] p-4">
              <div className="text-[12px] font-medium text-teal-100/75">Export gate</div>
              <p className="mt-2 text-[11px] leading-5 text-white/38">
                Academic integrity consent is required before export.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
