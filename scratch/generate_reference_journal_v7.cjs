require("../tests/helpers/register-ts.cjs");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { buildJournalArticle } = require("../src/lib/reports/journalArticleTemplate");
const { buildJournalHtml } = require("../src/lib/reports/journalHtmlTemplate");
const { renderJournalPdfFromHtml } = require("../src/lib/reports/journalHtmlPdfRenderer");
const { buildMockResult } = require("../src/lib/reports/reportGenerator");
const { buildReportMarkdown } = require("../src/lib/reports/markdown");
const { buildReportDocxBuffer } = require("../src/lib/reports/journalDocxRenderer");

const prompt =
  "Saya mahasiswa biologi. Tolong bantu buat draft laporan bergaya jurnal ilmiah mengenai pengamatan morfologi daun di area kampus dengan data replikasi pengukuran Daun A dan Daun B. Pengamatan mencakup panjang helaian daun, lebar helaian, dan panjang tangkai daun secara berulang. Tolong gunakan referensi yang saya berikan: Botany Guide 2024 dan Flora Kampus 2025. Batasi sitasi hanya pada referensi ini. Jangan buat sitasi fiktif atau klaim verifikasi sepihak.";

function outputDirectory() {
  const downloads = path.join(os.homedir(), "Downloads", "NaLI-QA");
  try {
    fs.mkdirSync(downloads, { recursive: true });
    return downloads;
  } catch {
    const fallback = path.join(os.tmpdir(), "nali-qa");
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\|?[\s:-]+\|[\s|:-]*$/gm, "")
    .replace(/\|/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function generate() {
  const outputDir = outputDirectory();
  for (const model of ["peregrine", "obsidian", "zephyr"]) {
    const input = {
      mode: "draft_from_materials",
      reportTemplate: "Laporan Observasi Lingkungan",
      mainText: prompt,
      sourceUrls: [],
      location: "Sekitar halaman kampus",
      fileDescription: "",
      userRole: "mahasiswa",
      title: "Pengamatan Morfologi Daun di Sekitar Kampus",
      topic: "",
      selectedModel: model,
      integrityConsent: true,
    };
    const label = `NaLI ${model.charAt(0).toUpperCase()}${model.slice(1)}`;
    const article = buildJournalArticle(input, model);
    const report = buildMockResult(input, label);
    const baseName = `nali-${model}-journal-rich-v7`;
    const htmlPath = path.join(outputDir, `${baseName}.html`);
    const markdownPath = path.join(outputDir, `${baseName}.md`);
    const textPath = path.join(outputDir, `${baseName}.txt`);
    const pdfPath = path.join(outputDir, `${baseName}.pdf`);
    const docxPath = path.join(outputDir, `${baseName}.docx`);
    const markdown = buildReportMarkdown(report, { exportStatus: "founder_admin_local_qa" });

    fs.writeFileSync(htmlPath, buildJournalHtml(article), "utf8");
    fs.writeFileSync(markdownPath, markdown, "utf8");
    fs.writeFileSync(textPath, stripMarkdown(markdown), "utf8");
    await renderJournalPdfFromHtml(article, pdfPath);
    fs.writeFileSync(docxPath, await buildReportDocxBuffer(report));

    console.log(`${label}: generated HTML, Markdown, text, PDF, and DOCX at ${outputDir}`);
  }
  console.log(`OUTPUT_DIR=${outputDir}`);
}

generate().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
