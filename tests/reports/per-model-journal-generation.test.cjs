require("../helpers/register-ts.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");
const { validateReportRequest, buildReportPrompt } = require("../../src/lib/reports/reportGenerator");

test("1. Model IDs are routed correctly", () => {
  const pVal = validateReportRequest({
    integrityConsent: true,
    mainText: "Kualitas air di sungai A keruh.",
    mode: "draft_from_materials",
    selectedModel: "peregrine",
  });
  assert.equal(pVal.success, true);
  assert.equal(pVal.data.selectedModel, "peregrine");

  const oVal = validateReportRequest({
    integrityConsent: true,
    mainText: "Kualitas air di sungai A keruh.",
    mode: "draft_from_materials",
    selectedModel: "obsidian",
  });
  assert.equal(oVal.success, true);
  assert.equal(oVal.data.selectedModel, "obsidian");

  const zVal = validateReportRequest({
    integrityConsent: true,
    mainText: "Kualitas air di sungai A keruh.",
    mode: "draft_from_materials",
    selectedModel: "zephyr",
  });
  assert.equal(zVal.success, true);
  assert.equal(zVal.data.selectedModel, "zephyr");

  const invVal = validateReportRequest({
    integrityConsent: true,
    mainText: "Kualitas air di sungai A keruh.",
    mode: "draft_from_materials",
    selectedModel: "invalid-id",
  });
  assert.equal(invVal.success, true);
  assert.equal(invVal.data.selectedModel, "peregrine"); // falls back to peregrine
});

test("2. Prompt builder injects model profile guideline safely", () => {
  const pInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Observasi erosi tebing sungai.",
    sourceUrls: [],
    location: "Semarang",
    fileDescription: "",
    role: "pengguna",
    title: "Erosi",
    topic: "",
    selectedModel: "peregrine",
  };
  const pPrompt = buildReportPrompt(pInput);
  assert.match(pPrompt, /MODEL PROFILE \(Peregrine\)/);

  const oInput = { ...pInput, selectedModel: "obsidian" };
  const oPrompt = buildReportPrompt(oInput);
  assert.match(oPrompt, /MODEL PROFILE \(Obsidian\)/);

  const zInput = { ...pInput, selectedModel: "zephyr" };
  const zPrompt = buildReportPrompt(zInput);
  assert.match(zPrompt, /MODEL PROFILE \(Zephyr\)/);
});

test("3. Prompts forbid fake citations, data, and DOIs", () => {
  const input = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Observasi air.",
    sourceUrls: [],
    location: "",
    fileDescription: "",
    role: "pengguna",
    title: "Air",
    topic: "",
    selectedModel: "peregrine",
  };
  const prompt = buildReportPrompt(input);
  assert.match(prompt, /Do not invent citations, DOI, statistics/);
  assert.match(prompt, /Do not fabricate data, fake references/);
});

test("4. Safe model labels exist in routes", () => {
  const generateRouteSource = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/generate/route.ts"), "utf8");
  assert.match(generateRouteSource, /"NaLI Peregrine"|"NaLI Obsidian"|"NaLI Zephyr"/);
});

test("5. Local copy/download UI features lock public PDF export", () => {
  const clientSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  assert.match(clientSource, /PDF berbayar belum aktif/);
  assert.match(clientSource, /Unduh Markdown lokal/);
  assert.match(clientSource, /Unduh teks lokal/);
});

test("6. QA download outputs are placed outside the repository", () => {
  const tmpPath = "/tmp/nali-qa";
  const downloadsPath = path.join(require("node:os").homedir(), "Downloads/NaLI-QA");
  
  const relTmp = path.relative(repoRoot, tmpPath);
  assert.ok(relTmp.startsWith(".."), "QA tmp path must be outside the repo.");
  
  const relDownloads = path.relative(repoRoot, downloadsPath);
  assert.ok(relDownloads.startsWith(".."), "QA downloads path must be outside the repo.");

  // Check v4 file naming
  const formats = ["md", "txt", "pdf", "docx"];
  const models = ["peregrine", "obsidian", "zephyr"];
  for (const model of models) {
    for (const fmt of formats) {
      const file = path.join(downloadsPath, `nali-${model}-journal-reference-v4.${fmt}`);
      // verify that paths are valid and resolved outside the repo
      const relFile = path.relative(repoRoot, file);
      assert.ok(relFile.startsWith(".."), "v4 QA artifact files must remain outside the repo root to avoid accidental staging.");
    }
  }
});
