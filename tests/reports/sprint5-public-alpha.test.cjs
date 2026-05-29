const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");

const { generateManualChecklist } = require("../../src/lib/reports/manualFallbackChecklist");
const { getPublicAlphaStatus } = require("../../src/lib/system/publicAlphaStatus");
const { normalizePublicError } = require("../../src/lib/errors/publicErrors");

test("Sprint 5 Public Alpha - 1. Public alpha status exposes correct default state", () => {
  const status = getPublicAlphaStatus();
  assert.equal(status.publicAlpha, true);
  assert.equal(status.paymentStatus, "inactive");
  assert.equal(status.pdfExportStatus, "locked");
  assert.equal(status.uploadStatus, "inactive");
  assert.equal(status.sourceVerificationStatus, "inactive");
  assert.equal(status.journalPdfStatus, "locked");
});

test("Sprint 5 Public Alpha - 2. AI unavailable error maps to AI_UNAVAILABLE category with correct copy", () => {
  const normalized = normalizePublicError({
    status: 503,
    code: "AI_ENGINE_UNAVAILABLE",
  });
  assert.equal(normalized.category, "AI_UNAVAILABLE");
  assert.equal(normalized.title, "AI engine sedang tidak tersedia. Coba lagi nanti.");
  assert.equal(normalized.explanation.includes("Draf tidak dibuat agar NaLI tidak menampilkan laporan palsu"), true);
});

test("Sprint 5 Public Alpha - 3. Manual fallback checklist generates checklist correctly and does not include fake reference/DOI or mark journalReady", () => {
  const checklist = generateManualChecklist("Laporan Observasi Lingkungan", "draft_from_materials");
  assert.ok(checklist.title.includes("Checklist Manual"));
  assert.ok(checklist.items.length > 0);
  assert.ok(checklist.suggestedOutline.length > 0);
  assert.ok(checklist.disclaimer.includes("wajib memeriksa, mengedit, memverifikasi sumber"));
  assert.ok(!checklist.disclaimer.includes("DOI dibuat"));
  assert.ok(!checklist.disclaimer.includes("siap publikasi"));
  
  // Verify it contains IMRaD for journals
  const journalChecklist = generateManualChecklist("Laporan Observasi Lingkungan Jurnal", "start_from_zero");
  assert.ok(journalChecklist.suggestedOutline.includes("Title Page & Abstract"));
});

test("Sprint 5 Public Alpha - 4. Workspace components contain the four required actions", () => {
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  
  const wsCode = fs.readFileSync(workspacePath, "utf8");
  const formCode = fs.readFileSync(formPath, "utf8");
  
  // Verify workspace has buttons for all four actions in UI
  assert.ok(wsCode.includes("Coba Lagi"));
  assert.ok(wsCode.includes("Simpan Draf Lokal"));
  assert.ok(wsCode.includes("Lihat Checklist Manual"));
  assert.ok(wsCode.includes("Kembali ke Form"));
  
  // Verify form has buttons for all four actions in UI
  assert.ok(formCode.includes("Coba Lagi"));
  assert.ok(formCode.includes("Simpan Draf Lokal"));
  assert.ok(formCode.includes("Lihat Checklist Manual"));
  assert.ok(formCode.includes("Kembali ke Form"));
});

test("Sprint 5 Public Alpha - 5. Pricing copy contains inactive checkout info", () => {
  const pricingCardsPath = path.join(__dirname, "../../src/components/report/PricingCards.tsx");
  const pricingCardsCode = fs.readFileSync(pricingCardsPath, "utf8");
  
  assert.ok(pricingCardsCode.includes("Checkout belum aktif"));
  assert.ok(pricingCardsCode.includes("PDF ekspor publik belum aktif"));
  assert.ok(pricingCardsCode.includes("Paket ini adalah konfigurasi harga, belum bisa dibeli"));
});

test("Sprint 5 Public Alpha - 6. PDF export, upload, source verification, and paid checkout are locked/inactive by default", () => {
  const status = getPublicAlphaStatus();
  assert.equal(status.pdfExportStatus, "locked");
  assert.equal(status.uploadStatus, "inactive");
  assert.equal(status.sourceVerificationStatus, "inactive");
  assert.equal(status.paymentStatus, "inactive");
});

test("Sprint 5 Public Alpha - 7. No forbidden copy exists directly in the page codes", () => {
  const pricingCardsPath = path.join(__dirname, "../../src/components/report/PricingCards.tsx");
  const pricingCardsCode = fs.readFileSync(pricingCardsPath, "utf8");
  
  // Check that forbidden phrases like "PDF aktif" or "siap publikasi" are not present, or only in negation contexts.
  assert.ok(!pricingCardsCode.includes("PDF ekspor publik aktif"));
  assert.ok(!pricingCardsCode.includes("siap publikasi"));
});
