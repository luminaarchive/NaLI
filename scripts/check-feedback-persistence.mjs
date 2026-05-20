import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  const envFiles = [".env.production.local", ".env.local.save", ".env.local", ".env"];
  for (const filename of envFiles) {
    const filepath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filepath)) continue;

    const lines = fs.readFileSync(filepath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Error: Supabase environment variables are missing.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function checkPersistence() {
  console.log(`Connecting to Supabase at: ${url}`);
  const { count, error } = await supabase
    .from("report_feedback")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Error querying report_feedback:", error.message);
    process.exit(1);
  }

  console.log(`SUCCESS: report_feedback count query succeeded. Current row count: ${count}`);
  process.exit(0);
}

checkPersistence().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
