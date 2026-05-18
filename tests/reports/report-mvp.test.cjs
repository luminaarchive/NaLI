require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  DRAFT_LABEL,
  PUBLIC_REPORT_DISCLAIMER,
  START_FROM_ZERO_DISCLAIMER,
  START_FROM_ZERO_LABEL,
  buildMockDraftReport,
  buildMockStartGuide,
  containsForbiddenWording,
  validateReportRequest,
} = require("../../src/lib/reports/reportGenerator");

const repoRoot = path.join(__dirname, "../..");

test("draft mode accepts material without requiring title or role", () => {
  const result = validateReportRequest({
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terkikis dan air cukup deras.",
    integrityConsent: true,
  });

  assert.equal(result.success, true);
  assert.equal(result.data.mode, "draft_from_materials");
  assert.equal(result.data.role, "pengguna");
  assert.match(result.data.title, /Observasi Erosi/i);
});

test("draft mode rejects empty material", () => {
  const result = validateReportRequest({
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "   ",
    sourceUrls: "  ",
    location: "",
    fileDescription: "",
    integrityConsent: true,
  });

  assert.equal(result.success, false);
  assert.match(result.error, /minimal satu bahan/i);
});

test("start-from-zero accepts a topic request without evidence material", () => {
  const result = validateReportRequest({
    mode: "start_from_zero",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Aku mau bikin laporan observasi lingkungan tentang sungai tapi belum punya catatan.",
    integrityConsent: true,
  });

  assert.equal(result.success, true);
  assert.equal(result.data.mode, "start_from_zero");
});

test("start-from-zero rejects a truly empty request", () => {
  const result = validateReportRequest({
    mode: "start_from_zero",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "",
    topic: "",
    integrityConsent: true,
  });

  assert.equal(result.success, false);
  assert.match(result.error, /topik atau jenis laporan/i);
});

test("missing integrity consent is rejected in both modes", () => {
  const draft = validateReportRequest({
    mode: "draft_from_materials",
    reportTemplate: "Laporan Field Trip Sekolah",
    mainText: "Ada catatan observasi tanaman di halaman sekolah.",
    integrityConsent: false,
  });
  const guide = validateReportRequest({
    mode: "start_from_zero",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Aku belum tahu topik laporan lingkungan.",
    integrityConsent: false,
  });

  assert.equal(draft.success, false);
  assert.equal(guide.success, false);
  assert.match(draft.error, /integritas/i);
  assert.match(guide.error, /integritas/i);
});

test("mock draft includes evidence boundaries, extra evidence, and review checklist", () => {
  const validated = validateReportRequest({
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Saya mengamati erosi di Banjir Kanal Semarang. Tebing sungai terlihat terkikis dan air cukup deras.",
    sourceUrls: "https://example.org/catatan-sungai",
    integrityConsent: true,
  });

  assert.equal(validated.success, true);

  const report = buildMockDraftReport(validated.data);

  assert.equal(report.mode, "draft_from_materials");
  assert.equal(report.draft_label, DRAFT_LABEL);
  assert.equal(report.disclaimer, PUBLIC_REPORT_DISCLAIMER);
  assert.equal(report.source_verification_status, "Source verification belum aktif di MVP ini.");
  assert.ok(report.evidence_table.length >= 2);
  assert.match(report.uncertainty_note, /belum/i);
  assert.ok(report.additional_evidence_needed.some((item) => /Foto kondisi tebing sungai/i.test(item)));
  assert.ok(report.user_review_checklist.length >= 4);
  assert.doesNotMatch(JSON.stringify(report), /doi:|10\.[0-9]{4,9}\//i);
});

test("optional fields are accepted without becoming fabricated verification", () => {
  const result = validateReportRequest({
    mode: "draft_from_materials",
    reportTemplate: "Laporan Field Trip Sekolah",
    mainText: "Catatan perjalanan lapangan menyebut sampah plastik di sekitar area sungai.",
    location: "Semarang",
    fileDescription: "Foto lapangan di galeri HP, belum diunggah.",
    sourceUrls: ["https://example.org/sumber"],
    integrityConsent: true,
  });

  assert.equal(result.success, true);

  const report = buildMockDraftReport(result.data);
  assert.equal(report.source_verification_status, "Source verification belum aktif di MVP ini.");
  assert.ok(report.evidence_table.some((row) => /Semarang/i.test(row.summary)));
  assert.ok(report.evidence_table.some((row) => /Foto lapangan/i.test(row.summary)));
  assert.ok(
    report.evidence_table.every((row) => /belum diverifikasi|Upload belum aktif/i.test(row.verification_status)),
  );
});

test("mock start guide is not labeled as a draft report", () => {
  const validated = validateReportRequest({
    mode: "start_from_zero",
    reportTemplate: "Laporan Observasi Lingkungan",
    mainText: "Aku harus bikin laporan lingkungan tapi belum tahu topiknya apa.",
    integrityConsent: true,
  });

  assert.equal(validated.success, true);

  const guide = buildMockStartGuide(validated.data);

  assert.equal(guide.mode, "start_from_zero");
  assert.equal(guide.label, START_FROM_ZERO_LABEL);
  assert.equal(guide.disclaimer, START_FROM_ZERO_DISCLAIMER);
  assert.ok(guide.suggested_outline.length >= 5);
  assert.ok(guide.observation_questions.length >= 4);
  assert.ok(guide.field_note_template.length >= 4);
  assert.ok(guide.evidence_checklist.length >= 4);
  assert.ok(guide.source_search_checklist.length >= 3);
  assert.equal("draft_label" in guide, false);
});

test("forbidden cheating wording detector catches unsafe copy", () => {
  assert.equal(containsForbiddenWording("Buat skripsi" + " selesai dalam sekali klik"), true);
  assert.equal(containsForbiddenWording("Buat draf berbasis bahan dengan human review"), false);
});

test("public route files exist for the core MVP links", () => {
  const routeFiles = [
    "src/app/page.tsx",
    "src/app/learn-report/page.tsx",
    "src/app/create-report/page.tsx",
    "src/app/field-intelligence/page.tsx",
    "src/app/pricing/page.tsx",
    "src/app/report/[id]/page.tsx",
    "src/app/api/reports/generate/route.ts",
  ];

  for (const file of routeFiles) {
    assert.equal(fs.existsSync(path.join(repoRoot, file)), true, `${file} should exist`);
  }
});

test("OpenRouter provider remains server-only in source", () => {
  const providerSource = fs.readFileSync(path.join(repoRoot, "src/lib/ai/openrouter.ts"), "utf8");
  const appSource = [
    "src/app/api/reports/generate/route.ts",
    "src/components/report/CreateReportForm.tsx",
    "src/components/report/ReportResultClient.tsx",
  ]
    .map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8"))
    .join("\n");

  assert.match(providerSource, /process\.env\.OPENROUTER_API_KEY/);
  assert.doesNotMatch(providerSource + appSource, /NEXT_PUBLIC_OPENROUTER/i);
});

test("public UI and report output source avoid forbidden academic cheating wording", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/learn-report/page.tsx",
    "src/app/create-report/page.tsx",
    "src/app/field-intelligence/page.tsx",
    "src/app/pricing/page.tsx",
    "src/components/report/CreateReportForm.tsx",
    "src/components/report/HomeCommandBox.tsx",
    "src/components/report/ReportResultClient.tsx",
    "src/lib/reports/reportGenerator.ts",
  ];
  const source = files.map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8")).join("\n");
  const forbiddenPhrases = [
    ["Generate tugas", " final"],
    ["Buat skripsi", " selesai"],
    ["Kerjakan tugas", " saya"],
    ["Anti ketahuan", " dosen"],
    ["Bebas plagiarisme", " dijamin"],
    ["Paper", " otomatis"],
    ["Skripsi", " otomatis"],
    ["Dijamin", " aman"],
  ].map((parts) => parts.join(""));

  for (const phrase of forbiddenPhrases) {
    assert.doesNotMatch(source, new RegExp(phrase, "i"), `${phrase} should not appear in public UI/output source`);
  }
});
