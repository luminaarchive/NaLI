const assert = require("node:assert/strict");
const test = require("node:test");

require("../helpers/register-ts.cjs");

const { verifyAnswer } = require("../../src/lib/reports/answerVerification");
const { evaluateJournalReadiness } = require("../../src/lib/reports/journalReadiness");
const { getOpenRouterModels } = require("../../src/lib/ai/openrouter");
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");
const openrouterModule = require("../../src/lib/ai/openrouter");

test("1. verifyAnswer helper handles different modes and inputs accurately", () => {
  // Test start_from_zero with sufficient inputs
  const inputZero = {
    mode: "start_from_zero",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Panduan Observasi Sungai",
    role: "pengguna",
    mainText: "Observasi keanekaragaman hayati dan sampah plastik di Sungai Ciliwung.",
    topic: "Sungai Ciliwung",
    sourceUrls: [],
    location: "",
    fileDescription: "",
    integrityConsent: true
  };
  const reportZero = {
    mode: "start_from_zero",
    title: "Panduan Observasi Sungai",
    suggested_outline: ["Pendahuluan", "Hasil"],
    observation_questions: ["Berapa jumlah sampah?"],
    evidence_checklist: ["Foto Sungai"],
    disclaimer: "Panduan ini belum menjadi draft laporan berbasis bukti...",
    integrity_note: "Awal pengamatan...",
    is_mock: true,
    status: "AI_GENERATED_NALI"
  };

  const resZero = verifyAnswer(inputZero, reportZero);
  assert.equal(resZero.detectedOutputType, "guidance");
  assert.equal(resZero.answered, true);
  assert.equal(resZero.answerConfidence, "high");

  // Test start_from_zero with extremely thin input
  const inputZeroThin = { ...inputZero, mainText: "Sungai" };
  const resZeroThin = verifyAnswer(inputZeroThin, reportZero);
  assert.equal(resZeroThin.detectedOutputType, "insufficient_input");

  // Test draft_from_materials with good inputs
  const inputDraft = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Laporan Sungai",
    role: "pengguna",
    mainText: "Mengamati kondisi air sungai Ciliwung yang keruh dan banyak sampah plastik di bantaran.",
    topic: "Sungai Ciliwung",
    sourceUrls: [],
    location: "Jakarta",
    fileDescription: "Foto sampah",
    integrityConsent: true
  };
  const reportDraft = {
    mode: "draft_from_materials",
    title: "Laporan Sungai",
    findings: ["Air sungai keruh", "Sampah plastik menumpuk"],
    evidence_table: [{ id: "EV-01", material_type: "catatan", summary: "Air keruh", user_provided: true, verification_status: "belum" }],
    executive_summary: "Ringkasan draf laporan Ciliwung.",
    is_mock: false,
    status: "AI_GENERATED_NALI"
  };

  const resDraft = verifyAnswer(inputDraft, reportDraft);
  assert.equal(resDraft.detectedOutputType, "report_draft");
  assert.equal(resDraft.answered, true);
  assert.equal(resDraft.answerConfidence, "medium"); // input length is < 100 characters

  // Test draft_from_materials with low confidence mismatch (e.g. topic sungai but no river words in report)
  const reportDraftMismatch = {
    ...reportDraft,
    findings: ["Tanaman tumbuh subur"], // no river words
    evidence_table: []
  };
  const resMismatch = verifyAnswer(inputDraft, reportDraftMismatch);
  assert.equal(resMismatch.answerConfidence, "low");
});

test("2. evaluateJournalReadiness evaluates document engineering readiness checklist accurately", () => {
  const input = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi Vegetasi",
    role: "pengguna",
    mainText: "Meneliti populasi tumbuhan Acacia di lereng Gunung Merapi pasca erupsi abu tipis.",
    topic: "Vegetasi Merapi",
    sourceUrls: [],
    location: "Sleman",
    fileDescription: "Foto vegetasi",
    integrityConsent: true
  };

  // 2a. Weak draft: fails because context/methods are too short
  const weakReport = {
    mode: "draft_from_materials",
    title: "Observasi Vegetasi",
    background: "Pendahuluan singkat.", // too short (< 100)
    method_or_materials: "Metode singkat.", // too short (< 100)
    evidence_table: [],
    uncertainty_note: "Ragu.",
    additional_evidence_needed: ["Foto"],
    is_mock: true
  };

  const resWeak = evaluateJournalReadiness(input, weakReport);
  assert.equal(resWeak.journalReady, false);
  assert.equal(resWeak.readinessLevel, "not_ready");
  assert.equal(resWeak.canGenerateJournalPdfNow, false);

  // 2b. Strong draft: has all sections populated adequately
  const strongReport = {
    mode: "draft_from_materials",
    title: "Observasi Vegetasi Gunung Merapi",
    background: "Latar belakang pengamatan vegetasi tanaman Acacia decurrens di lereng selatan Gunung Merapi, Sleman, Yogyakarta pasca erupsi abu vulkanik tipis beberapa waktu lalu.", // > 100 chars
    method_or_materials: "Metode pengamatan langsung di lapangan menggunakan kuadrat sampling plot 10x10 meter di ketinggian 1200 mdpl dengan mencatat jumlah pohon Acacia decurrens.", // > 100 chars
    evidence_table: [{ id: "EV-01", material_type: "lokasi", summary: "Sleman", user_provided: true, verification_status: "Ok" }],
    uncertainty_note: "Tingkat ketidakpastian sedang akibat keterbatasan pengamatan satelit.", // > 30 chars
    additional_evidence_needed: ["Foto berskala", "Data cuaca harian"],
    is_mock: false
  };

  const resStrong = evaluateJournalReadiness(input, strongReport);
  assert.equal(resStrong.journalReady, true);
  assert.equal(resStrong.readinessLevel, "draft_ready");
  assert.equal(resStrong.canGenerateJournalDraft, true);
  assert.equal(resStrong.canGenerateJournalPdfNow, false); // PDF export must remain locked
});

test("3. OpenRouter configuration returns primary and fallback models correctly", () => {
  const models = getOpenRouterModels();
  assert.ok(models.length > 0);
  // Ensure the primary model is at index 0
  const primary = process.env.OPENROUTER_MODEL?.trim() || process.env.NALI_OPENROUTER_MODEL?.trim() || "meta-llama/llama-3.3-70b-instruct:free";
  assert.equal(models[0], primary);
});

test("4. API report generation response contains diagnostics and verification metadata", async () => {
  const origRequestOpenRouterJson = openrouterModule.requestOpenRouterJson;
  
  // Mock OpenRouter success with fallback
  openrouterModule.requestOpenRouterJson = async () => {
    return {
      json: {
        mode: "draft_from_materials",
        title: "Draf Jurnal Daun",
        executive_summary: "Draf Jurnal Daun Bawang",
        background: "Penelitian mendalam tentang struktur sel epidermis daun bawang menggunakan mikroskop cahaya perbesaran 400x.",
        method_or_materials: "Metode preparat basah menyayat tipis lapisan epidermis dalam daun bawang merah (Allium cepa) lalu meneteskan air suling.",
        findings: ["Ditemukan dinding sel, sitoplasma, dan inti sel yang berwarna transparan."],
        evidence_table: [{ id: "EV-01", material_type: "catatan", summary: "Mikroskop 400x", user_provided: true, verification_status: "belum" }],
        uncertainty_note: "Keterbatasan lensa objektif yang belum dikalibrasi standar laboratorium nasional.",
        additional_evidence_needed: ["Dokumentasi foto kamera digital"],
        user_review_checklist: ["Verifikasi perbesaran lensa"],
        disclaimer: "Draft belajar...",
        next_user_steps: ["Foto kembali"]
      },
      model: "meta-llama/llama-3.2-3b-instruct:free" // fallback model (different from primary gemini)
    };
  };

  try {
    const response = await postGenerate(
      new Request("http://localhost/api/reports/generate", {
        body: JSON.stringify({
          guestSessionId: "sprint2-test-session",
          integrityConsent: true,
          mainText: "Praktikum sel daun bawang menggunakan mikroskop.",
          mode: "draft_from_materials",
          reportTemplate: "Laporan Praktikum Biologi",
        }),
        method: "POST",
      })
    );

    assert.equal(response.status, 200);

    const data = await response.json();
    assert.equal(data.mode, "ai");
    assert.ok(data.provider_metadata !== undefined);
    assert.ok(data.answer_verification !== undefined);
    assert.ok(data.journal_readiness !== undefined);

    // Assert fallback details
    assert.equal(data.provider_metadata.fallback_used, true);
    assert.equal(data.provider_metadata.provider_status, "fallback_success");
    assert.equal(data.provider_metadata.model_used, "meta-llama/llama-3.2-3b-instruct:free");

    // Assert answer verification
    assert.equal(data.answer_verification.answered, true);
    assert.equal(data.answer_verification.detectedOutputType, "report_draft"); // onion cell is not leaf morph query, so report_draft

    // Assert journal readiness
    assert.equal(data.journal_readiness.canGenerateJournalPdfNow, false);
  } finally {
    openrouterModule.requestOpenRouterJson = origRequestOpenRouterJson;
  }
});
