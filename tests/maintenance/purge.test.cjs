require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  classifyPurgeCandidate,
  isSafePurgeStoragePath,
  purgeExpiredReports,
} = require("../../src/lib/maintenance/purge");
const { getSystemReadiness } = require("../../src/lib/system/readiness");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");
const { POST: postPurge } = require("../../src/app/api/maintenance/purge/route");

const repoRoot = path.join(__dirname, "../..");
const now = new Date("2026-05-19T12:00:00.000Z");

function iso(minutesAgo) {
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}

function report(overrides = {}) {
  return {
    created_at: iso(10),
    id: "11111111-1111-4111-8111-111111111111",
    status: "pending_upload",
    storage_path: "pending_reports/11111111-1111-4111-8111-111111111111/nonce.pdf",
    updated_at: iso(10),
    ...overrides,
  };
}

function payment(overrides = {}) {
  return {
    id: "payment-1",
    payment_expires_at: new Date(now.getTime() + 60 * 60_000).toISOString(),
    report_id: "11111111-1111-4111-8111-111111111111",
    status: "pending",
    ...overrides,
  };
}

function snapshotEnv() {
  return {
    cron: process.env.CRON_SECRET,
    maintenance: process.env.MAINTENANCE_SECRET,
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  };
}

function restoreEnv(snapshot) {
  if (snapshot.cron === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = snapshot.cron;

  if (snapshot.maintenance === undefined) delete process.env.MAINTENANCE_SECRET;
  else process.env.MAINTENANCE_SECRET = snapshot.maintenance;

  if (snapshot.serviceRole === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = snapshot.serviceRole;

  if (snapshot.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = snapshot.url;
}

function makePurgeStore(reports, payments = []) {
  const state = {
    deletedReports: [],
    deletedStorage: [],
    markedFailed: [],
    payments,
    reports,
  };

  return {
    state,
    store: {
      async deleteReport(reportId) {
        state.deletedReports.push(reportId);
        return { ok: true };
      },
      async deleteStorageObject(storagePath) {
        state.deletedStorage.push(storagePath);
        return { ok: true };
      },
      async listCandidateReports(limit) {
        return { ok: true, reports: state.reports.slice(0, limit) };
      },
      async listPaymentsForReports(reportIds) {
        return {
          ok: true,
          payments: state.payments.filter((item) => reportIds.includes(item.report_id)),
        };
      },
      async markReportFailed(reportId, details) {
        state.markedFailed.push({ details, reportId });
        return { ok: true };
      },
    },
  };
}

test("pending_upload older than 60 minutes is a purge candidate", () => {
  const result = classifyPurgeCandidate(report({ created_at: iso(61), status: "pending_upload" }), undefined, { now });

  assert.equal(result.action, "delete_report_and_storage");
  assert.equal(result.storage_path, "pending_reports/11111111-1111-4111-8111-111111111111/nonce.pdf");
});

test("verifying older than 60 minutes is a purge candidate", () => {
  const result = classifyPurgeCandidate(
    report({ created_at: iso(20), status: "verifying", updated_at: iso(61) }),
    undefined,
    { now },
  );

  assert.equal(result.action, "delete_report_and_storage");
});

test("pending_payment without payment older than 2 hours is a purge candidate", () => {
  const result = classifyPurgeCandidate(report({ created_at: iso(121), status: "pending_payment" }), undefined, { now });

  assert.equal(result.action, "delete_report_and_storage");
});

test("pending_payment with active payment is kept until expiration", () => {
  const result = classifyPurgeCandidate(report({ created_at: iso(121), status: "pending_payment" }), payment(), { now });

  assert.equal(result.action, "keep");
  assert.match(result.reason, /payment/i);
});

test("pending_payment older than 24 hours is a purge candidate", () => {
  const result = classifyPurgeCandidate(
    report({ created_at: iso(24 * 60 + 1), status: "pending_payment" }),
    payment({ payment_expires_at: new Date(now.getTime() + 60 * 60_000).toISOString() }),
    { now },
  );

  assert.equal(result.action, "delete_report_and_storage");
});

test("export_ready is kept", () => {
  const result = classifyPurgeCandidate(report({ created_at: iso(24 * 60 + 1), status: "export_ready" }), undefined, {
    now,
  });

  assert.equal(result.action, "keep");
});

test("processing is kept by default", () => {
  const result = classifyPurgeCandidate(report({ created_at: iso(24 * 60 + 1), status: "processing" }), undefined, {
    now,
  });

  assert.equal(result.action, "keep");
});

test("failed deletes storage but keeps database row by default", () => {
  const result = classifyPurgeCandidate(report({ created_at: iso(24 * 60 + 1), status: "failed" }), undefined, { now });

  assert.equal(result.action, "delete_storage_only");
  assert.equal(result.storage_path, "pending_reports/11111111-1111-4111-8111-111111111111/nonce.pdf");
});

test("storage deletion rejects paths outside pending_reports", () => {
  assert.equal(isSafePurgeStoragePath("pending_reports/report/file.pdf"), true);
  assert.equal(isSafePurgeStoragePath("observation_media/report/file.pdf"), false);
  assert.equal(isSafePurgeStoragePath("../pending_reports/file.pdf"), false);
  assert.equal(isSafePurgeStoragePath("pending_reports"), false);
});

test("purge route rejects missing secret", async () => {
  const original = snapshotEnv();
  process.env.CRON_SECRET = "test-maintenance-secret";
  delete process.env.MAINTENANCE_SECRET;

  try {
    const response = await postPurge(
      new Request("http://localhost/api/maintenance/purge", {
        body: JSON.stringify({ dryRun: true }),
        method: "POST",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.match(payload.error, /Unauthorized/i);
    assert.doesNotMatch(JSON.stringify(payload), /test-maintenance-secret/);
  } finally {
    restoreEnv(original);
  }
});

test("purge route returns 503 when maintenance secret env is missing", async () => {
  const original = snapshotEnv();
  delete process.env.CRON_SECRET;
  delete process.env.MAINTENANCE_SECRET;

  try {
    const response = await postPurge(
      new Request("http://localhost/api/maintenance/purge", {
        headers: { authorization: "Bearer test-maintenance-secret" },
        method: "POST",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 503);
    assert.equal(payload.error, "Maintenance secret not configured.");
    assert.doesNotMatch(JSON.stringify(payload), /test-maintenance-secret/);
  } finally {
    restoreEnv(original);
  }
});

test("purge route returns not configured if Supabase env is missing", async () => {
  const original = snapshotEnv();
  process.env.CRON_SECRET = "test-maintenance-secret";
  delete process.env.MAINTENANCE_SECRET;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const response = await postPurge(
      new Request("http://localhost/api/maintenance/purge?dryRun=true", {
        headers: { authorization: "Bearer test-maintenance-secret" },
        method: "POST",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.configured, false);
    assert.equal(payload.skipped, true);
    assert.equal(payload.reason, "Supabase not configured");
  } finally {
    restoreEnv(original);
  }
});

test("dryRun does not delete reports or storage", async () => {
  const { state, store } = makePurgeStore([report({ created_at: iso(61), status: "pending_upload" })]);

  const result = await purgeExpiredReports({
    dryRun: true,
    now,
    store,
  });

  assert.equal(result.configured, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.scanned, 1);
  assert.equal(result.deletedReports, 0);
  assert.equal(result.deletedStorageObjects, 0);
  assert.equal(result.wouldDeleteReports, 1);
  assert.equal(result.wouldDeleteStorageObjects, 1);
  assert.deepEqual(state.deletedReports, []);
  assert.deepEqual(state.deletedStorage, []);
});

test("readiness endpoint includes purge booleans without exposing secret values", async () => {
  const original = snapshotEnv();
  process.env.CRON_SECRET = "test-maintenance-secret";
  delete process.env.MAINTENANCE_SECRET;

  try {
    const readiness = getSystemReadiness();
    const response = await getReadiness();
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    assert.equal(readiness.purgePrepared, true);
    assert.equal(readiness.maintenanceSecretConfigured, true);
    assert.equal(typeof payload.purgeConfigured, "boolean");
    assert.equal(payload.purgePrepared, true);
    assert.doesNotMatch(serialized, /test-maintenance-secret/);
  } finally {
    restoreEnv(original);
  }
});

test("public UI does not expose maintenance secret values", () => {
  const source = [
    "src/app/page.tsx",
    "src/app/create-report/page.tsx",
    "src/app/learn-report/page.tsx",
    "src/app/(app)/system/page.tsx",
    "src/components/report/CreateReportForm.tsx",
  ]
    .map((file) => fs.readFileSync(path.join(repoRoot, file), "utf8"))
    .join("\n");

  assert.doesNotMatch(source, /test-maintenance-secret|CRON_SECRET=|MAINTENANCE_SECRET=/);
  assert.doesNotMatch(source, /\/api\/maintenance\/purge/);
});
