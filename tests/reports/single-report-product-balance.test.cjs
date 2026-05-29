const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");
process.env.NALI_ALLOW_MOCK_GENERATION = "true";
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");
const { REPORT_PACKAGES } = require("../../src/lib/billing/reportPackages");
const {
  REPORT_LEDGER_EVENT_TYPES,
  consumeReportForAction,
  evaluateReportGenerationAccess,
  getSafeDefaultReportBalance,
} = require("../../src/lib/billing/reportBalances");

const repoRoot = path.join(__dirname, "../..");
const basePayload = {
  guestSessionId: "guest-single-report-product-test",
  integrityConsent: true,
  mainText: "Saya mengamati warna air dan vegetasi tepian di area kampus.",
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
};

test("CP1 config offers inactive report packages with Laporan as the public unit", () => {
  assert.deepEqual(
    REPORT_PACKAGES.map((pack) => ({
      id: pack.id,
      internalEngine: pack.internalEngine,
      label: pack.label,
      priceIdr: pack.priceIdr,
      publicCopy: pack.publicCopy,
      reportsIncluded: pack.reportsIncluded,
      reportType: pack.reportType,
    })),
    [
      {
        id: "basic",
        internalEngine: "basic_report_engine",
        label: "Basic",
        priceIdr: 15000,
        publicCopy: "5 laporan cepat",
        reportsIncluded: 5,
        reportType: "basic",
      },
      {
        id: "pro",
        internalEngine: "pro_report_engine",
        label: "Pro",
        priceIdr: 49000,
        publicCopy: "5 laporan lengkap",
        reportsIncluded: 5,
        reportType: "pro",
      },
      {
        id: "pro_bundle",
        internalEngine: "pro_report_engine",
        label: "Pro Bundle",
        priceIdr: 89000,
        publicCopy: "10 laporan lengkap",
        reportsIncluded: 10,
        reportType: "pro",
      },
    ],
  );
  assert.ok(REPORT_PACKAGES.every((pack) => pack.paymentActive === false));
});

test("report balances never grant a paid report by default and charge only a successful fresh paid generation", () => {
  const empty = getSafeDefaultReportBalance();
  assert.deepEqual(empty, {
    basicReportsRemaining: 0,
    paidBalanceVerified: false,
    proReportsRemaining: 0,
  });

  const starter = evaluateReportGenerationAccess({ reportType: "starter_free" });
  assert.equal(starter.allowed, true);
  assert.equal(starter.reason, "starter_free_report_available_rate_limited");
  assert.equal(starter.requiresPurchase, false);

  for (const reportType of ["basic", "pro"]) {
    const paid = evaluateReportGenerationAccess({ reportType });
    assert.equal(paid.allowed, false);
    assert.equal(paid.reason, "paid_report_balance_unavailable");
    assert.equal(paid.reportsRemaining, 0);
    assert.equal(paid.requiresPurchase, true);
  }

  const verified = {
    basicReportsRemaining: 1,
    paidBalanceVerified: true,
    proReportsRemaining: 2,
  };
  const regenerated = consumeReportForAction({
    action: "regenerate_from_scratch",
    balance: verified,
    generationSucceeded: true,
    reportType: "pro",
  });
  assert.equal(regenerated.consumed, true);
  assert.equal(regenerated.balance.proReportsRemaining, 1);
  assert.equal(regenerated.ledgerEvent, "consume_pro_report");

  for (const action of ["manual_edit", "copy_existing", "download_existing"]) {
    const unchanged = consumeReportForAction({
      action,
      balance: verified,
      generationSucceeded: true,
      reportType: "pro",
    });
    assert.equal(unchanged.consumed, false);
    assert.deepEqual(unchanged.balance, verified);
  }

  const failed = consumeReportForAction({
    action: "generate_new",
    balance: verified,
    generationSucceeded: false,
    reportType: "basic",
  });
  assert.equal(failed.consumed, false);
  assert.equal(failed.ledgerEvent, "generation_failed_no_charge");
  assert.deepEqual(failed.balance, verified);
  assert.deepEqual(REPORT_LEDGER_EVENT_TYPES, [
    "purchase_basic",
    "purchase_pro",
    "purchase_pro_bundle",
    "consume_basic_report",
    "consume_pro_report",
    "refund_report",
    "generation_failed_no_charge",
  ]);
});

test("public generation is a neutral starter report and client engine hints cannot unlock paid routing", async () => {
  const starterResponse = await postGenerate(
    new Request("http://localhost/api/reports/generate", {
      body: JSON.stringify(basePayload),
      method: "POST",
    }),
  );
  assert.equal(starterResponse.status, 200);
  const starterBody = await starterResponse.json();
  assert.equal(starterBody.report.model_used, "NaLI Starter Report");

  const hiddenEngineResponse = await postGenerate(
    new Request("http://localhost/api/reports/generate", {
      body: JSON.stringify({
        ...basePayload,
        guestSessionId: "guest-engine-injection-test",
        internalEngine: "pro_report_engine",
        model: "zephyr",
      }),
      method: "POST",
    }),
  );
  assert.equal(hiddenEngineResponse.status, 200);
  assert.equal((await hiddenEngineResponse.json()).report.model_used, "NaLI Starter Report");

  const lockedPaidType = await postGenerate(
    new Request("http://localhost/api/reports/generate", {
      body: JSON.stringify({ ...basePayload, guestSessionId: "guest-no-report-balance", reportType: "pro" }),
      method: "POST",
    }),
  );
  assert.equal(lockedPaidType.status, 403);
  const lockedBody = await lockedPaidType.json();
  assert.equal(lockedBody.code, "REPORT_BALANCE_REQUIRED");
  assert.equal(lockedBody.reportAccess.requiresPurchase, true);
  assert.equal(lockedBody.reason, "laporan_habis");
  assert.equal(lockedBody.paymentActivation, "disabled");
  assert.doesNotMatch(JSON.stringify(lockedBody), /midtrans|checkout_url|snap_token|secret|service_role/i);

  const route = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/generate/route.ts"), "utf8");
  assert.match(route, /getReportBalance/);
  assert.match(route, /normalizeReportOwner/);
  assert.doesNotMatch(route, /consumeReport\(|recordPurchaseLedgerEvent\(/);
});

test("normal public screens hide internal model names, credits, and active payment actions", () => {
  const publicFiles = ["src/components/report/AgentWorkspace.tsx", "src/components/report/CreateReportForm.tsx"].map(
    (file) => fs.readFileSync(path.join(repoRoot, file), "utf8"),
  );
  const pricing = fs.readFileSync(path.join(repoRoot, "src/components/report/PricingCards.tsx"), "utf8");
  const results = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  const combinedPublicComposer = publicFiles.join("\n");

  assert.doesNotMatch(combinedPublicComposer, /Peregrine|Obsidian|Zephyr|Haiku|Sonnet|naliModels|selectedModel/);
  assert.doesNotMatch(combinedPublicComposer, /Kredit|credits|Credit/);
  assert.match(combinedPublicComposer, /Buat Laporan/);
  assert.match(pricing, /REPORT_PACKAGES\.map/);
  assert.match(pricing, /reportPackage\.publicCopy/);
  assert.match(pricing, /Pembayaran dan checkout belum aktif di CP1/);
  assert.doesNotMatch(pricing + results + combinedPublicComposer, /fetch\(["']\/api\/payments\/create/);
});

test("editing an existing public report is not wired to legacy credit consumption", () => {
  const chatRoute = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/chat/route.ts"), "utf8");
  assert.doesNotMatch(chatRoute, /getEnergyBalance|getEstimatedCreditCostFromQuery|recordEnergyLedgerEntry/);
});

test("readiness exposes report architecture while payment, premium, upload, and export stay inactive", async () => {
  const response = await getReadiness();
  const body = await response.json();

  assert.equal(body.singleReportProduct, "enabled");
  assert.equal(body.reportPackagesConfigured, true);
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
});
