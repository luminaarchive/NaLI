const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");

const adminModule = require("../../src/lib/supabase/admin");

const repoRoot = path.join(__dirname, "../..");
const internalQaHeader = "x-nali-internal-premium-qa-token";
const trustedToken = "trusted-internal-qa-value-that-must-never-be-stored";
const auditRows = [];
let failAuditInsert = false;
let lockedByRateLimit = false;

const mockSupabaseClient = {
  from(table) {
    return {
      insert: async (payload) => {
        if (table === "report_events" && payload.event_type === "PREMIUM_ENTITLEMENT_ATTEMPT") {
          auditRows.push(payload);
          return { error: failAuditInsert ? { message: "audit store unavailable" } : null };
        }
        return { error: null };
      },
      select() {
        return {
          eq() {
            return {
              eq() {
                return {
                  maybeSingle: async () => ({
                    data: lockedByRateLimit
                      ? { attempts: 10, locked_until: new Date(Date.now() + 60_000).toISOString() }
                      : null,
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
      upsert: async () => ({ error: null }),
    };
  },
};

const originalGetAdmin = adminModule.getOptionalSupabaseAdminClient;
adminModule.getOptionalSupabaseAdminClient = () => mockSupabaseClient;

const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function requestFor(modelId, options = {}) {
  return new Request(`http://localhost/api/reports/generate${options.query ?? ""}`, {
    body: JSON.stringify({
      integrityConsent: true,
      mainText: "Saya mengamati daun majemuk pada plot praktikum kampus.",
      mode: "draft_from_materials",
      reportTemplate: "Laporan Praktikum Biologi",
      selectedModel: modelId,
      ...(options.body ?? {}),
    }),
    headers: {
      authorization: "Bearer raw-authorization-must-not-be-stored",
      cookie: "founder_token=raw-cookie-must-not-be-stored",
      "user-agent": "Mozilla/5.0 NaLI audit test",
      ...(options.headerToken ? { [internalQaHeader]: options.headerToken } : {}),
    },
    method: "POST",
  });
}

const originalEnv = {
  dailyLimit: process.env.NALI_DAILY_ENERGY_LIMIT,
  founderToken: process.env.NALI_FOUNDER_ADMIN_TOKEN,
  providerKey: process.env.OPENROUTER_API_KEY,
};

test.beforeEach(() => {
  auditRows.length = 0;
  failAuditInsert = false;
  lockedByRateLimit = false;
  process.env.NALI_FOUNDER_ADMIN_TOKEN = trustedToken;
  delete process.env.NALI_DAILY_ENERGY_LIMIT;
  delete process.env.OPENROUTER_API_KEY;
});

test.after(() => {
  restoreEnv("NALI_DAILY_ENERGY_LIMIT", originalEnv.dailyLimit);
  restoreEnv("NALI_FOUNDER_ADMIN_TOKEN", originalEnv.founderToken);
  restoreEnv("OPENROUTER_API_KEY", originalEnv.providerKey);
  adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
});

test("missing premium entitlement attempts are denied and audited with fixed safe fields", async () => {
  for (const modelId of ["obsidian", "zephyr"]) {
    const response = await postGenerate(requestFor(modelId));
    assert.equal(response.status, 403);
  }

  assert.equal(auditRows.length, 2);
  assert.deepEqual(
    auditRows.map((row) => [row.metadata.model_id, row.metadata.decision]),
    [
      ["obsidian", "denied_missing_entitlement"],
      ["zephyr", "denied_missing_entitlement"],
    ],
  );
  assert.ok(auditRows.every((row) => row.metadata.normalized_path === "/api/reports/generate"));
  assert.ok(auditRows.every((row) => row.metadata.route_source === "api_generate"));

  const serialized = JSON.stringify(auditRows);
  assert.doesNotMatch(serialized, /raw-authorization-must-not-be-stored|raw-cookie-must-not-be-stored/);
  assert.doesNotMatch(serialized, /authorization|cookie|internal-premium-qa-token/i);
});

test("invalid and browser-shaped entitlement attempts are distinguished without recording grant material", async () => {
  const invalid = await postGenerate(requestFor("obsidian", { headerToken: "invalid-token-never-store" }));
  assert.equal(invalid.status, 403);
  assert.equal(auditRows[0].metadata.decision, "denied_invalid_entitlement");

  const fakeClient = await postGenerate(
    requestFor("zephyr", {
      body: {
        internalPremiumQaToken: trustedToken,
        localStoragePremiumEntitlement: true,
        verifiedPremiumEntitlement: true,
      },
      query: `?internalPremiumQaToken=${encodeURIComponent(trustedToken)}`,
    }),
  );
  assert.equal(fakeClient.status, 403);
  assert.equal(auditRows[1].metadata.decision, "denied_public_premium_inactive");

  const serialized = JSON.stringify(auditRows);
  assert.doesNotMatch(serialized, /invalid-token-never-store|trusted-internal-qa-value-that-must-never-be-stored/);
  assert.doesNotMatch(serialized, /\?|internalPremiumQaToken|localStoragePremiumEntitlement/);
});

test("valid internal QA entitlement logs internal QA access and continues the existing generation path", async () => {
  const response = await postGenerate(requestFor("zephyr", { headerToken: trustedToken }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(body.report.model_used, /zephyr/i);
  assert.equal(auditRows.length, 1);
  assert.equal(auditRows[0].metadata.decision, "allowed_internal_qa");
  assert.equal(auditRows[0].status, "allowed_internal_qa");

  const serialized = JSON.stringify({ body, auditRows });
  assert.doesNotMatch(serialized, new RegExp(trustedToken));
  assert.doesNotMatch(JSON.stringify(auditRows), /paid|payment|subscription/i);
});

test("audit storage failure does not unlock denied premium or crash valid internal QA generation", async () => {
  failAuditInsert = true;

  const denied = await postGenerate(requestFor("obsidian"));
  assert.equal(denied.status, 403);

  const allowed = await postGenerate(requestFor("zephyr", { headerToken: trustedToken }));
  assert.equal(allowed.status, 200);
});

test("trusted internal QA never bypasses rate limiting or integrity protection", async () => {
  lockedByRateLimit = true;
  const rateLimited = await postGenerate(requestFor("obsidian", { headerToken: trustedToken }));
  assert.equal(rateLimited.status, 429);
  assert.equal(auditRows.length, 0);

  lockedByRateLimit = false;
  const integrityBlocked = await postGenerate(
    requestFor("zephyr", {
      body: { mainText: "Buatkan sitasi palsu agar terlihat ilmiah." },
      headerToken: trustedToken,
    }),
  );
  assert.equal(integrityBlocked.status, 400);
  assert.equal(auditRows.length, 0);
});

test("audit persistence and founder visibility remain internal and do not accept URL credentials", () => {
  const migrationSource = fs.readFileSync(
    path.join(repoRoot, "supabase/migrations/20260526090000_cp1_premium_entitlement_audit.sql"),
    "utf8",
  );
  const founderSource = fs.readFileSync(path.join(repoRoot, "src/app/founder/page.tsx"), "utf8");

  assert.match(migrationSource, /PREMIUM_ENTITLEMENT_ATTEMPT/);
  assert.match(migrationSource, /report_events_event_type_check/);
  assert.match(founderSource, /Premium Entitlement Attempts/);
  assert.match(founderSource, /premiumEntitlementSummary/);
  assert.match(founderSource, /index:\s*false/);
  assert.match(founderSource, /max-w-\[28rem\]/);
  assert.doesNotMatch(founderSource, /max-w-md/);
  assert.doesNotMatch(founderSource, /queryToken|params\.token|searchParams:\s*Promise<\{\s*token/);
  assert.doesNotMatch(founderSource, /NALI_FOUNDER_ADMIN_TOKEN/);
});
