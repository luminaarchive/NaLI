require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { NextRequest } = require("next/server");

// Back up original environment
const originalEnv = {
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_MERCHANT_ID: process.env.MIDTRANS_MERCHANT_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Set dummy env variables for test context
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy_service_role";

// Override Supabase admin client lookup
const adminModule = require("../../src/lib/supabase/admin");

let mockSelectFn = () => ({ data: null, error: null });
let mockInsertFn = () => ({ data: null, error: null });
let mockUpdateFn = () => ({ data: null, error: null });

const mockSupabaseClient = {
  from: (table) => {
    const makeChain = (queryObj = {}) => ({
      eq: (col, val) => makeChain({ ...queryObj, [col]: val }),
      is: (col, val) => makeChain({ ...queryObj, [col]: val }),
      in: (col, val) => makeChain({ ...queryObj, [col]: val }),
      order: () => makeChain(queryObj),
      limit: () => makeChain(queryObj),
      select: () => makeChain(queryObj),
      maybeSingle: async () => mockSelectFn(table, queryObj),
      single: async () => mockSelectFn(table, queryObj),
    });

    return {
      select: (fields, options) => makeChain({}),
      insert: (payload) => {
        return {
          select: (fields) => {
            return {
              single: async () => mockInsertFn(table, payload),
            };
          },
          then: async (resolve) => {
            const res = await mockInsertFn(table, payload);
            return resolve(res);
          },
        };
      },
      upsert: (row, options) => {
        return {
          then: async (resolve) => {
            return resolve({ data: null, error: null });
          },
        };
      },
    };
  },
};

adminModule.getOptionalSupabaseAdminClient = () => mockSupabaseClient;

// Import modules
const { getSystemReadiness } = require("../../src/lib/system/readiness");
const { evaluateIntegrityPolicy } = require("../../src/lib/integrity/policy");
const { getReportExportEligibility } = require("../../src/lib/reports/exportGate");
const { POST: postFeedback } = require("../../src/app/api/reports/[id]/feedback/route");
const { buildMockDraftReport } = require("../../src/lib/reports/reportGenerator");
const { getReportAccessTokenHash } = require("../../src/lib/reports/access");

function restoreAllEnv() {
  Object.keys(originalEnv).forEach((k) => {
    if (originalEnv[k] === undefined) delete process.env[k];
    else process.env[k] = originalEnv[k];
  });
}

test("Readiness truth matches CP1 limits and deferred Midtrans", () => {
  // Ensure Midtrans env variables are absent for this readiness test
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_SERVER_KEY;

  try {
    const readiness = getSystemReadiness();
    assert.equal(readiness.midtransConfigured, false);
    assert.equal(readiness.paidCheckoutActive, false);
    assert.equal(readiness.creditPurchaseActive, false);
    assert.equal(readiness.uploadActive, false);
    assert.equal(readiness.fileUploadActive, false);
    assert.equal(readiness.sourceVerificationActive, false);
    assert.equal(readiness.professionalFieldIntelligence, "positioning_only");
    assert.equal(readiness.exportGateStatus, "prepared_locked");
  } finally {
    process.env.MIDTRANS_SERVER_KEY = prevServerKey;
  }
});

test("Abuse safety policy catches fake references and Turnitin bypasses", () => {
  // 1. Fake DOI request is blocked (matches /\b(doi).{0,24}(palsu|fiktif|asal|fake|fabricated|made\s+up)\b/i)
  const resDoi = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Observasi biologi perkecambahan.",
    topic: "Tolong buatkan doi palsu agar terlihat keren.",
  });
  assert.equal(resDoi.allowed, false);
  assert.equal(resDoi.reasonCode, "FAKE_CITATION_REQUEST");

  // 2. Turnitin/AI detector evasion is blocked (matches \b(ai\s+detector|deteksi\s+ai|turnitin|plagiarism\s+checker).{0,36}(lolos|bypass|hindari|avoid|tidak\s+ketahuan|gak\s+ketahuan)\b/i)
  const resEvasion = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Observasi geografi.",
    topic: "Tolong buat agar Turnitin lolos ya.",
  });
  assert.equal(resEvasion.allowed, false);
  assert.equal(resEvasion.reasonCode, "PLAGIARISM_EVASION");

  // 3. Academic cheating task substitution is blocked (matches doMyWorkRule)
  const resHomework = evaluateIntegrityPolicy({
    mode: "draft_from_materials",
    mainText: "Hasil pengamatan.",
    topic: "Tolong kerjakan tugas saya ini.",
  });
  assert.equal(resHomework.allowed, false);
  assert.equal(resHomework.reasonCode, "DO_MY_WORK");
});

test("Export gate remains securely locked for unpaid reports", async () => {
  // Mock select to return no payment records
  mockSelectFn = (table, query) => {
    return { data: null, error: null };
  };

  const eligibility = await getReportExportEligibility("some-report-id");
  assert.equal(eligibility.eligible, false);
  assert.equal(eligibility.state, "export_locked");
  assert.equal(eligibility.reason, "payment_required");
});

test("Feedback route validation and secret filtering", async () => {
  // 1. Invalid rating is rejected with 400
  const reqBad = new NextRequest("http://localhost/api/reports/report-123/feedback", {
    method: "POST",
    body: JSON.stringify({ rating: "excellent", comment: "good job" }),
  });
  const resBad = await postFeedback(reqBad, { params: Promise.resolve({ id: "report-123" }) });
  assert.equal(resBad.status, 400);

  // 2. Fallback guest mode under unconfigured Supabase returns 202
  const originalClient = adminModule.getOptionalSupabaseAdminClient;
  adminModule.getOptionalSupabaseAdminClient = () => null;

  try {
    const reqFallback = new NextRequest("http://localhost/api/reports/report-123/feedback", {
      method: "POST",
      body: JSON.stringify({ rating: "helpful", comment: "Cukup baik." }),
    });
    const resFallback = await postFeedback(reqFallback, { params: Promise.resolve({ id: "report-123" }) });
    assert.equal(resFallback.status, 202);
  } finally {
    adminModule.getOptionalSupabaseAdminClient = originalClient;
  }

  // 3. Database error under configured Supabase returns 500 and does not leak secrets
  mockSelectFn = (table, query) => {
    if (table === "reports") {
      return {
        data: {
          id: "report-123",
          guest_session_id_hash: "trusted_guest_session_hash",
          report_access_token_hash: getReportAccessTokenHash("my_key")
        },
        error: null
      };
    }
    return { data: null, error: null };
  };

  mockInsertFn = (table, payload) => {
    return { data: null, error: { code: "TIMEOUT", message: "Timeout" } };
  };

  const reqGood = new NextRequest("http://localhost/api/reports/report-123/feedback", {
    method: "POST",
    body: JSON.stringify({ rating: "helpful", comment: "Cukup baik.", report_access_key: "my_key" }),
  });
  const resGood = await postFeedback(reqGood, { params: Promise.resolve({ id: "report-123" }) });
  assert.equal(resGood.status, 500);
  const bodyGood = await resGood.json();
  
  const serialized = JSON.stringify(bodyGood);
  assert.doesNotMatch(serialized, /hash|token|secret/i);
});

test("Evidence strength auditor correctly flags weak short prompts", () => {
  const report = buildMockDraftReport({
    title: "Praktikum Cepat",
    mainText: "Tanaman mati.",
    topic: "Fotosintesis cepat",
    reportTemplate: "Laporan Praktikum",
    sourceUrls: [],
    location: "",
    fileDescription: "",
  });
  assert.equal(report.evidence_strength, "weak");
  assert.ok(report.evidence_warnings.some((w) => w.includes("sangat pendek")));
});

// Restore original env variables after testing
test.after(() => {
  restoreAllEnv();
});
