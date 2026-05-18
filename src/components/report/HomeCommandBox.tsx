"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Mic, ChevronDown } from "lucide-react";
import { reportTemplates, type ReportMode } from "@/lib/reports/reportGenerator";
import { cn } from "@/lib/utils";

export function HomeCommandBox() {
  const router = useRouter();
  const [mode, setMode] = useState<ReportMode>("draft_from_materials");
  const [mainText, setMainText] = useState("");
  const [reportTemplate, setReportTemplate] = useState("Laporan Observasi Lingkungan");

  function start() {
    window.localStorage.setItem(
      "nali-create-report-prefill",
      JSON.stringify({
        mainText,
        mode,
        reportTemplate,
      }),
    );
    router.push(`/create-report?mode=${mode}`);
  }

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/40 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {/* Inner top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

      {/* Mode selector */}
      <div className="flex gap-2 border-b border-white/[0.06] px-4 py-3">
        <ModeChip active={mode === "draft_from_materials"} onClick={() => setMode("draft_from_materials")}>
          I have materials
        </ModeChip>
        <ModeChip active={mode === "start_from_zero"} onClick={() => setMode("start_from_zero")}>
          Start from scratch
        </ModeChip>
      </div>

      {/* Text area */}
      <div className="px-4 py-3">
        <textarea
          className="w-full resize-none bg-transparent text-[15px] leading-7 text-white/90 outline-none placeholder:text-white/25"
          rows={4}
          value={mainText}
          onChange={(event) => setMainText(event.target.value)}
          placeholder={
            mode === "draft_from_materials"
              ? "Ask NaLI to build a report from your notes..."
              : "Describe the topic you want to explore..."
          }
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Plus icon */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/60"
            aria-label="Add attachment"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Template selector */}
          <div className="relative">
            <select
              aria-label="Report template"
              className="h-8 cursor-pointer appearance-none rounded-lg border border-white/[0.08] bg-transparent py-0 pr-7 pl-3 text-xs font-medium text-white/50 outline-none transition-colors hover:border-white/[0.15] hover:text-white/70"
              value={reportTemplate}
              onChange={(event) => setReportTemplate(event.target.value)}
            >
              {reportTemplates.map((template) => (
                <option key={template} value={template} className="bg-[#18181b] text-white">
                  {template}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-white/30" />
          </div>

          {/* Mic */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:text-white/50"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        {/* Send button */}
        <button
          className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#09090b] transition-all hover:bg-white/90"
          type="button"
          onClick={start}
        >
          {mode === "draft_from_materials" ? "Build Draft" : "Create Guide"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}

function ModeChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
        active
          ? "border-white/[0.15] bg-white/[0.08] text-white"
          : "border-transparent text-white/35 hover:text-white/60",
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
