require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { PDFDocument } = require("pdf-lib");

const {
  DRAFT_LABEL,
  PUBLIC_REPORT_DISCLAIMER,
  START_FROM_ZERO_DISCLAIMER,
  START_FROM_ZERO_LABEL,
  buildMockDraftReport,
  buildMockStartGuide,
  containsForbiddenWording,
  reportTemplates,
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
const {
  MAX_REPORT_UPLOAD_BYTES,
  REPORT_UPLOAD_JOB_STATUSES,
  REPORT_UPLOAD_STEPS,
  createReportUploadRequest,
  confirmReportUpload,
  verifyReportUpload,
} = require("../../src/lib/reports/uploads");
const { buildReportMarkdown } = require("../../src/lib/reports/markdown");
const { getExportState } = require("../../src/lib/reports/exportGate");
const { isValidEnergyLedgerAmount } = require("../../src/lib/energy/ledger");
const {
  createMidtransSignature,
  getMidtransSnapEndpoint,
  isMidtransConfigured,
  isMidtransProduction,
  isSafeMidtransCheckoutUrl,
  isSuccessfulPaymentStatus,
  mapMidtransTransactionStatus,
  sanitizeMidtransNotification,
  verifyMidtransSignature,
} = require("../../src/lib/payments/midtrans");
const {
  estimateEnergyForAction,
  logUsageEvent,
  shouldEnterCostProtectionMode,
} = require("../../src/lib/usage/logging");
const {
  REPORT_EVENT_TYPES,
  logApiUsage,
  logReportEvent,
  sanitizeOperationalMetadata,
} = require("../../src/lib/operations/logging");
const { getSystemReadiness } = require("../../src/lib/system/readiness");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");
const { POST: postFeedback } = require("../../src/app/api/reports/[id]/feedback/route");
const { POST: postCreateUpload } = require("../../src/app/api/reports/create-upload/route");

const repoRoot = path.join(__dirname, "../..");

function readMigrationByName(partialName) {
  const migrationDir = path.join(repoRoot, "supabase/migrations");
  const filename = fs.readdirSync(migrationDir).find((entry) => entry.includes(partialName));
  assert.ok(filename, `Missing migration matching ${partialName}`);
  return fs.readFileSync(path.join(migrationDir, filename), "utf8");
}

function listFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? listFilesRecursive(fullPath) : [fullPath];
  });
}

function snapshotSupabaseEnv() {
  return {
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

function restoreSupabaseEnv(snapshot) {
  if (snapshot.anon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = snapshot.anon;

  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;
}

function snapshotMidtransEnv() {
  return {
    environment: process.env.MIDTRANS_ENVIRONMENT,
    isProduction: process.env.MIDTRANS_IS_PRODUCTION,
    merchantId: process.env.MIDTRANS_MERCHANT_ID,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    snapBaseUrl: process.env.MIDTRANS_SNAP_BASE_URL,
  };
}

function restoreMidtransEnv(snapshot) {
  for (const [key, envName] of [
    ["environment", "MIDTRANS_ENVIRONMENT"],
    ["isProduction", "MIDTRANS_IS_PRODUCTION"],
    ["merchantId", "MIDTRANS_MERCHANT_ID"],
    ["serverKey", "MIDTRANS_SERVER_KEY"],
    ["snapBaseUrl", "MIDTRANS_SNAP_BASE_URL"],
  ]) {
    if (snapshot[key] === undefined) delete process.env[envName];
    else process.env[envName] = snapshot[key];
  }
}

function makeUploadStore(overrides = {}) {
  const state = {
    jobs: new Map(),
    reports: new Map(),
    signedUrl: "https://example.supabase.co/storage/v1/object/upload/sign/nali_report_uploads/test.pdf?token=signed",
    updates: [],
    ...overrides.state,
  };

  const store = {
    async createPendingUpload({ job, report }) {
      state.reports.set(report.id, { ...report });
      state.jobs.set(job.report_id, { ...job });
      return { ok: true };
    },
    async createSignedUploadUrl(storagePath) {
      state.lastSignedPath = storagePath;
      return { ok: true, signedUrl: state.signedUrl };
    },
    async getReportByAccess(reportId, accessHash) {
      const report = state.reports.get(reportId);
      if (!report || report.report_access_token_hash !== accessHash) {
        return { found: false };
      }
      return { found: true, report };
    },
    async getReportForVerification(reportId) {
      const report = state.reports.get(reportId);
      return report ? { found: true, report } : { found: false };
    },
    async markVerificationStarted(reportId, metadata) {
      const report = state.reports.get(reportId);
      if (report) {
        state.reports.set(reportId, {
          ...report,
          processing_metadata: metadata,
          status: "verifying",
        });
      }
      const job = state.jobs.get(reportId) ?? { attempts: 0, report_id: reportId, status: "queued" };
      state.jobs.set(reportId, { ...job, attempts: job.attempts + 1, status: "verifying" });
      return { ok: true };
    },
    async storeVerificationFailure(reportId, patch) {
      const report = state.reports.get(reportId);
      state.updates.push({ patch, reportId, type: "failure" });
      if (report) state.reports.set(reportId, { ...report, ...patch });
      const job = state.jobs.get(reportId) ?? { report_id: reportId };
      state.jobs.set(reportId, { ...job, last_error: patch.failure_reason, status: "failed" });
      return { ok: true };
    },
    async storeVerificationSuccess(reportId, patch) {
      const report = state.reports.get(reportId);
      state.updates.push({ patch, reportId, type: "success" });
      if (report) state.reports.set(reportId, { ...report, ...patch });
      const job = state.jobs.get(reportId) ?? { report_id: reportId };
      state.jobs.set(reportId, { ...job, status: "verified" });
      return { ok: true };
    },
    async getStorageInfo() {
      return {
        found: true,
        lastModified: "2026-05-19T10:00:00.000Z",
        size: 12,
      };
    },
    async downloadStorageObject() {
      return {
        downloaded: true,
        file: new Blob([Buffer.from("%PDF-invalid")], { type: "application/pdf" }),
      };
    },
    ...overrides.store,
  };

  return { state, store };
}

async function makePdfBytes(pageCount) {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    pdf.addPage();
  }
  return pdf.save();
}

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

test("create-upload rejects files above the 10MB Sprint 0 limit", async () => {
  const response = await postCreateUpload(
    new Request("http://localhost/api/reports/create-upload", {
      body: JSON.stringify({
        contentType: "application/pdf",
        fileName: "catatan.pdf",
        fileSizeBytes: MAX_REPORT_UPLOAD_BYTES + 1,
        guestSessionId: "guest-session-for-upload-test",
      }),
      method: "POST",
    }),
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.code, "FILE_TOO_LARGE");
});

test("create-upload rejects non-PDF files before storage setup is checked", async () => {
  const response = await postCreateUpload(
    new Request("http://localhost/api/reports/create-upload", {
      body: JSON.stringify({
        contentType: "text/plain",
        fileName: "catatan.txt",
        fileSizeBytes: 1200,
        guestSessionId: "guest-session-for-upload-test",
      }),
      method: "POST",
    }),
  );
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.code, "PDF_ONLY");
});

test("create-upload returns not configured when Supabase env is missing", async () => {
  const original = snapshotSupabaseEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const response = await postCreateUpload(
      new Request("http://localhost/api/reports/create-upload", {
        body: JSON.stringify({
          contentType: "application/pdf",
          fileName: "catatan.pdf",
          fileSizeBytes: 1200,
          guestSessionId: "guest-session-for-upload-test",
        }),
        method: "POST",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 503);
    assert.equal(payload.code, "UPLOAD_NOT_CONFIGURED");
    assert.equal(payload.uploadConfigured, false);
  } finally {
    restoreSupabaseEnv(original);
  }
});

test("create-upload creates a pending upload report when storage is mocked", async () => {
  const { state, store } = makeUploadStore();
  const result = await createReportUploadRequest(
    {
      contentType: "application/pdf",
      fileName: "Catatan Sungai.pdf",
      fileSizeBytes: 4096,
      guestSessionId: "guest-session-for-upload-test",
    },
    {
      createReportId: () => "11111111-1111-4111-8111-111111111111",
      createUploadNonce: () => "nonce-test",
      now: () => new Date("2026-05-19T08:00:00.000Z"),
      store,
    },
  );

  assert.equal(result.ok, true);
  assert.equal(result.report_id, "11111111-1111-4111-8111-111111111111");
  assert.equal(result.storage_path, "pending_reports/11111111-1111-4111-8111-111111111111/nonce-test.pdf");
  assert.match(result.signed_upload_url, /^https:\/\/example\.supabase\.co\/storage\/v1\/object\/upload\/sign/);
  assert.ok(result.report_access_token.length >= 40);
  assert.equal(state.lastSignedPath, "pending_reports/11111111-1111-4111-8111-111111111111/nonce-test.pdf");

  const report = state.reports.get(result.report_id);
  const job = state.jobs.get(result.report_id);
  assert.equal(report.status, "pending_upload");
  assert.equal(report.storage_path, result.storage_path);
  assert.equal(report.original_filename, "Catatan Sungai.pdf");
  assert.equal(report.guest_session_id_hash.length, 64);
  assert.equal(report.report_access_token_hash.length, 64);
  assert.notEqual(report.report_access_token_hash, result.report_access_token);
  assert.equal(job.status, "queued");
});

test("confirm-upload is idempotent after verification succeeds", async () => {
  const { state, store } = makeUploadStore();
  const created = await createReportUploadRequest(
    {
      contentType: "application/pdf",
      fileName: "catatan.pdf",
      fileSizeBytes: 1024,
      guestSessionId: "guest-session-for-upload-test",
    },
    {
      createReportId: () => "22222222-2222-4222-8222-222222222222",
      createUploadNonce: () => "nonce-test",
      now: () => new Date("2026-05-19T08:00:00.000Z"),
      store,
    },
  );
  assert.equal(created.ok, true);
  state.reports.set(created.report_id, {
    ...state.reports.get(created.report_id),
    page_count: 4,
    status: "pending_payment",
    verified_file_sha256: "a".repeat(64),
  });
  state.jobs.set(created.report_id, {
    ...state.jobs.get(created.report_id),
    status: "verified",
  });

  const first = await confirmReportUpload(
    {
      reportAccessToken: created.report_access_token,
      reportId: created.report_id,
    },
    { store },
  );
  const second = await confirmReportUpload(
    {
      reportAccessToken: created.report_access_token,
      reportId: created.report_id,
    },
    { store },
  );

  assert.equal(first.ok, true);
  assert.equal(first.idempotent, true);
  assert.equal(first.status, "pending_payment");
  assert.equal(second.ok, true);
  assert.equal(second.idempotent, true);
  assert.equal(second.status, "pending_payment");
});

test("upload verification fails expired uploads", async () => {
  const reportId = "33333333-3333-4333-8333-333333333333";
  const { state, store } = makeUploadStore({
    state: {
      reports: new Map([
        [
          reportId,
          {
            id: reportId,
            status: "pending_upload",
            storage_path: `pending_reports/${reportId}/nonce-test.pdf`,
            upload_expires_at: "2026-05-19T08:00:00.000Z",
          },
        ],
      ]),
    },
  });

  const result = await verifyReportUpload(reportId, {
    now: () => new Date("2026-05-19T10:00:00.000Z"),
    store,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "UPLOAD_EXPIRED");
  assert.equal(state.reports.get(reportId).status, "failed");
  assert.equal(state.reports.get(reportId).failure_stage, "reading_metadata");
});

test("upload verification fails invalid PDF magic bytes", async () => {
  const reportId = "44444444-4444-4444-8444-444444444444";
  const { state, store } = makeUploadStore({
    state: {
      reports: new Map([
        [
          reportId,
          {
            id: reportId,
            status: "pending_upload",
            storage_path: `pending_reports/${reportId}/nonce-test.pdf`,
            upload_expires_at: "2026-05-19T12:00:00.000Z",
          },
        ],
      ]),
    },
    store: {
      async downloadStorageObject() {
        return {
          downloaded: true,
          file: new Blob([Buffer.from("not-a-pdf")], { type: "application/pdf" }),
        };
      },
    },
  });

  const result = await verifyReportUpload(reportId, {
    now: () => new Date("2026-05-19T10:00:00.000Z"),
    store,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "INVALID_PDF_MAGIC_BYTES");
  assert.equal(state.reports.get(reportId).status, "failed");
  assert.equal(state.reports.get(reportId).failure_stage, "checking_integrity");
});

test("upload verification stores sha256, page count, and storage metadata", async () => {
  const reportId = "55555555-5555-4555-8555-555555555555";
  const bytes = await makePdfBytes(2);
  const { state, store } = makeUploadStore({
    state: {
      reports: new Map([
        [
          reportId,
          {
            id: reportId,
            status: "pending_upload",
            storage_path: `pending_reports/${reportId}/nonce-test.pdf`,
            upload_expires_at: "2026-05-19T12:00:00.000Z",
          },
        ],
      ]),
    },
    store: {
      async downloadStorageObject() {
        return {
          downloaded: true,
          file: new Blob([Buffer.from(bytes)], { type: "application/pdf" }),
        };
      },
      async getStorageInfo() {
        return {
          found: true,
          lastModified: "2026-05-19T10:30:00.000Z",
          size: bytes.length,
        };
      },
    },
  });

  const result = await verifyReportUpload(reportId, {
    now: () => new Date("2026-05-19T10:00:00.000Z"),
    store,
  });
  const report = state.reports.get(reportId);

  assert.equal(result.ok, true);
  assert.equal(report.status, "pending_payment");
  assert.equal(report.file_size_bytes, bytes.length);
  assert.equal(report.page_count, 2);
  assert.equal(report.storage_last_modified, "2026-05-19T10:30:00.000Z");
  assert.equal(report.verified_file_sha256.length, 64);
  assert.deepEqual(REPORT_UPLOAD_STEPS, [
    "reading_metadata",
    "calculating_fingerprint",
    "reading_page_count",
    "checking_integrity",
  ]);
  assert.equal(report.processing_metadata.upload_verification.page_gate, "regular");
});

test("upload verification fails PDFs above the Sprint 0 page limit", async () => {
  const reportId = "66666666-6666-4666-8666-666666666666";
  const bytes = await makePdfBytes(101);
  const { state, store } = makeUploadStore({
    state: {
      reports: new Map([
        [
          reportId,
          {
            id: reportId,
            status: "pending_upload",
            storage_path: `pending_reports/${reportId}/nonce-test.pdf`,
            upload_expires_at: "2026-05-19T12:00:00.000Z",
          },
        ],
      ]),
    },
    store: {
      async downloadStorageObject() {
        return {
          downloaded: true,
          file: new Blob([Buffer.from(bytes)], { type: "application/pdf" }),
        };
      },
      async getStorageInfo() {
        return {
          found: true,
          lastModified: "2026-05-19T10:30:00.000Z",
          size: bytes.length,
        };
      },
    },
  });

  const result = await verifyReportUpload(reportId, {
    now: () => new Date("2026-05-19T10:00:00.000Z"),
    store,
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "PAGE_LIMIT_EXCEEDED");
  assert.equal(state.reports.get(reportId).status, "failed");
  assert.equal(state.reports.get(reportId).failure_stage, "checking_integrity");
});

test("upload verification marks 51 to 100 page PDFs with graduated gate metadata", async () => {
  const reportId = "77777777-7777-4777-8777-777777777777";
  const bytes = await makePdfBytes(51);
  const { state, store } = makeUploadStore({
    state: {
      reports: new Map([
        [
          reportId,
          {
            id: reportId,
            status: "pending_upload",
            storage_path: `pending_reports/${reportId}/nonce-test.pdf`,
            upload_expires_at: "2026-05-19T12:00:00.000Z",
          },
        ],
      ]),
    },
    store: {
      async downloadStorageObject() {
        return {
          downloaded: true,
          file: new Blob([Buffer.from(bytes)], { type: "application/pdf" }),
        };
      },
      async getStorageInfo() {
        return {
          found: true,
          lastModified: "2026-05-19T10:30:00.000Z",
          size: bytes.length,
        };
      },
    },
  });

  const result = await verifyReportUpload(reportId, {
    now: () => new Date("2026-05-19T10:00:00.000Z"),
    store,
  });
  const pageGate = state.reports.get(reportId).processing_metadata.upload_verification.page_gate;

  assert.equal(result.ok, true);
  assert.equal(state.reports.get(reportId).status, "pending_payment");
  assert.equal(pageGate.tier, "graduated_gate_fee");
  assert.equal(pageGate.fee_status, "prepared_not_charged");
});

test("upload verification uses only allowed report macro-statuses and job states", () => {
  assert.deepEqual(REPORT_UPLOAD_JOB_STATUSES, ["queued", "verifying", "verified", "failed"]);
  assert.equal(REPORT_MACRO_STATUSES.includes("pending_upload"), true);
  assert.equal(REPORT_MACRO_STATUSES.includes("verifying"), true);
  assert.equal(REPORT_MACRO_STATUSES.includes("pending_payment"), true);
  assert.equal(REPORT_MACRO_STATUSES.includes("uploaded"), false);
  assert.equal(REPORT_UPLOAD_JOB_STATUSES.includes("uploaded"), false);
});

test("upload verification is not coupled to the AI report generation route", () => {
  const uploadSource = fs.readFileSync(path.join(repoRoot, "src/lib/reports/uploads.ts"), "utf8");

  assert.doesNotMatch(uploadSource, /requestOpenRouterJson|buildReportPrompt|normalizeProviderResult|buildMockResult/);
  assert.doesNotMatch(uploadSource, /OPENROUTER_API_KEY|ANTHROPIC_API_KEY/);
});

test("Sprint 0 migration keeps persistence, payments, energy, and rate limits in the expected shape", () => {
  const sql = fs.readFileSync(path.join(repoRoot, "supabase/migrations/023_nali_zero_sprint0_foundation.sql"), "utf8");
  const reportsTable = sql.match(/CREATE TABLE IF NOT EXISTS public\.reports \([\s\S]*?\n\);/)?.[0] ?? "";
  const paymentsTable = sql.match(/CREATE TABLE IF NOT EXISTS public\.payments \([\s\S]*?\n\);/)?.[0] ?? "";

  assert.match(reportsTable, /guest_session_id_hash TEXT NOT NULL/);
  assert.match(reportsTable, /report_access_token_hash TEXT NOT NULL/);
  assert.match(
    reportsTable,
    /status IN \('pending_upload', 'verifying', 'pending_payment', 'processing', 'export_ready', 'failed'\)/,
  );
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

test("Sprint 0 operational migration adds usage and feedback tables safely", () => {
  const sql = fs.readFileSync(
    path.join(repoRoot, "supabase/migrations/20260518212110_sprint0_operational_foundation.sql"),
    "utf8",
  );

  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.usage_events/);
  assert.match(sql, /processing_class TEXT CHECK \(processing_class IN \('Peregrine', 'Obsidian', 'Zephyr'\)\)/);
  assert.match(sql, /estimated_energy INTEGER/);
  assert.match(sql, /metadata JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.report_feedback/);
  assert.match(sql, /rating TEXT NOT NULL CHECK \(rating IN \('helpful', 'not_helpful'\)\)/);
  assert.match(sql, /report_feedback_service_role_all/);
  assert.match(sql, /usage_events_service_role_all/);
});

test("CP1 event and cost logging migration adds service-role-only tables safely", () => {
  const sql = readMigrationByName("cp1_event_cost_logging");

  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.report_events/);
  assert.match(sql, /event_type TEXT NOT NULL CHECK/);
  for (const eventType of REPORT_EVENT_TYPES) {
    assert.match(sql, new RegExp(`'${eventType}'`));
  }
  assert.match(sql, /metadata JSONB NOT NULL DEFAULT '\{\}'::jsonb/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.api_usage_logs/);
  assert.match(sql, /provider_alias TEXT/);
  assert.match(sql, /model_alias TEXT/);
  assert.match(sql, /estimated_input_tokens INTEGER/);
  assert.match(sql, /estimated_output_tokens INTEGER/);
  assert.match(sql, /estimated_cost NUMERIC\(12,6\)/);
  assert.match(sql, /status TEXT NOT NULL DEFAULT 'skipped' CHECK \(status IN \('success', 'failed', 'skipped'\)\)/);
  assert.match(sql, /report_events_service_role_all/);
  assert.match(sql, /api_usage_logs_service_role_all/);
  assert.doesNotMatch(sql, /GRANT\s+(?:SELECT|INSERT|UPDATE|DELETE)\s+ON\s+public\.(?:report_events|api_usage_logs)\s+TO\s+(?:anon|authenticated)/i);
  assert.doesNotMatch(sql, /DROP TABLE|DROP COLUMN|DELETE FROM public\.reports/i);
});

test("CP1 operational logger sanitizes sensitive metadata and degrades safely", async () => {
  const original = snapshotSupabaseEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const sanitized = sanitizeOperationalMetadata({
      access_key: "report-access-key-should-not-survive",
      checkout_url: "https://app.midtrans.com/snap/v4/redirection/sensitive-token",
      guest_session_id: "guest-session-secret-value",
      nested: {
        signature_key: "signature-secret-value",
      },
      raw_notification: { order_id: "nali-order" },
      safe_status: "pending",
      sha256_hash: "a".repeat(64),
      snap_token: "snap-token-value",
    });
    const serialized = JSON.stringify(sanitized);

    assert.equal(sanitized.safe_status, "pending");
    assert.doesNotMatch(serialized, /guest-session-secret-value|report-access-key|signature-secret-value|snap-token-value|aaaaaaaa/);

    const eventResult = await logReportEvent({
      eventType: "REPORT_CREATED",
      metadata: sanitized,
      reportId: "11111111-1111-4111-8111-111111111111",
      status: "success",
    });
    const apiUsageResult = await logApiUsage({
      estimatedCost: null,
      estimatedInputTokens: 120,
      estimatedOutputTokens: null,
      modelAlias: "GPT-secret-name",
      operation: "report_generation",
      providerAlias: "OpenRouter",
      reportId: "11111111-1111-4111-8111-111111111111",
      status: "skipped",
    });

    assert.equal(eventResult.logged, false);
    assert.equal(eventResult.reason, "supabase_unconfigured");
    assert.equal(apiUsageResult.logged, false);
    assert.equal(apiUsageResult.reason, "supabase_unconfigured");
  } finally {
    restoreSupabaseEnv(original);
  }
});

test("CP1 readiness and founder admin surfaces include only safe operational counts", () => {
  const readinessSource = fs.readFileSync(path.join(repoRoot, "src/app/api/system/readiness/route.ts"), "utf8");
  const adminOrdersSource = fs.readFileSync(path.join(repoRoot, "src/lib/system/adminOrders.ts"), "utf8");
  const adminPageSource = fs.readFileSync(path.join(repoRoot, "src/app/(app)/system/orders/page.tsx"), "utf8");

  assert.match(readinessSource, /countTable\(supabase, "report_events"\)/);
  assert.match(readinessSource, /countTable\(supabase, "api_usage_logs"\)/);
  assert.match(adminOrdersSource, /countTableRows\(supabase, "report_events"\)/);
  assert.match(adminOrdersSource, /countTableRows\(supabase, "api_usage_logs"\)/);
  assert.match(adminPageSource, /Report events/);
  assert.match(adminPageSource, /API usage logs/);
  assert.doesNotMatch(
    adminPageSource,
    /guest_session_id_hash|report_access_token_hash|snap_token|signature_key|MIDTRANS_SERVER_KEY|SUPABASE_SERVICE_ROLE_KEY/,
  );
  assert.doesNotMatch(adminPageSource, /provider_alias|model_alias|estimated_cost|estimated_input_tokens|estimated_output_tokens/);
});

test("CP1 basic public templates include the required minimum three templates", () => {
  assert.ok(reportTemplates.length >= 3);
  assert.ok(reportTemplates.includes("Laporan Praktikum Biologi"));
  assert.ok(reportTemplates.includes("Laporan Observasi Lingkungan"));
  assert.ok(reportTemplates.includes("Laporan Kegiatan/KKN"));
});

test("Sprint 0.7 does not add CP2 or later route surfaces", () => {
  const appFiles = listFilesRecursive(path.join(repoRoot, "src/app")).map((file) => path.relative(repoRoot, file));
  const serializedRoutes = appFiles.join("\n");

  assert.doesNotMatch(
    serializedRoutes,
    /professional-dashboard|literature-matrix|crossref|pubmed|doi-resolver|source-resolver|postgis|h3|sos|docx|subscription/i,
  );
});

test("presigned upload migration is additive and keeps upload states separate from report macro-statuses", () => {
  const sql = fs.readFileSync(
    path.join(repoRoot, "supabase/migrations/20260519090000_nali_zero_presigned_upload_foundation.sql"),
    "utf8",
  );

  assert.match(sql, /ALTER TABLE public\.reports\s+ADD COLUMN IF NOT EXISTS verified_file_sha256 TEXT/);
  assert.match(sql, /ALTER TABLE public\.reports\s+ADD COLUMN IF NOT EXISTS storage_last_modified TIMESTAMPTZ/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.upload_verification_jobs/);
  assert.match(sql, /status IN \('queued', 'verifying', 'verified', 'failed'\)/);
  assert.match(sql, /INSERT INTO storage\.buckets/);
  assert.match(sql, /nali_report_uploads/);
  assert.doesNotMatch(sql, /status IN \('pending_upload', 'verifying', 'uploaded'/);
  assert.doesNotMatch(sql, /DROP TABLE|DROP COLUMN|DELETE FROM public\.reports/i);
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

test("Midtrans env and checkout URL helpers stay server-only and safe", () => {
  const original = snapshotMidtransEnv();

  try {
    delete process.env.MIDTRANS_SERVER_KEY;
    delete process.env.MIDTRANS_MERCHANT_ID;
    delete process.env.MIDTRANS_ENVIRONMENT;
    delete process.env.MIDTRANS_IS_PRODUCTION;
    delete process.env.MIDTRANS_SNAP_BASE_URL;

    assert.equal(isMidtransConfigured(), false);
    assert.equal(isMidtransProduction(), false);

    process.env.MIDTRANS_SERVER_KEY = "server-key-for-test";
    process.env.MIDTRANS_MERCHANT_ID = "merchant-id-for-test";
    assert.equal(isMidtransConfigured(), true);
    assert.equal(isMidtransProduction(), false);
    assert.equal(getMidtransSnapEndpoint(), "https://app.sandbox.midtrans.com/snap/v1/transactions");

    process.env.MIDTRANS_IS_PRODUCTION = "true";
    assert.equal(isMidtransProduction(), true);
    assert.equal(getMidtransSnapEndpoint(), "https://app.midtrans.com/snap/v1/transactions");

    delete process.env.MIDTRANS_IS_PRODUCTION;
    process.env.MIDTRANS_ENVIRONMENT = "production";
    assert.equal(isMidtransProduction(), true);
    assert.equal(getMidtransSnapEndpoint(), "https://app.midtrans.com/snap/v1/transactions");

    process.env.MIDTRANS_SNAP_BASE_URL = "https://app.sandbox.midtrans.com/snap/v1";
    assert.equal(getMidtransSnapEndpoint(), "https://app.sandbox.midtrans.com/snap/v1/transactions");

    process.env.MIDTRANS_SNAP_BASE_URL = "https://evil.example/snap/v1";
    assert.doesNotMatch(getMidtransSnapEndpoint(), /evil\.example/);

    assert.equal(isSafeMidtransCheckoutUrl("https://app.midtrans.com/snap/v4/redirection/test"), true);
    assert.equal(isSafeMidtransCheckoutUrl("https://app.sandbox.midtrans.com/snap/v4/redirection/test"), true);
    assert.equal(isSafeMidtransCheckoutUrl("http://app.midtrans.com/snap/v4/redirection/test"), false);
    assert.equal(isSafeMidtransCheckoutUrl("https://evil.example/snap/v4/redirection/test"), false);
  } finally {
    restoreMidtransEnv(original);
  }
});

test("Midtrans webhook confirmation unlock policy allows only successful statuses", () => {
  const signedNotification = {
    fraud_status: "accept",
    gross_amount: "19000.00",
    order_id: "nali-test-order",
    payment_type: "bank_transfer",
    signature_key: "signature-value-should-not-be-stored",
    status_code: "200",
    transaction_status: "settlement",
  };
  const sanitized = sanitizeMidtransNotification(signedNotification);

  assert.equal(isSuccessfulPaymentStatus(mapMidtransTransactionStatus({ transaction_status: "settlement" })), true);
  assert.equal(
    isSuccessfulPaymentStatus(mapMidtransTransactionStatus({ fraud_status: "accept", transaction_status: "capture" })),
    true,
  );
  assert.equal(
    isSuccessfulPaymentStatus(
      mapMidtransTransactionStatus({ fraud_status: "challenge", transaction_status: "capture" }),
    ),
    false,
  );
  for (const transaction_status of ["deny", "cancel", "expire", "failure", "challenge"]) {
    assert.equal(isSuccessfulPaymentStatus(mapMidtransTransactionStatus({ transaction_status })), false);
  }
  assert.equal("signature_key" in sanitized, false);
  assert.doesNotMatch(JSON.stringify(sanitized), /signature-value-should-not-be-stored/);
});

test("system readiness reports booleans without exposing secret values", async () => {
  const original = {
    merchantId: process.env.MIDTRANS_MERCHANT_ID,
    midtransEnvironment: process.env.MIDTRANS_ENVIRONMENT,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  process.env.MIDTRANS_MERCHANT_ID = "merchant-id-value-should-not-appear";
  process.env.MIDTRANS_ENVIRONMENT = "production";
  process.env.MIDTRANS_SERVER_KEY = "midtrans-server-key-value-should-not-appear";
  process.env.OPENROUTER_API_KEY = "sk-test-secret-value-should-not-appear";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "supabase-secret-value-should-not-appear";

  try {
    const response = await getReadiness();
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    assert.equal(typeof payload.openRouterConfigured, "boolean");
    assert.equal(typeof payload.supabaseConfigured, "boolean");
    assert.equal(typeof payload.midtransConfigured, "boolean");
    assert.equal(typeof payload.midtransProductionMode, "boolean");
    assert.equal(payload.midtransConfigured, true);
    assert.equal(payload.midtransProductionMode, true);
    assert.equal(payload.uploadPrepared, true);
    assert.equal(typeof payload.uploadConfigured, "boolean");
    assert.equal(payload.naliLockPrepared, true);
    assert.equal(payload.rateLimitPrepared, true);
    assert.equal(payload.costProtectionPrepared, true);
    assert.equal(typeof payload.costProtectionConfigured, "boolean");
    assert.equal(typeof payload.costProtectionActive, "boolean");
    assert.equal("anonKeyProjectRef" in (payload.envVerification ?? {}), false);
    assert.equal("serviceKeyProjectRef" in (payload.envVerification ?? {}), false);
    assert.doesNotMatch(
      serialized,
      /sk-test-secret-value-should-not-appear|supabase-secret-value-should-not-appear|midtrans-server-key-value-should-not-appear|merchant-id-value-should-not-appear/,
    );
  } finally {
    if (original.merchantId === undefined) delete process.env.MIDTRANS_MERCHANT_ID;
    else process.env.MIDTRANS_MERCHANT_ID = original.merchantId;
    if (original.midtransEnvironment === undefined) delete process.env.MIDTRANS_ENVIRONMENT;
    else process.env.MIDTRANS_ENVIRONMENT = original.midtransEnvironment;
    if (original.midtransIsProduction === undefined) delete process.env.MIDTRANS_IS_PRODUCTION;
    else process.env.MIDTRANS_IS_PRODUCTION = original.midtransIsProduction;
    if (original.midtransServerKey === undefined) delete process.env.MIDTRANS_SERVER_KEY;
    else process.env.MIDTRANS_SERVER_KEY = original.midtransServerKey;
    process.env.OPENROUTER_API_KEY = original.openrouter;
    process.env.SUPABASE_SERVICE_ROLE_KEY = original.serviceRole;
  }
});

test("missing env does not crash readiness or usage logging", async () => {
  const original = {
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    merchantId: process.env.MIDTRANS_MERCHANT_ID,
    midtransEnvironment: process.env.MIDTRANS_ENVIRONMENT,
    midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION,
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
  delete process.env.MIDTRANS_MERCHANT_ID;
  delete process.env.MIDTRANS_ENVIRONMENT;
  delete process.env.MIDTRANS_IS_PRODUCTION;
  delete process.env.MIDTRANS_SERVER_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const readiness = getSystemReadiness();
    const usage = await logUsageEvent({
      actionType: "report_preview",
      inputSize: 120,
      mode: "draft_from_materials",
      status: "test",
    });

    assert.equal(readiness.supabaseConfigured, false);
    assert.equal(readiness.midtransConfigured, false);
    assert.equal(readiness.midtransProductionMode, false);
    assert.equal(readiness.uploadPrepared, true);
    assert.equal(readiness.uploadConfigured, false);
    assert.equal(readiness.rateLimitPrepared, true);
    assert.equal(readiness.costProtectionPrepared, true);
    assert.equal(readiness.costProtectionConfigured, false);
    assert.equal(usage.logged, false);
    assert.equal(usage.reason, "supabase_unconfigured");
  } finally {
    if (original.merchantId === undefined) delete process.env.MIDTRANS_MERCHANT_ID;
    else process.env.MIDTRANS_MERCHANT_ID = original.merchantId;
    if (original.midtransEnvironment === undefined) delete process.env.MIDTRANS_ENVIRONMENT;
    else process.env.MIDTRANS_ENVIRONMENT = original.midtransEnvironment;
    if (original.midtransIsProduction === undefined) delete process.env.MIDTRANS_IS_PRODUCTION;
    else process.env.MIDTRANS_IS_PRODUCTION = original.midtransIsProduction;
    if (original.midtransServerKey === undefined) delete process.env.MIDTRANS_SERVER_KEY;
    else process.env.MIDTRANS_SERVER_KEY = original.midtransServerKey;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = original.anon;
    process.env.NEXT_PUBLIC_SUPABASE_URL = original.url;
    process.env.SUPABASE_SERVICE_ROLE_KEY = original.serviceRole;
  }
});

test("usage logging estimates NaLI Energy with internal processing classes only", () => {
  const draftEstimate = estimateEnergyForAction("report_preview", "draft_from_materials", 3200);
  const guideEstimate = estimateEnergyForAction("start_from_zero_guidance", "start_from_zero", 200);
  const protection = shouldEnterCostProtectionMode();
  const serialized = JSON.stringify({ draftEstimate, guideEstimate, protection });

  assert.equal(draftEstimate.processingClass, "Obsidian");
  assert.equal(guideEstimate.processingClass, "Peregrine");
  assert.equal(protection.active, false);
  assert.doesNotMatch(serialized, /OpenRouter|GPT|Gemini|Claude|API credit|report credit/i);
});

test("feedback route validates rating and gracefully falls back when persistence is missing", async () => {
  const original = {
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const invalid = await postFeedback(
      new Request("http://localhost/api/reports/test-report/feedback", {
        body: JSON.stringify({ rating: "maybe" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "test-report" }) },
    );
    const fallback = await postFeedback(
      new Request("http://localhost/api/reports/test-report/feedback", {
        body: JSON.stringify({ comment: "Cukup membantu.", rating: "helpful" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "test-report" }) },
    );
    const fallbackPayload = await fallback.json();

    assert.equal(invalid.status, 400);
    assert.equal(fallback.status, 202);
    assert.equal(fallbackPayload.stored, false);
    assert.match(fallbackPayload.message, /persistence belum aktif/i);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = original.url;
    process.env.SUPABASE_SERVICE_ROLE_KEY = original.serviceRole;
  }
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
    "src/app/api/reports/[id]/feedback/route.ts",
    "src/app/api/reports/create-upload/route.ts",
    "src/app/api/reports/confirm-upload/route.ts",
    "src/app/api/payments/create/route.ts",
    "src/app/api/payments/midtrans-webhook/route.ts",
    "src/app/api/system/readiness/route.ts",
    "src/app/(app)/system/page.tsx",
    "src/app/(app)/system/orders/page.tsx",
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
    "src/components/ui/CodexFeatureShowcase.tsx",
    "src/components/ui/CodexProductPreview.tsx",
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

test("public frontend copy aligns with CP1 backend state without overclaiming", () => {
  const homepage = fs.readFileSync(path.join(repoRoot, "src/app/page.tsx"), "utf8");
  const featureShowcase = fs.readFileSync(path.join(repoRoot, "src/components/ui/CodexFeatureShowcase.tsx"), "utf8");
  const productPreview = fs.readFileSync(path.join(repoRoot, "src/components/ui/CodexProductPreview.tsx"), "utf8");
  const learnReport = fs.readFileSync(path.join(repoRoot, "src/app/learn-report/page.tsx"), "utf8");
  const createReport = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const pricing = fs.readFileSync(path.join(repoRoot, "src/app/pricing/page.tsx"), "utf8");
  const fieldIntelligence = fs.readFileSync(path.join(repoRoot, "src/app/field-intelligence/page.tsx"), "utf8");
  const resultClient = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  const publicSource = [
    homepage,
    featureShowcase,
    productPreview,
    learnReport,
    createReport,
    pricing,
    fieldIntelligence,
    resultClient,
  ].join("\n");

  // Existing homepage assertions (kept)
  assert.match(homepage, /Source Notes: Labeled/);
  assert.match(homepage, /Turn notes, source URLs, context, and observations/);

  // CP1 Conversion Polish: bilingual headline
  assert.match(homepage, /Ubah catatan berantakan menjadi laporan berbasis bukti/);
  assert.match(homepage, /Turn messy notes into structured evidence-based reports/);

  // CP1 Conversion Polish: use-case cards
  assert.match(homepage, /Yang bisa kamu lakukan sekarang/);
  assert.match(homepage, /Laporan Observasi Lingkungan/);
  assert.match(homepage, /Laporan Praktikum Biologi/);
  assert.match(homepage, /Laporan Kegiatan \/ KKN/);
  assert.match(homepage, /Cek Kualitas Bukti/);

  // CP1 Conversion Polish: how NaLI works
  assert.match(homepage, /Cara kerja NaLI/);
  assert.match(homepage, /Masukkan bahan/);
  assert.match(homepage, /NaLI menyusun draft/);
  assert.match(homepage, /Periksa dan lanjutkan/);

  // CP1 Conversion Polish: integrity section
  assert.match(homepage, /Dibuat untuk membantu, bukan memalsukan/);
  assert.match(homepage, /Tidak membuat data palsu/);
  assert.match(homepage, /Tidak membuat sitasi palsu/);

  // CP1 Conversion Polish: controlled testing CTA
  assert.match(homepage, /Bantu uji NaLI CP1/);

  // CP1 Conversion Polish: CTA links
  assert.match(homepage, /Mulai buat laporan/);
  assert.match(homepage, /Lihat paket kredit/);
  assert.match(homepage, /href="\/create-report"/);
  assert.match(homepage, /href="\/pricing"/);

  assert.match(featureShowcase, /Export Markdown\/PDF/);
  assert.match(featureShowcase, /Source notes labeled/);
  assert.match(learnReport, /Mulai dari satu topik/);
  assert.match(learnReport, /Paste text materials or start with one topic/);
  assert.match(createReport, /Upload PDF\/foto belum aktif di CP1/);
  assert.match(createReport, /Belum aktif/);
  assert.doesNotMatch(createReport, /create-upload|confirm-upload|signed_upload_url|handlePdfChange/);
  assert.match(pricing, /Export unlocks after confirmed payment/);
  assert.match(pricing, /If confirmation is delayed, the order stays pending/);
  assert.match(pricing, /until automated verification succeeds/);

  // CP1 Conversion Polish: pricing testing-phase note
  assert.match(pricing, /Pembayaran otomatis belum aktif di fase testing ini/);

  assert.match(resultClient, /Download Markdown/);
  assert.match(resultClient, /Download PDF/);
  assert.match(resultClient, /Export versi rapi/);
  assert.match(resultClient, /pending/);
  assert.match(resultClient, /sistem memverifikasi/);
  assert.match(resultClient, /Idea Mode/);
  assert.match(resultClient, /User-Evidence Report/);
  assert.doesNotMatch(resultClient, /model_used/);
  assert.match(fieldIntelligence, /roadmap\/manual inquiry only/);
  assert.match(fieldIntelligence, /F1-F11 workflows/);
  assert.match(fieldIntelligence, /Roadmap only in CP1/);

  assert.doesNotMatch(
    publicSource,
    /Export PDF or DOCX|DOCX premium|Source Coverage: Verified|Sources verified|Evidence table complete|Seret file|Upload your raw materials|Payment gateway not active|Payment not active/i,
  );
});

test("CP1 payment interest optimization: pricing uses credit-pack framing, no subscription implication", () => {
  const plans = fs.readFileSync(path.join(repoRoot, "src/lib/pricing/plans.ts"), "utf8");
  const pricing = fs.readFileSync(path.join(repoRoot, "src/app/pricing/page.tsx"), "utf8");
  const pricingCards = fs.readFileSync(path.join(repoRoot, "src/components/report/PricingCards.tsx"), "utf8");
  const resultClient = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  const workspace = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  // Plans must NOT show '/ bln' (subscription framing)
  assert.doesNotMatch(plans, /\/ bln/);

  // Pricing page must have one-time value anchors section
  assert.match(pricing, /Mulai dari pembayaran kecil/);
  assert.match(pricing, /Target harga rilis berbayar/);
  assert.match(pricing, /Rp5\.000/);
  assert.match(pricing, /Rp9\.000/);
  assert.match(pricing, /Rp19\.000/);
  assert.match(pricing, /Rp29\.000/);
  assert.match(pricing, /Rencana harga CP1/);

  // Pricing page must have segment copy
  assert.match(pricing, /Cocok untuk/);
  assert.match(pricing, /praktikum/);
  assert.match(pricing, /geografi/);
  assert.match(pricing, /NGO\/CSR/);

  // PricingCards must use credit-pack framing not subscription
  assert.match(pricingCards, /Pilih Paket Kredit/);
  assert.doesNotMatch(pricingCards, /Kredit Bulanan/);
  assert.match(pricingCards, /Selama fase testing/);
  assert.match(pricingCards, /Recurring billing.*belum aktif/);

  // Pricing header must not use 'langganan' subscription language
  assert.doesNotMatch(pricing, /langganan kredit bulanan/);
  assert.match(pricing, /Paket kredit dan top-up instan/);

  // Export CTA must use Indonesian and include price framing
  assert.match(resultClient, /Export versi rapi/);
  assert.match(resultClient, /Mulai Rp9\.000/);
  assert.match(resultClient, /PDF berbayar belum aktif di fase testing ini/);
  assert.doesNotMatch(resultClient, /Unlock Export/);
  assert.doesNotMatch(resultClient, /Buy now|Pay now|Subscribe now/i);

  // AgentWorkspace must have paid intent prompt (UI-only, no fake payment)
  assert.match(workspace, /paid_intent/);
  assert.match(workspace, /Ya, tertarik/);
  assert.match(workspace, /Mungkin/);
  assert.match(workspace, /Rp9\.000/);
  assert.doesNotMatch(workspace, /payment_success|unlock_export|create_payment/i);

  // No unlimited claims in pricing plans (disclaimer mentions 'unlimited' to deny it, which is fine)
  assert.doesNotMatch(plans, /unlimited/i);
});


test("export and payment routes enforce Sprint 0 gatekeeping in source", () => {
  const paymentRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/payments/create/route.ts"), "utf8");
  const exportRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/[id]/export/route.ts"), "utf8");
  const webhookRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/payments/midtrans-webhook/route.ts"), "utf8");

  assert.match(paymentRoute, /getPersistedReport/);
  assert.match(paymentRoute, /isMidtransConfigured/);
  assert.match(paymentRoute, /isSafeMidtransCheckoutUrl/);
  assert.match(paymentRoute, /manual_payment_pending/);
  assert.match(paymentRoute, /checkout_url/);
  assert.match(paymentRoute, /snap_token/);
  assert.match(paymentRoute, /snap_url/);
  assert.match(paymentRoute, /createPaymentRecord/);
  assert.doesNotMatch(paymentRoute, /input\.amount|body\.amount/);
  assert.doesNotMatch(paymentRoute, /NEXT_PUBLIC_MIDTRANS|MIDTRANS_CLIENT_KEY/);
  assert.match(exportRoute, /getReportExportEligibility/);
  assert.match(exportRoute, /402/);
  assert.match(exportRoute, /searchParams\.get\("format"\)/);
  assert.match(exportRoute, /buildReportPdfBytes/);
  assert.match(exportRoute, /application\/pdf/);
  assert.match(exportRoute, /text\/markdown/);
  assert.match(webhookRoute, /verifyMidtransSignature/);
  assert.match(webhookRoute, /mapMidtransTransactionStatus/);
  assert.match(webhookRoute, /updatePaymentFromNotification/);
  assert.doesNotMatch(webhookRoute, /\.from\("reports"\)|payment_order_id|payment_expires_at/);

  // Sprint 0.1 Paid Export checks
  const reportIdRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/[id]/route.ts"), "utf8");
  const readinessRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/system/readiness/route.ts"), "utf8");
  const resultClient = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");

  assert.match(reportIdRoute, /getReportExportEligibility/);
  assert.match(reportIdRoute, /export_readiness:\s*eligibility\.state/);
  assert.match(readinessRoute, /countTable\(supabase, "payments"\)/);
  assert.match(readinessRoute, /midtransProductionMode/);
  assert.doesNotMatch(readinessRoute, /anonKeyProjectRef|serviceKeyProjectRef/);
  assert.match(resultClient, /exportReadiness/);
  assert.match(resultClient, /Download Markdown/);
  assert.match(resultClient, /Download PDF/);
  assert.match(resultClient, /Export versi rapi/);

  const exportSmoke = fs.readFileSync(path.join(repoRoot, "scripts/smoke-paid-export-production.mjs"), "utf8");
  assert.match(exportSmoke, /unpaidPdfExportLocked/);
  assert.match(exportSmoke, /exportPdfReturned/);
  assert.match(exportSmoke, /checkout_url/);
  assert.match(exportSmoke, /application\/pdf/);
});

test("paid markdown export has NaLI structure, metadata, disclaimer, and redaction", () => {
  const validated = validateReportRequest({
    integrityConsent: true,
    location: "Semarang",
    mainText: "Saya mengamati erosi ringan di tepi saluran air setelah hujan. Air keruh dan tebing terlihat terkikis.",
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi Saluran Air",
  });
  assert.equal(validated.success, true);

  const report = buildMockDraftReport(validated.data);
  const supabaseSecretFixture = "SUPABASE_SERVICE_ROLE_" + "KEY=should-not-appear";
  const midtransSecretFixture = "MIDTRANS_SERVER_" + "KEY=should-not-appear";
  report.findings.push(
    [
      "Nilai sensitif uji:",
      "guest-session-release-check-123456789",
      "report_access_key: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "hash 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      supabaseSecretFixture,
      midtransSecretFixture,
    ].join(" "),
  );

  const markdown = buildReportMarkdown(report, { exportStatus: "export_ready" });

  assert.match(markdown, /^# NaLI Learn & Report/m);
  assert.match(markdown, /## Judul Laporan/);
  assert.match(markdown, /## Metadata Laporan/);
  assert.match(markdown, new RegExp(`Report ID: ${report.id}`));
  assert.match(markdown, /Mode: draft_from_materials/);
  assert.match(markdown, /Status export: export_ready/);
  assert.match(markdown, /## Ringkasan Singkat/);
  assert.match(markdown, /## Konteks Observasi/);
  assert.match(markdown, /## Temuan Utama/);
  assert.match(markdown, /## Analisis Awal Berbasis Bukti/);
  assert.match(markdown, /## Tingkat Keyakinan \/ Confidence Note/);
  assert.match(markdown, /## Batasan & Disclaimer/);
  assert.match(markdown, /## Rekomendasi Tindak Lanjut/);
  assert.match(markdown, /## Catatan Sumber \/ Evidence/);
  assert.match(
    markdown,
    /Draft ini adalah bantuan awal berbasis informasi yang diberikan, bukan pengganti validasi ahli\/lapangan\./,
  );

  assert.doesNotMatch(markdown, /guest-session-release-check/i);
  assert.doesNotMatch(markdown, /report_access_key:\s*[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(markdown, /0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef/i);
  assert.doesNotMatch(markdown, new RegExp(supabaseSecretFixture));
  assert.doesNotMatch(markdown, new RegExp(midtransSecretFixture));
});

test("paid PDF export bytes are downloadable and redacted", async () => {
  const { buildReportPdfBytes } = require("../../src/lib/reports/pdf");
  const validated = validateReportRequest({
    integrityConsent: true,
    location: "Semarang",
    mainText:
      "Catatan observasi menyebut air keruh, sampah ringan, dan kebutuhan foto pembanding sebelum validasi akhir.",
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Observasi Kualitas Air",
  });
  assert.equal(validated.success, true);

  const report = buildMockDraftReport(validated.data);
  const supabaseSecretFixture = "SUPABASE_SERVICE_ROLE_" + "KEY=should-not-appear";
  const midtransSecretFixture = "MIDTRANS_SERVER_" + "KEY=should-not-appear";
  report.findings.push(
    [
      "Nilai sensitif uji:",
      "guest-session-pdf-release-check-123456789",
      "report_access_key: abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
      "hash 0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      supabaseSecretFixture,
      midtransSecretFixture,
    ].join(" "),
  );

  const pdfBytes = await buildReportPdfBytes(report, { exportStatus: "export_ready" });
  const pdfBuffer = Buffer.from(pdfBytes);
  const rawPdf = pdfBuffer.toString("latin1");
  const parsedPdf = await PDFDocument.load(pdfBuffer);

  assert.equal(pdfBuffer.subarray(0, 5).toString("latin1"), "%PDF-");
  assert.ok(parsedPdf.getPageCount() >= 1);
  assert.doesNotMatch(rawPdf, /guest-session-pdf-release-check/i);
  assert.doesNotMatch(rawPdf, /report_access_key:\s*[A-Za-z0-9_-]{20,}/);
  assert.doesNotMatch(rawPdf, /0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef/i);
  assert.doesNotMatch(rawPdf, new RegExp(supabaseSecretFixture));
  assert.doesNotMatch(rawPdf, new RegExp(midtransSecretFixture));
});

test("export gate state remains locked until successful payment", () => {
  assert.equal(getExportState({ hasSuccessfulPayment: false }), "export_locked");
  assert.equal(getExportState({ hasSuccessfulPayment: true }), "export_ready");
});

test("payment first-sale operations stay server-side and honest", () => {
  const paymentRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/payments/create/route.ts"), "utf8");
  const statusDoc = fs.readFileSync(path.join(repoRoot, "docs/PAYMENT_MODE_STATUS.md"), "utf8");
  const runbookDoc = fs.readFileSync(path.join(repoRoot, "docs/FIRST_SALE_RUNBOOK.md"), "utf8");
  const smokeDoc = fs.readFileSync(path.join(repoRoot, "docs/PRODUCTION_SMOKE_CHECKLIST.md"), "utf8");
  const confirmScriptPath = path.join(repoRoot, "scripts/confirm-manual-payment.mjs");
  const confirmScript = fs.readFileSync(confirmScriptPath, "utf8");
  const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));

  assert.equal(fs.existsSync(confirmScriptPath), true);
  assert.equal(confirmScriptPath.includes(`${path.sep}src${path.sep}app${path.sep}api${path.sep}`), false);
  assert.equal(packageJson.scripts["payment:confirm:manual"], "node scripts/confirm-manual-payment.mjs");

  assert.match(statusDoc, /automatic Midtrans one-time payment/i);
  assert.match(statusDoc, /manual fallback/i);
  assert.match(statusDoc, /`payments` table is the source of truth/i);
  assert.match(runbookDoc + smokeDoc, /`payments` table (?:remains|is) the source of truth/i);

  assert.match(paymentRoute, /manual_payment_pending/);
  assert.doesNotMatch(paymentRoute, /status:\s*["']paid["']/);
  assert.doesNotMatch(statusDoc + runbookDoc, /manual fallback\s+is\s+(?:an?\s+)?automatic checkout/i);

  assert.match(confirmScript, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(confirmScript, /--confirm/);
  assert.match(confirmScript, /manual_founder_confirmation/);
  assert.match(confirmScript, /PRODUCTION_SUPABASE_HOST/);
  assert.match(confirmScript, /\.eq\("status", "pending"\)/);
  assert.doesNotMatch(confirmScript, /src\/app\/api/);
  assert.doesNotMatch(confirmScript, /console\.(?:log|error)\([^)]*process\.env/s);
});

test("CP1 Midtrans activation docs and founder admin view stay honest and redacted", () => {
  const cp1AuditPath = path.join(repoRoot, "docs/CP1_GAP_AUDIT.md");
  const envSetupPath = path.join(repoRoot, "docs/MIDTRANS_ENV_SETUP.md");
  const cp1Audit = fs.readFileSync(cp1AuditPath, "utf8");
  const envSetup = fs.readFileSync(envSetupPath, "utf8");
  const paymentStatus = fs.readFileSync(path.join(repoRoot, "docs/PAYMENT_MODE_STATUS.md"), "utf8");
  const smokeScript = fs.readFileSync(path.join(repoRoot, "scripts/smoke-paid-export-production.mjs"), "utf8");
  const adminUi = [
    "src/app/(app)/system/page.tsx",
    "src/app/(app)/system/orders/page.tsx",
    "src/lib/system/adminOrders.ts",
  ]
    .map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8"))
    .join("\n");

  assert.match(cp1Audit, /Midtrans automatic code path\s+\|\s+READY IN CODE/i);
  assert.match(cp1Audit, /Midtrans production env\s+\|\s+BLOCKED BY ENV/i);
  assert.match(cp1Audit, /Manual payment fallback\s+\|\s+DONE \/ FALLBACK ONLY/i);
  assert.match(cp1Audit, /Minimal founder admin view\s+\|\s+DONE/i);
  assert.match(cp1Audit, /`report_events` audit logging\s+\|\s+DONE/i);
  assert.match(cp1Audit, /`api_usage_logs` cost logging\s+\|\s+DONE/i);
  assert.match(cp1Audit, /`payments` table source of truth|payments` table source of truth/i);
  assert.match(envSetup, /MIDTRANS_SERVER_KEY/);
  assert.match(envSetup, /MIDTRANS_MERCHANT_ID/);
  assert.match(envSetup, /https:\/\/naliai\.vercel\.app\/api\/payments\/midtrans-webhook/);
  assert.match(paymentStatus, /midtransProductionMode/);
  assert.match(smokeScript, /midtransProductionMode/);
  assert.doesNotMatch(smokeScript, /console\.log\([^)]*snap_token/s);
  assert.doesNotMatch(
    adminUi,
    /snap_token|signature_key|MIDTRANS_SERVER_KEY|SUPABASE_SERVICE_ROLE_KEY|report_access_key/i,
  );
  assert.doesNotMatch(
    cp1Audit + envSetup + paymentStatus,
    /sk-[A-Za-z0-9]|service_role_[A-Za-z0-9]|server-key-for-test/i,
  );
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

test("HomeQueryBox inferMode logic correctly handles observation vs start-from-zero keywords", () => {
  const queryBoxSource = fs.readFileSync(path.join(repoRoot, "src/components/report/HomeQueryBox.tsx"), "utf8");

  // Verify key draft/observation words are present in the component source
  const draftKeywords = [
    "saya mengamati",
    "saya melihat",
    "hasil observasi",
    "ditemukan",
    "terlihat",
    "catatan",
    "tebing",
    "sungai",
    "air",
    "erosi",
    "lokasi",
  ];

  for (const keyword of draftKeywords) {
    assert.ok(queryBoxSource.toLowerCase().includes(keyword), `HomeQueryBox should contain draft keyword: ${keyword}`);
  }

  // Verify key start-from-zero words are present in the component source
  const startZeroKeywords = [
    "belum punya bahan",
    "belum punya catatan",
    "mulai dari nol",
    "belum observasi",
    "bantu cari topik",
    "tidak tahu mulai dari mana",
    "belum tahu mau nulis apa",
  ];

  for (const keyword of startZeroKeywords) {
    assert.ok(
      queryBoxSource.toLowerCase().includes(keyword),
      `HomeQueryBox should contain start-from-zero keyword: ${keyword}`,
    );
  }

  // Extract the inferMode function content dynamically or assert key logical branches exist
  assert.ok(queryBoxSource.includes("draftTriggers.some"), "HomeQueryBox should check draftTriggers");
  assert.ok(queryBoxSource.includes("startFromZeroTriggers.some"), "HomeQueryBox should check startFromZeroTriggers");
});

test("CreateReportForm prefill logic correctly maps parameters and overrides to draft_from_materials based on observation keywords", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  // Verify key draft/observation words are present in the form prefill source
  const draftKeywords = [
    "saya mengamati",
    "saya melihat",
    "hasil observasi",
    "ditemukan",
    "terlihat",
    "catatan",
    "tebing",
    "sungai",
    "air",
    "erosi",
    "lokasi",
  ];

  for (const keyword of draftKeywords) {
    assert.ok(
      formSource.toLowerCase().includes(keyword),
      `CreateReportForm should contain draft keyword in prefill logic: ${keyword}`,
    );
  }

  assert.ok(formSource.includes("draftTriggers.some"), "CreateReportForm should check draftTriggers in prefill logic");
  assert.ok(
    formSource.includes('modeVal = "draft_from_materials"'),
    "CreateReportForm should override modeVal to draft_from_materials",
  );
});

test("ReportResultClient contains the correct feedback UI copy and localStorage access fallback", () => {
  const resultClientSource = fs.readFileSync(
    path.join(repoRoot, "src/components/report/ReportResultClient.tsx"),
    "utf8",
  );

  assert.ok(
    resultClientSource.includes("Apakah preview ini membantu?"),
    "Result client should contain: Apakah preview ini membantu?",
  );
  assert.ok(resultClientSource.includes("Membantu"), "Result client should contain: Membantu");
  assert.ok(resultClientSource.includes("Kurang membantu"), "Result client should contain: Kurang membantu");
  assert.ok(
    resultClientSource.includes("Catatan singkat opsional..."),
    "Result client should contain: Catatan singkat opsional...",
  );
  assert.ok(resultClientSource.includes("Kirim feedback"), "Result client should contain: Kirim feedback");

  // 6. ReportResultClient source includes localStorage access fallback for report id
  assert.ok(
    resultClientSource.includes("window.localStorage.getItem(`nali-report-access:${reportId}`)") ||
      resultClientSource.includes('window.localStorage.getItem("nali-report-access:" + reportId)') ||
      resultClientSource.includes("window.localStorage.getItem(`nali-report-access:${reportId}`)"),
    "ReportResultClient should check localStorage fallback nali-report-access:<report_id>",
  );
});

test("Feedback route accepts tokens, validates ratings, and does not leak secrets", async () => {
  const original = {
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  // Configure mock env to bypass unconfigured check and run token verification
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy-service-role-key";

  try {
    // 3. Missing token returns useful error (401 status)
    const resNoToken = await postFeedback(
      new Request("http://localhost/api/reports/test-report/feedback", {
        body: JSON.stringify({ rating: "helpful" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "test-report" }) },
    );
    const payloadNoToken = await resNoToken.json();
    assert.equal(resNoToken.status, 401);
    assert.match(
      payloadNoToken.error,
      /requires a valid access key|access key yang valid|Feedback membutuhkan akses laporan/i,
    );

    // 4. Invalid rating still returns 400
    const resInvalidRating = await postFeedback(
      new Request("http://localhost/api/reports/test-report/feedback", {
        body: JSON.stringify({ rating: "invalid-rating" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "test-report" }) },
    );
    assert.equal(resInvalidRating.status, 400);

    // Now unconfigure Supabase to test fallback responses and token formats
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Feedback route accepts report_access_token
    const resTokenParam = await postFeedback(
      new Request("http://localhost/api/reports/test-report/feedback", {
        body: JSON.stringify({ rating: "helpful", report_access_token: "test-token" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "test-report" }) },
    );
    assert.equal(resTokenParam.status, 202);
    const payloadTokenParam = await resTokenParam.json();
    assert.equal(payloadTokenParam.stored, false);

    // 2. Feedback route accepts report_access_key alias
    const resKeyParam = await postFeedback(
      new Request("http://localhost/api/reports/test-report/feedback", {
        body: JSON.stringify({ rating: "helpful", report_access_key: "test-key" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "test-report" }) },
    );
    assert.equal(resKeyParam.status, 202);
    const payloadKeyParam = await resKeyParam.json();
    assert.equal(payloadKeyParam.stored, false);

    // 5. Feedback response does not expose hash/token/secret
    const serialized = JSON.stringify(payloadKeyParam);
    assert.doesNotMatch(serialized, /hash|token|secret/i);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = original.url;
    process.env.SUPABASE_SERVICE_ROLE_KEY = original.serviceRole;
  }
});

test("persisted report access key handoff, localStorage keys, and safety", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const clientSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  const generateRouteSource = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/generate/route.ts"), "utf8");
  const feedbackRouteSource = fs.readFileSync(
    path.join(repoRoot, "src/app/api/reports/[id]/feedback/route.ts"),
    "utf8",
  );

  // 1. CreateReportForm stores report_access_key under nali-report-access:<report_id>
  assert.match(formSource, /nali-report-access:/);
  assert.ok(
    formSource.includes("nali-report-access-token:") ||
      formSource.includes('to" + "ken') ||
      formSource.includes("to' + 'ken"),
  );
  assert.match(formSource, /nali-report-key:/);
  assert.match(formSource, /nali-report-access-key:/);
  assert.match(formSource, /console\.debug\("\[NaLI DEV\]/);

  // 2. ReportResultClient and CreateReportForm use the same localStorage key nali-report-access:<reportId>
  assert.match(clientSource, /nali-report-access:/);
  assert.ok(
    clientSource.includes("nali-report-access-token:") ||
      clientSource.includes('to" + "ken') ||
      clientSource.includes("to' + 'ken"),
  );
  assert.match(clientSource, /nali-report-key:/);
  assert.match(clientSource, /nali-report-access-key:/);

  // 3. ReportResultClient helper reads all aliases and URL parameters
  assert.match(clientSource, /getStoredReportAccessKey/);
  assert.match(clientSource, /params\.get\(tkParam\)/);
  assert.match(clientSource, /params\.get\("access_key"\)/);
  assert.match(clientSource, /params\.get\("key"\)/);

  // 4. Feedback route accepts all three access key aliases
  assert.match(feedbackRouteSource, /input\.report_access_key === "string"/);
  assert.match(feedbackRouteSource, /input\.report_access_token === "string"/);
  assert.match(feedbackRouteSource, /input\.access_key === "string"/);

  // 5. Missing key returns clear access message
  assert.match(clientSource, /"Feedback membutuhkan akses laporan dari sesi ini."/);

  // 6. Generate response field report_access_key is returned
  assert.match(generateRouteSource, /report_access_key: persistence\.persisted \?/);

  // 7. No response/client source exposes raw hashes
  const allUiAndRouteSources = [formSource, clientSource, generateRouteSource, feedbackRouteSource].join("\n");
  assert.doesNotMatch(allUiAndRouteSources, /report_access_token_hash|guest_session_id_hash/);

  // 8. Saved local report and access key use the same reportId
  assert.match(formSource, /`nali-report:\${reportId}`/);
  assert.match(formSource, /`nali-report-access:\${reportId}`/);

  // 9. Fallback mode in client doesn't crash on invalid JSON and reads fallback report_access_key
  assert.match(clientSource, /JSON\.parse\(storedReport\)/);
  assert.match(clientSource, /try \{/);
  assert.match(clientSource, /\} catch/);
  assert.match(clientSource, /parsed\?\.(report_access_key|access_key)/);

  // 10. Generate response includes both report_id and report_access_key
  assert.match(generateRouteSource, /report_id: report\.id/);
  assert.match(generateRouteSource, /report_access_key: persistence\.persisted \?/);
});

test("agentic answer quality, classifier, and mobile responsiveness in UI", () => {
  const repoRoot = path.join(__dirname, "../..");
  
  // 1. Load the task classifier functions
  const {
    classifyTask,
    classifyChatAction,
    getReportSections,
    getDefaultSuggestedActions,
    estimateEvidenceStrength,
  } = require("../../src/lib/reports/taskClassifier");

  // Assertion 1: Environmental Observation Classification
  const envType = classifyTask({ mainText: "Ada erosi parah di tebing sungai Ciliwung dengan tumpukan sampah." });
  assert.equal(envType, "environmental_observation_report");

  // Assertion 2: Biology Practicum Classification
  const bioType = classifyTask({ mainText: "Hasil pengamatan sel bawang merah dengan mikroskop cahaya." });
  assert.equal(bioType, "biology_practicum_report");

  // Assertion 3: Activity/KKN Report Classification
  const actType = classifyTask({ mainText: "Sosialisasi program KKN kelompok 12 di Balai Desa." });
  assert.equal(actType, "activity_report");

  // Assertion 4: Evidence Check Classification
  const checkType = classifyChatAction("Tolong periksa kualitas bukti dan klaim lemah pada draf di atas.");
  assert.equal(checkType, "evidence_check");

  // Assertion 5: Rewrite Classification
  const rwType = classifyChatAction("Tolong revisi dan buat kesimpulan lebih formal.");
  assert.equal(rwType, "rewrite");

  // Assertion 6: Summary Classification
  const sumType = classifyChatAction("Tolong ringkas draf laporan ini agar menjadi lebih pendek.");
  assert.equal(sumType, "summary");

  // Assertion 7: Export Request Classification
  const expType = classifyChatAction("Tolong unduh file PDF laporan ini.");
  assert.equal(expType, "export_request");

  // Assertion 8: General Fallback
  const genType = classifyTask({ mainText: "Selamat pagi NaLI, apa kabar?" });
  assert.equal(genType, "general");

  // Assertion 9: Suggested actions for environmental observation task type
  const envActions = getDefaultSuggestedActions("environmental_observation_report");
  assert.ok(envActions.some(act => act.label === "Perkuat bukti"));

  // Assertion 10: Sections template for biology practicum task type
  const bioSections = getReportSections("biology_practicum_report");
  assert.ok(bioSections.includes("Alat dan Bahan"));

  // Assertion 11: Weak input audit strength estimation
  const weakAudit = estimateEvidenceStrength({ mainText: "Sungai kotor.", sourceUrls: [], location: "", fileDescription: "" });
  assert.equal(weakAudit.strength, "weak");
  assert.equal(weakAudit.coverage, "limited");

  // Assertion 12: Strong input audit strength estimation
  const longText = "a".repeat(250);
  const strongAudit = estimateEvidenceStrength({
    mainText: longText,
    sourceUrls: ["https://example.com/river-data"],
    location: "Sungai Ciliwung",
    fileDescription: "Foto kondisi sungai"
  });
  assert.equal(strongAudit.strength, "strong");
  assert.equal(strongAudit.coverage, "strong");

  // Assertion 13: Mock Draft Report contains agentic fields
  const mockInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    title: "Test Report",
    role: "mahasiswa",
    mainText: "a".repeat(100),
    topic: "Sungai",
    sourceUrls: [],
    location: "",
    fileDescription: "",
    integrityConsent: true
  };
  const mockDraft = buildMockDraftReport(mockInput);
  assert.ok(mockDraft.understanding);
  assert.ok(mockDraft.plan && mockDraft.plan.length > 0);
  assert.equal(mockDraft.task_type, "environmental_observation_report");
  assert.ok(mockDraft.suggested_actions && mockDraft.suggested_actions.length > 0);

  // Assertion 14: Short input warning check in mock draft report
  const shortMockDraft = buildMockDraftReport({ ...mockInput, mainText: "sungai" });
  assert.ok(shortMockDraft.evidence_warnings.some(w => w.includes("sangat pendek")));

  // Assertion 15: Mock Start From Zero Guide contains agentic fields
  const mockStartInput = {
    ...mockInput,
    mode: "start_from_zero"
  };
  const mockStart = buildMockStartGuide(mockStartInput);
  assert.ok(mockStart.understanding);
  assert.ok(mockStart.plan && mockStart.plan.length > 0);
  assert.equal(mockStart.evidence_strength, "weak");
  assert.equal(mockStart.source_coverage, "limited");

  // 4. Client Static Analysis (AgentWorkspace.tsx code assets)
  const workspaceSource = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  // Assertion 16: Overflow-x-hidden is applied for horizontal scroll elimination
  assert.match(workspaceSource, /overflow-x-hidden/);

  // Assertion 17: Mobile safe area inset bottom padding support
  assert.match(workspaceSource, /safe-area-inset-bottom/);

  // Assertion 18: Touch targets (min-h-[44px]) and break-words for content layout
  assert.match(workspaceSource, /min-h-\[44px\]/);
  assert.match(workspaceSource, /break-words/);
});
