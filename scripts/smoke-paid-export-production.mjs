import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULT_BASE_URL = "https://naliai.vercel.app";
const ENV_FILES = [".env.production.local", ".env.vercel.production", ".env.local.save", ".env.local", ".env"];
const PRODUCTION_SUPABASE_HOST = "wvpplfjrbndzxlgpuicn.supabase.co";
const RESUME_FILE = path.join(os.tmpdir(), "nali-paid-export-smoke-state.json");
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
      const value = trimmed
        .slice(index + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");
      if (key && (!process.env[key] || process.env[key]?.trim() === "")) process.env[key] = value;
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

function assertNoPdfSecretLeak(pdfRaw, accessKey) {
  const pdfSecretPatterns = [
    /guest-session-/i,
    /report[_-]?access[_-]?(?:key|token)/i,
    /payment[_-]?(?:id|reference|status)/i,
    /midtrans[_-]?order[_-]?id/i,
    /service_role/i,
    /MIDTRANS_SERVER_KEY/i,
    /SUPABASE_SERVICE_ROLE_KEY/i,
    /\b[a-f0-9]{64}\b/i,
  ];

  for (const pattern of pdfSecretPatterns) {
    assert(!pattern.test(pdfRaw), "Export PDF appears to contain sensitive NaLI metadata");
  }
  assert(!pdfRaw.includes(accessKey), "Export PDF contains the report access key");
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const json = await response.json().catch(() => ({}));
  return { json, response };
}

function readResumeState() {
  if (!fs.existsSync(RESUME_FILE)) return null;
  const raw = fs.readFileSync(RESUME_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") return null;
  if (typeof parsed.reportId !== "string" || typeof parsed.accessKey !== "string") return null;
  return parsed;
}

function writeResumeState(state) {
  fs.writeFileSync(RESUME_FILE, JSON.stringify(state), { mode: 0o600 });
}

function clearResumeState() {
  if (fs.existsSync(RESUME_FILE)) fs.rmSync(RESUME_FILE);
}

function createSupabaseServiceClient() {
  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceRoleKey) return null;

  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");
  const host = new URL(url).host;
  if (host !== PRODUCTION_SUPABASE_HOST) return null;

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
  const resumeState = readResumeState();

  console.log("[1/8] production readiness");
  const readiness = await fetchJson(`${baseUrl}/api/system/readiness`, { cache: "no-store" });
  assert(readiness.response.status === 200, `Readiness returned HTTP ${readiness.response.status}`);

  const dbStatus = readiness.json.dbStatus || {};
  assert(dbStatus.reports?.success === true, "reports readiness must be true");
  assert(dbStatus.feedback?.success === true, "report_feedback readiness must be true");
  assert(dbStatus.usageEvents?.success === true, "usage_events readiness must be true");
  assert(dbStatus.payments?.success === true, "payments readiness must be true");
  assert(dbStatus.reportEvents?.success === true, "report_events readiness must be true");
  assert(dbStatus.apiUsageLogs?.success === true, "api_usage_logs readiness must be true");
  const midtransProductionMode =
    typeof readiness.json.midtransProductionMode === "boolean" ? readiness.json.midtransProductionMode : false;

  assert(typeof readiness.json.midtransConfigured === "boolean", "midtransConfigured readiness must be boolean");
  assert(
    readiness.json.midtransProductionMode === undefined || typeof readiness.json.midtransProductionMode === "boolean",
    "midtransProductionMode readiness must be boolean when deployed",
  );
  console.log(`- paymentsSuccess: ${dbStatus.payments.success}`);
  console.log(`- reportEventsSuccess: ${dbStatus.reportEvents.success}`);
  console.log(`- apiUsageLogsSuccess: ${dbStatus.apiUsageLogs.success}`);
  console.log(`- midtransConfigured: ${readiness.json.midtransConfigured === true}`);
  console.log(`- midtransProductionMode: ${midtransProductionMode}`);

  if (resumeState) {
    console.log("[2/8] resume production report");
    console.log("- reportPersisted: true");
    console.log("[3/8] unpaid export lock");
    console.log("- unpaidExportLocked: previously verified");
    console.log("- unpaidPdfExportLocked: previously verified");
    console.log("[4/8] payment creation");
    console.log("- pendingPaymentRowCreated: previously verified");
    console.log("[5/8] confirm payment through database source of truth");
    console.log("- confirmedPaymentUnlockSource: externally confirmed in payments");
    await verifyUnlockedExport({ accessKey: resumeState.accessKey, baseUrl, reportId: resumeState.reportId });
    clearResumeState();
    console.log("Paid export production smoke passed.");
    return;
  }

  const guestSessionId = `guest-session-paid-export-smoke-${randomUUID()}`;

  console.log("[2/8] create production report");
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
  assert(
    reportResponse.json.persistence === "supabase",
    `Expected Supabase persistence, got ${reportResponse.json.persistence}`,
  );
  const reportId = reportResponse.json.report_id;
  const accessKey = reportResponse.json.report_access_key;
  assert(typeof reportId === "string" && reportId.length > 0, "Report id missing");
  assert(typeof accessKey === "string" && accessKey.length >= 40, "Report access key missing");
  console.log("- reportPersisted: true");

  console.log("[3/8] unpaid export lock");
  const unpaidExport = await fetchJson(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/export?token=${encodeURIComponent(accessKey)}`,
    { cache: "no-store" },
  );
  assert(unpaidExport.response.status === 402, `Expected unpaid export HTTP 402, got ${unpaidExport.response.status}`);
  assert(unpaidExport.json.state === "export_locked", "Unpaid export state must be export_locked");
  assert(
    /unlock|payment|pembayaran|diperlukan/i.test(unpaidExport.json.error || ""),
    "Unpaid export must say payment is required",
  );
  assertNoSecretLeak(unpaidExport.json, "Unpaid export response");
  console.log("- unpaidExportLocked: true");

  const unpaidPdfExport = await fetchJson(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/export?token=${encodeURIComponent(accessKey)}&format=pdf`,
    { cache: "no-store" },
  );
  assert(
    unpaidPdfExport.response.status === 402,
    `Expected unpaid PDF export HTTP 402, got ${unpaidPdfExport.response.status}`,
  );
  assert(unpaidPdfExport.json.state === "export_locked", "Unpaid PDF export state must be export_locked");
  assert(
    /unlock|payment|pembayaran|diperlukan/i.test(unpaidPdfExport.json.error || ""),
    "Unpaid PDF export must say payment is required",
  );
  assertNoSecretLeak(unpaidPdfExport.json, "Unpaid PDF export response");
  console.log("- unpaidPdfExportLocked: true");

  console.log("[4/8] payment creation");
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
      status: paymentResponse.json.status,
    },
    "Payment create response",
  );
  assert(
    paymentResponse.json.status === "pending" || paymentResponse.json.status === "manual_payment_pending",
    "Payment create must be pending",
  );
  assert(paymentResponse.json.status !== "paid", "Payment create must not fake paid success");

  if (readiness.json.midtransConfigured === true) {
    const checkoutUrl = paymentResponse.json.checkout_url || paymentResponse.json.snap_url;
    assert(typeof checkoutUrl === "string", "Midtrans configured but checkout URL missing");
    assert(
      typeof paymentResponse.json.snap_token === "string" && paymentResponse.json.snap_token.length > 0,
      "Midtrans configured but Snap token missing",
    );
    assert(/^https:\/\/app(\.sandbox)?\.midtrans\.com\//.test(checkoutUrl), "Checkout URL is not a safe Midtrans URL");
    console.log("- paymentMode: midtrans");
    console.log("- checkoutUrlReturned: true");
    console.log("- snapTokenReturned: true");
  } else {
    assert(paymentResponse.json.payment_mode === "manual", "Missing Midtrans must return manual payment mode");
    assert(
      !paymentResponse.json.checkout_url && !paymentResponse.json.snap_url && !paymentResponse.json.snap_token,
      "Manual payment mode must not include Snap credentials",
    );
    console.log("- paymentMode: manual");
  }

  if (supabase) {
    const pendingPayment = await getLatestPayment(supabase, reportId);
    assert(pendingPayment, "Pending payment row was not created");
    assert(pendingPayment.status === "pending", `Expected pending payment row, got ${pendingPayment.status}`);
    assert(pendingPayment.export_type === "markdown", "Pending payment export type must be markdown");
    console.log("- pendingPaymentRowCreated: true");

    console.log("[5/8] confirm payment through database source of truth");
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

    await verifyUnlockedExport({ accessKey, baseUrl, reportId });
    console.log("Paid export production smoke passed.");
    return;
  }

  assert(typeof paymentResponse.json.payment_id === "string", "Payment create response missing payment id");
  writeResumeState({
    accessKey,
    createdAt: new Date().toISOString(),
    paymentId: paymentResponse.json.payment_id,
    reportId,
  });
  console.log("- pendingPaymentRowCreated: api-confirmed");
  throw new Error(
    "Production service-role env is unavailable locally. Confirm the saved pending payment with Supabase admin/MCP, then rerun npm run smoke:export:prod to verify unlock and export.",
  );
}

async function verifyUnlockedExport({ accessKey, baseUrl, reportId }) {
  console.log("[6/8] report export readiness");
  const unlockedReport = await fetchJson(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}?token=${encodeURIComponent(accessKey)}`,
    { cache: "no-store" },
  );
  assert(unlockedReport.response.status === 200, `Report lookup returned HTTP ${unlockedReport.response.status}`);
  assert(unlockedReport.json.export_readiness === "export_ready", "Report export_readiness must be export_ready");
  assertNoSecretLeak(unlockedReport.json.export_readiness, "Report readiness response");
  console.log("- exportReadiness: export_ready");

  console.log("[7/8] export markdown after confirmation");
  const exportResponse = await fetch(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/export?token=${encodeURIComponent(accessKey)}`,
    { cache: "no-store" },
  );
  const markdown = await exportResponse.text();
  assert(exportResponse.status === 200, `Confirmed export returned HTTP ${exportResponse.status}`);
  assert(
    (exportResponse.headers.get("content-type") || "").includes("text/markdown"),
    "Export content-type must be markdown",
  );
  assert(markdown.includes("Draft bantuan belajar/penulisan berbasis bukti."), "Export markdown missing draft label");
  assert(
    markdown.includes("Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti."),
    "Export markdown missing disclaimer",
  );
  assertNoSecretLeak(markdown, "Export markdown");
  console.log("- exportMarkdownReturned: true");

  console.log("[8/8] export PDF after confirmation");
  const pdfResponse = await fetch(
    `${baseUrl}/api/reports/${encodeURIComponent(reportId)}/export?token=${encodeURIComponent(accessKey)}&format=pdf`,
    { cache: "no-store" },
  );
  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
  const pdfRaw = pdfBuffer.toString("latin1");
  assert(pdfResponse.status === 200, `Confirmed PDF export returned HTTP ${pdfResponse.status}`);
  assert(
    (pdfResponse.headers.get("content-type") || "").includes("application/pdf"),
    "PDF export content-type must be application/pdf",
  );
  assert(pdfBuffer.subarray(0, 5).toString("latin1") === "%PDF-", "PDF export must return PDF bytes");
  assertNoPdfSecretLeak(pdfRaw, accessKey);
  console.log("- exportPdfReturned: true");
}

run().catch((error) => {
  console.error(`Paid export production smoke failed: ${error.message}`);
  process.exit(1);
});
