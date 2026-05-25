require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");

const { buildMockResult } = require("../../src/lib/reports/reportGenerator");
const { buildReportDocxBuffer } = require("../../src/lib/reports/journalDocxRenderer");

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
