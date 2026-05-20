"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { reportTemplates, type ReportMode } from "@/lib/reports/reportGenerator";
import { cn } from "@/lib/utils";

const startFromZeroSignals = [
  "belum punya bahan",
  "belum punya catatan",
  "mulai dari nol",
  "belum observasi",
  "bantu cari topik",
  "tidak tahu mulai dari mana",
];

const quickStarts: {
  label: string;
  mode?: ReportMode;
  template?: string;
}[] = [
  { label: "Punya catatan", mode: "draft_from_materials" },
  { label: "Belum punya bahan", mode: "start_from_zero" },
  { label: "Observasi lingkungan", template: "Laporan Observasi Lingkungan" },
  { label: "Praktikum", template: "Laporan Praktikum Biologi" },
  { label: "Field trip", template: "Laporan Field Trip Sekolah" },
];

const examples: {
  label: string;
  mode: ReportMode;
  template: string;
}[] = [
  {
    label: "Saya mengamati erosi di Banjir Kanal Semarang...",
    mode: "draft_from_materials",
    template: "Laporan Observasi Lingkungan",
  },
  {
    label: "Aku mau laporan observasi sungai tapi belum punya catatan.",
    mode: "start_from_zero",
    template: "Laporan Observasi Lingkungan",
  },
  {
    label: "Saya punya hasil praktikum biologi, bantu susun laporan.",
    mode: "draft_from_materials",
    template: "Laporan Praktikum Biologi",
  },
];

function inferReportMode(text: string, fallback: ReportMode): ReportMode {
  const normalized = text.toLowerCase();

  if (startFromZeroSignals.some((signal) => normalized.includes(signal))) {
    return "start_from_zero";
  }

  return text.trim() ? "draft_from_materials" : fallback;
}

export function HomeCommandBox() {
  const router = useRouter();
  const [mode, setMode] = useState<ReportMode>("draft_from_materials");
  const [mainText, setMainText] = useState("");
  const [reportTemplate, setReportTemplate] = useState("Laporan Observasi Lingkungan");

  function applyQuickStart(chip: (typeof quickStarts)[number]) {
    if (chip.mode) setMode(chip.mode);
    if (chip.template) setReportTemplate(chip.template);
  }

  function applyExample(example: (typeof examples)[number]) {
    setMainText(example.label);
    setMode(example.mode);
    setReportTemplate(example.template);
  }

  function start() {
    const trimmed = mainText.trim();
    const nextMode = inferReportMode(trimmed, mode);
    const params = new URLSearchParams({ mode: nextMode });

    if (trimmed) params.set("q", trimmed);
    if (reportTemplate) params.set("template", reportTemplate);

    window.localStorage.setItem(
      "nali-create-report-prefill",
      JSON.stringify({
        mainText: trimmed,
        mode: nextMode,
        reportTemplate,
      }),
    );

    router.push(`/create-report?${params.toString()}`);
  }

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg border border-[#D8D0C2] bg-[#FCFAF4] text-left shadow-[0_26px_70px_rgba(17,24,20,0.14)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DED2] px-3 py-3 sm:px-4">
          {quickStarts.map((chip) => (
            <button
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-semibold transition",
                (chip.mode && chip.mode === mode) || chip.template === reportTemplate
                  ? "border-[#6F8057] bg-[#E8EFE4] text-[#173D2B]"
                  : "border-[#DDD5C7] bg-white/70 text-[#5F6B62] hover:bg-white hover:text-[#111814]",
              )}
              key={chip.label}
              onClick={() => applyQuickStart(chip)}
              type="button"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <label className="block px-3 pt-3 sm:px-4">
          <span className="sr-only">Tulis catatan, topik, lokasi, atau sumbermu</span>
          <textarea
            className="min-h-[132px] w-full resize-none rounded-md border border-[#DDD5C7] bg-white px-4 py-3 text-[15px] leading-7 text-[#111814] outline-none transition placeholder:text-[#8A938B] focus:border-[#6F8057] focus:ring-4 focus:ring-[#6F8057]/15 sm:min-h-[148px]"
            onChange={(event) => {
              setMainText(event.target.value);
              setMode(inferReportMode(event.target.value, mode));
            }}
            placeholder="Tulis catatan, topik, lokasi, atau sumbermu..."
            value={mainText}
          />
        </label>

        <div className="flex flex-col gap-3 px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-[#5F6B62]">
              Punya bahan? NaLI buatkan draf. Belum punya bahan? NaLI buatkan panduan mulai.
            </p>
            <select
              aria-label="Template laporan"
              className="h-9 rounded-md border border-[#DDD5C7] bg-white px-3 text-xs font-semibold text-[#5F6B62] outline-none focus:border-[#6F8057]"
              onChange={(event) => setReportTemplate(event.target.value)}
              value={reportTemplate}
            >
              {reportTemplates.map((template) => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            {examples.map((example) => (
              <button
                className="flex items-start gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs leading-5 text-[#5F6B62] transition hover:border-[#DDD5C7] hover:bg-white"
                key={example.label}
                onClick={() => applyExample(example)}
                type="button"
              >
                {example.mode === "start_from_zero" ? (
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6F8057]" aria-hidden="true" />
                ) : (
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6F8057]" aria-hidden="true" />
                )}
                <span>{example.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#173D2B] px-6 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(23,61,43,0.2)] transition hover:bg-[#102F20]"
          onClick={start}
          type="button"
        >
          Mulai Laporan
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#DDD5C7] bg-white/70 px-6 text-sm font-semibold text-[#173D2B] transition hover:bg-white"
          href="/field-intelligence"
        >
          NaLI untuk Kerja
        </Link>
      </div>
    </div>
  );
}
