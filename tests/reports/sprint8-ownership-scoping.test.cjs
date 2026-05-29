require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { getPersistedReport, updatePersistedReport } = require("../../src/lib/reports/persistence");
const { getReportAccessTokenHash, getGuestSessionIdHash } = require("../../src/lib/reports/access");
const adminModule = require("../../src/lib/supabase/admin");

const originalGetAdmin = adminModule.getOptionalSupabaseAdminClient;

// Set up mock env
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret-key";

test("guest report fetches using service role require token validation and guest_session_id_hash", async (t) => {
  let eqFilters = {};
  let isFilters = {};
  
  const queryBuilder = {
    select(fields) {
      return this;
    },
    eq(field, value) {
      eqFilters[field] = value;
      return this;
    },
    is(field, value) {
      isFilters[field] = value;
      return this;
    },
    async maybeSingle() {
      // Return a valid mock record only if queries are correct
      return {
        data: {
          id: "report-123",
          user_id: null,
          guest_session_id_hash: getGuestSessionIdHash("guest-session-secret"),
          report_access_token_hash: getReportAccessTokenHash("access-token-secret"),
          output: { id: "report-123", title: "Guest Observation Report", mode: "draft_from_materials" },
          status: "export_ready",
          processing_metadata: {}
        },
        error: null
      };
    }
  };

  const mockAdmin = {
    from(table) {
      if (table === "reports") {
        eqFilters = {};
        isFilters = {};
        return queryBuilder;
      }
      throw new Error(`Unexpected table: ${table}`);
    }
  };

  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    // 1. Fetch fails if guestSessionIdHash is missing
    const resNoGuestHash = await getPersistedReport({
      reportAccessToken: "access-token-secret",
      reportId: "report-123"
    });
    assert.strictEqual(resNoGuestHash.found, false);
    assert.strictEqual(resNoGuestHash.reason, "missing_guest_session_hash");

    // 2. Fetch fails if reportAccessToken is missing
    const resNoToken = await getPersistedReport({
      guestSessionIdHash: getGuestSessionIdHash("guest-session-secret"),
      reportId: "report-123"
    });
    assert.strictEqual(resNoToken.found, false);
    assert.strictEqual(resNoToken.reason, "missing_token");

    // 3. Fetch succeeds if both are provided and correct
    const resValid = await getPersistedReport({
      guestSessionIdHash: getGuestSessionIdHash("guest-session-secret"),
      reportAccessToken: "access-token-secret",
      reportId: "report-123"
    });
    assert.strictEqual(resValid.found, true);
    assert.strictEqual(resValid.report.title, "Guest Observation Report");
    assert.strictEqual(eqFilters["id"], "report-123");
    assert.strictEqual(eqFilters["guest_session_id_hash"], getGuestSessionIdHash("guest-session-secret"));
    assert.strictEqual(eqFilters["report_access_token_hash"], getReportAccessTokenHash("access-token-secret"));
    assert.strictEqual(isFilters["user_id"], null);

  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("authenticated user report fetches ignore access tokens and are scoped strictly by user_id", async (t) => {
  let eqFilters = {};
  let isFilters = {};
  
  const queryBuilder = {
    select(fields) {
      return this;
    },
    eq(field, value) {
      eqFilters[field] = value;
      return this;
    },
    is(field, value) {
      isFilters[field] = value;
      return this;
    },
    async maybeSingle() {
      return {
        data: {
          id: "report-user-456",
          user_id: "user-A",
          guest_session_id_hash: null,
          report_access_token_hash: null,
          output: { id: "report-user-456", title: "User Owned Report", mode: "draft_from_materials" },
          status: "export_ready",
          processing_metadata: {}
        },
        error: null
      };
    }
  };

  const mockAdmin = {
    from(table) {
      if (table === "reports") {
        eqFilters = {};
        isFilters = {};
        return queryBuilder;
      }
      throw new Error(`Unexpected table: ${table}`);
    }
  };

  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    const resUser = await getPersistedReport({
      reportId: "report-user-456",
      userId: "user-A"
    });
    assert.strictEqual(resUser.found, true);
    assert.strictEqual(resUser.report.title, "User Owned Report");
    // Assert query scope contains user_id and NO guest or token filters
    assert.strictEqual(eqFilters["id"], "report-user-456");
    assert.strictEqual(eqFilters["user_id"], "user-A");
    assert.strictEqual(eqFilters["guest_session_id_hash"], undefined);
    assert.strictEqual(eqFilters["report_access_token_hash"], undefined);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("guest report updates require guestSessionIdHash validation", async (t) => {
  let eqFilters = {};
  
  const queryBuilder = {
    eq(field, value) {
      eqFilters[field] = value;
      return this;
    },
    is(field, value) {
      return this;
    },
    then(onfulfilled) {
      // Simulate successful update promise
      return Promise.resolve({ error: null }).then(onfulfilled);
    }
  };

  const mockAdmin = {
    from(table) {
      if (table === "reports") {
        eqFilters = {};
        return {
          update(payload) {
            return queryBuilder;
          }
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }
  };

  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    // Update fails if guestSessionIdHash is missing
    const resNoHash = await updatePersistedReport({
      reportId: "report-123",
      reportAccessKey: "access-token-secret",
      report: { id: "report-123", status: "export_ready" },
      agentThread: {}
    });
    assert.strictEqual(resNoHash.updated, false);
    assert.strictEqual(resNoHash.reason, "missing_guest_session_hash");

    // Update succeeds with correct filters if guestSessionIdHash is present
    const resValid = await updatePersistedReport({
      reportId: "report-123",
      reportAccessKey: "access-token-secret",
      report: { id: "report-123", status: "export_ready" },
      agentThread: {},
      guestSessionIdHash: getGuestSessionIdHash("guest-session-secret")
    });
    assert.strictEqual(resValid.updated, true);
    assert.strictEqual(eqFilters["id"], "report-123");
    assert.strictEqual(eqFilters["guest_session_id_hash"], getGuestSessionIdHash("guest-session-secret"));
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("authenticated user A cannot access authenticated user B report", async (t) => {
  let eqFilters = {};
  
  const queryBuilder = {
    select(fields) { return this; },
    eq(field, value) {
      eqFilters[field] = value;
      return this;
    },
    is(field, value) { return this; },
    async maybeSingle() {
      if (eqFilters["user_id"] === "user-A" && eqFilters["id"] === "report-user-B") {
        return { data: null, error: null };
      }
      return { data: { id: "report-user-B", user_id: "user-B" }, error: null };
    }
  };

  const mockAdmin = {
    from(table) {
      if (table === "reports") {
        eqFilters = {};
        return queryBuilder;
      }
      throw new Error(`Unexpected table: ${table}`);
    }
  };

  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    const res = await getPersistedReport({
      reportId: "report-user-B",
      userId: "user-A"
    });
    assert.strictEqual(res.found, false);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("guest session cannot access user A report", async (t) => {
  let eqFilters = {};
  
  const queryBuilder = {
    select(fields) { return this; },
    eq(field, value) {
      eqFilters[field] = value;
      return this;
    },
    is(field, value) { return this; },
    async maybeSingle() {
      if (eqFilters["user_id"] === null && eqFilters["id"] === "report-user-A") {
        return { data: null, error: null };
      }
      return { data: { id: "report-user-A", user_id: "user-A" }, error: null };
    }
  };

  const mockAdmin = {
    from(table) {
      if (table === "reports") {
        eqFilters = {};
        return queryBuilder;
      }
      throw new Error(`Unexpected table: ${table}`);
    }
  };

  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    const res = await getPersistedReport({
      guestSessionIdHash: getGuestSessionIdHash("guest-session-secret"),
      reportAccessToken: "access-token-secret",
      reportId: "report-user-A"
    });
    assert.strictEqual(res.found, false);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("guest B cannot access guest A report", async (t) => {
  let eqFilters = {};
  
  const queryBuilder = {
    select(fields) { return this; },
    eq(field, value) {
      eqFilters[field] = value;
      return this;
    },
    is(field, value) { return this; },
    async maybeSingle() {
      if (eqFilters["guest_session_id_hash"] === getGuestSessionIdHash("guest-B") && eqFilters["id"] === "report-guest-A") {
        return { data: null, error: null };
      }
      return { data: { id: "report-guest-A", guest_session_id_hash: getGuestSessionIdHash("guest-A") }, error: null };
    }
  };

  const mockAdmin = {
    from(table) {
      if (table === "reports") {
        eqFilters = {};
        return queryBuilder;
      }
      throw new Error(`Unexpected table: ${table}`);
    }
  };

  adminModule.getOptionalSupabaseAdminClient = () => mockAdmin;

  try {
    const res = await getPersistedReport({
      guestSessionIdHash: getGuestSessionIdHash("guest-B"),
      reportAccessToken: "access-token-secret",
      reportId: "report-guest-A"
    });
    assert.strictEqual(res.found, false);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalGetAdmin;
  }
});

test("auth configuration utilities correctly evaluate configuration flags", () => {
  const { isSupabaseConfigured, isGoogleOAuthLikelyConfigured } = require("../../src/lib/auth/config");
  
  const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prevAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const prevGoogleActive = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ACTIVE;

  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://real.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "real-key";
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ACTIVE = "true";
    assert.strictEqual(isSupabaseConfigured(), true);
    assert.strictEqual(isGoogleOAuthLikelyConfigured(), true);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy.supabase.co";
    assert.strictEqual(isSupabaseConfigured(), false);
    assert.strictEqual(isGoogleOAuthLikelyConfigured(), false);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://real.supabase.co";
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ACTIVE = "false";
    assert.strictEqual(isGoogleOAuthLikelyConfigured(), false);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevAnon;
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ACTIVE = prevGoogleActive;
  }
});

test("no client-side component imports service role key or supabase admin client", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const repoRoot = path.join(__dirname, "../..");

  function getTsFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        getTsFiles(full, files);
      } else if (stat.isFile() && /\.(ts|tsx)$/.test(item)) {
        files.push(full);
      }
    }
    return files;
  }

  const files = getTsFiles(path.join(repoRoot, "src/components"));
  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(code, /SUPABASE_SERVICE_ROLE_KEY|getOptionalSupabaseAdminClient/);
  }
});

