const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

test("Sprint 6B Visual Restructuring - 1. Homepage contains section id='status'", () => {
  const pagePath = path.join(__dirname, "../../src/app/page.tsx");
  const code = fs.readFileSync(pagePath, "utf8");
  assert.ok(code.includes('id="status"'));
  assert.ok(code.includes("Status Sistem NaLI"));
  assert.ok(code.includes("Pembayaran"));
  assert.ok(code.includes("belum aktif"));
});

test("Sprint 6B Visual Restructuring - 2. PublicAppShell footer no longer contains id='status'", () => {
  const shellPath = path.join(__dirname, "../../src/components/ui/PublicAppShell.tsx");
  const code = fs.readFileSync(shellPath, "utf8");
  assert.ok(!code.includes('id="status"'));
  assert.ok(!code.includes('footer className="border-t border-[#f5f0e8]/10 bg-[#1e3525] px-4 py-12 text-[#f5f0e8] sm:px-6" id="status"'));
});

test("Sprint 6B Visual Restructuring - 3. create-report workspace has required sidebar and composer labels", () => {
  const wsPath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const code = fs.readFileSync(wsPath, "utf8");
  
  // Sidebar items
  assert.ok(code.includes("Buat laporan baru"));
  assert.ok(code.includes("Agent"));
  assert.ok(code.includes("Laporan"));
  assert.ok(code.includes("Draf Jurnal"));
  assert.ok(code.includes("Catatan"));
  assert.ok(code.includes("Library"));
  assert.ok(code.includes("Scheduled"));
  assert.ok(code.includes("Projects"));
  assert.ok(code.includes("NaLI"));
  assert.ok(code.includes("Riwayat") && (code.includes("Riwayat lokal") || code.includes("Riwayat akun")));
  
  // Sidebar footer status
  assert.ok(code.includes("Public Alpha"));
  assert.ok(code.includes("PDF locked"));
  assert.ok(code.includes("AI capacity limited"));

  // Centered empty state heading & composer
  assert.ok(code.includes("Apa yang bisa NaLI bantu susun?"));
  assert.ok(code.includes("Tulis tugas, catatan lapangan, atau bahan laporan..."));
  assert.ok(code.includes("Buat laporan"));
  assert.ok(code.includes("Draf jurnal"));
  assert.ok(code.includes("Cek bukti"));
  assert.ok(code.includes("Checklist manual"));
  assert.ok(code.includes("Riwayat lokal"));
  assert.ok(code.includes("More"));
});

test("Sprint 6B Visual Restructuring - 4. pricing page, field-notes and learn-report render light-theme PublicAppShell isHomepage={true}", () => {
  const pricingPath = path.join(__dirname, "../../src/app/pricing/page.tsx");
  const notesPath = path.join(__dirname, "../../src/app/field-notes/page.tsx");
  const learnPath = path.join(__dirname, "../../src/app/learn-report/page.tsx");

  const pricingCode = fs.readFileSync(pricingPath, "utf8");
  const notesCode = fs.readFileSync(notesPath, "utf8");
  const learnCode = fs.readFileSync(learnPath, "utf8");

  assert.ok(pricingCode.includes("PublicAppShell isHomepage={true}"));
  assert.ok(notesCode.includes("PublicAppShell isHomepage={true}"));
  assert.ok(learnCode.includes("PublicAppShell isHomepage={true}"));
});

test("Sprint 6B Visual Restructuring - 5. PricingCards contains required inactive checkout text", () => {
  const cardsPath = path.join(__dirname, "../../src/components/report/PricingCards.tsx");
  const code = fs.readFileSync(cardsPath, "utf8");

  assert.ok(code.includes("Checkout belum aktif"));
  assert.ok(code.includes("PDF ekspor publik belum aktif"));
  assert.ok(code.includes("Paket ini adalah konfigurasi harga, belum bisa dibeli"));
});

test("Sprint 6B Visual Restructuring - 6. No forbidden copy exists", () => {
  const cardsPath = path.join(__dirname, "../../src/components/report/PricingCards.tsx");
  const code = fs.readFileSync(cardsPath, "utf8");

  assert.ok(!code.includes("PDF aktif"));
  assert.ok(!code.includes("Checkout aktif"));
});
