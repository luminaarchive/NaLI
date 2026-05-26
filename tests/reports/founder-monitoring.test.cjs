require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

// Set up mock env and supabase lookup
const adminModule = require("../../src/lib/supabase/admin");

let mockSelectFn = () => ({ data: null, error: null });

const mockSupabaseClient = {
  from: (table) => {
    return {
      select: (fields, options) => {
        return {
          order: (col, opts) => {
            return {
              then: async (resolve) => {
                const res = await mockSelectFn(table, { col, opts });
                return resolve(res);
              },
            };
          },
          then: async (resolve) => {
            const res = await mockSelectFn(table, {});
            return resolve(res);
          },
        };
      },
    };
  },
};

const originalGetAdmin = adminModule.getOptionalSupabaseAdminClient;
adminModule.getOptionalSupabaseAdminClient = () => mockSupabaseClient;

// Import monitoring helpers
const { getFounderMonitoringData, classifyComment, verifyFounderToken } = require("../../src/lib/system/monitoring");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

test("classifyComment detects all friction themes correctly", () => {
  const c1 = classifyComment("Saya bingung dengan hasil laporan ini, kurang jelas.");
  assert.equal(c1.confusing, true);
  assert.equal(c1.mobile, false);

  const c2 = classifyComment("Tampilan HP rusak, tombol bertumpuk.");
  assert.equal(c2.mobile, true);

  const c3 = classifyComment("Error saat memproses draf, aplikasi crash.");
  assert.equal(c3.bugError, true);

  const c4 = classifyComment("Bagaimana cara ekspor premium? Apakah harus bayar?");
  assert.equal(c4.exportPaymentConfusion, true);

  const c5 = classifyComment("Terlalu banyak permintaan rate limit 429.");
  assert.equal(c5.rateLimit, true);
});

test("verifyFounderToken checks credentials and configuration presence correctly", () => {
  // Backup original env
  const origToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;

  // 1. Missing token env should return console not configured state
  delete process.env.NALI_FOUNDER_ADMIN_TOKEN;
  const resNotConfigured = verifyFounderToken("test");
  assert.equal(resNotConfigured.configured, false);
  assert.equal(resNotConfigured.authorized, false);

  // 2. Incorrect token should be unauthorized
  process.env.NALI_FOUNDER_ADMIN_TOKEN = "super_secret_founder_token";
  try {
    const resWrong = verifyFounderToken("wrong_token");
    assert.equal(resWrong.configured, true);
    assert.equal(resWrong.authorized, false);

    // 3. Correct token should be authorized
    const resCorrect = verifyFounderToken("super_secret_founder_token");
    assert.equal(resCorrect.configured, true);
    assert.equal(resCorrect.authorized, true);
  } finally {
    process.env.NALI_FOUNDER_ADMIN_TOKEN = origToken;
  }
});

test("Monitoring summary and feedback analyzer degrades safely on empty DB", async () => {
  // Empty data returned
  mockSelectFn = (table, query) => {
    return { data: [], error: null };
  };

  const data = await getFounderMonitoringData();
  assert.strictEqual(data.reportsSummary.total, 0);
  assert.strictEqual(data.feedbackSummary.total, 0);
  assert.strictEqual(data.usageSummary.apiLogsCount, 0);
  assert.strictEqual(data.paymentsSummary.total, 0);
  assert.deepEqual(data.premiumEntitlementSummary, {
    internalQaUnlocks: 0,
    invalidEntitlementAttempts: 0,
    lastEventAt: null,
    missingEntitlementAttempts: 0,
    blockedByModel: { obsidian: 0, zephyr: 0 },
    publicPremiumInactiveAttempts: 0,
  });
});

test("Dashboard helper does not leak raw guest sessions, hashes, or env secrets", async () => {
  mockSelectFn = (table, query) => {
    if (table === "reports") {
      return {
        data: [
          {
            id: "report-1",
            guest_session_id_hash: "SECRET_SESSION_HASH_ABC",
            report_access_token_hash: "SECRET_ACCESS_TOKEN_HASH_DEF",
            status: "failed",
            created_at: new Date().toISOString(),
          },
        ],
        error: null,
      };
    }
    return { data: [], error: null };
  };

  const data = await getFounderMonitoringData();
  const serialized = JSON.stringify(data);
  assert.doesNotMatch(serialized, /SECRET_SESSION_HASH/);
  assert.doesNotMatch(serialized, /SECRET_ACCESS_TOKEN/);
});

test("Founder monitoring aggregates premium entitlement decisions without returning event material", async () => {
  mockSelectFn = (table) => {
    if (table === "report_events") {
      return {
        data: [
          {
            created_at: "2026-05-26T08:00:00.000Z",
            event_type: "PREMIUM_ENTITLEMENT_ATTEMPT",
            metadata: {
              decision: "allowed_internal_qa",
              model_id: "zephyr",
              raw_cookie: "DO_NOT_RETURN_RAW_COOKIE",
              token: "DO_NOT_RETURN_TOKEN",
            },
          },
          {
            created_at: "2026-05-26T07:00:00.000Z",
            event_type: "PREMIUM_ENTITLEMENT_ATTEMPT",
            metadata: { decision: "denied_invalid_entitlement", model_id: "obsidian" },
          },
          {
            created_at: "2026-05-26T06:00:00.000Z",
            event_type: "PREMIUM_ENTITLEMENT_ATTEMPT",
            metadata: { decision: "denied_missing_entitlement", model_id: "obsidian" },
          },
          {
            created_at: "2026-05-26T05:00:00.000Z",
            event_type: "PREMIUM_ENTITLEMENT_ATTEMPT",
            metadata: { decision: "denied_public_premium_inactive", model_id: "zephyr" },
          },
        ],
        error: null,
      };
    }
    return { data: [], error: null };
  };

  const data = await getFounderMonitoringData();
  assert.deepEqual(data.premiumEntitlementSummary, {
    internalQaUnlocks: 1,
    invalidEntitlementAttempts: 1,
    lastEventAt: "2026-05-26T08:00:00.000Z",
    missingEntitlementAttempts: 1,
    blockedByModel: { obsidian: 2, zephyr: 1 },
    publicPremiumInactiveAttempts: 1,
  });
  assert.doesNotMatch(JSON.stringify(data), /DO_NOT_RETURN_RAW_COOKIE|DO_NOT_RETURN_TOKEN/);
});

test("Readiness truth preserves Midtrans DEFERRED and Paid Launch NO-GO flags", () => {
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_SERVER_KEY; // Ensure deferred mode

  try {
    const readiness = getSystemReadiness();
    assert.equal(readiness.midtransConfigured, false);
    assert.equal(readiness.paidCheckoutActive, false);
    assert.equal(readiness.creditPurchaseActive, false);
    assert.equal(readiness.exportGateStatus, "prepared_locked");
  } finally {
    process.env.MIDTRANS_SERVER_KEY = prevServerKey;
  }
});

test.after(() => {
  adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
});
