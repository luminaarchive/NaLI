const assert = require("node:assert/strict");
const test = require("node:test");

require("../helpers/register-ts.cjs");

const { evaluateJournalQuality } = require("../../src/lib/reports/journalQuality");
const { evaluateJournalReadiness } = require("../../src/lib/reports/journalReadiness");
const { getReportExportEligibility } = require("../../src/lib/reports/exportGate");
const { normalizeProviderResult, buildMockResult } = require("../../src/lib/reports/reportGenerator");
const {
  wildlifeConservationBenchmark,
  quantitativeConservationAuthorGuideline,
  combinedNaLiJournalCandidateBenchmark,
} = require("../../src/lib/reports/journalBenchmarkProfile");

test("Sprint 4 Benchmark - 1. Benchmark profile exists and does not contain JWC/E-Palli protected branding as output", () => {
  assert.ok(wildlifeConservationBenchmark);
  assert.ok(quantitativeConservationAuthorGuideline);
  assert.ok(combinedNaLiJournalCandidateBenchmark);

  const serialized = JSON.stringify(combinedNaLiJournalCandidateBenchmark).toLowerCase();
  assert.equal(serialized.includes("wiley"), false);
  assert.equal(serialized.includes("zsl"), false);
  assert.equal(serialized.includes("e-palli"), false);
  assert.equal(serialized.includes("journal of wildlife and conservation"), false);
});

test("Sprint 4 Benchmark - 2. Journal candidate normalization includes all benchmark sections", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan Jurnal",
    title: "Observasi Vegetasi",
    role: "pengguna",
    mainText: "Observasi detail Merapi dengan data dan koordinat.",
    topic: "Acacia",
    sourceUrls: ["https://example.com/source"],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const rawResult = {
    title: "Draf Jurnal Merapi",
    journal_candidate: {
      title: "Judul Jurnal",
      abstract: "Abstrak detail tentang riset Acacia.",
      keywords: ["Acacia", "Merapi"],
      introduction: "Pendahuluan detail...",
      literatureReview: "Tinjauan pustaka detail...",
      materialsAndMethods: "Metode detail...",
      results: "Hasil terperinci...",
      discussion: "Pembahasan terperinci...",
      conclusion: "Kesimpulan terperinci...",
      limitations: ["Batasan 1"],
      futureResearch: ["Riset 1"],
      annexure: [{ label: "Lampiran A", details: ["Detail 1"] }],
      evidenceTable: [{ claim: "Klaim", evidenceType: "Foto", source: "user_supplied", confidence: "high", limitation: "" }],
      missingEvidence: ["Bukti X"],
      referencesSuppliedByUser: ["https://example.com/source"],
      citationIntegrityNote: "NaLI tidak membuat DOI/referensi palsu.",
      unsupportedClaims: [],
      hasConservationImplication: true,
      scientificNameDiscipline: "ok",
      ethicsSafetyNotePresent: true,
      quantitativeEvidenceLevel: "basic_quantitative"
    }
  };

  const normalized = normalizeProviderResult(rawResult, requestInput, "Test Model");
  const jc = normalized.journal_candidate;

  assert.ok(jc);
  assert.equal(jc.title, "Judul Jurnal");
  assert.equal(jc.literatureReview, "Tinjauan pustaka detail...");
  assert.equal(jc.materialsAndMethods, "Metode detail...");
  assert.equal(jc.publicationStatus.isPublished, false);
  assert.equal(jc.publicationStatus.isPeerReviewed, false);
  assert.equal(jc.publicationStatus.doiGenerated, false);
  assert.equal(jc.publicationStatus.pdfPublicExportActive, false);
});

test("Sprint 4 Benchmark - 3. No fake DOI/reference generated when user supplies no sources", () => {
  const requestInputNoRefs = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan Jurnal",
    title: "Observasi Hutan",
    role: "pengguna",
    mainText: "Pengamatan vegetasi Acacia decurrens.",
    topic: "Acacia",
    sourceUrls: [],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const rawResult = {
    title: "Draf Jurnal Merapi",
    journal_candidate: {
      title: "Judul Jurnal",
      abstract: "Abstrak...",
      keywords: ["Acacia"],
      introduction: "Pendahuluan...",
      literatureReview: "Tinjauan...",
      materialsAndMethods: "Metode...",
      results: "Hasil...",
      discussion: "Pembahasan...",
      conclusion: "Kesimpulan...",
      limitations: [],
      futureResearch: [],
      annexure: [],
      evidenceTable: [],
      missingEvidence: [],
      referencesSuppliedByUser: ["DOI 10.1111/acv.70066 fake reference wiley"],
      citationIntegrityNote: "Palsu",
      unsupportedClaims: []
    }
  };

  const normalized = normalizeProviderResult(rawResult, requestInputNoRefs, "Test Model");
  assert.deepEqual(normalized.journal_candidate.referencesSuppliedByUser, ["Belum ada referensi yang disediakan pengguna."]);
});

test("Sprint 4 Benchmark - 4. User-supplied references are preserved as user-supplied/unverified", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan Jurnal",
    title: "Observasi Hutan",
    role: "pengguna",
    mainText: "Vegetasi Acacia.",
    topic: "Acacia",
    sourceUrls: ["https://doi.org/10.1111/acv.70066"],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const rawResult = {
    title: "Draf",
    journal_candidate: {
      title: "Judul",
      abstract: "Abstrak",
      keywords: ["Acacia"],
      introduction: "Pendahuluan",
      literatureReview: "Tinjauan",
      materialsAndMethods: "Metode",
      results: "Hasil",
      discussion: "Pembahasan",
      conclusion: "Kesimpulan",
      limitations: [],
      futureResearch: [],
      annexure: [],
      evidenceTable: [],
      missingEvidence: [],
      referencesSuppliedByUser: []
    }
  };

  const normalized = normalizeProviderResult(rawResult, requestInput, "Test Model");
  assert.equal(normalized.journal_candidate.referencesSuppliedByUser[0].includes("[User Provided]"), true);
});

test("Sprint 4 Benchmark - 5. Thin input score cap works", () => {
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
    title: "Judul Jurnal",
    abstract: "Ini abstrak draf jurnal pengamatan vegetasi yang detail untuk pengujian.",
    keywords: ["Merapi"],
    introduction: "Pendahuluan detail...",
    literatureReview: "Tinjauan detail...",
    materialsAndMethods: "Metode detail...",
    results: "Hasil detail...",
    discussion: "Pembahasan detail...",
    conclusion: "Kesimpulan detail...",
    limitations: ["Batasan data"],
    futureResearch: ["Riset 1"],
    evidenceTable: []
  };

  const quality = evaluateJournalQuality(thinInput, candidate);
  assert.ok(quality.score <= 55);
  assert.equal(quality.level, "basic" || "weak");
});

test("Sprint 4 Benchmark - 6. No methods/protocol prevents strong level", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi",
    role: "pengguna",
    mainText: "Observasi detail dengan data lengkap.",
    topic: "Acacia",
    sourceUrls: ["https://example.com/source"],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  // Materials & Methods fails the replicability check
  const candidate = {
    title: "Judul Jurnal",
    abstract: "Ini abstrak draf jurnal pengamatan vegetasi Acacia decurrens yang detail.",
    keywords: ["Acacia", "Merapi"],
    introduction: "Pendahuluan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    literatureReview: "Tinjauan detail...",
    materialsAndMethods: "Tipis", // no protocol keyword, fails replicability check
    results: "Hasil detail minimal 50 karakter...",
    discussion: "Pembahasan detail minimal 50 karakter...",
    conclusion: "Kesimpulan detail minimal 50 karakter...",
    limitations: ["Batasan 1"],
    futureResearch: ["Riset 1"],
    hasConservationImplication: true,
    ethicsSafetyNotePresent: true,
    quantitativeEvidenceLevel: "basic_quantitative",
    evidenceTable: [
      { claim: "Klaim 1", evidenceType: "Foto", source: "user_supplied", confidence: "high", limitation: "" },
      { claim: "Klaim 2", evidenceType: "Foto", source: "user_supplied", confidence: "high", limitation: "" },
      { claim: "Klaim 3", evidenceType: "Foto", source: "user_supplied", confidence: "high", limitation: "" }
    ],
    referencesSuppliedByUser: ["https://example.com/source"],
  };

  const quality = evaluateJournalQuality(requestInput, candidate);
  assert.notEqual(quality.level, "strong");
});

test("Sprint 4 Benchmark - 7. No evidence table prevents strong level", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan",
    title: "Observasi",
    role: "pengguna",
    mainText: "Observasi detail...",
    topic: "Acacia",
    sourceUrls: ["https://example.com/source"],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const candidate = {
    title: "Judul Jurnal",
    abstract: "Ini abstrak draf jurnal pengamatan vegetasi Acacia decurrens yang detail.",
    keywords: ["Acacia", "Merapi"],
    introduction: "Pendahuluan detail minimal 50 karakter untuk memenuhi standar kelayakan draf jurnal.",
    literatureReview: "Tinjauan detail...",
    materialsAndMethods: "Metode detail dengan protocol lengkap...",
    results: "Hasil detail minimal 50 karakter...",
    discussion: "Pembahasan detail minimal 50 karakter...",
    conclusion: "Kesimpulan detail minimal 50 karakter...",
    limitations: ["Batasan 1"],
    futureResearch: ["Riset 1"],
    hasConservationImplication: true,
    ethicsSafetyNotePresent: true,
    quantitativeEvidenceLevel: "basic_quantitative",
    evidenceTable: [], // empty table
    referencesSuppliedByUser: ["https://example.com/source"],
  };

  const quality = evaluateJournalQuality(requestInput, candidate);
  assert.notEqual(quality.level, "strong");
});

test("Sprint 4 Benchmark - 8. PDF status remains locked", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi Hutan",
    role: "pengguna",
    mainText: "Observasi vegetasi.",
    topic: "Acacia",
    sourceUrls: [],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const mockReport = buildMockResult(requestInput, "Model Label");
  const readiness = evaluateJournalReadiness(requestInput, mockReport);
  assert.equal(readiness.canGenerateJournalPdfNow, false);
});

test("Sprint 4 Benchmark - 9. publicationClaimAllowed remains false", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan",
    title: "Observasi",
    role: "pengguna",
    mainText: "Observasi...",
    topic: "Acacia",
    sourceUrls: [],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const candidate = {
    title: "Judul Jurnal",
    abstract: "Abstrak...",
    keywords: ["Acacia"],
    introduction: "Pendahuluan...",
    materialsAndMethods: "Metode...",
    results: "Hasil...",
    discussion: "Pembahasan...",
    conclusion: "Kesimpulan...",
    limitations: [],
    referencesSuppliedByUser: []
  };

  const quality = evaluateJournalQuality(requestInput, candidate);
  assert.equal(quality.publicationClaimAllowed, false);
});

test("Sprint 4 Benchmark - 10. publicationStatus flags remain false", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Jurnal",
    title: "Observasi",
    role: "pengguna",
    mainText: "Observasi...",
    topic: "Acacia",
    sourceUrls: [],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  const rawResult = {
    title: "Draf",
    journal_candidate: {
      title: "Judul",
      abstract: "Abstrak",
      keywords: ["Acacia"],
      introduction: "Pendahuluan",
      literatureReview: "Tinjauan",
      materialsAndMethods: "Metode",
      results: "Hasil",
      discussion: "Pembahasan",
      conclusion: "Kesimpulan",
      limitations: [],
      futureResearch: [],
      annexure: [],
      evidenceTable: [],
      missingEvidence: [],
      referencesSuppliedByUser: []
    }
  };

  const normalized = normalizeProviderResult(rawResult, requestInput, "Test Model");
  const ps = normalized.journal_candidate.publicationStatus;
  assert.equal(ps.isPublished, false);
  assert.equal(ps.isPeerReviewed, false);
  assert.equal(ps.doiGenerated, false);
  assert.equal(ps.pdfPublicExportActive, false);
});

test("Sprint 4 Benchmark - 11. Smoke journal assertions fail on fake DOI/published/peer-reviewed claim", () => {
  const requestInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan",
    title: "Observasi",
    role: "pengguna",
    mainText: "Observasi...",
    topic: "Acacia",
    sourceUrls: [],
    location: "Merapi",
    fileDescription: "",
    integrityConsent: true,
  };

  // candidate containing fake DOI claim
  const candidate = {
    title: "Judul Jurnal",
    abstract: "Abstrak...",
    keywords: ["Acacia"],
    introduction: "Pendahuluan...",
    literatureReview: "Tinjauan...",
    materialsAndMethods: "Metode...",
    results: "Hasil...",
    discussion: "Pembahasan...",
    conclusion: "Kesimpulan...",
    limitations: [],
    referencesSuppliedByUser: ["doi.org/10.1111/acv.70066"], // fake doi trigger
  };

  const quality = evaluateJournalQuality(requestInput, candidate);
  assert.equal(quality.score, 0);
  assert.equal(quality.level, "weak");
  assert.equal(quality.referenceConsistencyStatus, "blocked");
});

test("Sprint 4 Benchmark - 12. Export Gate status remains locked", async () => {
  const eligibility = await getReportExportEligibility("some-report-id");
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.state, "export_locked");
});
