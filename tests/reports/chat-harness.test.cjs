require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { NextRequest } = require("next/server");
const { POST: chatRoute } = require("../../src/app/api/reports/chat/route");

function snapshotEnv() {
  return {
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE,
  };
}

function restoreEnv(snapshot) {
  if (snapshot.anon === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = snapshot.anon;

  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;

  if (snapshot.demoMode === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
  else process.env.NEXT_PUBLIC_DEMO_MODE = snapshot.demoMode;
}

test("chat endpoint requires POST with valid reportId and reportAccessKey", async () => {
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Missing parameters -> 400
    const resNoParams = await chatRoute(
      new NextRequest("http://localhost/api/reports/chat", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );
    const payloadNoParams = await resNoParams.json();
    assert.equal(resNoParams.status, 400);
    assert.match(payloadNoParams.error, /reportId dan reportAccessKey diperlukan/i);

    // 2. Unconfigured DB lookup returns 404/401 (Laporan tidak ditemukan / tidak sah)
    const resLookupUnconfigured = await chatRoute(
      new NextRequest("http://localhost/api/reports/chat", {
        method: "POST",
        body: JSON.stringify({
          reportId: "11111111-1111-4111-8111-111111111111",
          reportAccessKey: "some_key",
          newQuery: "harden the prompt",
        }),
      })
    );
    const payloadLookup = await resLookupUnconfigured.json();
    assert.equal(resLookupUnconfigured.status, 404);
    assert.match(payloadLookup.error, /Laporan tidak ditemukan atau akses tidak sah/i);
  } finally {
    restoreEnv(original);
  }
});

test("chat endpoint input validation rules", async () => {
  const original = snapshotEnv();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    // 1. Empty newQuery -> 400 (under normal flow check before db lookup)
    const resEmptyQuery = await chatRoute(
      new NextRequest("http://localhost/api/reports/chat", {
        method: "POST",
        body: JSON.stringify({
          reportId: "",
          reportAccessKey: "test",
          newQuery: "  ",
        }),
      })
    );
    assert.equal(resEmptyQuery.status, 400);
  } finally {
    restoreEnv(original);
  }
});
