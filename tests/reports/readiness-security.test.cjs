const assert = require("node:assert/strict");
const test = require("node:test");

require("../helpers/register-ts.cjs");

// Set up mock env and founder token verification
const monitoringModule = require("../../src/lib/system/monitoring");
const founderAuthModule = require("../../src/lib/system/founderAuthorization");
const openrouterModule = require("../../src/lib/ai/openrouter");
const persistenceModule = require("../../src/lib/reports/persistence");
const operationsLoggingModule = require("../../src/lib/operations/logging");

const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");
const { GET: getHealth } = require("../../src/app/api/system/health/route");
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");

test("1. Public unauthenticated readiness endpoint is safe and minimal", async () => {
  const origToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;
  process.env.NALI_FOUNDER_ADMIN_TOKEN = "super_secret_founder_token";

  try {
    // GET request without Authorization headers/cookies
    const response = await getReadiness(
      new Request("http://localhost/api/system/readiness", {
        method: "GET",
      })
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");

    const body = await response.json();
    assert.equal(body.status, "ok");
    assert.equal(body.service, "nali");
    assert.equal(body.publicMode, "alpha");

    // Ensure absolutely no sensitive keys or DB counts are present
    assert.equal(body.dbStatus, undefined);
    assert.equal(body.envVerification, undefined);
    assert.equal(body.openRouterConfigured, undefined);
    assert.equal(body.midtransConfigured, undefined);
  } finally {
    process.env.NALI_FOUNDER_ADMIN_TOKEN = origToken;
  }
});

test("2. Authorized readiness endpoint returns full system details and Cache-Control: no-store", async () => {
  const origToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;
  process.env.NALI_FOUNDER_ADMIN_TOKEN = "super_secret_founder_token";

  try {
    // GET request with correct Authorization header
    const response = await getReadiness(
      new Request("http://localhost/api/system/readiness", {
        headers: {
          "Authorization": "Bearer super_secret_founder_token",
        },
        method: "GET",
      })
    );

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");

    const body = await response.json();
    // Verify it contains DB status and verification metrics
    assert.ok(body.dbStatus !== undefined);
    assert.ok(body.envVerification !== undefined);
    assert.ok(body.envVerification.nextPublicSupabaseAnonKeyExists !== undefined);
    // Ensure raw secrets are NEVER exposed, only booleans
    assert.notEqual(body.envVerification.nextPublicSupabaseAnonKeyExists, "super_secret_founder_token");
  } finally {
    process.env.NALI_FOUNDER_ADMIN_TOKEN = origToken;
  }
});

test("3. Public health endpoint works safely and returns status: ok with Cache-Control: no-store", async () => {
  const response = await getHealth();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");

  const body = await response.json();
  assert.deepEqual(body, { status: "ok" });
});

test("4. Failure path: Simulate OpenRouter unavailable and NALI_ALLOW_MOCK_GENERATION disabled", async () => {
  const origMockFlag = process.env.NALI_ALLOW_MOCK_GENERATION;
  process.env.NALI_ALLOW_MOCK_GENERATION = "false";

  // Spy & mock persistence and logging functions
  let persistCalled = false;
  let eventLogged = false;

  const origPersist = persistenceModule.persistGeneratedReport;
  const origLogReportEvent = operationsLoggingModule.logReportEvent;

  persistenceModule.persistGeneratedReport = async () => {
    persistCalled = true;
    return { persisted: false, reason: "mocked" };
  };

  operationsLoggingModule.logReportEvent = async (event) => {
    if (event.eventType === "PREVIEW_GENERATED" && event.status === "success") {
      eventLogged = true;
    }
  };

  const origRequestOpenRouterJson = openrouterModule.requestOpenRouterJson;
  openrouterModule.requestOpenRouterJson = async () => {
    // Simulate OpenRouter down/unavailable
    return null;
  };

  try {
    const response = await postGenerate(
      new Request("http://localhost/api/reports/generate", {
        body: JSON.stringify({
          guestSessionId: "test-session-id",
          integrityConsent: true,
          mainText: "Ini catatan pengamatan vegetasi lereng gunung.",
          mode: "draft_from_materials",
          reportTemplate: "Observasi Lingkungan",
        }),
        method: "POST",
      })
    );

    assert.equal(response.status, 503);

    const body = await response.json();
    assert.equal(body.code, "AI_ENGINE_UNAVAILABLE");
    assert.equal(body.error, "AI engine belum tersedia. Coba lagi nanti.");

    // Assert absolutely no report or report_id returned
    assert.equal(body.report, undefined);
    assert.equal(body.report_id, undefined);
    assert.equal(body.id, undefined);

    // Assert no fake report is persisted and no fake PREVIEW_GENERATED success event is logged
    assert.equal(persistCalled, false);
    assert.equal(eventLogged, false);
  } finally {
    process.env.NALI_ALLOW_MOCK_GENERATION = origMockFlag;
    persistenceModule.persistGeneratedReport = origPersist;
    operationsLoggingModule.logReportEvent = origLogReportEvent;
    openrouterModule.requestOpenRouterJson = origRequestOpenRouterJson;
  }
});
