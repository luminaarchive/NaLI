const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");

test("1. Public copy does not claim upload is active", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  assert.ok(formSource.includes("Upload PDF/foto belum aktif"));
});

test("2. Public copy does not claim source verification is active", () => {
  const fileContent = fs.readFileSync(path.join(repoRoot, "src/lib/reports/reportGenerator.ts"), "utf8");
  assert.match(fileContent, /Source verification belum aktif di MVP ini/);
});

test("3. Local image metadata copy includes 'File tidak diupload'", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  assert.ok(formSource.includes("File tidak diupload"));
});

test("4. Metadata copy does not claim photo/evidence verification", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  assert.doesNotMatch(formSource, /foto terverifikasi resmi|bukti terverifikasi resmi/gi);
});

test("5. Local Markdown/TXT copy/download options exist in client UI", () => {
  const clientSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  assert.ok(clientSource.includes("Unduh Markdown lokal"));
  assert.ok(clientSource.includes("Unduh teks lokal"));
  assert.ok(clientSource.includes("Salin teks biasa"));
});

test("6. Public PDF/payment remains locked", () => {
  const clientSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  assert.ok(clientSource.includes("PDF/DOCX publik tetap terkunci / inactive"));
  assert.doesNotMatch(clientSource, /\/api\/payments\/create/);
});

test("7. Pricing/upgrade copy does not claim paid launch active", () => {
  const pricingSource = fs.readFileSync(path.join(repoRoot, "src/app/pricing/page.tsx"), "utf8");
  assert.ok(pricingSource.includes("Pembayaran dan checkout belum aktif"));
});

test("8. Field Intelligence page remains positioning-only", () => {
  const fiSource = fs.readFileSync(path.join(repoRoot, "src/app/field-intelligence/page.tsx"), "utf8");
  assert.ok(fiSource.includes("Concept workflow. Not a fully operational feature in the public MVP."));
  assert.ok(fiSource.includes("Roadmap only"));
});

test("9. Readiness endpoint source preserves inactive upload/source verification", () => {
  const readinessLib = fs.readFileSync(path.join(repoRoot, "src/lib/system/readiness.ts"), "utf8");
  assert.match(readinessLib, /uploadActive:\s*false/);
  assert.match(readinessLib, /sourceVerificationActive:\s*false/);
});

test("10. Model selector copy does not claim paid/pro activation", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  assert.doesNotMatch(formSource, /model pro aktif|model berbayar aktif/gi);
});

test("11. No public navigation links exist for /founder", () => {
  const componentsPath = path.join(repoRoot, "src/components");
  const checkNav = (dir) => {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        checkNav(full);
      } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(item)) {
        const content = fs.readFileSync(full, "utf8");
        assert.doesNotMatch(content, /href=['"]\/founder['"]/);
      }
    }
  };
  checkNav(componentsPath);
});

test("12. No cloud sync or permanent backup claims exist for local snapshots", () => {
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  assert.doesNotMatch(formSource, /cloud sync|backup permanen|guaranteed restore/gi);
});

test("13. No fake source, citation, or DOI encouragement exists in prompts or generators", () => {
  const genSource = fs.readFileSync(path.join(repoRoot, "src/lib/reports/reportGenerator.ts"), "utf8");
  assert.match(genSource, /Do not invent citations, DOI, statistics/);
});

test("14. No Midtrans/payment activation is enabled by default in system configurations", () => {
  const readinessLib = fs.readFileSync(path.join(repoRoot, "src/lib/system/readiness.ts"), "utf8");
  assert.match(readinessLib, /paidCheckoutActive:\s*false/);
  assert.match(readinessLib, /creditPurchaseActive:\s*false/);
  assert.match(readinessLib, /paidExportActive:\s*false/);
});

test("15. No raw provider names or API secrets in public components", () => {
  const appSource = ["src/components/report/CreateReportForm.tsx", "src/components/report/ReportResultClient.tsx"]
    .map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8"))
    .join("\n");
  assert.doesNotMatch(appSource, /OPENROUTER_API_KEY|SUPABASE_SERVICE_ROLE_KEY/);
});
