require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  checkRateLimit,
  createMemoryRateLimitStore,
  resolveRateLimitKey,
} = require("../../src/lib/rateLimit/limit");

function snapshotEnv() {
  return {
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

function restoreEnv(snapshot) {
  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;
}

test("missing Supabase env allows request with configured false", async () => {
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const result = await checkRateLimit({
      actionType: "generate_report",
      guestSessionId: "guest-session-rate-limit-12345",
    });

    assert.equal(result.allowed, true);
    assert.equal(result.configured, false);
  } finally {
    restoreEnv(original);
  }
});

test("rate-limit action types are isolated", async () => {
  const now = new Date("2026-05-19T12:00:00.000Z");
  const store = createMemoryRateLimitStore();

  const first = await checkRateLimit({
    actionType: "generate_report",
    guestSessionId: "guest-session-rate-limit-12345",
    maxAttempts: 1,
    now,
    store,
    windowMs: 60_000,
  });
  const second = await checkRateLimit({
    actionType: "generate_report",
    guestSessionId: "guest-session-rate-limit-12345",
    maxAttempts: 1,
    now,
    store,
    windowMs: 60_000,
  });
  const upload = await checkRateLimit({
    actionType: "create_upload",
    guestSessionId: "guest-session-rate-limit-12345",
    maxAttempts: 1,
    now,
    store,
    windowMs: 60_000,
  });

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, false);
  assert.equal(upload.allowed, true);
});

test("locked action returns blocked result", async () => {
  const now = new Date("2026-05-19T12:00:00.000Z");
  const store = createMemoryRateLimitStore([
    {
      action_type: "feedback_submit",
      attempts: 99,
      key_hash: resolveRateLimitKey({ guestSessionId: "guest-session-rate-limit-12345" }).keyHash,
      last_attempt_at: now.toISOString(),
      locked_until: new Date(now.getTime() + 30_000).toISOString(),
      updated_at: now.toISOString(),
    },
  ]);

  const result = await checkRateLimit({
    actionType: "feedback_submit",
    guestSessionId: "guest-session-rate-limit-12345",
    now,
    store,
  });

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "locked");
  assert.ok(result.retryAfterSeconds > 0);
});

test("raw IP and user-agent are not stored or returned", async () => {
  const store = createMemoryRateLimitStore();
  const request = new Request("http://localhost/api/test", {
    headers: {
      "user-agent": "SensitiveBrowser/1.0",
      "x-forwarded-for": "203.0.113.77",
    },
  });

  const result = await checkRateLimit({
    actionType: "payment_create",
    request,
    store,
  });
  const serialized = JSON.stringify({ result, rows: store.dump() });

  assert.equal(result.allowed, true);
  assert.doesNotMatch(serialized, /203\.0\.113\.77|SensitiveBrowser/);
});
