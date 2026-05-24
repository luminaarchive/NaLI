const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");
const {
  computeReportQualityMemory,
  sanitizeForQualityMemory,
} = require("../../src/lib/quality/reportQualityMemory");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

// ─── Helper: build a minimal FounderMonitoringData shape ─────────────────────

function emptyMonitoringData() {
  return {
    readiness: getSystemReadiness(),
    reportsSummary: {
      total: 0,
      draftFromMaterialsCount: 0,
      startFromZeroCount: 0,
      failedCount: 0,
      createdToday: 0,
      createdLast7Days: 0,
      failureStages: {},
      evidenceStrength: {},
      recentFailures: [],
    },
    feedbackSummary: {
      total: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      keywords: {
        confusing: 0,
        mobile: 0,
        outputNotUseful: 0,
        evidenceUnclear: 0,
        exportPaymentConfusion: 0,
        bugError: 0,
        rateLimit: 0,
      },
      latestComments: [],
    },
    usageSummary: {
      apiLogsCount: 0,
      successApiLogsCount: 0,
      failedApiLogsCount: 0,
      totalCostUsd: 0,
      recentApiLogs: [],
      rateLimitsCount: 0,
      activeRateLimits: [],
    },
    paymentsSummary: {
      total: 0,
      paidCount: 0,
      pendingCount: 0,
      totalAmountIdr: 0,
    },
  };
}

// ─── Test 1: Empty input → safe empty state ──────────────────────────────────

test("empty monitoring data returns safe empty quality memory state", () => {
  const data = emptyMonitoringData();
  const result = computeReportQualityMemory(data);

  assert.strictEqual(result.qualityScore, -1, "empty data should produce score -1");
  assert.strictEqual(result.riskLevel, "none");
  assert.deepStrictEqual(result.themes, []);
  assert.strictEqual(result.weakEvidenceCount, 0);
  assert.strictEqual(result.strongEvidenceCount, 0);
  assert.strictEqual(result.totalReportsScored, 0);
  assert.deepStrictEqual(result.attentionQueue, []);
  assert.deepStrictEqual(result.suggestedFixes, []);
  assert.strictEqual(result.safeSummary, "No quality memory signals collected yet.");
});

// ─── Test 2: Weak evidence → lower score ─────────────────────────────────────

test("weak evidence and missing evidence produces lower quality score", () => {
  const data = emptyMonitoringData();
  data.reportsSummary.total = 10;
  data.reportsSummary.draftFromMaterialsCount = 10;
  data.reportsSummary.evidenceStrength = { weak: 7, medium: 2, strong: 1 };

  const result = computeReportQualityMemory(data);

  assert.ok(result.qualityScore >= 0, "score should be non-negative");
  assert.ok(result.qualityScore < 80, "score should be lower than 80 with mostly weak evidence");
  assert.strictEqual(result.weakEvidenceCount, 7);
  assert.strictEqual(result.strongEvidenceCount, 1);
  assert.ok(result.attentionQueue.some((a) => a.title.toLowerCase().includes("weak")), "attention queue should flag weak evidence");
});

// ─── Test 3: Strong metadata → higher score ──────────────────────────────────

test("strong report metadata produces higher quality score", () => {
  const data = emptyMonitoringData();
  data.reportsSummary.total = 20;
  data.reportsSummary.draftFromMaterialsCount = 18;
  data.reportsSummary.startFromZeroCount = 2;
  data.reportsSummary.failedCount = 0;
  data.reportsSummary.evidenceStrength = { strong: 15, medium: 5 };
  data.feedbackSummary.total = 10;
  data.feedbackSummary.helpfulCount = 9;
  data.feedbackSummary.notHelpfulCount = 1;
  data.usageSummary.apiLogsCount = 20;
  data.usageSummary.successApiLogsCount = 20;

  const result = computeReportQualityMemory(data);

  assert.ok(result.qualityScore >= 75, `score should be >= 75, got ${result.qualityScore}`);
  assert.strictEqual(result.weakEvidenceCount, 0);
  assert.strictEqual(result.strongEvidenceCount, 15);
});

// ─── Test 4: Feedback maps to deterministic themes ───────────────────────────

test("feedback text maps to deterministic themes without LLM", () => {
  const data = emptyMonitoringData();
  data.reportsSummary.total = 5;
  data.feedbackSummary.total = 6;
  data.feedbackSummary.helpfulCount = 2;
  data.feedbackSummary.notHelpfulCount = 4;
  data.feedbackSummary.keywords = {
    confusing: 3,
    mobile: 2,
    outputNotUseful: 1,
    evidenceUnclear: 0,
    exportPaymentConfusion: 1,
    bugError: 0,
    rateLimit: 0,
  };

  const result = computeReportQualityMemory(data);

  assert.ok(result.themes.length > 0, "themes should be populated");
  assert.ok(result.themes.some((t) => t.key === "confusing"), "confusing theme should be present");
  assert.ok(result.themes.some((t) => t.key === "mobile"), "mobile theme should be present");
  assert.ok(result.themes.some((t) => t.key === "exportPaymentConfusion"), "export theme should be present");

  // Verify themes have valid severity labels
  for (const theme of result.themes) {
    assert.ok(["P0", "P1", "P2", "P3", "none"].includes(theme.severity), `invalid severity: ${theme.severity}`);
    assert.ok(theme.count > 0, `theme ${theme.key} should have count > 0`);
    assert.ok(theme.label.length > 0, `theme ${theme.key} should have a label`);
  }
});

// ─── Test 5: sanitizeForQualityMemory strips secrets ─────────────────────────

test("sanitizeForQualityMemory removes secrets and sensitive data", () => {
  // API keys
  const s1 = sanitizeForQualityMemory("Error with key sk-12345abcdefghijklmnopqrstuvwxyz67890");
  assert.doesNotMatch(s1, /sk-12345/);
  assert.match(s1, /\[REDACTED\]/);

  // Long hashes (access keys, SHA-256) — use pure hex that won't match sk- pattern
  const longHash = "deadbeef".repeat(8); // 64 hex chars
  const s2 = sanitizeForQualityMemory(`Value: ${longHash}`);
  assert.doesNotMatch(s2, new RegExp(longHash));
  assert.match(s2, /\[HASH\]/);

  // Local paths
  const s3 = sanitizeForQualityMemory("File at /Users/macintosh/Documents/NaLI/src/lib/foo.ts");
  assert.doesNotMatch(s3, /\/Users\/macintosh/);
  assert.match(s3, /\[PATH\]/);

  // Provider names
  const s4 = sanitizeForQualityMemory("openrouter API failed; supabase timeout");
  assert.doesNotMatch(s4, /openrouter/i);
  assert.doesNotMatch(s4, /supabase/i);
  assert.match(s4, /\[PROVIDER\]/);

  // guest_session_id pattern
  const s5 = sanitizeForQualityMemory("guest_session_id=abc123-secret-value");
  assert.doesNotMatch(s5, /abc123-secret-value/);
});

// ─── Test 6: No raw tokens/hashes in output ──────────────────────────────────

test("quality memory output contains no raw access tokens or hashes", () => {
  const data = emptyMonitoringData();
  data.reportsSummary.total = 3;
  data.reportsSummary.failedCount = 1;
  data.reportsSummary.recentFailures = [
    {
      id: "rpt-12345678",
      failure_reason: "openrouter API key sk-testabcdefghijklmnopqrstuvwxyz99 expired",
      failure_stage: "ai_generation",
      created_at: new Date().toISOString(),
    },
  ];

  const result = computeReportQualityMemory(data);
  const serialized = JSON.stringify(result);

  // No API key patterns
  assert.doesNotMatch(serialized, /sk-test/i, "output should not contain API keys");
  // No raw hash patterns (40+ hex chars)
  assert.doesNotMatch(serialized, /[a-f0-9]{40}/i, "output should not contain long hashes");
  // No access token field leakage
  assert.doesNotMatch(serialized, /guest_session_id/i);
  assert.doesNotMatch(serialized, /access_key/i);
});

// ─── Test 7: P0/P1/P2/P3 severity classification ────────────────────────────

test("risk level classification works for P0 through P3 and none", () => {
  // P1: High failure rate
  const dataP1 = emptyMonitoringData();
  dataP1.reportsSummary.total = 10;
  dataP1.reportsSummary.failedCount = 5;
  const resultP1 = computeReportQualityMemory(dataP1);
  assert.strictEqual(resultP1.riskLevel, "P1", "50% failure rate should be P1");

  // P2: multiple confusing feedback
  const dataP2 = emptyMonitoringData();
  dataP2.reportsSummary.total = 10;
  dataP2.feedbackSummary.total = 5;
  dataP2.feedbackSummary.keywords.confusing = 3;
  const resultP2 = computeReportQualityMemory(dataP2);
  assert.strictEqual(resultP2.riskLevel, "P2", "multiple confusing feedback should be P2");

  // P3: rate limit friction
  const dataP3 = emptyMonitoringData();
  dataP3.reportsSummary.total = 10;
  dataP3.feedbackSummary.total = 3;
  dataP3.feedbackSummary.keywords.rateLimit = 1;
  const resultP3 = computeReportQualityMemory(dataP3);
  assert.strictEqual(resultP3.riskLevel, "P3", "rate limit signals should be P3");

  // none: healthy data
  const dataNone = emptyMonitoringData();
  dataNone.reportsSummary.total = 10;
  dataNone.feedbackSummary.total = 5;
  dataNone.feedbackSummary.helpfulCount = 5;
  const resultNone = computeReportQualityMemory(dataNone);
  assert.strictEqual(resultNone.riskLevel, "none", "healthy data should be none");
});

// ─── Test 8: Empty database → safe founder summary ───────────────────────────

test("founder monitoring summary handles empty database safely", () => {
  const data = emptyMonitoringData();
  const result = computeReportQualityMemory(data);

  assert.strictEqual(result.safeSummary, "No quality memory signals collected yet.");
  assert.deepStrictEqual(result.attentionQueue, []);
  assert.deepStrictEqual(result.suggestedFixes, []);
  assert.strictEqual(result.qualityScore, -1);
});

// ─── Test 9: System readiness unchanged ──────────────────────────────────────

test("Midtrans deferred and paid launch no-go remain unchanged", () => {
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_SERVER_KEY;

  try {
    const readiness = getSystemReadiness();
    assert.strictEqual(readiness.midtransConfigured, false);
    assert.strictEqual(readiness.paidCheckoutActive, false);
    assert.strictEqual(readiness.creditPurchaseActive, false);
    assert.strictEqual(readiness.exportGateStatus, "prepared_locked");
  } finally {
    process.env.MIDTRANS_SERVER_KEY = prevServerKey;
  }
});

// ─── Test 10: No public nav exposes /founder ─────────────────────────────────

test("no public navigation component links to /founder", () => {
  const componentsDir = path.join(__dirname, "../../src/components");
  const appDir = path.join(__dirname, "../../src/app");

  // Search public components for /founder links
  function searchDir(dir) {
    if (!fs.existsSync(dir)) return [];
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip the founder directory itself
        if (entry.name === "founder") continue;
        results.push(...searchDir(full));
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        const content = fs.readFileSync(full, "utf8");
        // Look for href="/founder" or Link to="/founder" in non-founder files
        if (
          (content.includes('href="/founder"') || content.includes('to="/founder"')) &&
          !full.includes("/founder/")
        ) {
          results.push(full);
        }
      }
    }
    return results;
  }

  const publicLinks = [...searchDir(componentsDir), ...searchDir(appDir)];
  assert.strictEqual(
    publicLinks.length,
    0,
    `Found public nav links to /founder in: ${publicLinks.join(", ")}`
  );
});

// ─── Test 11: Suggested fixes are deterministic and consistent ───────────────

test("suggested fixes respond deterministically to data patterns", () => {
  const data = emptyMonitoringData();
  data.reportsSummary.total = 20;
  data.reportsSummary.failedCount = 5;
  data.reportsSummary.failureStages = { ai_generation: 3, validation: 2 };
  data.reportsSummary.evidenceStrength = { weak: 10, medium: 5, strong: 5 };
  data.feedbackSummary.total = 8;
  data.feedbackSummary.helpfulCount = 3;
  data.feedbackSummary.notHelpfulCount = 5;
  data.feedbackSummary.keywords.outputNotUseful = 3;
  data.feedbackSummary.keywords.evidenceUnclear = 2;

  const result = computeReportQualityMemory(data);

  assert.ok(result.suggestedFixes.length >= 2, "should have multiple fix suggestions");
  assert.ok(
    result.suggestedFixes.some((f) => f.title.toLowerCase().includes("failure")),
    "should suggest investigating failures"
  );
  assert.ok(
    result.suggestedFixes.some((f) => f.title.toLowerCase().includes("output")),
    "should suggest improving output quality"
  );

  // Verify consistency: running same input twice gives same output
  const result2 = computeReportQualityMemory(data);
  assert.deepStrictEqual(result, result2, "deterministic: same input should produce same output");
});

// ─── Test 12: Founder page noindex verification ──────────────────────────────

test("founder page has noindex robots meta", () => {
  const founderPage = path.join(__dirname, "../../src/app/founder/page.tsx");
  const content = fs.readFileSync(founderPage, "utf8");
  assert.match(content, /index:\s*false/, "founder page must have index: false");
  assert.match(content, /follow:\s*false/, "founder page must have follow: false");
});
