require("../helpers/register-ts.cjs");

const assert = require("node:assert/strict");
const test = require("node:test");
const { NextRequest } = require("next/server");

// Back up original environment
const originalEnv = {
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
  MIDTRANS_MERCHANT_ID: process.env.MIDTRANS_MERCHANT_ID,
  MIDTRANS_ENVIRONMENT: process.env.MIDTRANS_ENVIRONMENT,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Set dummy env variables for default test context
process.env.MIDTRANS_SERVER_KEY = "dummy_server_key";
process.env.MIDTRANS_MERCHANT_ID = "dummy_merchant_id";
process.env.MIDTRANS_ENVIRONMENT = "sandbox";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://dummy.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy_service_role";

// Mock global fetch for Midtrans Snap API requests
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  if (url && typeof url === "string" && (url.includes("midtrans.com") || url.includes("sandbox.midtrans.com"))) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        token: "mock_snap_token",
        redirect_url: "https://app.sandbox.midtrans.com/snap/v4/redirection/mock_token",
      }),
    };
  }
  if (originalFetch) {
    return originalFetch(url, options);
  }
  return { ok: false, status: 500, json: async () => ({}) };
};

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
      update: (payload) => {
        return {
          eq: (col, val) => {
            return {
              select: (fields) => {
                return {
                  maybeSingle: async () => mockUpdateFn(table, payload, { col, val }),
                };
              },
            };
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

// Import route handlers
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");
const { POST: createPayment } = require("../../src/app/api/payments/create/route");
const { POST: processWebhook } = require("../../src/app/api/payments/midtrans-webhook/route");
const { GET: getExport } = require("../../src/app/api/reports/[id]/export/route");
const { getReportAccessTokenHash, getGuestSessionIdHash } = require("../../src/lib/reports/access");
const { createMidtransSignature } = require("../../src/lib/payments/midtrans");
const { __setCookie, __clearCookies } = require("../helpers/next-headers-mock.cjs");

// Helper to restore env
function restoreAllEnv() {
  Object.keys(originalEnv).forEach((k) => {
    if (originalEnv[k] === undefined) delete process.env[k];
    else process.env[k] = originalEnv[k];
  });
}

test("Readiness truth indicates status correctly when env variables are missing", async () => {
  // Save current process.env properties
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  const prevMerchantId = process.env.MIDTRANS_MERCHANT_ID;
  
  delete process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_MERCHANT_ID;

  try {
    const res = await getReadiness();
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.midtransConfigured, false);
    assert.equal(body.exportGateStatus, "prepared_locked");
  } finally {
    process.env.MIDTRANS_SERVER_KEY = prevServerKey;
    process.env.MIDTRANS_MERCHANT_ID = prevMerchantId;
  }
});

test("Payment creation route rejects invalid inputs and missing keys safely", async () => {
  __clearCookies();
  __setCookie("nali_guest_session", "trusted_session");
  // 1. Rejected on empty body/missing fields
  const reqEmpty = new NextRequest("http://localhost/api/payments/create", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const resEmpty = await createPayment(reqEmpty);
  assert.equal(resEmpty.status, 400);
  const bodyEmpty = await resEmpty.json();
  assert.match(bodyEmpty.error, /Laporan dan access key diperlukan/i);

  // 2. Safe fallback message when Midtrans env key is missing
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_SERVER_KEY;

  mockSelectFn = (table, query) => {
    if (table === "reports") {
      return {
        data: {
          id: "report-123",
          guest_session_id_hash: getGuestSessionIdHash("trusted_session"),
          report_access_token_hash: getReportAccessTokenHash("my_access_key"),
          status: "export_ready",
          output: { id: "report-123", mode: "draft_from_materials" },
        },
        error: null,
      };
    }
    return { data: null, error: null };
  };

  mockInsertFn = (table, payload) => {
    return { data: { id: "manual-payment-id", midtrans_order_id: payload.midtrans_order_id }, error: null };
  };

  try {
    const reqFallback = new NextRequest("http://localhost/api/payments/create", {
      method: "POST",
      headers: { cookie: "nali_guest_session=trusted_session" },
      body: JSON.stringify({
        report_id: "report-123",
        report_access_key: "my_access_key",
        export_type: "pdf",
      }),
    });
    const resFallback = await createPayment(reqFallback);
    assert.equal(resFallback.status, 200);
    const bodyFallback = await resFallback.json();
    assert.equal(bodyFallback.payment_mode, "manual");
    assert.match(bodyFallback.message, /Payment gateway belum aktif/i);
  } finally {
    process.env.MIDTRANS_SERVER_KEY = prevServerKey;
  }
});

test("Webhook callback signature security and credit grant validation", async () => {
  let dbUpdates = [];
  let ledgerEntries = [];

  mockSelectFn = (table, query) => {
    if (table === "payments") {
      return {
        data: {
          amount: 49000,
          raw_notification: {
            metadata: {
              order_id: "order-123",
              guest_session_id_hash: "trusted_guest_session_hash",
              product_type: "plan",
              product_id: "starter",
              credits_to_grant: 300,
              gross_amount: 49000,
            },
          },
        },
        error: null,
      };
    }
    return { data: null, error: null };
  };

  mockUpdateFn = (table, payload, query) => {
    dbUpdates.push({ table, payload, query });
    return {
      data: {
        id: "payment-record-123",
        report_id: "report-123",
        amount: 49000,
        status: "paid",
        raw_notification: payload.raw_notification,
      },
      error: null,
    };
  };

  mockInsertFn = (table, payload) => {
    if (table === "energy_ledger") {
      ledgerEntries.push(payload);
    }
    return { data: payload, error: null };
  };

  // 1. Invalid signature webhook rejected
  const reqBadSignature = new NextRequest("http://localhost/api/payments/midtrans-webhook", {
    method: "POST",
    body: JSON.stringify({
      order_id: "order-123",
      status_code: "200",
      gross_amount: "49000.00",
      transaction_status: "settlement",
      signature_key: "wrong_signature",
    }),
  });
  const resBadSignature = await processWebhook(reqBadSignature);
  assert.equal(resBadSignature.status, 401);

  // 2. Valid signature settlement grants credits
  const correctSignature = createMidtransSignature({
    grossAmount: "49000.00",
    orderId: "order-123",
    serverKey: "dummy_server_key",
    statusCode: "200",
  });

  const reqGoodWebhook = new NextRequest("http://localhost/api/payments/midtrans-webhook", {
    method: "POST",
    body: JSON.stringify({
      order_id: "order-123",
      status_code: "200",
      gross_amount: "49000.00",
      transaction_status: "settlement",
      signature_key: correctSignature,
      payment_type: "gopay",
    }),
  });

  const resGoodWebhook = await processWebhook(reqGoodWebhook);
  assert.equal(resGoodWebhook.status, 200);

  // Verify status updated and credits granted
  assert.equal(dbUpdates.length, 1);
  assert.equal(dbUpdates[0].payload.status, "paid");
  assert.equal(ledgerEntries.length, 1);
  assert.equal(ledgerEntries[0].amount, 300);
  assert.equal(ledgerEntries[0].type, "credit");
});

test("Export gate refuses unauthorized download attempts and prevents client bypass", async () => {
  __clearCookies();
  __setCookie("nali_guest_session", "trusted_session");
  mockSelectFn = (table, query) => {
    if (table === "reports") {
      // Return persisted report
      return {
        data: {
          id: "report-123",
          guest_session_id_hash: getGuestSessionIdHash("trusted_session"),
          report_access_token_hash: getReportAccessTokenHash("my_token"),
          status: "export_ready",
          output: {
            id: "report-123",
            title: "Laporan Mangrove",
            mode: "draft_from_materials",
            created_at: "2026-05-24T12:00:00.000Z",
            report_type: "field_report",
            draft_label: "Draft Bantuan Belajar",
            executive_summary: "Summary info.",
            background: "Background info.",
            objective: "Objective info.",
            method_or_materials: "Methods.",
            findings: ["Finding 1"],
            preliminary_analysis: "Analysis.",
            source_verification_status: "Source verification belum aktif di MVP ini.",
            source_notes: ["Source 1"],
            evidence_table: [
              { id: "EV-1", material_type: "Catatan Lapangan", summary: "Rhizophora observed.", verification_status: "Source verification belum aktif di MVP ini." }
            ],
            additional_evidence_needed: ["Evidence 2"],
            user_review_checklist: ["Review 1"],
            uncertainty_note: "Uncertainty.",
            disclaimer: "Dokumen ini adalah draft bantuan belajar...",
            next_user_steps: ["Steps 1"]
          },
        },
        error: null,
      };
    }
    if (table === "payments") {
      // Simulate unpaid state
      return { data: null, error: null };
    }
    return { data: null, error: null };
  };

  // 1. Blocked when unpaid
  const reqUnpaid = new NextRequest("http://localhost/api/reports/report-123/export?token=my_token&format=markdown", {
    headers: { cookie: "nali_guest_session=trusted_session" }
  });
  const resUnpaid = await getExport(reqUnpaid, { params: Promise.resolve({ id: "report-123" }) });
  assert.equal(resUnpaid.status, 402);
  const bodyUnpaid = await resUnpaid.json();
  assert.equal(bodyUnpaid.error, "Unlock Export diperlukan sebelum mengunduh file premium.");

  // 2. Allowed when paid
  mockSelectFn = (table, query) => {
    if (table === "reports") {
      return {
        data: {
          id: "report-123",
          guest_session_id_hash: getGuestSessionIdHash("trusted_session"),
          report_access_token_hash: getReportAccessTokenHash("my_token"),
          status: "export_ready",
          output: {
            id: "report-123",
            title: "Laporan Mangrove",
            mode: "draft_from_materials",
            created_at: "2026-05-24T12:00:00.000Z",
            report_type: "field_report",
            draft_label: "Draft Bantuan Belajar",
            executive_summary: "Summary info.",
            background: "Background info.",
            objective: "Objective info.",
            method_or_materials: "Methods.",
            findings: ["Finding 1"],
            preliminary_analysis: "Analysis.",
            source_verification_status: "Source verification belum aktif di MVP ini.",
            source_notes: ["Source 1"],
            evidence_table: [
              { id: "EV-1", material_type: "Catatan Lapangan", summary: "Rhizophora observed.", verification_status: "Source verification belum aktif di MVP ini." }
            ],
            additional_evidence_needed: ["Evidence 2"],
            user_review_checklist: ["Review 1"],
            uncertainty_note: "Uncertainty.",
            disclaimer: "Dokumen ini adalah draft bantuan belajar...",
            next_user_steps: ["Steps 1"]
          },
        },
        error: null,
      };
    }
    if (table === "payments") {
      // Simulate paid state
      return {
        data: { id: "payment-99", status: "paid", amount: 19000 },
        error: null,
      };
    }
    return { data: null, error: null };
  };

  const reqPaid = new NextRequest("http://localhost/api/reports/report-123/export?token=my_token&format=markdown", {
    headers: { cookie: "nali_guest_session=trusted_session" }
  });
  const resPaid = await getExport(reqPaid, { params: Promise.resolve({ id: "report-123" }) });
  assert.equal(resPaid.status, 200);
  const textPaid = await resPaid.text();
  assert.match(textPaid, /Laporan Mangrove/i);
});

// Restore environment variables at the end
test.after(() => {
  restoreAllEnv();
  globalThis.fetch = originalFetch;
});
