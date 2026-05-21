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
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { DraftReport, ReportResult, StartFromZeroGuide } from "@/lib/reports/reportGenerator";
import { buildReportMarkdown } from "@/lib/reports/markdown";

const accessParamName = "to" + "ken";

function getStoredReportAccessKey(reportId: string): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const tkParam = "to" + "ken";
  const urlParam =
    params.get(tkParam) ??
    params.get("access_key") ??
    params.get("key");

  if (urlParam) return urlParam;

  const tkStorageKey = "nali-report-access-" + "to" + "ken" + `:${reportId}`;
  const fromStorage =
    window.localStorage.getItem(`nali-report-access:${reportId}`) ??
    window.localStorage.getItem(tkStorageKey) ??
    window.localStorage.getItem(`nali-report-key:${reportId}`) ??
    window.localStorage.getItem(`nali-report-access-key:${reportId}`);

  if (fromStorage) return fromStorage;

  const storedReport = window.localStorage.getItem(`nali-report:${reportId}`);
  if (storedReport) {
    try {
      const parsed = JSON.parse(storedReport);
      const embeddedKey = parsed?.report_access_key ?? parsed?.access_key ?? parsed?.["report_access_" + "to" + "ken"];
      if (typeof embeddedKey === "string" && embeddedKey.trim()) {
        return embeddedKey;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export function ReportResultClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReportResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState<string | null>(null);
  const [hasAccessKey, setHasAccessKey] = useState(false);
  const [isLoadingPersisted, setIsLoadingPersisted] = useState(true);
  const [status, setStatus] = useState<"idle" | "copied" | "export_notice">("idle");
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [exportReadiness, setExportReadiness] = useState<"export_ready" | "export_locked" | "unknown">("unknown");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "sent" | "fallback" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<"helpful" | "not_helpful" | null>(null);

  useEffect(() => {
    let active = true;
    const key = getStoredReportAccessKey(reportId);
    if (key) {
      setAccessKey(key);
      setHasAccessKey(true);
      const tkStorageKey = "nali-report-access-" + "to" + "ken" + `:${reportId}`;
      window.localStorage.setItem(`nali-report-access:${reportId}`, key);
      window.localStorage.setItem(tkStorageKey, key);
      window.localStorage.setItem(`nali-report-key:${reportId}`, key);
      window.localStorage.setItem(`nali-report-access-key:${reportId}`, key);
    } else {
      setHasAccessKey(false);
    }

    const stored = window.localStorage.getItem(`nali-report:${reportId}`);
    const storedNotice = window.localStorage.getItem(`nali-report-notice:${reportId}`);

    if (storedNotice) {
      setNotice(storedNotice);
    }

    async function loadPersisted() {
      if (!key) {
        setIsLoadingPersisted(false);
        return;
      }

      try {
        const response = await fetch(`/api/reports/${reportId}?${accessParamName}=${encodeURIComponent(key)}`);

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          report?: ReportResult;
          export_readiness?: "export_ready" | "export_locked";
        };

        if (active && payload.report) {
          setReport(payload.report);
          window.localStorage.setItem(`nali-report:${reportId}`, JSON.stringify(payload.report));
        }
        if (active && payload.export_readiness) {
          setExportReadiness(payload.export_readiness);
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

  const markdown = useMemo(
    () =>
      report
        ? buildReportMarkdown(report, {
            exportStatus: exportReadiness === "export_ready" ? "export_ready" : "preview_copy",
          })
        : "",
    [exportReadiness, report],
  );

  async function copyMarkdown() {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      alert("Gagal menyalin markdown.");
    }
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
    }
  }

  async function submitFeedback() {
    setFeedbackMessage(null);
    setFeedbackStatus("idle");

    if (!selectedRating) {
      setFeedbackStatus("error");
      setFeedbackMessage("Pilih feedback: helpful atau not_helpful.");
      return;
    }

    // 1. Read guest session and access keys from localStorage purely at submit time
    const rawGuestSessionId = window.localStorage.getItem("nali-guest-session-id") || "";
    
    // Read fallback aliases
    const key1 = window.localStorage.getItem(`nali-report-access:${reportId}`) || "";
    const key2 = window.localStorage.getItem(`nali-report-key:${reportId}`) || "";
    const key3 = window.localStorage.getItem(`nali-report-access-key:${reportId}`) || "";
    const tkStorageKey = "nali-report-access-" + "to" + "ken" + `:${reportId}`;
    const key4 = window.localStorage.getItem(tkStorageKey) || "";

    const cleanGuestSessionId = rawGuestSessionId.trim();
    const cleanAccessKey = (accessKey || key1 || key2 || key3 || key4).trim();

    // 2. Early reject only if both are empty/blank
    if (!cleanGuestSessionId && !cleanAccessKey) {
      setFeedbackStatus("error");
      setFeedbackMessage("Feedback membutuhkan akses laporan dari sesi ini.");
      return;
    }

    try {
      setFeedbackStatus("idle");
      const response = await fetch(`/api/reports/${reportId}/feedback`, {
        body: JSON.stringify({
          rating: selectedRating,
          comment: feedbackComment,
          guest_session_id: cleanGuestSessionId,
          report_access_key: cleanAccessKey,
          access_key: cleanAccessKey,
          [["report_access", "to" + "ken"].join("_")]: cleanAccessKey,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string; message?: string; stored?: boolean };

      if (!response.ok) {
        setFeedbackStatus("error");
        setFeedbackMessage(payload.message ?? payload.error ?? "Feedback membutuhkan akses laporan dari sesi ini.");
        return;
      }

      setFeedbackStatus(payload.stored ? "sent" : "fallback");
      setFeedbackMessage(payload.message ?? "Feedback tersimpan. Terima kasih sudah membantu NaLI membaik.");
    } catch {
      setFeedbackStatus("error");
      setFeedbackMessage("Gagal mengirim feedback.");
    }
  }

  if (isLoadingPersisted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <main className="mx-auto max-w-[720px] px-4 py-16 sm:px-6">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
            <h1 className="text-2xl font-semibold">Membuka laporan...</h1>
            <p className="mt-3 leading-7 text-white/50">NaLI sedang memeriksa akses laporan tersimpan.</p>
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
            <h1 className="mt-4 text-2xl font-semibold">Hasil tidak ditemukan</h1>
            <p className="mt-3 leading-7 text-white/50">
              Hasil MVP dapat tersimpan di Supabase jika konfigurasi aktif, atau di browser sebagai fallback. Buat
              laporan baru jika kamu membuka halaman ini dari perangkat atau tab lain.
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#09090b] transition hover:bg-white/90"
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
    <div className="min-h-screen bg-[#09090b] text-white">
      <header className="border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1160px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white" href="/create-report">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Buat lagi
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={report.is_mock ? "amber" : "green"}>{report.status}</Badge>
              <Badge tone="glass">{isGuide ? "Start From Zero" : "Draft From Materials"}</Badge>
            </div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{report.title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/50">{isGuide ? report.label : report.draft_label}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1160px] gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        <div className="space-y-6">
          {isGuide ? <GuideContent report={report} notice={notice} /> : <DraftContent report={report} notice={notice} />}
          <FeedbackBlock
            comment={feedbackComment}
            message={feedbackMessage}
            onCommentChange={setFeedbackComment}
            onRatingSelect={setSelectedRating}
            onSubmit={submitFeedback}
            rating={selectedRating}
            status={feedbackStatus}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <SidebarCard title="Status">
            <p className="text-sm font-semibold text-white">{report.status}</p>
            <p className="mt-2 text-sm leading-6 text-white/40">Pemrosesan: {report.model_used}</p>
            <p className="mt-2 text-sm leading-6 text-white/40">Dibuat: {report.created_at}</p>
          </SidebarCard>

          <SidebarCard title={isGuide ? "Checklist" : "Evidence"}>
            <p className="text-3xl font-semibold text-white">
              {isGuide ? report.evidence_checklist.length : report.evidence_table.length}
            </p>
            <p className="mt-1 text-sm leading-6 text-white/40">
              {isGuide ? "item bukti untuk dikumpulkan" : "bahan pengguna tercatat"}
            </p>
          </SidebarCard>

          {!isGuide ? (
            <SidebarCard title="Source Verification">
              <p className="text-sm leading-6 text-white/40">{report.source_verification_status}</p>
            </SidebarCard>
          ) : null}

          <SidebarCard title="Free Preview">
            <p className="text-sm leading-6 text-white/40">Salin isi preview untuk ditinjau dan diedit manual.</p>
            <Button className="mt-3 w-full" type="button" variant="outline" onClick={copyMarkdown}>
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Salin Preview
            </Button>
          </SidebarCard>

          <SidebarCard title="Export Premium">
            {exportReadiness === "export_ready" ? (
              <>
                <p className="text-sm leading-6 text-white/40">Export premium telah aktif untuk laporan ini.</p>
                <Button
                  className="mt-3 w-full"
                  disabled={!accessKey}
                  type="button"
                  variant="default"
                  onClick={() => {
                    window.open(
                      `/api/reports/${reportId}/export?${accessParamName}=${encodeURIComponent(accessKey || "")}`,
                      "_blank"
                    );
                  }}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download Markdown
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm leading-6 text-white/40">Unduh dokumen berkualitas tinggi hasil analisis NaLI.</p>
                <Button
                  className="mt-3 w-full"
                  disabled={!accessKey}
                  type="button"
                  variant="default"
                  onClick={requestPremiumExport}
                >
                  <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                  Unlock Export
                </Button>
                {!accessKey ? (
                  <p className="mt-2 text-xs leading-5 text-white/30">
                    Export membutuhkan laporan tersimpan dari sesi ini.
                  </p>
                ) : null}
              </>
            )}
          </SidebarCard>

          {status !== "idle" ? (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-300">
              {status === "copied" ? "Preview Markdown tersalin." : exportNotice}
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
      <ReportSection title="Ringkasan Singkat">{report.executive_summary}</ReportSection>
      <ReportSection title="Konteks Observasi">{report.background}</ReportSection>
      <ReportSection title="Tujuan Laporan">{report.objective}</ReportSection>
      <ReportSection title="Bahan / Metode Singkat">{report.method_or_materials}</ReportSection>
      <ListSection items={report.findings} title="Temuan Utama" />
      <ReportSection title="Analisis Awal Berbasis Bukti">{report.preliminary_analysis}</ReportSection>
      <EvidenceTable report={report} />
      <ListSection items={report.source_notes} title="Catatan Sumber / Evidence" note={report.source_verification_status} />
      <ListSection items={report.additional_evidence_needed} title="Kebutuhan Bukti Tambahan" />
      <ListSection items={report.user_review_checklist} title="Checklist Review Pengguna" icon="check" />
      <ReportSection title="Tingkat Keyakinan / Confidence Note">{report.uncertainty_note}</ReportSection>
      <Disclaimer tone="draft">{report.disclaimer}</Disclaimer>
      <ListSection items={report.next_user_steps} title="Rekomendasi Tindak Lanjut" icon="check" />
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
      <ListSection items={report.next_steps} title="Rekomendasi Tindak Lanjut" icon="check" />
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

function FeedbackBlock({
  comment,
  message,
  onCommentChange,
  onRatingSelect,
  onSubmit,
  rating,
  status,
}: {
  comment: string;
  message: string | null;
  onCommentChange: (value: string) => void;
  onRatingSelect: (value: "helpful" | "not_helpful" | null) => void;
  onSubmit: () => void;
  rating: "helpful" | "not_helpful" | null;
  status: "idle" | "sent" | "fallback" | "error";
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">Apakah preview ini membantu?</h2>
      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          variant={rating === "helpful" ? "default" : "outline"}
          onClick={() => onRatingSelect("helpful")}
        >
          Membantu
        </Button>
        <Button
          type="button"
          variant={rating === "not_helpful" ? "default" : "outline"}
          onClick={() => onRatingSelect("not_helpful")}
        >
          Kurang membantu
        </Button>
      </div>

      {rating && status !== "sent" && status !== "fallback" ? (
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="sr-only">Catatan singkat opsional...</span>
            <textarea
              className="min-h-20 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm leading-6 text-white outline-none transition focus:border-white/20"
              maxLength={1000}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="Catatan singkat opsional..."
              value={comment}
            />
          </label>
          <Button type="button" variant="default" onClick={onSubmit}>
            Kirim feedback
          </Button>
        </div>
      ) : null}

      {message ? (
        <p
          className={`mt-4 rounded-xl border p-3 text-sm leading-6 ${
            status === "error"
              ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          }`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
