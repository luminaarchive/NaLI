"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  ListChecks,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DraftReport, ReportResult, StartFromZeroGuide } from "@/lib/reports/reportGenerator";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function lineList(title: string, items: string[]) {
  return [`## ${title}`, ...items.map((item) => `- ${item}`), ""].join("\n");
}

function buildDraftMarkdown(report: DraftReport) {
  const evidenceRows = report.evidence_table
    .map(
      (row) =>
        `| ${row.id} | ${row.material_type} | ${row.summary.replace(/\|/g, "/")} | ${row.verification_status.replace(/\|/g, "/")} |`,
    )
    .join("\n");

  return [
    `# ${report.title}`,
    "",
    `**${report.draft_label}**`,
    "",
    `Jenis laporan: ${report.report_type}`,
    `Dibuat: ${report.created_at}`,
    `Status: ${report.status}`,
    `Model: ${report.model_used}`,
    "",
    "## Ringkasan Eksekutif",
    report.executive_summary,
    "",
    "## Latar Belakang",
    report.background,
    "",
    "## Tujuan",
    report.objective,
    "",
    "## Metode atau Bahan",
    report.method_or_materials,
    "",
    lineList("Temuan", report.findings),
    "## Analisis Awal",
    report.preliminary_analysis,
    "",
    "## Evidence Table",
    "| ID | Tipe bahan | Ringkasan | Status verifikasi |",
    "| --- | --- | --- | --- |",
    evidenceRows,
    "",
    "## Source Verification",
    report.source_verification_status,
    "",
    ...report.source_notes.map((item) => `- ${item}`),
    "",
    lineList("Kebutuhan Bukti Tambahan", report.additional_evidence_needed),
    lineList("Checklist Review Pengguna", report.user_review_checklist),
    "## Uncertainty Note",
    report.uncertainty_note,
    "",
    "## Disclaimer",
    report.disclaimer,
    "",
    lineList("Langkah Berikutnya", report.next_user_steps),
  ].join("\n");
}

function buildGuideMarkdown(report: StartFromZeroGuide) {
  return [
    `# ${report.title}`,
    "",
    `**${report.label}**`,
    "",
    `Jenis laporan: ${report.report_type}`,
    `Dibuat: ${report.created_at}`,
    `Status: ${report.status}`,
    `Model: ${report.model_used}`,
    "",
    "## Kerangka Topik",
    report.topic_framing,
    "",
    lineList("Outline Laporan", report.suggested_outline),
    lineList("Pertanyaan Observasi", report.observation_questions),
    lineList("Template Catatan Lapangan", report.field_note_template),
    lineList("Checklist Bukti", report.evidence_checklist),
    lineList("Checklist Pencarian Sumber", report.source_search_checklist),
    "## Catatan Etika/Keamanan",
    report.safety_or_ethics_note,
    "",
    "## Integritas Akademik",
    report.integrity_note,
    "",
    "## Disclaimer",
    report.disclaimer,
    "",
    lineList("Langkah Berikutnya", report.next_steps),
  ].join("\n");
}

function buildMarkdown(report: ReportResult) {
  return report.mode === "start_from_zero" ? buildGuideMarkdown(report) : buildDraftMarkdown(report);
}

export function ReportResultClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReportResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "copied" | "downloaded">("idle");

  useEffect(() => {
    const stored = window.localStorage.getItem(`nali-report:${reportId}`);
    const storedNotice = window.localStorage.getItem(`nali-report-notice:${reportId}`);

    if (storedNotice) {
      setNotice(storedNotice);
    }

    if (!stored) {
      return;
    }

    try {
      setReport(JSON.parse(stored) as ReportResult);
    } catch {
      setReport(null);
    }
  }, [reportId]);

  const markdown = useMemo(() => (report ? buildMarkdown(report) : ""), [report]);

  async function copyMarkdown() {
    if (!markdown) {
      return;
    }

    await navigator.clipboard.writeText(markdown);
    setStatus("copied");
  }

  function downloadMarkdown() {
    if (!report || !markdown) {
      return;
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slugify(report.title) || "nali-report"}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("downloaded");
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-50 text-forest-950">
        <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
          <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <AlertTriangle className="h-8 w-8 text-rare-red" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Hasil tidak ditemukan</h1>
            <p className="mt-3 leading-7 text-forest-700">
              Hasil MVP saat ini disimpan di browser setelah form dikirim. Buat laporan baru jika kamu membuka halaman
              ini dari perangkat atau tab lain.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-900 px-4 text-sm font-semibold text-stone-50 transition hover:bg-forest-800"
              href="/create-report"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Buat Laporan Baru
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const isGuide = report.mode === "start_from_zero";

  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:text-forest-950" href="/create-report">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Buat lagi
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={report.is_mock ? "amber" : "green"}>{report.status}</Badge>
              <Badge tone="paper">{isGuide ? "Start From Zero" : "Draft From Materials"}</Badge>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[0] sm:text-4xl">{report.title}</h1>
            <p className="mt-2 text-sm leading-6 text-forest-700">{isGuide ? report.label : report.draft_label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={copyMarkdown}>
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Salin Markdown
            </Button>
            <Button type="button" onClick={downloadMarkdown}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Unduh Markdown
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1160px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        {isGuide ? <GuideContent report={report} notice={notice} /> : <DraftContent report={report} notice={notice} />}

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <SidebarCard title="Status">
            <p className="text-sm font-semibold">{report.status}</p>
            <p className="mt-2 text-sm leading-6 text-forest-700">Model: {report.model_used}</p>
            <p className="mt-2 text-sm leading-6 text-forest-700">Dibuat: {report.created_at}</p>
          </SidebarCard>

          <SidebarCard title={isGuide ? "Checklist" : "Evidence"}>
            <p className="text-3xl font-semibold">
              {isGuide ? report.evidence_checklist.length : report.evidence_table.length}
            </p>
            <p className="mt-1 text-sm leading-6 text-forest-700">
              {isGuide ? "item bukti untuk dikumpulkan" : "bahan pengguna tercatat"}
            </p>
          </SidebarCard>

          {!isGuide ? (
            <SidebarCard title="Source Verification">
              <p className="text-sm leading-6 text-forest-700">{report.source_verification_status}</p>
            </SidebarCard>
          ) : null}

          {status !== "idle" ? (
            <p className="rounded-lg border border-data-cyan/40 bg-data-cyan/10 p-3 text-sm text-forest-900">
              {status === "copied" ? "Markdown tersalin." : "Markdown diunduh."}
            </p>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

function DraftContent({ notice, report }: { notice: string | null; report: DraftReport }) {
  return (
    <article className="space-y-5">
      <Notice notice={notice} />
      <ReportSection title="Ringkasan Eksekutif">{report.executive_summary}</ReportSection>
      <ReportSection title="Latar Belakang">{report.background}</ReportSection>
      <ReportSection title="Tujuan">{report.objective}</ReportSection>
      <ReportSection title="Metode atau Bahan">{report.method_or_materials}</ReportSection>
      <ListSection items={report.findings} title="Temuan" />
      <ReportSection title="Analisis Awal">{report.preliminary_analysis}</ReportSection>
      <EvidenceTable report={report} />
      <ListSection items={report.source_notes} title="Source Verification" note={report.source_verification_status} />
      <ListSection items={report.additional_evidence_needed} title="Kebutuhan Bukti Tambahan" />
      <ListSection items={report.user_review_checklist} title="Checklist Review Pengguna" icon="check" />
      <ReportSection title="Uncertainty Note">{report.uncertainty_note}</ReportSection>
      <Disclaimer tone="draft">{report.disclaimer}</Disclaimer>
      <ListSection items={report.next_user_steps} title="Langkah Berikutnya" icon="check" />
    </article>
  );
}

function GuideContent({ notice, report }: { notice: string | null; report: StartFromZeroGuide }) {
  return (
    <article className="space-y-5">
      <Notice notice={notice} />
      <ReportSection title="Panduan Awal">{report.integrity_note}</ReportSection>
      <ReportSection title="Kerangka Topik">{report.topic_framing}</ReportSection>
      <ListSection items={report.suggested_outline} title="Outline Laporan" />
      <ListSection items={report.observation_questions} title="Pertanyaan Observasi" />
      <ListSection items={report.field_note_template} title="Template Catatan Lapangan" />
      <ListSection items={report.evidence_checklist} title="Checklist Bukti" icon="check" />
      <ListSection items={report.source_search_checklist} title="Checklist Pencarian Sumber" />
      <ReportSection title="Catatan Etika/Keamanan">{report.safety_or_ethics_note}</ReportSection>
      <Disclaimer tone="guide">{report.disclaimer}</Disclaimer>
      <ListSection items={report.next_steps} title="Langkah Berikutnya" icon="check" />
    </article>
  );
}

function Notice({ notice }: { notice: string | null }) {
  if (!notice) {
    return null;
  }

  return (
    <div className="flex gap-3 rounded-lg border border-warning-amber/60 bg-warning-amber/15 p-4 text-sm leading-6 text-forest-950">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{notice}</p>
    </div>
  );
}

function ReportSection({ children, title }: { children: string; title: string }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-forest-800">{children}</p>
    </section>
  );
}

function ListSection({
  icon = "file",
  items,
  note,
  title,
}: {
  icon?: "file" | "check";
  items: string[];
  note?: string;
  title: string;
}) {
  const Icon = icon === "check" ? CheckCircle2 : FileText;

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {note ? <p className="mt-2 text-sm leading-6 text-forest-700">{note}</p> : null}
      <ul className="mt-4 space-y-3 text-sm leading-6 text-forest-800">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvidenceTable({ report }: { report: DraftReport }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">Evidence Table</h2>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="px-3 py-2 font-semibold text-forest-700">ID</th>
              <th className="px-3 py-2 font-semibold text-forest-700">Tipe</th>
              <th className="px-3 py-2 font-semibold text-forest-700">Ringkasan</th>
              <th className="px-3 py-2 font-semibold text-forest-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.evidence_table.map((row) => (
              <tr className="border-b border-stone-200 align-top" key={row.id}>
                <td className="px-3 py-3 font-mono text-xs">{row.id}</td>
                <td className="px-3 py-3">{row.material_type}</td>
                <td className="px-3 py-3">{row.summary}</td>
                <td className="px-3 py-3">
                  <Badge tone="paper">{row.verification_status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-3 md:hidden">
        {report.evidence_table.map((row) => (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4" key={row.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-semibold">{row.id}</span>
              <Badge tone="green">{row.material_type}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-forest-800">{row.summary}</p>
            <p className="mt-3 text-xs leading-5 text-forest-700">{row.verification_status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Disclaimer({ children, tone }: { children: string; tone: "draft" | "guide" }) {
  return (
    <section
      className={`rounded-lg border p-5 ${
        tone === "draft" ? "border-rare-red/30 bg-rare-red/10" : "border-warning-amber/50 bg-warning-amber/15"
      }`}
    >
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <ShieldCheck className="h-5 w-5 text-olive-700" aria-hidden="true" />
        Disclaimer
      </h2>
      <p className="mt-3 text-sm leading-7 text-forest-900">{children}</p>
    </section>
  );
}

function SidebarCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-forest-700">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
