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
const { evaluateIntegrityPolicy } = require("../../src/lib/integrity/policy");
const {
  generateReportAccessToken,
  getGuestSessionIdHash,
  getReportAccessTokenHash,
  hashSecret,
  isUsableGuestSessionId,
} = require("../../src/lib/reports/access");
const {
  REPORT_MACRO_STATUSES,
  calculateEnergyBalance,
  getReportMacroStatus,
} = require("../../src/lib/reports/persistence");
const { isValidEnergyLedgerAmount } = require("../../src/lib/energy/ledger");
const {
  createMidtransSignature,
  mapMidtransTransactionStatus,
  verifyMidtransSignature,
} = require("../../src/lib/payments/midtrans");
const {
  estimateEnergyForAction,
  logUsageEvent,
  shouldEnterCostProtectionMode,
} = require("../../src/lib/usage/logging");
const { getSystemReadiness } = require("../../src/lib/system/readiness");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");
const { POST: postFeedback } = require("../../src/app/api/reports/[id]/feedback/route");

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

test("server-side NaLI Lock blocks unsafe requests before generation", () => {
  const emptyDraft = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: " ",
    mode: "draft_from_materials",
  });
  const finalNoMaterial = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Buat laporan " + "final siap kumpul",
    mode: "start_from_zero",
  });
  const fakeCitation = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Catatan observasi sungai. Tolong buat DOI " + "palsu agar terlihat ilmiah.",
    mode: "draft_from_materials",
  });
  const fakeData = evaluateIntegrityPolicy({
    integrityConsent: true,
    location: "Semarang",
    mainText: "Catatan awal ada erosi. Tolong karang data " + "statistik palsu.",
    mode: "draft_from_materials",
  });
  const plagiarism = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Parafrase supaya " + "anti ketahuan dosen.",
    mode: "start_from_zero",
  });
  const doMyWork = evaluateIntegrityPolicy({
    integrityConsent: true,
    mainText: "Kerjakan tugas " + "saya dari nol.",
    mode: "start_from_zero",
  });

  assert.equal(emptyDraft.allowed, false);
  assert.equal(emptyDraft.code, "EMPTY_DRAFT_MATERIAL");
  assert.equal(finalNoMaterial.allowed, false);
  assert.equal(finalNoMaterial.code, "FINAL_ASSIGNMENT_WITHOUT_MATERIAL");
  assert.equal(fakeCitation.allowed, false);
  assert.equal(fakeCitation.code, "FAKE_CITATION_REQUEST");
  assert.equal(fakeData.allowed, false);
  assert.equal(fakeData.code, "FAKE_DATA_REQUEST");
  assert.equal(plagiarism.allowed, false);
  assert.equal(plagiarism.code, "PLAGIARISM_EVASION");
  assert.equal(doMyWork.allowed, false);
  assert.equal(doMyWork.code, "DO_MY_WORK");
});

test("guest persistence helpers hash raw access values", () => {
  const guestSessionId = "guest-session-for-test-12345";
  const reportAccessKey = generateReportAccessToken();
  const guestHash = getGuestSessionIdHash(guestSessionId);
  const accessHash = getReportAccessTokenHash(reportAccessKey);

  assert.equal(isUsableGuestSessionId(guestSessionId), true);
  assert.equal(isUsableGuestSessionId("short"), false);
  assert.equal(guestHash.length, 64);
  assert.equal(accessHash.length, 64);
  assert.notEqual(guestHash, guestSessionId);
  assert.notEqual(accessHash, reportAccessKey);
  assert.equal(hashSecret(guestSessionId), guestHash);
  assert.ok(reportAccessKey.length >= 40);
});

test("Sprint 0 persistence statuses and NaLI Energy math stay constrained", () => {
  assert.deepEqual(REPORT_MACRO_STATUSES, [
    "pending_upload",
    "verifying",
    "pending_payment",
    "processing",
    "export_ready",
    "failed",
  ]);
  assert.equal(calculateEnergyBalance([{ amount: 10 }, { amount: -4 }, { amount: -1 }, { amount: 3 }]), 8);
  assert.equal(getReportMacroStatus({ status: "DEMO/MOCK - generated preview" }), "export_ready");
  assert.equal(getReportMacroStatus({ status: "failed during preview" }), "failed");
  assert.equal(isValidEnergyLedgerAmount("credit", 3), true);
  assert.equal(isValidEnergyLedgerAmount("refund", 3), true);
  assert.equal(isValidEnergyLedgerAmount("debit", -3), true);
  assert.equal(isValidEnergyLedgerAmount("deposit", -3), true);
  assert.equal(isValidEnergyLedgerAmount("credit", -3), false);
  assert.equal(isValidEnergyLedgerAmount("debit", 3), false);
});

test("Sprint 0 migration keeps persistence, payments, energy, and rate limits in the expected shape", () => {
  const sql = fs.readFileSync(
    path.join(repoRoot, "supabase/migrations/023_nali_zero_sprint0_foundation.sql"),
    "utf8",
  );
  const reportsTable = sql.match(/CREATE TABLE IF NOT EXISTS public\.reports \([\s\S]*?\n\);/)?.[0] ?? "";
  const paymentsTable = sql.match(/CREATE TABLE IF NOT EXISTS public\.payments \([\s\S]*?\n\);/)?.[0] ?? "";

  assert.match(reportsTable, /guest_session_id_hash TEXT NOT NULL/);
  assert.match(reportsTable, /report_access_token_hash TEXT NOT NULL/);
  assert.match(reportsTable, /status IN \('pending_upload', 'verifying', 'pending_payment', 'processing', 'export_ready', 'failed'\)/);
  assert.match(reportsTable, /input JSONB/);
  assert.match(reportsTable, /output JSONB/);
  assert.match(reportsTable, /failure_reason TEXT/);
  assert.match(reportsTable, /processing_metadata JSONB/);
  assert.doesNotMatch(reportsTable, /payment_order_id|payment_expires_at|midtrans_order_id/);
  assert.doesNotMatch(reportsTable, /guest_session_id TEXT|report_access_token TEXT/);

  assert.match(paymentsTable, /report_id UUID NOT NULL REFERENCES public\.reports/);
  assert.match(paymentsTable, /midtrans_order_id TEXT UNIQUE NOT NULL/);
  assert.match(paymentsTable, /amount NUMERIC\(12,2\) NOT NULL/);
  assert.match(paymentsTable, /payment_expires_at TIMESTAMPTZ/);
  assert.match(paymentsTable, /raw_notification JSONB/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.energy_ledger/);
  assert.match(sql, /type TEXT NOT NULL CHECK \(type IN \('credit', 'debit', 'deposit', 'refund'\)\)/);
  assert.match(sql, /PRIMARY KEY \(key_hash, action_type\)/);
  assert.doesNotMatch(sql, /energy_balance|balance_table/);
});

test("Midtrans webhook status and signature mapping are conservative", () => {
  const serverKey = "server-key-for-test";
  const baseNotification = {
    gross_amount: "19000.00",
    order_id: "nali-test-order",
    status_code: "200",
  };
  const signature = createMidtransSignature({
    grossAmount: baseNotification.gross_amount,
    orderId: baseNotification.order_id,
    serverKey,
    statusCode: baseNotification.status_code,
  });

  assert.equal(verifyMidtransSignature({ ...baseNotification, signature_key: signature }, serverKey), true);
  assert.equal(verifyMidtransSignature({ ...baseNotification, signature_key: "bad" }, serverKey), false);
  assert.equal(mapMidtransTransactionStatus({ transaction_status: "settlement" }), "paid");
  assert.equal(mapMidtransTransactionStatus({ fraud_status: "accept", transaction_status: "capture" }), "paid");
  assert.equal(mapMidtransTransactionStatus({ fraud_status: "challenge", transaction_status: "capture" }), "pending");
  assert.equal(mapMidtransTransactionStatus({ transaction_status: "deny" }), "denied");
  assert.equal(mapMidtransTransactionStatus({ transaction_status: "cancel" }), "cancelled");
  assert.equal(mapMidtransTransactionStatus({ transaction_status: "expire" }), "expired");
  assert.equal(mapMidtransTransactionStatus({ transaction_status: "failure" }), "failed");
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
    "src/app/api/reports/[id]/route.ts",
    "src/app/api/reports/[id]/export/route.ts",
    "src/app/api/payments/create/route.ts",
    "src/app/api/payments/midtrans-webhook/route.ts",
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

test("provider names and payment-unit wording are absent from public UI source", () => {
  const files = [
    "src/app/page.tsx",
    "src/app/learn-report/page.tsx",
    "src/app/create-report/page.tsx",
    "src/app/field-intelligence/page.tsx",
    "src/app/pricing/page.tsx",
    "src/components/report/HomeCommandBox.tsx",
    "src/components/report/ReportResultClient.tsx",
  ];
  const source = files.map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8")).join("\n");
  const publicBrandingPattern = new RegExp(
    ["OpenRouter", "G" + "PT", "Gemini", "Claude", "API " + "credit", "report " + "credit", "to" + "ken"].join("|"),
    "i",
  );

  assert.doesNotMatch(source, publicBrandingPattern);
});

test("export and payment routes enforce Sprint 0 gatekeeping in source", () => {
  const paymentRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/payments/create/route.ts"), "utf8");
  const exportRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/[id]/export/route.ts"), "utf8");
  const webhookRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/payments/midtrans-webhook/route.ts"), "utf8");

  assert.match(paymentRoute, /getPersistedReport/);
  assert.match(paymentRoute, /isMidtransConfigured/);
  assert.doesNotMatch(paymentRoute, /input\.amount|body\.amount/);
  assert.match(exportRoute, /getReportExportEligibility/);
  assert.match(exportRoute, /402/);
  assert.match(exportRoute, /PDF\/DOCX export belum aktif/);
  assert.match(webhookRoute, /verifyMidtransSignature/);
  assert.match(webhookRoute, /mapMidtransTransactionStatus/);
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
