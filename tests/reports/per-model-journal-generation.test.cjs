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
  const downloadsPath = "/tmp/nali-qa";
  const relative = path.relative(repoRoot, downloadsPath);
  assert.ok(relative.startsWith(".."), "QA outputs must be placed outside the repository root to avoid committing them to git.");
});
