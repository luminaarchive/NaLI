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

export function CodexProductPreview() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[-245px] z-0 flex justify-center px-3 sm:bottom-[-225px] sm:px-6 lg:bottom-[-218px]">
      <div
        className="relative h-[370px] w-[min(1160px,calc(100vw-24px))] overflow-hidden rounded-t-[28px] sm:h-[430px] sm:w-[min(1160px,calc(100vw-56px))] sm:rounded-t-[34px]"
        style={{
          background: "linear-gradient(180deg, rgba(20,26,40,0.96) 0%, rgba(14,18,29,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderBottom: "0",
          boxShadow:
            "0 -1px 0 rgba(255,255,255,0.18) inset, 0 -34px 110px rgba(30,41,59,0.26), 0 28px 90px rgba(15,23,42,0.4)",
        }}
      >
        <BorderBeam
          className="opacity-[0.35]"
          colorFrom="rgba(96,165,250,0.55)"
          colorTo="rgba(167,139,250,0.45)"
          duration={18}
          size={260}
        />

        <div
          className="absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-3 px-4 sm:px-5"
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
          <div className="ml-3 min-w-0 text-xs font-medium text-white/58 sm:text-[13px]">NaLI — Create Report</div>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/72">
              Open
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/72">
              Export
            </span>
          </div>
        </div>

        <div className="grid h-full pt-14 sm:grid-cols-[218px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_300px]">
          <aside
            className="hidden p-4 sm:block"
            style={{
              background: "rgba(255,255,255,0.035)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-white/32 uppercase">Workspace</div>
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13px] ${
                      item.active ? "bg-white/[0.11] text-white" : "text-white/48"
                    }`}
                    key={item.label}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 rounded-lg border border-white/[0.07] bg-black/[0.12] p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-white/64">
                <SearchCheck className="h-3.5 w-3.5 text-cyan-200/80" />
                Review required
              </div>
              <p className="text-[11px] leading-5 text-white/38">Human verification remains final before export.</p>
            </div>
          </aside>

          <section className="min-w-0 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-blue-200">NaLI</span>
              <span className="text-white/20">/</span>
              <span className="text-white/45">draft workspace</span>
            </div>

            <div className="max-w-[620px]">
              <h2 className="text-[20px] font-semibold tracking-normal text-white sm:text-[22px]">
                Create NaLI report
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-white/48 sm:text-sm">
                Draft from uploaded notes, sources, files, and observations.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {evidenceChips.map((chip) => (
                <span
                  className="rounded-full border border-white/[0.08] bg-white/[0.055] px-3 py-1 text-[11px] font-medium text-white/66"
                  key={chip}
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_0.78fr]">
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.045] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-200/80" />
                  <span className="text-[12px] font-medium text-white/62">Draft from uploaded notes...</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/[0.12]" />
                  <div className="h-2 w-5/6 rounded-full bg-white/[0.09]" />
                  <div className="h-2 w-2/3 rounded-full bg-white/[0.07]" />
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.08] bg-black/[0.12] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Table2 className="h-4 w-4 text-teal-200/80" />
                  <span className="text-[12px] font-medium text-white/62">Evidence table</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-white/38">
                  <span>Claim</span>
                  <span>Evidence</span>
                  <span>Limit</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="h-2 rounded-full bg-white/[0.11]" />
                    <span className="h-2 rounded-full bg-blue-300/20" />
                    <span className="h-2 rounded-full bg-white/[0.08]" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="h-2 rounded-full bg-white/[0.08]" />
                    <span className="h-2 rounded-full bg-violet-300/18" />
                    <span className="h-2 rounded-full bg-white/[0.07]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-[12px] leading-5 text-white/42">
              Source verification belum aktif di MVP ini. Review evidence before export.
            </div>
          </section>

          <aside
            className="hidden p-5 lg:block"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-[10px] font-semibold tracking-[0.18em] text-white/32 uppercase">Report structure</div>
            <div className="mt-4 space-y-2">
              {["Context", "Evidence", "Uncertainty", "Next steps"].map((item, index) => (
                <div
                  className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2.5"
                  key={item}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[10px] text-white/52">
                    {index + 1}
                  </span>
                  <span className="text-[12px] text-white/62">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-teal-200/10 bg-teal-200/[0.06] p-4">
              <div className="text-[12px] font-medium text-teal-100/80">Export gate</div>
              <p className="mt-2 text-[11px] leading-5 text-white/42">
                Academic integrity consent is required before export.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
