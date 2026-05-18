"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, Compass } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { reportTemplates, type ReportMode } from "@/lib/reports/reportGenerator";
import { cn } from "@/lib/utils";

const templateChips = [
  "Observasi Lingkungan",
  "Praktikum Biologi",
  "Field Trip",
  "KKN Lingkungan",
  "Survei Flora/Fauna",
];

const guardrails = ["Evidence Table", "Uncertainty Note", "No Fake Citation", "Human Review"];

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
    <div className="rounded-lg border border-white/10 bg-[#07100c]/80 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="rounded-md border border-white/10 bg-white/5 p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <ModeChip active={mode === "draft_from_materials"} onClick={() => setMode("draft_from_materials")}>
            Saya sudah punya bahan
          </ModeChip>
          <ModeChip active={mode === "start_from_zero"} onClick={() => setMode("start_from_zero")}>
            Saya belum punya bahan
          </ModeChip>
        </div>

        <textarea
          className="command-input min-h-[168px] p-4 text-base leading-7 sm:min-h-[188px]"
          value={mainText}
          onChange={(event) => setMainText(event.target.value)}
          placeholder={
            mode === "draft_from_materials"
              ? "Tulis catatan yang kamu punya...\n\nContoh: Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terlihat terkikis..."
              : "Tulis topik atau tugas yang ingin kamu mulai...\n\nContoh: Aku mau bikin laporan observasi lingkungan tentang sungai, tapi belum punya catatan."
          }
        />

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <select
              aria-label="Template laporan"
              className="field-input border-white/15 bg-white/10 text-sm text-stone-50 [color-scheme:dark] sm:w-64"
              value={reportTemplate}
              onChange={(event) => setReportTemplate(event.target.value)}
            >
              {reportTemplates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
            <div className="hidden flex-wrap gap-2 xl:flex">
              {templateChips.map((chip) => (
                <Badge key={chip} tone="dark">
                  {chip}
                </Badge>
              ))}
            </div>
          </div>

          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-50 px-5 text-sm font-semibold text-forest-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-data-cyan"
            type="button"
            onClick={start}
          >
            {mode === "draft_from_materials" ? (
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Compass className="h-4 w-4" aria-hidden="true" />
            )}
            {mode === "draft_from_materials" ? "Buat Draf Berbasis Bahan" : "Buat Panduan Mulai"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-2 pb-2 pt-3">
        {guardrails.map((item) => (
          <Badge key={item} tone="cyan">
            {item}
          </Badge>
        ))}
      </div>
    </div>
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
        "rounded-full border px-3 py-2 text-xs font-semibold transition sm:text-sm",
        active
          ? "border-data-cyan/60 bg-data-cyan/15 text-stone-50"
          : "border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-stone-50",
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
