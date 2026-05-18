"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
    <div className="rounded-lg border border-[#DDD5C7] bg-white p-3 shadow-[0_18px_70px_rgba(17,24,20,0.08)]">
      <div className="mb-3 flex flex-wrap gap-2">
        <ModeChip active={mode === "draft_from_materials"} onClick={() => setMode("draft_from_materials")}>
          Saya sudah punya bahan
        </ModeChip>
        <ModeChip active={mode === "start_from_zero"} onClick={() => setMode("start_from_zero")}>
          Saya belum punya bahan
        </ModeChip>
      </div>

      <textarea
        className="command-input min-h-[158px] p-4 text-base leading-7 sm:min-h-[178px]"
        value={mainText}
        onChange={(event) => setMainText(event.target.value)}
        placeholder={
          mode === "draft_from_materials"
            ? "Tulis catatan, topik, lokasi, atau sumbermu...\n\nContoh: Saya mengamati erosi di Banjir Kanal Semarang."
            : "Tulis topik atau tugas yang ingin kamu mulai...\n\nContoh: Aku mau bikin laporan observasi sungai, tapi belum punya catatan."
        }
      />

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <select
            aria-label="Template laporan"
            className="field-input text-sm sm:w-64"
            value={reportTemplate}
            onChange={(event) => setReportTemplate(event.target.value)}
          >
            {reportTemplates.map((template) => (
              <option key={template} value={template}>
                {template}
              </option>
            ))}
          </select>
        </div>

        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#173D2B] px-5 text-sm font-semibold text-stone-50 transition hover:bg-[#102b1e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900"
          type="button"
          onClick={start}
        >
          {mode === "draft_from_materials" ? "Buat Draf" : "Buat Panduan"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="px-1 pt-3 text-sm text-[#5F6B62]">Draft berbasis bahan. Validasi akhir tetap manusia.</p>
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
          ? "border-[#173D2B] bg-[#E8EFE4] text-[#173D2B]"
          : "border-[#DDD5C7] bg-[#FCFAF4] text-[#5F6B62] hover:bg-[#E8EFE4]",
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
