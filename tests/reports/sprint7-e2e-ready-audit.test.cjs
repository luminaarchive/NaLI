const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");
const { getPublicAlphaStatus } = require("../../src/lib/system/publicAlphaStatus");
const { generateManualChecklist } = require("../../src/lib/reports/manualFallbackChecklist");

const repoRoot = path.join(__dirname, "../..");

// 1. All critical public routes render (files exist)
test("1. All critical public routes render (files exist)", () => {
  const routes = [
    "src/app/page.tsx",
    "src/app/create-report/page.tsx",
    "src/app/pricing/page.tsx",
    "src/app/field-notes/page.tsx",
    "src/app/learn-report/page.tsx",
    "src/app/(auth)/login/page.tsx",
    "src/app/(auth)/register/page.tsx",
  ];
  for (const route of routes) {
    const fullPath = path.join(repoRoot, route);
    assert.ok(fs.existsSync(fullPath), `Route file should exist: ${route}`);
  }
});

// 2. Header Status link points to /#status
test("2. Header Status link points to /#status", () => {
  const shellPath = path.join(repoRoot, "src/components/ui/PublicAppShell.tsx");
  const code = fs.readFileSync(shellPath, "utf8");
  assert.ok(code.includes('href="/#status"'), "PublicAppShell must link to /#status");
});

// 3. Homepage contains section id=\"status\"
test("3. Homepage contains section id='status'", () => {
  const pagePath = path.join(repoRoot, "src/app/page.tsx");
  const code = fs.readFileSync(pagePath, "utf8");
  assert.ok(code.includes('id="status"'), "Homepage must contain section id='status'");
  assert.ok(code.includes("Status Sistem NaLI"), "Homepage must show Status Sistem heading");
});

// 4. Create-report has action chips
test("4. Create-report has action chips", () => {
  const wsPath = path.join(repoRoot, "src/components/report/AgentWorkspace.tsx");
  const code = fs.readFileSync(wsPath, "utf8");
  
  assert.ok(code.includes("Buat laporan"), "Workspace must contain 'Buat Laporan' action chip text");
  assert.ok(code.includes("Draf jurnal"), "Workspace must contain 'Draf Jurnal' action chip text");
  assert.ok(code.includes("Cek bukti"), "Workspace must contain 'Cek Bukti' action chip text");
  assert.ok(code.includes("Checklist manual"), "Workspace must contain 'Checklist manual' action chip text");
  assert.ok(code.includes("Riwayat lokal"), "Workspace must contain 'Riwayat lokal' action chip text");
  assert.ok(code.includes("More"), "Workspace must contain 'More' action chip text");
});

// 5. Create-report unavailable UX strings exist
test("5. Create-report unavailable UX strings exist", () => {
  const errPath = path.join(repoRoot, "src/lib/errors/publicErrors.ts");
  const errCode = fs.readFileSync(errPath, "utf8");
  assert.ok(errCode.includes("AI engine sedang tidak tersedia. Coba lagi nanti."), "publicErrors must contain unavailable title");
  
  const wsPath = path.join(repoRoot, "src/components/report/AgentWorkspace.tsx");
  const wsCode = fs.readFileSync(wsPath, "utf8");
  assert.ok(wsCode.includes("normalized.category === \"AI_UNAVAILABLE\""), "Workspace must handle AI_UNAVAILABLE state");
});

// 6. Manual fallback checklist exists and is not a generated report
test("6. Manual fallback checklist exists and is not a generated report", () => {
  const checklist = generateManualChecklist("Observasi Vegetasi", "draft_from_materials");
  assert.ok(checklist.title.includes("Checklist Manual"), "Must be labeled Checklist Manual");
  assert.ok(checklist.disclaimer.includes("draft bantuan belajar"), "Must contain public layer disclaimer");
  assert.ok(!checklist.title.includes("DOI"), "Must not generate DOI");
  assert.ok(!checklist.title.includes("peer-reviewed"), "Must not claim peer-reviewed");
});

// 7. Pricing buttons remain disabled/inactive
test("7. Pricing buttons remain disabled/inactive", () => {
  const cardsPath = path.join(repoRoot, "src/components/report/PricingCards.tsx");
  const code = fs.readFileSync(cardsPath, "utf8");
  assert.ok(code.includes("disabled"), "Pricing buttons must have disabled attribute");
  assert.ok(code.includes("Checkout belum aktif di CP1"), "Pricing buttons must state Checkout belum aktif");
});

// 8. Field-notes empty state CTAs route correctly
test("8. Field-notes empty state CTAs route correctly", () => {
  const notesPath = path.join(repoRoot, "src/app/field-notes/page.tsx");
  const code = fs.readFileSync(notesPath, "utf8");
  assert.ok(code.includes('router.push("/create-report")'), "Empty state CTA must route to /create-report");
});

// 9. Learn-report key steps render
test("9. Learn-report key steps render", () => {
  const learnPath = path.join(repoRoot, "src/app/learn-report/page.tsx");
  const code = fs.readFileSync(learnPath, "utf8");
  assert.ok(code.includes("Tangga Kualitas Bukti"), "Learn-report must contain Tangga Kualitas Bukti");
  assert.ok(code.includes("Cara Kerja NaLI"), "Learn-report must contain Cara Kerja NaLI");
  assert.ok(code.includes("Batas Bukti NaLI"), "Learn-report must contain Batas Bukti NaLI");
  assert.ok(code.includes("Yang NaLI Tidak Lakukan"), "Learn-report must contain Yang NaLI Tidak Lakukan");
});

// 10. Forbidden active claims do not exist
test("10. Forbidden active claims do not exist", () => {
  const filesToCheck = [
    "src/components/report/PricingCards.tsx",
    "src/components/ui/PublicAppShell.tsx",
    "src/app/page.tsx",
    "src/app/pricing/page.tsx",
  ];
  
  const forbiddenList = [
    "PDF aktif",
    "Checkout aktif",
    "Pembayaran aktif",
    "Upload aktif",
    "Source verification aktif",
    "peer-reviewed",
    "terindeks",
    "siap publikasi",
    "siap submit",
    "DOI dibuat",
    "jurnal final",
    "published",
    "accepted",
  ];

  for (const relativePath of filesToCheck) {
    const code = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
    for (const forbidden of forbiddenList) {
      // It is allowed if followed by "belum" or if it is inside negative words,
      // but let's assert that there is no positive claim.
      // E.g., we don't want "PDF aktif" as a plain positive substring.
      assert.ok(!code.includes(`${forbidden} `) || code.includes(`belum ${forbidden}`) || code.includes(`tidak ${forbidden}`) || code.includes(`Belum ${forbidden}`) || code.includes("Not ") || code.includes("not "), 
        `File ${relativePath} contains forbidden word context: "${forbidden}"`);
    }
  }
});
