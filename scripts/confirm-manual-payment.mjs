import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.production.local", ".env.vercel.production", ".env.local.save", ".env.local", ".env"];
const PRODUCTION_SUPABASE_HOST = "wvpplfjrbndzxlgpuicn.supabase.co";

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
      if (key && (!process.env[key] || process.env[key]?.trim() === "")) process.env[key] = value;
    }
  }
}

function usage() {
  return [
    "Founder/manual operation only. This script confirms a real manually verified payment.",
    "",
    "Usage:",
    "  npm run payment:confirm:manual -- --payment-id <payment-id> --confirm",
    "  npm run payment:confirm:manual -- --report-id <report-id> --confirm",
    "  npm run payment:confirm:manual -- --payment-id <payment-id> --dry-run",
    "",
    "Safety:",
    "  - Server-side/admin use only.",
    "  - Requires production Supabase service-role env.",
    "  - Refuses to update without --confirm.",
    "  - Logs only safe payment metadata.",
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    confirm: false,
    dryRun: false,
    paymentId: "",
    reportId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--confirm") {
      args.confirm = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--payment-id") {
      args.paymentId = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--report-id") {
      args.reportId = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function fail(message) {
  console.error(`Manual payment confirmation refused: ${message}`);
  process.exit(1);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function createSupabaseServiceClient() {
  const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceRoleKey) {
    fail("Required production Supabase admin env is missing.");
  }

  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");
  let host = "";

  try {
    host = new URL(url).host;
  } catch {
    fail("Supabase URL is not a valid URL.");
  }

  if (host !== PRODUCTION_SUPABASE_HOST) {
    fail("Supabase URL does not match the verified production project.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function safePaymentMetadata(payment) {
  return {
    amount: payment.amount,
    export_type: payment.export_type,
    payment_id: payment.id,
    report_id: payment.report_id,
    status: payment.status,
  };
}

async function findPendingPayment(supabase, { paymentId, reportId }) {
  const columns = "id, report_id, amount, status, payment_type, export_type, created_at";

  if (paymentId) {
    const { data, error } = await supabase.from("payments").select(columns).eq("id", paymentId).maybeSingle();
    if (error) fail(`Payment lookup failed: ${error.message}`);
    return data;
  }

  const { data, error } = await supabase
    .from("payments")
    .select(columns)
    .eq("report_id", reportId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) fail(`Payment lookup failed: ${error.message}`);
  return data;
}

async function confirmPayment(supabase, payment) {
  const { data, error } = await supabase
    .from("payments")
    .update({
      payment_type: "manual_founder_confirmation",
      raw_notification: {
        confirmed_by: "founder_manual_operation",
        confirmed_at: new Date().toISOString(),
        source: "scripts/confirm-manual-payment.mjs",
      },
      status: "paid",
    })
    .eq("id", payment.id)
    .eq("status", "pending")
    .select("id, report_id, amount, status, payment_type, export_type")
    .maybeSingle();

  if (error) fail(`Payment confirmation failed: ${error.message}`);
  if (!data) fail("Payment was not updated. It may no longer be pending.");

  return data;
}

async function main() {
  loadLocalEnv();

  const args = parseArgs(process.argv.slice(2));

  if (!args.paymentId && !args.reportId) fail("Provide --payment-id or --report-id.");
  if (args.paymentId && args.reportId) fail("Use only one lookup mode: --payment-id or --report-id.");
  if (args.paymentId && !isUuid(args.paymentId)) fail("--payment-id must be a UUID.");
  if (args.reportId && !isUuid(args.reportId)) fail("--report-id must be a UUID.");
  if (args.confirm && args.dryRun) fail("Use either --confirm or --dry-run, not both.");
  if (!args.confirm && !args.dryRun) fail("Use --dry-run to inspect or --confirm to update.");

  const supabase = createSupabaseServiceClient();
  const payment = await findPendingPayment(supabase, args);

  if (!payment) fail("No matching payment row found.");
  if (payment.status !== "pending") fail(`Payment status is ${payment.status}; only pending payments can be confirmed.`);
  if (payment.export_type !== "markdown") fail(`Payment export type is ${payment.export_type}; only markdown is verified for first sale.`);

  console.log("Manual payment candidate:");
  console.log(JSON.stringify(safePaymentMetadata(payment), null, 2));

  if (args.dryRun) {
    console.log("Dry run complete. No payment was changed.");
    return;
  }

  const confirmed = await confirmPayment(supabase, payment);
  console.log("Manual payment confirmed:");
  console.log(JSON.stringify(safePaymentMetadata(confirmed), null, 2));
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : "Unknown error");
});
