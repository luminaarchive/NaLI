const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");

const repoRoot = path.join(__dirname, "../..");

function read(file) {
  return fs.readFileSync(path.join(repoRoot, file), "utf8");
}

test("homepage is a NaLI-original minimal report launcher without public engines or active dormant claims", () => {
  const page = read("src/app/page.tsx");
  const queryBox = read("src/components/report/HomeQueryBox.tsx");
  const shell = read("src/components/ui/PublicAppShell.tsx");
  const combined = `${page}\n${queryBox}\n${shell}`;

  assert.match(page, /Mau bikin laporan apa\?/);
  assert.match(page, /batas bukti/i);
  assert.match(queryBox, /Tulis topik laporanmu/);
  assert.match(queryBox, /Buat Laporan/);
  assert.match(combined, /Laporan Observasi/);
  assert.match(combined, /Praktikum Biologi/);
  assert.match(combined, /Laporan KKN/);
  assert.match(combined, /Cek Batas Bukti/);
  assert.match(combined, /CP1: pembayaran belum aktif/);
  assert.match(combined, /Upload belum aktif/);
  assert.match(combined, /Source verification belum aktif/);
  assert.doesNotMatch(combined, /Peregrine|Obsidian|Zephyr|Haiku|Sonnet|Kredit|credits/i);
  assert.doesNotMatch(
    combined,
    /payment aktif|checkout aktif|upload aktif|source verification aktif|Download PDF|Download DOCX/i,
  );
  assert.doesNotMatch(page, /CodexProductPreview|CodexFeatureShowcase|FluidVideoBackground|NaLIIconTile/);
  assert.match(shell, /Buat Laporan/);
  assert.match(shell, /Harga/);
  assert.match(shell, /Panduan/);
  assert.match(shell, /Status/);
  assert.match(shell, /\/#status/);
  assert.doesNotMatch(shell, /href="\/system"/);
  assert.match(shell, /Integritas Akademik/);
  assert.match(shell, /function FooterGroup[\s\S]*min-h-\[44px\]/);
});

test("pricing and create-report keep Laporan language, inactive actions, and mobile-sized controls", () => {
  const pricing = read("src/app/pricing/page.tsx");
  const cards = read("src/components/report/PricingCards.tsx");
  const workspace = read("src/components/report/AgentWorkspace.tsx");
  const publicCopy = `${pricing}\n${cards}\n${workspace}`;

  assert.match(cards, /reportPackage\.publicCopy/);
  assert.match(cards, /Belum aktif/);
  assert.match(cards, /disabled/);
  assert.match(cards, /Pembayaran dan checkout belum aktif di CP1/);
  assert.match(workspace, /Buat Laporan/);
  assert.match(workspace, /jalur starter gratis/i);
  assert.match(publicCopy, /min-h-\[44px\]|h-11/);
  assert.doesNotMatch(
    publicCopy,
    /Peregrine|Obsidian|Zephyr|Haiku|Sonnet|Kredit|credits|fetch\(["']\/api\/payments\/create/i,
  );
});

test("readiness exposes ledger and app-shell preparation while every activation remains disabled", async () => {
  const response = await getReadiness();
  const body = await response.json();
  const serialized = JSON.stringify(body);

  assert.equal(body.singleReportProduct, "enabled");
  assert.equal(body.reportBalanceArchitecture, "enabled");
  assert.ok(["configured", "unavailable"].includes(body.reportBalancePersistence));
  assert.equal(body.reportLedger, "enabled");
  assert.equal(body.idempotencyProtection, "enabled");
  assert.equal(body.minimalLandingRefresh, "enabled");
  assert.equal(body.appShell, "enabled");
  assert.equal(body.paymentActivation, "disabled");
  assert.equal(body.publicPremiumActivation, "disabled");
  assert.equal(body.midtrans, "deferred_inactive");
  assert.equal(body.publicExport, "locked_inactive");
  assert.equal(body.uploadApi, "inactive_blocked");
  assert.equal(body.sourceVerification, "inactive");
  assert.doesNotMatch(
    serialized,
    /SERVICE_ROLE|founder.*token|internal.*token|ownerId|owner_id|ledgerEvents|ledger_events/i,
  );
});
