import type { DraftReport, ReportResult, StartFromZeroGuide } from "@/lib/reports/reportGenerator";

export const PREMIUM_EXPORT_DISCLAIMER =
  "Draft ini adalah bantuan awal berbasis informasi yang diberikan, bukan pengganti validasi ahli/lapangan.";

export type ReportMarkdownOptions = {
  exportStatus?: "export_ready" | "export_locked" | "preview_copy";
};

const SENSITIVE_PATTERNS: Array<[RegExp, string]> = [
  [/\bguest-session-[a-z0-9-]+\b/gi, "[redacted guest session]"],
  [
    /\b(report[_-]?access[_-]?(?:key|token)|access[_-]?key|token)\s*[:=]\s*[A-Za-z0-9._-]{20,}/gi,
    "$1: [redacted access key]",
  ],
  [
    /\b(payment[_-]?(?:id|reference|status)|midtrans[_-]?order[_-]?id)\s*[:=]\s*[A-Za-z0-9._-]{8,}/gi,
    "$1: [redacted payment metadata]",
  ],
  [
    /\b(SUPABASE_SERVICE_ROLE_KEY|MIDTRANS_SERVER_KEY|MIDTRANS_MERCHANT_ID|service_role)\s*=?\s*[A-Za-z0-9._:-]*/gi,
    "[redacted secret]",
  ],
  [/\b[a-f0-9]{64}\b/gi, "[redacted hash]"],
  [/\b[A-Za-z0-9_-]{48,}\b/g, "[redacted token]"],
];

function redactSensitive(value: string) {
  return SENSITIVE_PATTERNS.reduce((next, [pattern, replacement]) => next.replace(pattern, replacement), value);
}

function safeText(value: unknown) {
  return redactSensitive(String(value ?? "").trim());
}

function lineList(title: string, items: string[]) {
  return [`## ${title}`, ...items.map((item) => `- ${safeText(item)}`), ""].join("\n");
}

function escapeTableCell(value: string) {
  return safeText(value).replace(/\|/g, "/");
}

function buildMetadata(report: ReportResult, options: ReportMarkdownOptions) {
  const exportStatus = options.exportStatus ?? "preview_copy";

  return [
    "## Metadata Laporan",
    `- Report ID: ${safeText(report.id)}`,
    `- Tanggal dibuat: ${safeText(report.created_at)}`,
    `- Mode: ${safeText(report.mode)}`,
    `- Status export: ${safeText(exportStatus)}`,
    `- Jenis laporan: ${safeText(report.report_type)}`,
    "",
  ].join("\n");
}

export function buildDraftMarkdown(report: DraftReport, options: ReportMarkdownOptions = {}) {
  const evidenceRows = report.evidence_table
    .map(
      (row) =>
        `| ${safeText(row.id)} | ${safeText(row.material_type)} | ${escapeTableCell(row.summary)} | ${escapeTableCell(row.verification_status)} |`,
    )
    .join("\n");

  return [
    "# NaLI Learn & Report",
    "",
    "## Judul Laporan",
    safeText(report.title),
    "",
    `**${safeText(report.draft_label)}**`,
    "",
    buildMetadata(report, options),
    "## Ringkasan Singkat",
    safeText(report.executive_summary),
    "",
    "## Konteks Observasi",
    safeText(report.background),
    "",
    "## Tujuan Laporan",
    safeText(report.objective),
    "",
    "## Bahan / Metode Singkat",
    safeText(report.method_or_materials),
    "",
    lineList("Temuan Utama", report.findings),
    "## Analisis Awal Berbasis Bukti",
    safeText(report.preliminary_analysis),
    "",
    "## Catatan Sumber / Evidence",
    safeText(report.source_verification_status),
    "",
    ...report.source_notes.map((item) => `- ${safeText(item)}`),
    "",
    "### Evidence Table",
    "| ID | Tipe bahan | Ringkasan | Status verifikasi |",
    "| --- | --- | --- | --- |",
    evidenceRows,
    "",
    lineList("Kebutuhan Bukti Tambahan", report.additional_evidence_needed),
    lineList("Checklist Review Pengguna", report.user_review_checklist),
    "## Tingkat Keyakinan / Confidence Note",
    safeText(report.uncertainty_note),
    "",
    "## Batasan & Disclaimer",
    PREMIUM_EXPORT_DISCLAIMER,
    "",
    safeText(report.disclaimer),
    "",
    lineList("Rekomendasi Tindak Lanjut", report.next_user_steps),
  ].join("\n");
}

export function buildGuideMarkdown(report: StartFromZeroGuide, options: ReportMarkdownOptions = {}) {
  return [
    "# NaLI Learn & Report",
    "",
    "## Judul Laporan",
    safeText(report.title),
    "",
    `**${safeText(report.label)}**`,
    "",
    buildMetadata(report, options),
    "## Kerangka Topik",
    safeText(report.topic_framing),
    "",
    lineList("Outline Laporan", report.suggested_outline),
    lineList("Pertanyaan Observasi", report.observation_questions),
    lineList("Template Catatan Lapangan", report.field_note_template),
    lineList("Checklist Bukti", report.evidence_checklist),
    lineList("Checklist Pencarian Sumber", report.source_search_checklist),
    "## Catatan Etika/Keamanan",
    safeText(report.safety_or_ethics_note),
    "",
    "## Integritas Akademik",
    safeText(report.integrity_note),
    "",
    "## Batasan & Disclaimer",
    PREMIUM_EXPORT_DISCLAIMER,
    "",
    safeText(report.disclaimer),
    "",
    lineList("Rekomendasi Tindak Lanjut", report.next_steps),
  ].join("\n");
}

export function buildReportMarkdown(report: ReportResult, options: ReportMarkdownOptions = {}) {
  return report.mode === "start_from_zero" ? buildGuideMarkdown(report, options) : buildDraftMarkdown(report, options);
}
