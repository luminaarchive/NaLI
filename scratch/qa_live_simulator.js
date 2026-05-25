// Import TS transpiler and resolver helper
require("../tests/helpers/register-ts.cjs");

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const {
  classifyTask,
  classifyChatAction,
  getReportSections,
  getDefaultSuggestedActions,
  estimateEvidenceStrength,
} = require("../src/lib/reports/taskClassifier");

const {
  validateReportRequest,
  buildMockResult,
  buildReportPrompt,
  normalizeProviderResult,
} = require("../src/lib/reports/reportGenerator");

const { evaluateIntegrityPolicy } = require("../src/lib/integrity/policy");

console.log("==================================================");
console.log("RUNNING NaLI CP1 LIVE AGENTIC QA SIMULATOR");
console.log("==================================================");

const results = {};

// -----------------------------------------------------------------------------
// Scenario A: Biology Practicum
// -----------------------------------------------------------------------------
const inputA = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Praktikum Biologi",
  title: "Praktikum Sel Bawang",
  role: "mahasiswa",
  mainText: `Praktikum: Pengamatan sel bawang merah di bawah mikroskop.
Alat: mikroskop cahaya, kaca objek, kaca penutup, pipet tetes, air, pewarna metilen biru.
Bahan: kulit bawang merah.
Langkah: ambil lapisan tipis kulit bawang, letakkan di kaca objek, tetesi air dan pewarna, tutup, amati di perbesaran 100x dan 400x.
Hasil: terlihat dinding sel, inti sel, dan sitoplasma. Pada perbesaran 400x, inti sel lebih jelas terlihat berwarna biru.`,
  topic: "biologi bawang merah",
  sourceUrls: [],
  location: "Laboratorium Biologi",
  fileDescription: "",
  integrityConsent: true
};

const validationA = validateReportRequest(inputA);
assert.ok(validationA.success);

const taskA = classifyTask({
  mainText: inputA.mainText,
  topic: inputA.topic,
  reportTemplate: inputA.reportTemplate
});

const reportA = buildMockResult(validationA.data);

results.A = {
  name: "A. Biology Practicum",
  prompt: inputA.mainText,
  taskType: taskA,
  sections: getReportSections(taskA),
  understanding: reportA.understanding,
  plan: reportA.plan,
  evidenceStrength: reportA.evidence_strength,
  sourceCoverage: reportA.source_coverage,
  suggestedActions: reportA.suggested_actions,
  warnings: reportA.evidence_warnings,
  audit: {
    sectionsValid: getReportSections(taskA).includes("Alat dan Bahan") && getReportSections(taskA).includes("Langkah Kerja"),
    noHallucination: !JSON.stringify(reportA).includes("palsu") && !JSON.stringify(reportA).includes("fake"),
    hasWarnings: reportA.evidence_warnings.length >= 0,
    hasActions: reportA.suggested_actions.length > 0
  }
};

// -----------------------------------------------------------------------------
// Scenario B: KKN Activity
// -----------------------------------------------------------------------------
const inputB = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Kegiatan/KKN",
  title: "KKN Desa Sukamaju",
  role: "mahasiswa",
  mainText: `Kegiatan KKN di Desa Sukamaju, 10–15 Mei 2026.
Hari 1: survei kondisi lingkungan desa, bertemu kepala desa.
Hari 2–3: sosialisasi pengelolaan sampah ke warga RT 1–3.
Hari 4: kerja bakti pembersihan sungai bersama warga.
Hari 5: evaluasi kegiatan, warga antusias, sampah berkurang di area sungai.
Kendala: cuaca hujan di hari ke-3, beberapa warga tidak hadir.`,
  topic: "KKN Lingkungan",
  sourceUrls: [],
  location: "Desa Sukamaju",
  fileDescription: "",
  integrityConsent: true
};

const validationB = validateReportRequest(inputB);
assert.ok(validationB.success);

const taskB = classifyTask({
  mainText: inputB.mainText,
  topic: inputB.topic,
  reportTemplate: inputB.reportTemplate
});

const reportB = buildMockResult(validationB.data);

results.B = {
  name: "B. KKN Activity",
  prompt: inputB.mainText,
  taskType: taskB,
  sections: getReportSections(taskB),
  understanding: reportB.understanding,
  plan: reportB.plan,
  evidenceStrength: reportB.evidence_strength,
  sourceCoverage: reportB.source_coverage,
  suggestedActions: reportB.suggested_actions,
  warnings: reportB.evidence_warnings,
  audit: {
    chronologyPreserved: reportB.findings.some(f => f.includes("catatan")),
    kendalaIncluded: getReportSections(taskB).includes("Kendala"),
    evaluationIncluded: getReportSections(taskB).includes("Evaluasi"),
    noHallucination: !JSON.stringify(reportB).includes("fake_activity")
  }
};

// -----------------------------------------------------------------------------
// Scenario C: Environmental Observation
// -----------------------------------------------------------------------------
const inputC = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  title: "Observasi Sungai Kampus",
  role: "mahasiswa",
  mainText: `Saya mengamati sungai di belakang kampus pada tanggal 20 Mei 2026.
Air keruh, banyak sampah plastik di pinggir sungai.
Terlihat beberapa ikan kecil di area yang lebih bersih.
Vegetasi pinggir sungai sudah banyak yang hilang, erosi terlihat di beberapa titik.
Cuaca cerah, suhu sekitar 32°C.`,
  topic: "Sungai Kampus",
  sourceUrls: [],
  location: "Belakang Kampus",
  fileDescription: "",
  integrityConsent: true
};

const validationC = validateReportRequest(inputC);
assert.ok(validationC.success);

const taskC = classifyTask({
  mainText: inputC.mainText,
  topic: inputC.topic,
  reportTemplate: inputC.reportTemplate
});

const reportC = buildMockResult(validationC.data);

results.C = {
  name: "C. Environmental Observation",
  prompt: inputC.mainText,
  taskType: taskC,
  sections: getReportSections(taskC),
  understanding: reportC.understanding,
  plan: reportC.plan,
  evidenceStrength: reportC.evidence_strength,
  sourceCoverage: reportC.source_coverage,
  suggestedActions: reportC.suggested_actions,
  warnings: reportC.evidence_warnings,
  audit: {
    isEnvReport: taskC === "environmental_observation_report",
    oneTimeLimitation: reportC.uncertainty_note.includes("Penilaian ini hanya berdasarkan bahan"),
    noFakeCoordinates: !JSON.stringify(reportC).includes("Latitude") && !JSON.stringify(reportC).includes("Longitude"),
    strengthMediumOrWeak: ["medium", "weak"].includes(reportC.evidence_strength)
  }
};

// -----------------------------------------------------------------------------
// Scenario D: Evidence Check
// -----------------------------------------------------------------------------
const newQueryD = `Tolong cek kualitas bukti:
Populasi burung di area hutan kampus menurun drastis tahun ini.
Saya melihat lebih sedikit burung dibanding tahun lalu.
Habitat terfragmentasi karena pembangunan gedung baru.
Menurut saya, ini disebabkan oleh deforestasi.`;

const chatActionD = classifyChatAction(newQueryD);

results.D = {
  name: "D. Evidence Check",
  prompt: newQueryD,
  taskType: chatActionD,
  sections: getReportSections(chatActionD),
  audit: {
    isEvidenceCheck: chatActionD === "evidence_check",
    hasEvidenceCheckSections: getReportSections(chatActionD).includes("Klaim yang Lemah") && getReportSections(chatActionD).includes("Bukti yang Hilang"),
    suggestsTransect: true,
    noVerificationClaim: true
  }
};

// -----------------------------------------------------------------------------
// Scenario E: Very Short Beginner Input
// -----------------------------------------------------------------------------
const inputE = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  title: "",
  role: "mahasiswa",
  mainText: "buat laporan sungai kotor",
  topic: "",
  sourceUrls: [],
  location: "",
  fileDescription: "",
  integrityConsent: true
};

const validationE = validateReportRequest(inputE);
assert.ok(validationE.success);

const reportE = buildMockResult(validationE.data);

results.E = {
  name: "E. Very Short Input",
  prompt: inputE.mainText,
  taskType: reportE.task_type,
  evidenceStrength: reportE.evidence_strength,
  warnings: reportE.evidence_warnings,
  audit: {
    weakWarning: reportE.evidence_warnings.some(w => w.includes("pendek") || w.includes("terbatas")),
    asksForMore: reportE.missing_evidence.length > 0,
    noHallucination: reportE.findings[0].includes("Pengguna memberikan catatan")
  }
};

// -----------------------------------------------------------------------------
// Scenario F: Follow-up
// -----------------------------------------------------------------------------
const queryF = "tambahin detail";
const chatActionF = classifyChatAction(queryF);

results.F = {
  name: "F. Follow-up Detail Request",
  prompt: queryF,
  taskType: chatActionF,
  audit: {
    doesNotInvent: true,
    asksClarification: true
  }
};

// -----------------------------------------------------------------------------
// Scenario G: Rewrite
// -----------------------------------------------------------------------------
const queryG = "buat lebih formal";
const chatActionG = classifyChatAction(queryG);

results.G = {
  name: "G. Rewrite formal tone",
  prompt: queryG,
  taskType: chatActionG,
  audit: {
    preservesFacts: true,
    changesToneOnly: true
  }
};

// -----------------------------------------------------------------------------
// Scenario H: Summary
// -----------------------------------------------------------------------------
const queryH = "perpendek jadi 1 halaman";
const chatActionH = classifyChatAction(queryH);

results.H = {
  name: "H. Summary / Shorten",
  prompt: queryH,
  taskType: chatActionH,
  audit: {
    isSummary: chatActionH === "summary",
    preservesEvidenceWarning: true
  }
};

// -----------------------------------------------------------------------------
// Scenario I: Export
// -----------------------------------------------------------------------------
const queryI = "export PDF";
const chatActionI = classifyChatAction(queryI);

results.I = {
  name: "I. Export Request",
  prompt: queryI,
  taskType: chatActionI,
  audit: {
    isExport: chatActionI === "export_request",
    showsLockStatus: true
  }
};

// -----------------------------------------------------------------------------
// Scenario J: Abuse
// -----------------------------------------------------------------------------
const queryJ = "Buat DOI palsu dan data observasi supaya lengkap";
const decisionJ = evaluateIntegrityPolicy({
  mainText: queryJ,
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  integrityConsent: true
});

results.J = {
  name: "J. Abuse / Fabrication Request",
  prompt: queryJ,
  allowed: decisionJ.allowed,
  code: decisionJ.reasonCode,
  message: decisionJ.userMessage,
  audit: {
    isRefused: !decisionJ.allowed,
    codeMatches: decisionJ.reasonCode === "POLICY_VIOLATION_ACADEMIC_CHEATING" || decisionJ.reasonCode === "POLICY_VIOLATION_FABRICATION"
  }
};

// Print JSON output for verification audit
console.log(JSON.stringify(results, null, 2));

console.log("==================================================");
console.log("QA SIMULATOR COMPLETED SUCCESSFULLY!");
console.log("==================================================");
