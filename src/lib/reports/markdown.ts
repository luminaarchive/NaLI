import type { DraftReport, ReportResult, StartFromZeroGuide } from "@/lib/reports/reportGenerator";

function lineList(title: string, items: string[]) {
  return [`## ${title}`, ...items.map((item) => `- ${item}`), ""].join("\n");
}

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "/");
}

export function buildDraftMarkdown(report: DraftReport) {
  const evidenceRows = report.evidence_table
    .map(
      (row) =>
        `| ${row.id} | ${row.material_type} | ${escapeTableCell(row.summary)} | ${escapeTableCell(row.verification_status)} |`,
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

export function buildGuideMarkdown(report: StartFromZeroGuide) {
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

export function buildReportMarkdown(report: ReportResult) {
  return report.mode === "start_from_zero" ? buildGuideMarkdown(report) : buildDraftMarkdown(report);
}
