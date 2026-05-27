const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");
const { evaluateIntegrityPolicy } = require("../../src/lib/integrity/policy");
const { evaluateModelEntitlement } = require("../../src/lib/entitlements/modelEntitlements");
const { evaluateReportGenerationAccess } = require("../../src/lib/billing/reportBalances");
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");

const repoRoot = path.join(__dirname, "../..");

// 1. EMPTY_DRAFT_MATERIAL check
test("1. Empty draft material query is blocked by EMPTY_DRAFT_MATERIAL", () => {
  const result = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "",
    notes: "",
    topic: "",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "EMPTY_DRAFT_MATERIAL");
  assert.match(result.userMessage, /minimal satu bahan/);
});

// 2. DO_MY_WORK task replacement 'kerjakan tugas saya'
test("2. Assignment-cheating intent 'kerjakan tugas saya' is blocked by DO_MY_WORK", () => {
  const result = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Saya ingin Anda kerjakan tugas saya secara lengkap.",
    notes: "KKN",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "DO_MY_WORK");
  assert.match(result.userMessage, /tidak bisa mengerjakan tugas/);
});

// 3. DO_MY_WORK 'do my homework' English intent
test("3. Homework intent 'do my homework' is blocked by DO_MY_WORK", () => {
  const result = evaluateIntegrityPolicy({
    mode: "start_from_zero",
    topic: "write my homework for me please",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "DO_MY_WORK");
});

// 4. FINAL_ASSIGNMENT_WITHOUT_MATERIAL thesis generator block
test("4. Skripsi/thesis generation without materials is blocked by FINAL_ASSIGNMENT_WITHOUT_MATERIAL", () => {
  const result = evaluateIntegrityPolicy({
    mode: "start_from_zero",
    topic: "Buatkan skripsi langsung jadi bab 1 sampai bab 5",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FINAL_ASSIGNMENT_WITHOUT_MATERIAL");
  assert.match(result.userMessage, /tidak membuat karya akademik final/);
});

// 5. FAKE_CITATION_REQUEST block
test("5. Fake reference/citation creation is blocked by FAKE_CITATION_REQUEST", () => {
  const result = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Tolong buatkan referensi palsu atau fiktif yang terlihat ilmiah dengan DOI.",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FAKE_CITATION_REQUEST");
  assert.match(result.userMessage, /tidak bisa membuat data atau sitasi palsu/);
});

// 6. FAKE_DATA_REQUEST block
test("6. Fake data/field observation fabrication is blocked by FAKE_DATA_REQUEST", () => {
  const result = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Karang data observasi lapangan dan koordinat fiktif untuk sungai ini.",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "FAKE_DATA_REQUEST");
  assert.match(result.userMessage, /tidak bisa membuat data, statistik, koordinat/);
});

// 7. PLAGIARISM_EVASION turnitin bypass block
test("7. AI detector turnitin evasion is blocked by PLAGIARISM_EVASION", () => {
  const result = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Parafrase dokumen ini supaya lolos Turnitin dan tidak ketahuan AI detector.",
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reasonCode, "PLAGIARISM_EVASION");
  assert.match(result.userMessage, /tidak dapat membantu menyamarkan plagiarisme/);
});

// 8. Starter free entitlement checks
test("8. Starter free mode passes the entitlement gate", () => {
  const modelEnt = evaluateModelEntitlement("peregrine");
  assert.equal(modelEnt.allowed, true);
  assert.equal(modelEnt.entitlementStatus, "starter_available");

  const reportAccess = evaluateReportGenerationAccess({
    reportType: "starter_free",
  });
  assert.equal(reportAccess.allowed, true);
  assert.equal(reportAccess.requiresPurchase, false);
});

// 9. Premium model request block
test("9. Direct API request for premium model without QA token returns 403", async () => {
  const response = await postGenerate(
    new Request("http://localhost/api/reports/generate", {
      body: JSON.stringify({
        guestSessionId: "test-guest-id",
        integrityConsent: true,
        mainText: "Ini adalah catatan pengamatan jenis vegetasi di lereng gunung.",
        mode: "draft_from_materials",
        reportTemplate: "Observasi Lingkungan",
        selectedModel: "obsidian",
      }),
      method: "POST",
    }),
  );
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.equal(body.code, "MODEL_ENTITLEMENT_REQUIRED");
});

// 10. Paid report type basic/pro block
test("10. Direct API request for paid report type basic/pro returns 403 PUBLIC_PAID_GENERATION_INACTIVE", async () => {
  const response = await postGenerate(
    new Request("http://localhost/api/reports/generate", {
      body: JSON.stringify({
        guestSessionId: "test-guest-id",
        integrityConsent: true,
        mainText: "Ini adalah catatan pengamatan jenis vegetasi di lereng gunung.",
        mode: "draft_from_materials",
        reportTemplate: "Observasi Lingkungan",
        reportType: "pro",
      }),
      method: "POST",
    }),
  );
  assert.equal(response.status, 403);
  const body = await response.json();
  assert.ok(body.code === "PUBLIC_PAID_GENERATION_INACTIVE" || body.code === "REPORT_BALANCE_REQUIRED");
  assert.match(body.error, /Paket Laporan belum aktif|Laporan kamu habis/);
});
