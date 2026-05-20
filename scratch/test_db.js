const { createClient } = require("@supabase/supabase-js");

// Read from .env.local.save
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const filepath = path.join(__dirname, "../.env.local.save");
  if (!fs.existsSync(filepath)) {
    console.error("Could not find .env.local.save");
    process.exit(1);
  }
  const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  });
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing keys in env");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testInsert() {
  console.log("Testing insert to public.reports table...");
  const reportId = "00000000-0000-4000-8000-000000000099";
  
  // Clean up first if exists
  await supabase.from("reports").delete().eq("id", reportId);

  const { error } = await supabase.from("reports").insert({
    guest_session_id_hash: "test_guest_session_id_hash",
    id: reportId,
    input: { mode: "start_from_zero", topic: "test" },
    mode: "start_from_zero",
    output: { mode: "start_from_zero", status: "export_ready" },
    processing_metadata: {
      source_verification: "inactive_mvp",
      sprint: "zero",
      step: "preview_generated",
    },
    report_access_token_hash: "test_report_access_token_hash",
    status: "export_ready",
  });

  if (error) {
    console.error("Insert failed!");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    console.error("Error Details:", error.details);
    console.error("Error Hint:", error.hint);
  } else {
    console.log("Insert succeeded!");
    // Clean up
    await supabase.from("reports").delete().eq("id", reportId);
  }
}

testInsert().catch(console.error);
