const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");

const repoRoot = path.join(__dirname, "../..");
const migrationPath = path.join(
  repoRoot,
  "supabase/migrations/20260526174926_cp1_report_balance_ledger_persistence.sql",
);

test("report balance migration is additive, RLS protected, and idempotent", () => {
  assert.equal(fs.existsSync(migrationPath), true, "CP1 report balance ledger migration should exist");
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.report_balances/i);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.report_ledger_events/i);
  assert.match(sql, /owner_type\s+TEXT\s+NOT NULL/i);
  assert.match(sql, /owner_id\s+TEXT\s+NOT NULL/i);
  assert.match(sql, /basic_reports_remaining\s+INTEGER\s+NOT NULL\s+DEFAULT\s+0/i);
  assert.match(sql, /pro_reports_remaining\s+INTEGER\s+NOT NULL\s+DEFAULT\s+0/i);
  assert.match(sql, /UNIQUE\s*\(owner_type,\s*owner_id\)/i);
  assert.match(sql, /CHECK\s*\(owner_type\s+IN\s*\('guest',\s*'user',\s*'internal'\)\)/i);
  assert.match(sql, /basic_reports_remaining\s*>=\s*0/i);
  assert.match(sql, /pro_reports_remaining\s*>=\s*0/i);
  assert.match(
    sql,
    /purchase_basic[\s\S]*purchase_pro[\s\S]*purchase_pro_bundle[\s\S]*consume_basic_report[\s\S]*consume_pro_report[\s\S]*refund_report[\s\S]*generation_failed_no_charge[\s\S]*admin_adjustment_internal[\s\S]*test_seed_internal/i,
  );
  assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS idx_report_ledger_events_owner_idempotency/i);
  assert.match(sql, /WHERE idempotency_key IS NOT NULL/i);
  assert.match(sql, /ALTER TABLE public\.report_balances ENABLE ROW LEVEL SECURITY/i);
  assert.match(sql, /ALTER TABLE public\.report_ledger_events ENABLE ROW LEVEL SECURITY/i);
  assert.match(sql, /report_balances_service_role_all[\s\S]*auth\.role\(\)\s*=\s*'service_role'/i);
  assert.match(sql, /report_ledger_events_service_role_all[\s\S]*auth\.role\(\)\s*=\s*'service_role'/i);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.consume_report_balance/i);
  assert.match(sql, /SECURITY INVOKER/i);
  assert.match(sql, /REVOKE EXECUTE ON FUNCTION public\.consume_report_balance[\s\S]*FROM PUBLIC/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.consume_report_balance[\s\S]*TO service_role/i);
});

test("server ledger normalizes owners, defaults safely, consumes exactly once, and records no-charge events", async () => {
  const ledger = require("../../src/lib/billing/reportBalanceLedger");
  const guestOwner = ledger.normalizeReportOwner({ ownerType: "guest", ownerId: "a".repeat(64) });
  assert.deepEqual(guestOwner, { ownerId: "a".repeat(64), ownerType: "guest" });
  assert.equal(ledger.normalizeReportOwner({ ownerType: "guest", ownerId: "raw-cookie-value" }), null);
  assert.equal(ledger.normalizeReportOwner({ ownerType: "internal", ownerId: "qa_token_secret" }), null);

  const unavailable = await ledger.getReportBalance(guestOwner, { store: null });
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.source, "unavailable");
  assert.deepEqual(unavailable.balance, { basicReportsRemaining: 0, proReportsRemaining: 0 });

  const store = ledger.createDeterministicReportLedgerStore();
  const missing = await ledger.getReportBalance(guestOwner, { store });
  assert.equal(missing.ok, true);
  assert.equal(missing.source, "default_zero");
  assert.deepEqual(missing.balance, { basicReportsRemaining: 0, proReportsRemaining: 0 });

  const ensured = await ledger.ensureReportBalance(guestOwner, { store });
  assert.equal(ensured.ok, true);
  assert.deepEqual(ensured.balance, { basicReportsRemaining: 0, proReportsRemaining: 0 });
  assert.equal((await ledger.canConsumeReport(guestOwner, "pro", { store })).allowed, false);

  const seededStore = ledger.createDeterministicReportLedgerStore([
    { owner: guestOwner, balance: { basicReportsRemaining: 1, proReportsRemaining: 2 } },
  ]);
  const first = await ledger.consumeReport(
    guestOwner,
    "pro",
    {
      idempotencyKey: "generate:report-123",
      metadata: { action: "generate_new", authorization: "Bearer secret", reportBody: "private observations" },
      reportId: "report-123",
      reason: "successful_paid_generation",
      source: "test",
    },
    { store: seededStore },
  );
  assert.equal(first.consumed, true);
  assert.equal(first.balanceBefore, 2);
  assert.equal(first.balanceAfter, 1);

  const duplicate = await ledger.consumeReport(
    guestOwner,
    "pro",
    {
      idempotencyKey: "generate:report-123",
      reportId: "report-123",
      reason: "successful_paid_generation",
      source: "test",
    },
    { store: seededStore },
  );
  assert.equal(duplicate.consumed, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal((await ledger.getReportBalance(guestOwner, { store: seededStore })).balance.proReportsRemaining, 1);

  const noCharge = await ledger.recordGenerationFailedNoCharge(
    guestOwner,
    {
      idempotencyKey: "failed:report-124",
      metadata: { blockedBy: "integrity", cookie: "raw-cookie", queryString: "?token=leak" },
      reportId: "report-124",
      reportType: "pro",
      source: "test",
    },
    { store: seededStore },
  );
  assert.equal(noCharge.recorded, true);
  assert.equal((await ledger.getReportBalance(guestOwner, { store: seededStore })).balance.proReportsRemaining, 1);

  const summary = await ledger.getLedgerSummary(guestOwner, { store: seededStore });
  assert.equal(summary.consumedProReports, 1);
  assert.equal(summary.noChargeFailures, 1);
  const serialized = JSON.stringify(summary);
  assert.doesNotMatch(
    serialized,
    /Bearer secret|raw-cookie|private observations|token=leak|authorization|cookie|queryString/i,
  );
});

test("ledger event vocabulary and sanitized metadata never represent internal QA as a paid purchase", () => {
  const ledger = require("../../src/lib/billing/reportBalanceLedger");
  assert.deepEqual(ledger.REPORT_PERSISTED_LEDGER_EVENT_TYPES, [
    "purchase_basic",
    "purchase_pro",
    "purchase_pro_bundle",
    "consume_basic_report",
    "consume_pro_report",
    "refund_report",
    "generation_failed_no_charge",
    "admin_adjustment_internal",
    "test_seed_internal",
  ]);
  assert.deepEqual(
    ledger.sanitizeReportLedgerMetadata({
      action: "regenerate_from_scratch",
      internalQa: true,
      packageId: "pro",
      route: "api_generate",
      token: "secret",
      rawAuthorizationHeader: "Bearer private",
      reportContent: "do not keep",
      result: "zephyr",
    }),
    {
      action: "regenerate_from_scratch",
      internalQa: true,
      packageId: "pro",
      route: "api_generate",
    },
  );
});
