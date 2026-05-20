import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_BASE_URL = "https://naliai.vercel.app";
const ENV_FILES = [".env.production.local", ".env.local.save", ".env.local", ".env"];
const SECRET_PATTERNS = [
  /guest-session-[a-z0-9-]+/i,
  /[A-Za-z0-9_-]{43,}/,
  /[a-f0-9]{64}/i,
  /service_role/i,
  /MIDTRANS_SERVER_KEY/i,
  /SUPABASE_SERVICE_ROLE_KEY/i,
];

function loadLocalEnv() {
  for (const filename of ENV_FILES) {
    const filepath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filepath)) continue;

    const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertNoSecretLeak(value, label) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  for (const pattern of SECRET_PATTERNS) {
    assert(!pattern.test(text), `${label} appears to contain a secret-like value`);
  }
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const json = await response.json().catch(() => ({}));
  return { json, response };
}

function createSupabaseServiceClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  assert(rawUrl, "NEXT_PUBLIC_SUPABASE_URL is required for production export smoke");
  assert(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY is required for production export smoke");

  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getLatestPayment(supabase, reportId) {
  const { data, error } = await supabase
    .from("payments")
    .select("id, report_id, midtrans_order_id, amount, status, payment_type, export_type, created_at")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Payment lookup failed: ${error.message}`);
  return data;
}

async function run() {
  loadLocalEnv();

  const baseUrl = (process.env.TEST_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  assert(baseUrl === DEFAULT_BASE_URL, "Production export smoke must target https://naliai.vercel.app by default");

  const supabase = createSupabaseServiceClient();
  const guestSessionId = `guest-session-paid-export-smoke-${randomUUID()}`;

  console.log("[1/7] production readiness");
  const readiness = await fetchJson(`${baseUrl}/api/system/readiness`, { cache: "no-store" });
  assert(readiness.response.status === 200, `Readiness returned HTTP ${readiness.response.status}`);

  const dbStatus = readiness.json.dbStatus || {};
  assert(dbStatus.reports?.success === true, "reports readiness must be true");
  assert(dbStatus.feedback?.success === true, "report_feedback readiness must be true");
  assert(dbStatus.usageEvents?.success === true, "usage_events readiness must be true");
  assert(dbStatus.payments?.success === true, "payments readiness must be true");
  console.log(`- paymentsSuccess: ${dbStatus.payments.success}`);
  console.log(`- midtransConfigured: ${readiness.json.midtransConfigured === true}`);

  console.log("[2/7] create production report");
  const reportResponse = await fetchJson(`${baseUrl}/api/reports/generate`, {
    body: JSON.stringify({
      guestSessionId,
      integrityConsent: true,
      location: "Semarang, lokasi umum untuk smoke test produksi",
      mainText:
        "Smoke test produksi NaLI: catatan observasi menyebut erosi ringan di tepi saluran air, air keruh setelah hujan, dan kebutuhan foto serta verifikasi sumber sebelum laporan akhir.",
      mode: "draft_from_materials",
      reportTemplate: "Laporan Observasi Lingkungan",
      title: "Smoke Test Paid Export Production",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  assert(reportResponse.response.status === 200, `Report generation returned HTTP ${reportResponse.response.status}`);
  assert(reportResponse.json.persistence === "supabase", `Expected Supabase persistence, got ${reportResponse.json.persistence}`);
  const reportId = reportResponse.json.report_id;
  const accessKey = reportResponse.json.report_access_key;
  assert(typeof reportId === "string" && reportId.length > 0, "Report id missing");
  assert(typeof accessKey === "string" && accessKey.length >= 40, "Report access key missing");
  console.log("- reportPersisted: true");

  console.log("[3/7] unpaid export lock");
  const unpaidExport = await fetchJson(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/export?token=${encodeURIComponent(accessKey)}`,
    { cache: "no-store" },
  );
  assert(unpaidExport.response.status === 402, `Expected unpaid export HTTP 402, got ${unpaidExport.response.status}`);
  assert(unpaidExport.json.state === "export_locked", "Unpaid export state must be export_locked");
  assert(/unlock|payment|pembayaran|diperlukan/i.test(unpaidExport.json.error || ""), "Unpaid export must say payment is required");
  assertNoSecretLeak(unpaidExport.json, "Unpaid export response");
  console.log("- unpaidExportLocked: true");

  console.log("[4/7] payment creation");
  const paymentResponse = await fetchJson(`${baseUrl}/api/payments/create`, {
    body: JSON.stringify({
      export_type: "markdown",
      guestSessionId,
      report_access_key: accessKey,
      report_id: reportId,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  assert(paymentResponse.response.ok, `Payment create returned HTTP ${paymentResponse.response.status}`);
  assertNoSecretLeak(
    {
      error: paymentResponse.json.error,
      export_type: paymentResponse.json.export_type,
      message: paymentResponse.json.message,
      payment_mode: paymentResponse.json.payment_mode,
      snap_url: paymentResponse.json.snap_url,
      status: paymentResponse.json.status,
    },
    "Payment create response",
  );
  assert(paymentResponse.json.status === "pending" || paymentResponse.json.status === "manual_payment_pending", "Payment create must be pending");
  assert(paymentResponse.json.status !== "paid", "Payment create must not fake paid success");

  if (readiness.json.midtransConfigured === true) {
    assert(typeof paymentResponse.json.snap_url === "string", "Midtrans configured but Snap URL missing");
    assert(/^https:\/\/app(\.sandbox)?\.midtrans\.com\//.test(paymentResponse.json.snap_url), "Snap URL is not a safe Midtrans URL");
    console.log("- paymentMode: midtrans");
  } else {
    assert(paymentResponse.json.payment_mode === "manual", "Missing Midtrans must return manual payment mode");
    assert(!paymentResponse.json.snap_url && !paymentResponse.json.snap_token, "Manual payment mode must not include Snap credentials");
    console.log("- paymentMode: manual");
  }

  const pendingPayment = await getLatestPayment(supabase, reportId);
  assert(pendingPayment, "Pending payment row was not created");
  assert(pendingPayment.status === "pending", `Expected pending payment row, got ${pendingPayment.status}`);
  assert(pendingPayment.export_type === "markdown", "Pending payment export type must be markdown");
  console.log("- pendingPaymentRowCreated: true");

  console.log("[5/7] confirm payment through database source of truth");
  const { data: confirmedPayment, error: confirmError } = await supabase
    .from("payments")
    .update({
      payment_type: "production_smoke_manual_confirmation",
      raw_notification: {
        confirmed_by: "smoke-paid-export-production",
        source: "server_side_admin_script",
      },
      status: "paid",
    })
    .eq("id", pendingPayment.id)
    .select("id, report_id, status, export_type")
    .single();

  if (confirmError) throw new Error(`Payment confirmation failed: ${confirmError.message}`);
  assert(confirmedPayment.status === "paid", "Confirmed payment row must be paid");
  console.log("- confirmedPaymentUnlockSource: payments");

  console.log("[6/7] report export readiness");
  const unlockedReport = await fetchJson(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}?token=${encodeURIComponent(accessKey)}`,
    { cache: "no-store" },
  );
  assert(unlockedReport.response.status === 200, `Report lookup returned HTTP ${unlockedReport.response.status}`);
  assert(unlockedReport.json.export_readiness === "export_ready", "Report export_readiness must be export_ready");
  assertNoSecretLeak(unlockedReport.json.export_readiness, "Report readiness response");
  console.log("- exportReadiness: export_ready");

  console.log("[7/7] export markdown after confirmation");
  const exportResponse = await fetch(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/export?token=${encodeURIComponent(accessKey)}`,
    { cache: "no-store" },
  );
  const markdown = await exportResponse.text();
  assert(exportResponse.status === 200, `Confirmed export returned HTTP ${exportResponse.status}`);
  assert((exportResponse.headers.get("content-type") || "").includes("text/markdown"), "Export content-type must be markdown");
  assert(markdown.includes("Draft bantuan belajar/penulisan berbasis bukti."), "Export markdown missing draft label");
  assert(markdown.includes("Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti."), "Export markdown missing disclaimer");
  assertNoSecretLeak(markdown, "Export markdown");
  console.log("- exportMarkdownReturned: true");

  console.log("Paid export production smoke passed.");
}

run().catch((error) => {
  console.error(`Paid export production smoke failed: ${error.message}`);
  process.exit(1);
});
