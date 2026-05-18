"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clipboard, Download, FileText, RotateCcw, ShieldCheck } from "lucide-react";
import type { EvidenceReport } from "@/lib/reports/reportGenerator";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function buildMarkdown(report: EvidenceReport) {
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
    `Dibuat: ${new Date(report.generated_at).toLocaleString("id-ID")}`,
    report.is_mock ? "Status: DEMO/MOCK - bukan output AI provider." : "Status: Draft dari AI provider.",
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
    "## Temuan",
    ...report.findings.map((item) => `- ${item}`),
    "",
    "## Pembahasan",
    report.discussion,
    "",
    "## Kesimpulan",
    report.conclusion,
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
    "## Uncertainty Note",
    report.uncertainty_note,
    "",
    "## Disclaimer",
    report.disclaimer,
    "",
    "## Langkah Berikutnya",
    ...report.next_user_steps.map((item) => `- ${item}`),
  ].join("\n");
}

export function ReportResultClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<EvidenceReport | null>(null);
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
      setReport(JSON.parse(stored) as EvidenceReport);
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
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="border-stone-200 bg-white p-6 shadow-sm">
            <AlertTriangle className="h-8 w-8 text-rare-red" aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Draft tidak ditemukan</h1>
            <p className="text-forest-700 mt-3 leading-7">
              Hasil MVP saat ini disimpan di browser setelah form dikirim. Buat draft baru jika kamu membuka halaman ini
              dari perangkat atau tab lain.
            </p>
            <Link
              className="bg-forest-900 hover:bg-forest-800 mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-sm font-semibold text-stone-50 transition"
              href="/create-report"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Buat Draft Baru
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-stone-200 bg-white border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link className="text-forest-700 text-sm font-semibold hover:text-forest-950" href="/">
              NaLI
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-[0] sm:text-3xl">{report.title}</h1>
            <p className="text-forest-700 mt-2 text-sm leading-6">{report.draft_label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="border-forest-300 text-forest-900 inline-flex min-h-11 items-center gap-2 rounded-sm border bg-stone-50 px-4 text-sm font-semibold transition hover:bg-stone-100"
              type="button"
              onClick={copyMarkdown}
            >
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Salin Markdown
            </button>
            <button
              className="bg-forest-900 hover:bg-forest-800 inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-sm font-semibold text-stone-50 transition"
              type="button"
              onClick={downloadMarkdown}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Unduh Markdown
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_18rem] lg:px-8">
        <article className="space-y-5">
          {notice ? (
            <div className="border-warning-amber/60 bg-warning-amber/15 text-forest-950 flex gap-3 border p-4 text-sm leading-6">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>{notice}</p>
            </div>
          ) : null}

          <ReportSection title="Ringkasan Eksekutif">{report.executive_summary}</ReportSection>
          <ReportSection title="Latar Belakang">{report.background}</ReportSection>
          <ReportSection title="Tujuan">{report.objective}</ReportSection>
          <ReportSection title="Metode atau Bahan">{report.method_or_materials}</ReportSection>

          <section className="border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Temuan</h2>
            <ul className="text-forest-800 mt-4 space-y-3 text-sm leading-6">
              {report.findings.map((item) => (
                <li className="flex gap-2" key={item}>
                  <CheckDot />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <ReportSection title="Pembahasan">{report.discussion}</ReportSection>
          <ReportSection title="Kesimpulan">{report.conclusion}</ReportSection>

          <section className="border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Evidence Table</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-stone-200 border-b">
                    <th className="text-forest-700 px-3 py-2 font-semibold">ID</th>
                    <th className="text-forest-700 px-3 py-2 font-semibold">Tipe</th>
                    <th className="text-forest-700 px-3 py-2 font-semibold">Ringkasan</th>
                    <th className="text-forest-700 px-3 py-2 font-semibold">Status verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {report.evidence_table.map((row) => (
                    <tr className="border-stone-200 border-b align-top" key={row.id}>
                      <td className="px-3 py-3 font-mono text-xs">{row.id}</td>
                      <td className="px-3 py-3">{row.material_type}</td>
                      <td className="px-3 py-3">{row.summary}</td>
                      <td className="px-3 py-3">{row.verification_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <ReportSection title="Uncertainty Note">{report.uncertainty_note}</ReportSection>

          <section className="border-rare-red/30 bg-rare-red/7 text-forest-950 border p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck className="h-5 w-5 text-rare-red" aria-hidden="true" />
              Disclaimer Integritas Akademik
            </h2>
            <p className="mt-3 text-sm leading-7">{report.disclaimer}</p>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-forest-700 text-xs font-semibold tracking-[0.08em] uppercase">Status</p>
            <p className="mt-3 text-sm font-semibold">{report.is_mock ? "DEMO/MOCK" : "AI provider"}</p>
            <p className="text-forest-700 mt-2 text-sm leading-6">{report.source_verification_status}</p>
          </div>

          <div className="border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-forest-700 text-xs font-semibold tracking-[0.08em] uppercase">Source Notes</p>
            <ul className="text-forest-800 mt-3 space-y-2 text-sm leading-6">
              {report.source_notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-forest-700 text-xs font-semibold tracking-[0.08em] uppercase">Langkah Berikutnya</p>
            <ul className="text-forest-800 mt-3 space-y-2 text-sm leading-6">
              {report.next_user_steps.map((item) => (
                <li className="flex gap-2" key={item}>
                  <CheckDot />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {status !== "idle" ? (
            <p className="border-data-cyan/40 bg-data-cyan/10 text-forest-900 border p-3 text-sm">
              {status === "copied" ? "Markdown tersalin." : "Markdown diunduh."}
            </p>
          ) : null}
        </aside>
      </main>
    </div>
  );
}

function ReportSection({ children, title }: { children: string; title: string }) {
  return (
    <section className="border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-forest-800 mt-3 text-sm leading-7">{children}</p>
    </section>
  );
}

function CheckDot() {
  return <FileText className="mt-0.5 h-4 w-4 shrink-0 text-olive-700" aria-hidden="true" />;
}
