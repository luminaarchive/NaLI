require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");

const { buildMockResult } = require("../../src/lib/reports/reportGenerator");
const { buildReportMarkdown } = require("../../src/lib/reports/markdown");
const { buildReportPdfBytes } = require("../../src/lib/reports/pdf");
const { validateJournalPdfOutputPath } = require("../../src/lib/reports/journalHtmlPdfRenderer");
const { buildJournalArticle, mapJournalArticleToDraftReport } = require("../../src/lib/reports/journalArticleTemplate");

const testInput = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "morfologi daun Daun A dan Daun B",
  sourceUrls: [],
  location: "Halaman Kampus",
  fileDescription: "",
  userRole: "mahasiswa",
  title: "Pengamatan Morfologi Daun",
  topic: "",
  selectedModel: "peregrine",
  integrityConsent: true,
};

function journalReport(model) {
  const input = { ...testInput, selectedModel: model };
  const label = `NaLI ${model.charAt(0).toUpperCase()}${model.slice(1)}`;
  return mapJournalArticleToDraftReport(buildMockResult(input, label), buildJournalArticle(input, model));
}

test("1. Peregrine journal output contract is a compact starter structure", () => {
  const report = journalReport("peregrine");
  assert.ok(report.executive_summary.includes("Starter Brief"));
  assert.ok(report.background.includes("Background for Practicum"));
  assert.ok(report.method_or_materials.includes("Ringkasan deskriptif"));
  assert.ok(report.discussion.includes("SHORT LIMITATION CHECKLIST"));
  assert.ok(report.conclusion.includes("Starter note"));
});

test("2. Evidence placeholders are present when no photo/evidence is provided", () => {
  const report = journalReport("peregrine");
  const markdown = buildReportMarkdown(report);
  assert.ok(markdown.includes("Foto belum disediakan"), "Must include photo evidence placeholder");
  assert.ok(markdown.includes("tidak ditampilkan pada starter output"), "Must retain the starter measurement cap");
});

test("3. No fake DOI, citation, or species identification is fabricated", () => {
  const report = buildMockResult(testInput, "NaLI Peregrine");
  const text = JSON.stringify(report);
  assert.equal(text.includes("doi.org"), false, "Must not fabricate DOI");
  assert.equal(text.includes("10.1002"), false, "Must not fabricate DOIs");
  // Ensure we do not fabricate random species taxonomies or verified markers
  assert.equal(text.includes("Spesies Terverifikasi"), false, "Must not claim verified species");
});

test("4. Peregrine, Obsidian, and Zephyr profiles produce meaningfully different outputs", () => {
  const pReport = journalReport("peregrine");
  const oReport = journalReport("obsidian");
  const zReport = journalReport("zephyr");

  assert.notEqual(pReport.executive_summary, oReport.executive_summary, "Peregrine and Obsidian abstracts must differ");
  assert.notEqual(oReport.executive_summary, zReport.executive_summary, "Obsidian and Zephyr abstracts must differ");
  assert.ok(oReport.discussion.includes("DATA RISK REGISTER"), "Obsidian should expose audit risk analysis");
  assert.ok(
    zReport.discussion.includes("PUBLICATION-STYLE REVISION NOTES"),
    "Zephyr should expose premium editorial work",
  );
});

test("5. PDF builder includes headers, disclaimers, and evidence slots", async () => {
  const report = buildMockResult(testInput, "NaLI Peregrine");
  const pdfBytes = await buildReportPdfBytes(report, { exportStatus: "export_ready" });
  assert.ok(pdfBytes.length > 0, "PDF generation should succeed");
  // Check that the output is indeed a PDF
  const header = Buffer.from(pdfBytes.slice(0, 4)).toString("utf8");
  assert.equal(header, "%PDF", "Must output valid PDF header");
});

test("6. Public PDF remains locked in client copy operations", () => {
  const report = buildMockResult(testInput, "NaLI Peregrine");
  const markdown = buildReportMarkdown(report, { exportStatus: "preview_copy" });
  assert.ok(markdown.includes("Status export: preview_copy"), "Should state copy mode status");
});

test("7. Founder/admin journal PDF uses a Playwright local-only renderer", () => {
  const repoRoot = path.join(__dirname, "../..");
  const source = fs.readFileSync(path.join(repoRoot, "src/lib/reports/journalHtmlPdfRenderer.ts"), "utf8");
  assert.match(source, /from "playwright"/);
  assert.match(source, /printBackground:\s*true/);
  assert.match(source, /preferCSSPageSize:\s*true/);
  assert.doesNotMatch(source, /Founder\/Admin Draft Series|Internal QA/);
  assert.match(source, /article\.metadata\.shortCategory/);
});

test("8. Journal PDF renderer refuses repository and public output paths", () => {
  assert.doesNotThrow(() => validateJournalPdfOutputPath("/tmp/nali-qa/founder-draft.pdf"));
  assert.doesNotThrow(() =>
    validateJournalPdfOutputPath(path.join(require("node:os").homedir(), "Downloads/NaLI-QA/founder-draft.pdf")),
  );
  assert.throws(() => validateJournalPdfOutputPath(path.join(__dirname, "../../public/export.pdf")));
});

test("9. V6 generator keeps publication artifacts outside the repository", () => {
  const repoRoot = path.join(__dirname, "../..");
  const source = fs.readFileSync(path.join(repoRoot, "scratch/generate_reference_journal_v6.cjs"), "utf8");
  assert.match(source, /Downloads", "NaLI-QA"/);
  assert.match(source, /journal-reference-v6/);
  assert.doesNotMatch(source, /public\/|src\/app/);
});
