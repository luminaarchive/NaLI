require("../tests/helpers/register-ts.cjs");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const { buildMockResult } = require("../src/lib/reports/reportGenerator");
const { buildReportMarkdown } = require("../src/lib/reports/markdown");
const { buildReportPdfBytes } = require("../src/lib/reports/pdf");

const prompt = "Saya mahasiswa biologi. Tolong bantu buat draft laporan bergaya jurnal sederhana tentang pengamatan morfologi daun di sekitar kampus. Data saya: Daun A berbentuk lonjong, tepi rata, warna hijau tua. Daun B berbentuk menjari, tepi bergerigi, warna hijau muda. Lokasi umum: sekitar halaman kampus. Waktu pengamatan: pagi hari. Jangan buat sitasi palsu, DOI palsu, atau klaim verifikasi sumber. Buat struktur seperti judul, abstrak singkat, pendahuluan, metode, hasil, pembahasan, keterbatasan bukti, dan data tambahan yang masih perlu saya kumpulkan.";

let outputDir = path.join(os.homedir(), "Downloads/NaLI-QA");
try {
  fs.mkdirSync(outputDir, { recursive: true });
} catch (err) {
  console.warn("Unable to create ~/Downloads/NaLI-QA, falling back to /tmp/nali-qa");
  outputDir = "/tmp/nali-qa";
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  const models = ["peregrine", "obsidian", "zephyr"];
  for (const model of models) {
    const input = {
      mode: "draft_from_materials",
      reportTemplate: "Laporan Observasi Lingkungan",
      mainText: prompt,
      sourceUrls: [],
      location: "Halaman Kampus",
      fileDescription: "",
      userRole: "mahasiswa",
      title: `Pengamatan Morfologi Daun (${model})`,
      topic: "",
      selectedModel: model,
      integrityConsent: true,
    };
    
    const report = buildMockResult(input, `NaLI ${model.charAt(0).toUpperCase() + model.slice(1)}`);
    
    // Build Markdown
    const md = buildReportMarkdown(report, { exportStatus: "export_ready" });
    
    // Build Plain text
    function stripMarkdown(text) {
      return text
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*|__/g, "")
        .replace(/\*|_/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^-\s+/gm, "")
        .replace(/^[|+-].*[|+-]$/gm, "")
        .replace(/\n\s*\n+/g, "\n\n")
        .trim();
    }
    const txt = stripMarkdown(md);
    
    // Write Markdown & TXT
    fs.writeFileSync(path.join(outputDir, `nali-${model}-journal-v2.md`), md, "utf8");
    fs.writeFileSync(path.join(outputDir, `nali-${model}-journal-v2.txt`), txt, "utf8");
    
    // Build PDF
    const pdfBytes = await buildReportPdfBytes(report, { exportStatus: "export_ready" });
    fs.writeFileSync(path.join(outputDir, `nali-${model}-journal-v2.pdf`), Buffer.from(pdfBytes));
    
    console.log(`Generated QA v2 artifacts for model ${model} in ${outputDir}`);
  }
}

run().catch(console.error);
