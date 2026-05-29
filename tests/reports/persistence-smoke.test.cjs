require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { NextRequest } = require("next/server");
const { GET: getReport } = require("../../src/app/api/reports/[id]/route");
const { GET: getExport } = require("../../src/app/api/reports/[id]/export/route");
const { POST: postFeedback } = require("../../src/app/api/reports/[id]/feedback/route");
const { getPersistedReport } = require("../../src/lib/reports/persistence");
const { logUsageEvent } = require("../../src/lib/usage/logging");
const { __setCookie, __clearCookies } = require("../helpers/next-headers-mock.cjs");

function snapshotEnv() {
  return {
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

function restoreEnv(snapshot) {
  if (snapshot.anon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = snapshot.anon;

  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;
}

test("persisted report endpoint requires valid token", async () => {
  __clearCookies();
  __setCookie("nali_guest_session", "test_guest");
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. GET without token -> 401
    const resNoToken = await getReport(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111", {
        headers: { cookie: "nali_guest_session=test_guest" }
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    const payloadNoToken = await resNoToken.json();
    assert.equal(resNoToken.status, 401);
    assert.match(payloadNoToken.error, /Akses laporan membutuhkan/i);

    // 2. GET with empty/whitespace token -> 401
    const resEmptyToken = await getReport(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111?token=   ", {
        headers: { cookie: "nali_guest_session=test_guest" }
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    assert.equal(resEmptyToken.status, 401);

    // 3. GET with token under unconfigured supabase env -> 503
    const resUnconfigured = await getReport(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111?token=some_token", {
        headers: { cookie: "nali_guest_session=test_guest" }
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    const payloadUnconfigured = await resUnconfigured.json();
    assert.equal(resUnconfigured.status, 503);
    assert.match(payloadUnconfigured.error, /Laporan tersimpan belum tersedia/i);
    assert.equal(payloadUnconfigured.persistence, "supabase_unconfigured");
  } finally {
    restoreEnv(original);
  }
});

test("feedback endpoint persistence and fallback behaviors", async () => {
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Submit with invalid rating -> 400
    const resInvalidRating = await postFeedback(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111/feedback", {
        body: JSON.stringify({ rating: "excellent", comment: "good" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    assert.equal(resInvalidRating.status, 400);

    // 2. Submit with valid rating under unconfigured supabase env -> 202 fallback
    const resFallback = await postFeedback(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111/feedback", {
        body: JSON.stringify({ rating: "helpful", comment: "good feedback", report_access_token: "test" }),
        method: "POST",
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    const payloadFallback = await resFallback.json();
    assert.equal(resFallback.status, 202);
    assert.equal(payloadFallback.stored, false);
    assert.match(payloadFallback.message, /Feedback belum tersimpan karena persistence belum aktif/i);
    
    // Ensure no secrets/hashes are returned in the response
    const serialized = JSON.stringify(payloadFallback);
    assert.doesNotMatch(serialized, /hash|token|secret/i);
  } finally {
    restoreEnv(original);
  }
});

test("usage logging fallback behavior under unconfigured env", async () => {
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const result = await logUsageEvent({
      actionType: "report_preview",
      guestSessionId: "guest-session-test-id-123456",
      inputSize: 100,
    });
    assert.equal(result.logged, false);
    assert.equal(result.reason, "supabase_unconfigured");
  } finally {
    restoreEnv(original);
  }
});

test("export endpoint under unconfigured env returns 503 or 401", async () => {
  __clearCookies();
  __setCookie("nali_guest_session", "test_guest");
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // GET export without token -> 401
    const resNoToken = await getExport(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111/export", {
        headers: { cookie: "nali_guest_session=test_guest" }
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    assert.equal(resNoToken.status, 401);

    // GET export with token under unconfigured env -> 503
    const resUnconfigured = await getExport(
      new NextRequest("http://localhost/api/reports/11111111-1111-4111-8111-111111111111/export?token=some_token", {
        headers: { cookie: "nali_guest_session=test_guest" }
      }),
      { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) }
    );
    assert.equal(resUnconfigured.status, 503);
  } finally {
    restoreEnv(original);
  }
});
