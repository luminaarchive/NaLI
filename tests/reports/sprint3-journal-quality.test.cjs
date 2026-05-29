const assert = require("node:assert/strict");
const test = require("node:test");

require("../helpers/register-ts.cjs");

const { evaluateJournalQuality } = require("../../src/lib/reports/journalQuality");
const { evaluateJournalReadiness } = require("../../src/lib/reports/journalReadiness");
const { getReportExportEligibility } = require("../../src/lib/reports/exportGate");
const { normalizeProviderResult, buildMockDraftReport } = require("../../src/lib/reports/reportGenerator");

test("Sprint 3 Journal Quality - 1. Evaluator computes correct score, levels, and IMRaD completeness", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi Hutan Merapi",
    role: "pengguna",
    mainText: "Observasi vegetasi Acacia decurrens di lereng Gunung Merapi.",
    topic: "Acacia decurrens",
    sourceUrls: ["https://example.com/sumber1"],
    location: "Yogyakarta",
    fileDescription: "",
    integrityConsent: true,
  };

  const candidate = {
    title: "Draf Jurnal Pengamatan Merapi",
    abstract: "Ini abstrak draf jurnal pengamatan vegetasi Acacia decurrens yang detail.",
    keywords: ["Merapi", "Acacia"],
    introduction: "Pendahuluan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    methods: "Metode detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    results: "Hasil detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    discussion: "Pembahasan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    conclusion: "Kesimpulan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    limitations: "Batasan data: plot pengamatan sempit dan waktu singkat.",
    evidenceTable: [
      { id: "EV-01", material_type: "catatan", summary: "Catatan Acacia", user_provided: true, verification_status: "verified" },
      { id: "EV-02", material_type: "url", summary: "https://example.com/sumber1", user_provided: true, verification_status: "verified" },
      { id: "EV-03", material_type: "lokasi", summary: "Yogyakarta", user_provided: true, verification_status: "verified" }
    ],
    missingEvidence: ["Foto pohon Acacia"],
    referencesSuppliedByUser: "- https://example.com/sumber1",
    citationIntegrityNote: "NaLI tidak membuat DOI/referensi palsu.",
    unsupportedClaims: []
  };

  const quality = evaluateJournalQuality(requestInput, candidate);

  // 30 points base score + sections (6 * 5 = 30) + IMRaD bonus (10) + Evidence strong (15) + Citation safe (10) + Limitations (15) = 110 (capped at 100)
  assert.ok(quality.score > 50);
  assert.equal(quality.imradComplete, true);
  assert.equal(quality.missingSections.length, 0);
  assert.equal(quality.citationIntegrity, "safe");
  assert.equal(quality.evidenceSufficiency, "strong");
  assert.equal(quality.publicationClaimAllowed, false);
});

test("Sprint 3 Journal Quality - 2. Thin input caps the score to maximum 55", () => {
  const thinInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Merapi",
    role: "pengguna",
    mainText: "Merapi.",
    topic: "Merapi",
    sourceUrls: [],
    location: "",
    fileDescription: "",
    integrityConsent: true,
  };

  const candidate = {
    title: "Merapi Jurnal",
    abstract: "Ini abstrak draf jurnal pengamatan vegetasi Acacia decurrens yang detail.",
    keywords: ["Merapi"],
    introduction: "Pendahuluan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    methods: "Metode detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    results: "Hasil detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    discussion: "Pembahasan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    conclusion: "Kesimpulan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    limitations: "Batasan data: plot pengamatan sempit dan waktu singkat.",
    evidenceTable: [],
    missingEvidence: [],
    referencesSuppliedByUser: "Belum ada referensi yang disediakan pengguna.",
    citationIntegrityNote: "NaLI tidak membuat DOI/referensi palsu.",
    unsupportedClaims: []
  };

  const quality = evaluateJournalQuality(thinInput, candidate);
  assert.ok(quality.score <= 55);
});

test("Sprint 3 Journal Quality - 3. Citation integrity warning and references override when sourceUrls are empty", () => {
  const requestInputNoRefs = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan Jurnal",
    title: "Jurnal Observasi Hutan Merapi",
    role: "pengguna",
    mainText: "Observasi vegetasi Acacia decurrens di lereng Gunung Merapi.",
    topic: "Acacia decurrens",
    sourceUrls: [],
    location: "Yogyakarta",
    fileDescription: "",
    integrityConsent: true,
  };

  // Check normalizeProviderResult with empty references
  const rawResponse = {
    title: "Observasi Merapi",
    executive_summary: "Ringkasan",
    background: "Latar Belakang",
    method_or_materials: "Metode",
    findings: ["Temuan 1"],
    preliminary_analysis: "Analisis",
    discussion: "Pembahasan",
    conclusion: "Kesimpulan",
    uncertainty_note: "Batasan",
    evidence_table: [],
    journal_candidate: {
      title: "Jurnal Merapi",
      abstract: "Abstrak",
      introduction: "Pendahuluan",
      methods: "Metode",
      results: "Hasil",
      discussion: "Pembahasan",
      conclusion: "Kesimpulan",
      limitations: "Batasan",
      referencesSuppliedByUser: "Invented DOI 10.1000/xyz123, fake reference list",
      citationIntegrityNote: "Palsu",
      unsupportedClaims: []
    }
  };

  const normalized = normalizeProviderResult(rawResponse, requestInputNoRefs, "Test Model");
  assert.ok(normalized.journal_candidate);
  assert.deepEqual(normalized.journal_candidate.referencesSuppliedByUser, ["Belum ada referensi yang disediakan pengguna."]);
  assert.equal(normalized.journal_quality.citationIntegrity, "warning");
});

test("Sprint 3 Journal Quality - 4. Journal readiness set canGenerateJournalPdfNow to false", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi Hutan Merapi",
    role: "pengguna",
    mainText: "Observasi vegetasi Acacia decurrens di lereng Gunung Merapi.",
    topic: "Acacia decurrens",
    sourceUrls: ["https://example.com"],
    location: "Yogyakarta",
    fileDescription: "",
    integrityConsent: true,
  };

  const mockReport = buildMockDraftReport(requestInput);
  const readiness = evaluateJournalReadiness(requestInput, mockReport);

  assert.equal(readiness.canGenerateJournalPdfNow, false);
});

test("Sprint 3 Journal Quality - 5. Export Gate is strictly locked for unpaid report", async () => {
  const eligibility = await getReportExportEligibility("some-unpaid-report-id");
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.state, "export_locked");
});
