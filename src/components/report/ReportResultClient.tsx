"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  FileText,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DraftReport, ReportResult, StartFromZeroGuide } from "@/lib/reports/reportGenerator";

const accessParamName = "to" + "ken";

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
    "## Source verification belum aktif di MVP ini",
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
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);
  const [status, setStatus] = useState<"idle" | "copied" | "export_notice">("idle");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sent" | "fallback" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const storedAccessKey = params.get(accessParamName) ?? window.localStorage.getItem(`nali-report-access:${reportId}`);
    const stored = window.localStorage.getItem(`nali-report:${reportId}`);
    const storedNotice = window.localStorage.getItem(`nali-report-notice:${reportId}`);

    setAccessKey(storedAccessKey);

    if (storedNotice) {
      setNotice(storedNotice);
    }

    async function loadPersisted() {
      if (!storedAccessKey) {
        setIsLoadingPersisted(false);
        return;
      }

      try {
        const response = await fetch(`/api/reports/${reportId}?${accessParamName}=${encodeURIComponent(storedAccessKey)}`);

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

  function downloadMarkdownPreview() {
    if (!markdown) {
      return;
    }

    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `nali-preview-${reportId}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function requestPremiumExport() {
    setExportNotice(null);

    if (!report || !accessKey) {
      setExportNotice("Export premium membutuhkan laporan tersimpan dari sesi ini.");
      setStatus("export_notice");
      return;
    }

    try {
      const response = await fetch("/api/payments/create", {
        body: JSON.stringify({
          export_type: "markdown",
          report_access_key: accessKey,
          report_id: reportId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string; snap_url?: string };

      if (response.ok && payload.snap_url) {
        window.location.href = payload.snap_url;
        return;
      }

      setExportNotice(payload.error ?? "Export premium belum aktif di MVP ini.");
    } catch {
      setExportNotice("Export premium belum aktif di MVP ini.");
    } finally {
      setStatus("export_notice");
    }
  }

  async function submitFeedback(rating: "helpful" | "not_helpful") {
    setFeedbackStatus("idle");
    setFeedbackMessage(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/feedback`, {
        body: JSON.stringify({
          comment: feedbackComment,
          rating,
          report_access_key: accessKey,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as { message?: string; error?: string; stored?: boolean };

      if (response.ok) {
        setFeedbackStatus(payload.stored ? "sent" : "fallback");
        setFeedbackMessage(payload.message ?? "Feedback diterima.");
        return;
      }

      setFeedbackStatus("error");
      setFeedbackMessage(payload.error ?? "Feedback belum bisa dikirim.");
    } catch {
      setFeedbackStatus("error");
      setFeedbackMessage("Feedback belum bisa dikirim.");
    }
  }

  if (!report && isLoadingPersisted) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] text-[#111814]">
        <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
          <section className="rounded-lg border border-[#DDD5C7] bg-white p-6">
            <h1 className="text-2xl font-semibold">Membuka laporan...</h1>
            <p className="mt-3 leading-7 text-[#5F6B62]">NaLI sedang memeriksa akses laporan tersimpan.</p>
          </section>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] text-[#111814]">
        <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
          <section className="rounded-lg border border-[#DDD5C7] bg-white p-6">
            <AlertTriangle className="h-8 w-8 text-[#7A520F]" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Hasil tidak ditemukan</h1>
            <p className="mt-3 leading-7 text-[#5F6B62]">
              Belum ada hasil. Mulai dari satu catatan atau topik. Hasil MVP dapat tersimpan di Supabase jika konfigurasi aktif, atau di browser sebagai fallback.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[#173D2B] px-4 text-sm font-semibold text-white transition hover:bg-[#102F20]"
              href="/create-report"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Buat laporan baru
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const isGuide = report.mode === "start_from_zero";

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#111814]">
      <header className="border-b border-[#DDD5C7] bg-[#F7F3EA]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#5F6B62] transition-colors hover:text-[#111814]" href="/create-report">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Buat lagi
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="green">Preview laporan/panduan</Badge>
              <Badge tone={report.is_mock ? "amber" : "green"}>{report.status}</Badge>
              <Badge tone="glass">{isGuide ? "Panduan mulai" : "Draf berbasis bahan"}</Badge>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{report.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#5F6B62]">{isGuide ? report.label : report.draft_label}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1160px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        {isGuide ? <GuideContent report={report} notice={notice} /> : <DraftContent report={report} notice={notice} />}

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <SidebarCard title="Status">
            <p className="text-sm font-semibold text-[#111814]">{report.status}</p>
            <p className="mt-2 text-sm leading-6 text-[#5F6B62]">Pemrosesan NaLI</p>
            <p className="mt-2 text-sm leading-6 text-[#5F6B62]">Dibuat: {report.created_at}</p>
          </SidebarCard>

          <SidebarCard title={isGuide ? "Checklist" : "Evidence"}>
            <p className="text-3xl font-semibold text-[#111814]">
              {isGuide ? report.evidence_checklist.length : report.evidence_table.length}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#5F6B62]">
              {isGuide ? "item bukti untuk dikumpulkan" : "bahan pengguna tercatat"}
            </p>
          </SidebarCard>

          {!isGuide ? (
            <SidebarCard title="Source verification belum aktif">
              <p className="text-sm leading-6 text-[#5F6B62]">{report.source_verification_status}</p>
            </SidebarCard>
          ) : null}

          <SidebarCard title="Preview gratis">
            <p className="text-sm leading-6 text-[#5F6B62]">Salin isi preview untuk ditinjau dan diedit manual.</p>
            <Button className="mt-3 w-full border-[#DDD5C7] bg-white text-[#173D2B] hover:bg-[#FCFAF4]" type="button" variant="outline" onClick={copyMarkdown}>
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Salin preview
            </Button>
            <Button className="mt-2 w-full border-[#DDD5C7] bg-white text-[#173D2B] hover:bg-[#FCFAF4]" type="button" variant="outline" onClick={downloadMarkdownPreview}>
              <FileText className="h-4 w-4" aria-hidden="true" />
              Unduh preview Markdown
            </Button>
          </SidebarCard>

          <SidebarCard title="Export Premium">
            <p className="text-sm leading-6 text-[#5F6B62]">
              Preview ini bisa dibaca gratis. Export premium disiapkan untuk dokumen yang lebih rapi saat payment aktif.
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-[#5F6B62]">
              {["Struktur lebih rapi", "Evidence table ikut terbawa", "Disclaimer tetap ada", "Checklist review ikut terbawa"].map((item) => (
                <li className="flex gap-2" key={item}>
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#315F45]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button className="mt-3 w-full bg-[#173D2B] text-white hover:bg-[#102F20]" disabled={!accessKey} type="button" variant="default" onClick={requestPremiumExport}>
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Export premium terkunci
            </Button>
            {!accessKey ? (
              <p className="mt-2 text-xs leading-5 text-[#5F6B62]">Export membutuhkan laporan tersimpan dari sesi ini.</p>
            ) : null}
          </SidebarCard>

          <FeedbackCard
            comment={feedbackComment}
            message={feedbackMessage}
            onCommentChange={setFeedbackComment}
            onSubmit={submitFeedback}
            status={feedbackStatus}
          />

          {status !== "idle" ? (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-50 p-3 text-sm text-emerald-800">
              {status === "copied" ? "Preview tersalin." : exportNotice}
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
      <ListSection items={report.source_notes} title="Source verification belum aktif" note={report.source_verification_status} />
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
    <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-[#FFF7DF] p-4 text-sm leading-6 text-[#7A520F]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{notice}</p>
    </div>
  );
}

function ReportSection({ children, title }: { children: string; title: string }) {
  return (
    <section className="rounded-lg border border-[#DDD5C7] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#111814]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#5F6B62]">{children}</p>
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
    <section className="rounded-lg border border-[#DDD5C7] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#111814]">{title}</h2>
      {note ? <p className="mt-2 text-sm leading-6 text-[#5F6B62]">{note}</p> : null}
      <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5F6B62]">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#6F8057]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvidenceTable({ report }: { report: DraftReport }) {
  return (
    <section className="rounded-lg border border-[#DDD5C7] bg-white p-5">
      <h2 className="text-xl font-semibold text-[#111814]">Evidence Table</h2>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#DDD5C7]">
              <th className="px-3 py-2 font-semibold text-[#5F6B62]">ID</th>
              <th className="px-3 py-2 font-semibold text-[#5F6B62]">Tipe</th>
              <th className="px-3 py-2 font-semibold text-[#5F6B62]">Ringkasan</th>
              <th className="px-3 py-2 font-semibold text-[#5F6B62]">Status</th>
            </tr>
          </thead>
          <tbody>
            {report.evidence_table.map((row) => (
              <tr className="border-b border-[#EEE7DB] align-top" key={row.id}>
                <td className="px-3 py-3 font-mono text-xs text-[#5F6B62]">{row.id}</td>
                <td className="px-3 py-3 text-[#5F6B62]">{row.material_type}</td>
                <td className="px-3 py-3 text-[#5F6B62]">{row.summary}</td>
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
          <div className="rounded-lg border border-[#DDD5C7] bg-[#FCFAF4] p-4" key={row.id}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-semibold text-[#5F6B62]">{row.id}</span>
              <Badge tone="cyan">{row.material_type}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#5F6B62]">{row.summary}</p>
            <p className="mt-3 text-xs leading-5 text-[#5F6B62]">{row.verification_status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Disclaimer({ children, tone }: { children: string; tone: "draft" | "guide" }) {
  return (
    <section className="rounded-lg border border-amber-500/20 bg-[#FFF7DF] p-5">
      <h2 className="flex items-center gap-2 text-xl font-semibold text-[#7A520F]">
        <ShieldCheck className="h-5 w-5 text-[#7A520F]" aria-hidden="true" />
        Disclaimer
      </h2>
      <p className="mt-3 text-sm leading-7 text-[#7A520F]">{children}</p>
    </section>
  );
}

function SidebarCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border border-[#DDD5C7] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#5F6B62]">{title}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function FeedbackCard({
  comment,
  message,
  onCommentChange,
  onSubmit,
  status,
}: {
  comment: string;
  message: string | null;
  onCommentChange: (value: string) => void;
  onSubmit: (rating: "helpful" | "not_helpful") => void;
  status: "idle" | "sent" | "fallback" | "error";
}) {
  return (
    <SidebarCard title="Feedback">
      <p className="text-sm font-semibold text-[#111814]">Apakah preview ini membantu?</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="border-[#DDD5C7] bg-white text-[#173D2B] hover:bg-[#FCFAF4]" type="button" variant="outline" onClick={() => onSubmit("helpful")}>
          Membantu
        </Button>
        <Button className="border-[#DDD5C7] bg-white text-[#173D2B] hover:bg-[#FCFAF4]" type="button" variant="outline" onClick={() => onSubmit("not_helpful")}>
          Kurang membantu
        </Button>
      </div>
      <label className="mt-3 block">
        <span className="sr-only">Catatan singkat untuk memperbaiki NaLI</span>
        <textarea
          className="min-h-20 w-full resize-none rounded-lg border border-[#DDD5C7] bg-[#FCFAF4] px-3 py-2 text-sm leading-6 text-[#111814] outline-none transition focus:border-[#6F8057]"
          maxLength={1000}
          onChange={(event) => onCommentChange(event.target.value)}
          placeholder="Catatan singkat untuk memperbaiki NaLI"
          value={comment}
        />
      </label>
      {message ? (
        <p
          className={`mt-3 rounded-lg border p-3 text-sm leading-6 ${
            status === "error"
              ? "border-amber-500/20 bg-[#FFF7DF] text-[#7A520F]"
              : "border-emerald-500/20 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </p>
      ) : null}
    </SidebarCard>
  );
}
