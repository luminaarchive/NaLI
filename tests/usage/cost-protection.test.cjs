require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createMemoryUsageStore,
  getCostProtectionStatus,
} = require("../../src/lib/usage/costProtection");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");

function snapshotEnv() {
  return {
    dailyLimit: process.env.NALI_DAILY_ENERGY_LIMIT,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

function restoreEnv(snapshot) {
  if (snapshot.dailyLimit === undefined) delete process.env.NALI_DAILY_ENERGY_LIMIT;
  else process.env.NALI_DAILY_ENERGY_LIMIT = snapshot.dailyLimit;

  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;
}

test("cost protection missing env returns inactive", async () => {
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NALI_DAILY_ENERGY_LIMIT = "10";

  try {
    const status = await getCostProtectionStatus();

    assert.equal(status.configured, false);
    assert.equal(status.active, false);
    assert.equal(status.reason, "Usage logging not configured");
  } finally {
    restoreEnv(original);
  }
});

test("cost protection exceeded threshold returns active", async () => {
  const original = snapshotEnv();
  process.env.NALI_DAILY_ENERGY_LIMIT = "10";

  try {
    const status = await getCostProtectionStatus({
      now: new Date("2026-05-19T12:00:00.000Z"),
      store: createMemoryUsageStore([
        { created_at: "2026-05-19T01:00:00.000Z", estimated_energy: 6 },
        { created_at: "2026-05-19T02:00:00.000Z", estimated_energy: 5 },
      ]),
    });

    assert.equal(status.configured, true);
    assert.equal(status.active, true);
    assert.equal(status.estimatedEnergy, 11);
  } finally {
    restoreEnv(original);
  }
});

test("readiness endpoint includes cost protection booleans only", async () => {
  const original = snapshotEnv();
  process.env.NALI_DAILY_ENERGY_LIMIT = "10";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const response = await getReadiness();
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    assert.equal(payload.rateLimitPrepared, true);
    assert.equal(payload.costProtectionPrepared, true);
    assert.equal(typeof payload.costProtectionConfigured, "boolean");
    assert.equal(typeof payload.costProtectionActive, "boolean");
    assert.doesNotMatch(serialized, /NALI_DAILY_ENERGY_LIMIT=10/);
  } finally {
    restoreEnv(original);
  }
});
