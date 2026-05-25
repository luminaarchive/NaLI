require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");
const JSZip = require("jszip");

const { buildMockResult } = require("../../src/lib/reports/reportGenerator");
const { buildReportDocxBuffer } = require("../../src/lib/reports/journalDocxRenderer");

const testInput = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "morfologi daun Daun A dan Daun B references Botany Guide Flora Kampus",
  sourceUrls: [],
  location: "Halaman Kampus",
  fileDescription: "",
  userRole: "mahasiswa",
  title: "Pengamatan Morfologi Daun",
  topic: "",
  selectedModel: "peregrine",
  integrityConsent: true,
};

test("1. DOCX renderer module exists and exports buildReportDocxBuffer", () => {
  assert.equal(typeof buildReportDocxBuffer, "function");
});

test("2. DOCX renderer creates structured document sections successfully", async () => {
  const report = buildMockResult(testInput, "NaLI Peregrine");
  const docxBuffer = await buildReportDocxBuffer(report);
  assert.ok(docxBuffer instanceof Buffer);
  assert.ok(docxBuffer.length > 1000, "Docx file should be compiled to a valid binary");
});

test("3. Public DOCX export remains locked / inactive", () => {
  const repoRoot = path.join(__dirname, "../..");
  const clientSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  // The client code should not feature any direct active DOCX download triggers or unlocked indicators
  assert.equal(clientSource.includes("Unduh DOCX"), false, "Unduh DOCX must not be exposed to the public UI");
});

test("4. DOCX library dependency is not imported in client components", () => {
  const repoRoot = path.join(__dirname, "../..");
  const clientSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  assert.equal(clientSource.includes('from "docx"'), false, "DOCX library must not be loaded on the client side");
});

test("5. Obsidian DOCX contains evidence-audit sections, clean tables, and no premium dump", async () => {
  const report = buildMockResult(testInput, "NaLI Obsidian");
  const zip = await JSZip.loadAsync(await buildReportDocxBuffer(report));
  const xml = await zip.file("word/document.xml").async("string");
  const text = xml.replace(/<[^>]+>/g, " ");

  for (const section of [
    "INTRODUCTION",
    "LITERATURE REVIEW",
    "MATERIALS AND METHODS",
    "RESULTS AND DISCUSSION",
    "EVIDENCE DOCUMENTATION",
    "EVIDENCE SUFFICIENCY ASSESSMENT",
    "DATA RISK REGISTER",
    "METHODOLOGICAL VULNERABILITY",
    "CONCLUSIONS",
    "ANNEXURE",
    "REFERENCES",
  ]) {
    assert.match(text, new RegExp(section));
  }
  assert.doesNotMatch(text, /\|\s*Spesimen\s*\||#{1,3}\s/);
  assert.match(text, /Evidence Audit Article/i);
  assert.doesNotMatch(text, /Publication-style Revision Notes|Reviewer-readiness Checklist/);
  assert.match(text, /Draft only; source verification inactive; public export locked\./);
  assert.doesNotMatch(text, /Founder\/Admin Draft Series|Internal QA|DOI\s+Not assigned|ISSN\s+Not applicable/i);
  assert.match(xml, /w:type="dxa"/, "Tables must have explicit editable geometry");

  // V7 Specifics
  assert.match(text, /Table 2\. Summary measurements statistics/, "Must contain Table 2");
  assert.match(text, /Annex Table A2\. Raw replicate measurements/, "Must contain Annex Table A2");
  assert.match(text, /Figure 1/, "Must contain Figure 1");
  assert.match(text, /Figure 2/, "Must contain Figure 2");
  assert.match(text, /Botany morphology practical guide/, "Must contain references content");
});
