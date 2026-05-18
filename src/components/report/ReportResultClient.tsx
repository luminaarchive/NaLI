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
    `Pemrosesan: ${report.model_used}`,
    "",
    "## Ringkasan",
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
    `Pemrosesan: ${report.model_used}`,
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
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);
  const [status, setStatus] = useState<"idle" | "copied" | "downloaded">("idle");

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const accessKey = params.get("token") ?? window.localStorage.getItem(`nali-report-access:${reportId}`);
    const stored = window.localStorage.getItem(`nali-report:${reportId}`);
    const storedNotice = window.localStorage.getItem(`nali-report-notice:${reportId}`);

    if (storedNotice) {
      setNotice(storedNotice);
    }

    async function loadPersisted() {
      if (!accessKey) {
        setIsLoadingPersisted(false);
        return;
      }

      try {
        const response = await fetch(`/api/reports/${reportId}?token=${encodeURIComponent(accessKey)}`);

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { report?: ReportResult };

        if (active && payload.report) {
          setReport(payload.report);
          window.localStorage.setItem(`nali-report:${reportId}`, JSON.stringify(payload.report));
        }
      } catch {
        // LocalStorage fallback remains available when persistence is not configured.
      } finally {
        if (active) {
          setIsLoadingPersisted(false);
        }
      }
    }

    if (stored) {
      try {
        setReport(JSON.parse(stored) as ReportResult);
      } catch {
        setReport(null);
      }
    }

    void loadPersisted();

    return () => {
      active = false;
    };
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

  if (!report && isLoadingPersisted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <h1 className="text-2xl font-semibold">Opening report...</h1>
            <p className="mt-3 leading-7 text-white/50">NaLI is checking access to the saved report.</p>
          </section>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <AlertTriangle className="h-8 w-8 text-amber-400/70" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Result not found</h1>
            <p className="mt-3 leading-7 text-white/50">
              Results are currently stored in the browser after form submission. Create a new report if you opened
              this page from another device or tab.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#09090b] transition hover:bg-white/90"
              href="/create-report"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Create New Report
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const isGuide = report.mode === "start_from_zero";

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white" href="/create-report">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Create another
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={report.is_mock ? "amber" : "green"}>{report.status}</Badge>
              <Badge tone="glass">{isGuide ? "Start From Zero" : "Draft From Materials"}</Badge>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{report.title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/50">{isGuide ? report.label : report.draft_label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="glass" onClick={copyMarkdown}>
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Copy Markdown
            </Button>
            <Button type="button" variant="primary" onClick={downloadMarkdown}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Markdown
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1160px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        {isGuide ? <GuideContent report={report} notice={notice} /> : <DraftContent report={report} notice={notice} />}

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <SidebarCard title="Status">
            <p className="text-sm font-semibold text-white">{report.status}</p>
            <p className="mt-2 text-sm leading-6 text-white/40">Processing: {report.model_used}</p>
            <p className="mt-2 text-sm leading-6 text-white/40">Created: {report.created_at}</p>
          </SidebarCard>

          <SidebarCard title={isGuide ? "Checklist" : "Evidence"}>
            <p className="text-3xl font-semibold text-white">
              {isGuide ? report.evidence_checklist.length : report.evidence_table.length}
            </p>
            <p className="mt-1 text-sm leading-6 text-white/40">
              {isGuide ? "evidence items to collect" : "user materials recorded"}
            </p>
          </SidebarCard>

          {!isGuide ? (
            <SidebarCard title="Source Verification">
              <p className="text-sm leading-6 text-white/40">{report.source_verification_status}</p>
            </SidebarCard>
          ) : null}

          {status !== "idle" ? (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">
              {status === "copied" ? "Markdown copied." : "Markdown downloaded."}
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
      <ReportSection title="Ringkasan">{report.executive_summary}</ReportSection>
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
    <div className="flex gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{notice}</p>
    </div>
  );
}

function ReportSection({ children, title }: { children: string; title: string }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-white/50">{children}</p>
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
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {note ? <p className="mt-2 text-sm leading-6 text-white/40">{note}</p> : null}
      <ul className="mt-4 space-y-3 text-sm leading-6 text-white/50">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400/50" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvidenceTable({ report }: { report: DraftReport }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">Evidence Table</h2>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-2 font-semibold text-white/40">ID</th>
              <th className="px-3 py-2 font-semibold text-white/40">Type</th>
              <th className="px-3 py-2 font-semibold text-white/40">Summary</th>
              <th className="px-3 py-2 font-semibold text-white/40">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.evidence_table.map((row) => (
              <tr className="border-b border-white/[0.04] align-top" key={row.id}>
                <td className="px-3 py-3 font-mono text-xs text-white/60">{row.id}</td>
                <td className="px-3 py-3 text-white/60">{row.material_type}</td>
                <td className="px-3 py-3 text-white/50">{row.summary}</td>
                <td className="px-3 py-3">
                  <Badge tone="glass">{row.verification_status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-3 md:hidden">
        {report.evidence_table.map((row) => (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4" key={row.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-semibold text-white/60">{row.id}</span>
              <Badge tone="cyan">{row.material_type}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/50">{row.summary}</p>
            <p className="mt-3 text-xs leading-5 text-white/35">{row.verification_status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Disclaimer({ children, tone }: { children: string; tone: "draft" | "guide" }) {
  return (
    <section className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-amber-200">
        <ShieldCheck className="h-5 w-5 text-amber-400/60" aria-hidden="true" />
        Disclaimer
      </h2>
      <p className="mt-3 text-sm leading-7 text-amber-100/70">{children}</p>
    </section>
  );
}

function SidebarCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}
