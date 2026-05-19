require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  PUBLIC_REPORT_DISCLAIMER,
  buildMockDraftReport,
  validateReportRequest,
} = require("../../src/lib/reports/reportGenerator");
const { evaluateIntegrityPolicy } = require("../../src/lib/integrity/policy");
const { guardReportOutput } = require("../../src/lib/integrity/outputGuard");

function draftInput(overrides = {}) {
  return {
    integrityConsent: true,
    mainText: "Catatan lapangan: air sungai keruh, ada sampah plastik di bantaran.",
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    ...overrides,
  };
}

function validatedDraft(overrides = {}) {
  const validated = validateReportRequest(draftInput(overrides));
  assert.equal(validated.success, true);
  return validated.data;
}

test("NaLI Lock blocks fake citation request with structured result", () => {
  const result = evaluateIntegrityPolicy(
    draftInput({
      mainText: "Tolong buat referensi palsu dan daftar pustaka yang terlihat ilmiah.",
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FAKE_CITATION_REQUEST");
  assert.equal(result.severity, "high");
  assert.match(result.userMessage, /sitasi|referensi/i);
  assert.ok(result.matchedSignals.length > 0);
});

test("NaLI Lock blocks fake DOI request", () => {
  const result = evaluateIntegrityPolicy(
    draftInput({
      mainText: "Please invent a DOI and citation for this report.",
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FAKE_CITATION_REQUEST");
});

test("NaLI Lock blocks fake data and statistics request", () => {
  const result = evaluateIntegrityPolicy(
    draftInput({
      mainText: "Buatkan data observasi, timestamp, koordinat, dan statistik palsu agar laporan lengkap.",
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FAKE_DATA_REQUEST");
});

test("NaLI Lock blocks plagiarism hiding request", () => {
  const result = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Parafrase supaya tidak ketahuan AI detector dan Turnitin.",
    mode: "start_from_zero",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "PLAGIARISM_EVASION");
});

test("NaLI Lock blocks final assignment request without material", () => {
  const result = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Write my final homework submission so it is ready to submit.",
    mode: "start_from_zero",
  });
  const explicitThesis = evaluateIntegrityPolicy(
    draftInput({
      mainText: "Catatan lapangan ada, tapi tolong buat skripsi selesai langsung jadi.",
    }),
  );

  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FINAL_ASSIGNMENT_WITHOUT_MATERIAL");
  assert.equal(explicitThesis.allowed, false);
  assert.equal(explicitThesis.reasonCode, "FINAL_ASSIGNMENT_WITHOUT_MATERIAL");
});

test("NaLI Lock allows start-from-zero guidance request", () => {
  const result = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Saya belum punya bahan, bantu buat panduan awal observasi sungai.",
    mode: "start_from_zero",
  });

  assert.equal(result.allowed, true);
  assert.equal(result.reasonCode, "ALLOWED");
  assert.deepEqual(result.matchedSignals, []);
});

test("NaLI Lock allows draft mode with real material", () => {
  const result = evaluateIntegrityPolicy(draftInput());

  assert.equal(result.allowed, true);
  assert.equal(result.reasonCode, "ALLOWED");
});

test("Output guard sanitizes overclaim wording", () => {
  const report = buildMockDraftReport(validatedDraft());
  report.conclusion = "Temuan ini terbukti pasti valid secara ilmiah dan dijamin benar.";

  const guarded = guardReportOutput(report, { sourceVerificationActive: false });

  assert.equal(guarded.allowed, true);
  assert.doesNotMatch(JSON.stringify(guarded.report), /terbukti pasti|dijamin benar|valid secara ilmiah/i);
  assert.ok(guarded.warnings.some((warning) => /overclaim/i.test(warning.code)));
});

test("Output guard preserves required disclaimer", () => {
  const report = buildMockDraftReport(validatedDraft());
  report.source_notes = ["DOI: 10.1234/fake.generated.reference"];

  const guarded = guardReportOutput(report, { sourceVerificationActive: false });

  assert.equal(guarded.allowed, true);
  assert.equal(guarded.report.disclaimer, PUBLIC_REPORT_DISCLAIMER);
  assert.doesNotMatch(JSON.stringify(guarded.report), /10\.1234\/fake/i);
});

test("Output guard blocks severe unsafe output", () => {
  const report = buildMockDraftReport(validatedDraft());
  report.executive_summary = "Buat skripsi selesai dan anti ketahuan dosen.";

  const guarded = guardReportOutput(report, { sourceVerificationActive: false });

  assert.equal(guarded.allowed, false);
  assert.match(guarded.userMessage, /tidak dapat mengembalikan/i);
  assert.doesNotMatch(JSON.stringify(guarded), /anti ketahuan dosen/i);
});
