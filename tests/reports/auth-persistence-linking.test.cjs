require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { NextRequest } = require("next/server");
const { isSupabaseConfigured, isGoogleOAuthLikelyConfigured, getAuthRedirectBaseUrl } = require("../../src/lib/auth/config");
const { GET: callbackHandler } = require("../../src/app/auth/callback/route");
const { POST: linkGuestHandler } = require("../../src/app/api/auth/link-guest/route");

const supabaseMock = require("../helpers/supabase-server-mock.cjs");
const nextHeadersMock = require("../helpers/next-headers-mock.cjs");
const adminModule = require("../../src/lib/supabase/admin");

test("auth config utilities correctly evaluate configuration flags", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    // 1. Configured
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "valid-anon-key";
    assert.strictEqual(isSupabaseConfigured(), true);

    // 2. Unconfigured / Dummy
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy.supabase.co";
    assert.strictEqual(isSupabaseConfigured(), false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy";
    assert.strictEqual(isSupabaseConfigured(), false);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  }
});

test("callback route handler rejects unsafe/external redirect paths", async () => {
  supabaseMock.__resetMock();
  nextHeadersMock.__clearCookies();

  // Test 1: Safe relative paths
  const reqSafe = new NextRequest("http://localhost/auth/callback?code=mock_code&next=/create-report");
  const resSafe = await callbackHandler(reqSafe);
  assert.equal(resSafe.status, 307);
  const locationSafe = resSafe.headers.get("location");
  assert.match(locationSafe, /\/create-report/);

  // Test 2: Unsafe absolute/external schemas
  const reqUnsafe = new NextRequest("http://localhost/auth/callback?code=mock_code&next=https://malicious.com");
  const resUnsafe = await callbackHandler(reqUnsafe);
  const locationUnsafe = resUnsafe.headers.get("location");
  // Should fall back to create-report
  assert.match(locationUnsafe, /\/create-report/);
  assert.ok(!locationUnsafe.includes("malicious.com"));

  // Test 3: Unsafe protocol-relative path
  const reqProto = new NextRequest("http://localhost/auth/callback?code=mock_code&next=//malicious.com");
  const resProto = await callbackHandler(reqProto);
  const locationProto = resProto.headers.get("location");
  assert.match(locationProto, /\/create-report/);
  assert.ok(!locationProto.includes("malicious.com"));

  // Test 4: Auth exchange code error redirects to error presentation page
  supabaseMock.__setExchangeError(new Error("Exchange failed"));
  const reqErr = new NextRequest("http://localhost/auth/callback?code=bad_code");
  const resErr = await callbackHandler(reqErr);
  assert.equal(resErr.status, 307);
  assert.match(resErr.headers.get("location"), /\/auth\/auth-code-error/);
  supabaseMock.__resetMock();
});

test("link guest route requires authenticated session", async () => {
  supabaseMock.__resetMock();
  supabaseMock.__setMockUser(null);
  nextHeadersMock.__clearCookies();

  const req = new NextRequest("http://localhost/api/auth/link-guest", { method: "POST" });
  const res = await linkGuestHandler(req);
  assert.equal(res.status, 401);
  const payload = await res.json();
  assert.equal(payload.error, "Unauthorized");
});

test("link guest route handles missing guest session cookie", async () => {
  supabaseMock.__resetMock();
  supabaseMock.__setMockUser({ id: "user_123" });
  nextHeadersMock.__clearCookies();

  const req = new NextRequest("http://localhost/api/auth/link-guest", { method: "POST" });
  const res = await linkGuestHandler(req);
  assert.equal(res.status, 200);
  const payload = await res.json();
  assert.equal(payload.success, true);
  assert.equal(payload.count, 0);
  assert.match(payload.notice, /No guest session cookie found/);
});

test("link guest route links reports and clears cookie (unconfigured Supabase fallback)", async () => {
  supabaseMock.__resetMock();
  supabaseMock.__setMockUser({ id: "user_123" });
  nextHeadersMock.__clearCookies();
  nextHeadersMock.__setCookie("nali_guest_session", "guest_session_123");

  const originalGetAdmin = adminModule.getOptionalSupabaseAdminClient;
  adminModule.getOptionalSupabaseAdminClient = () => null;

  try {
    const req = new NextRequest("http://localhost/api/auth/link-guest", { method: "POST" });
    const res = await linkGuestHandler(req);
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.success, true);
    assert.match(payload.notice, /Supabase unconfigured/);
    
    // Cookie should be deleted
    assert.equal(nextHeadersMock.__getCookie("nali_guest_session"), undefined);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("link guest route links reports and clears cookie in database (configured Supabase)", async () => {
  supabaseMock.__resetMock();
  supabaseMock.__setMockUser({ id: "user_123" });
  nextHeadersMock.__clearCookies();
  nextHeadersMock.__setCookie("nali_guest_session", "guest_session_123");

  const mockAdmin = {
    from: () => ({
      update: () => ({
        eq: () => ({
          is: () => ({
            select: () => Promise.resolve({ data: [{ id: "report_1" }], error: null })
          })
        })
      })
    })
  };

  const originalGetAdmin = adminModule.getOptionalSupabaseAdminClient;
  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    const req = new NextRequest("http://localhost/api/auth/link-guest", { method: "POST" });
    const res = await linkGuestHandler(req);
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.success, true);
    assert.equal(payload.count, 1);
    assert.equal(payload.reports[0].id, "report_1");
    
    // Cookie should be deleted
    assert.equal(nextHeadersMock.__getCookie("nali_guest_session"), undefined);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});
