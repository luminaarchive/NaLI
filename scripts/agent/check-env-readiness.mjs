import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

loadEnv();

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const clientKeys = Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_"));

let status = "READY";
const missing = [];
const unsafe = [];

for (const key of requiredKeys) {
  const val = process.env[key];
  if (!val || val.trim() === "" || val === "dummy" || val.includes("dummy.supabase")) {
    missing.push(key);
  }
}

// Security Audit: Check if service role key is leaked into client-accessible variables
for (const key of clientKeys) {
  const val = process.env[key] || "";
  if (key !== "NEXT_PUBLIC_SUPABASE_ANON_KEY" && val === process.env.SUPABASE_SERVICE_ROLE_KEY && val) {
    unsafe.push(`${key} leaks SUPABASE_SERVICE_ROLE_KEY`);
    status = "UNSAFE";
  }
}

if (status !== "UNSAFE") {
  if (missing.length === requiredKeys.length) {
    status = "MISSING";
  } else if (missing.length > 0) {
    status = "PARTIAL";
  }
}

console.log("=========================================");
console.log("      NaLI Environment Readiness         ");
console.log("=========================================");
console.log(`Status:  ${status}`);
console.log("-----------------------------------------");

for (const key of requiredKeys) {
  const present = process.env[key] && process.env[key] !== "dummy" && !process.env[key].includes("dummy.supabase");
  console.log(`${key.padEnd(30)}: ${present ? "PRESENT" : "MISSING"}`);
}

console.log("-----------------------------------------");
if (missing.length > 0) {
  console.log(`Missing Keys: ${missing.join(", ")}`);
}
if (unsafe.length > 0) {
  console.log(`Security Violations: ${unsafe.join(", ")}`);
}
console.log("=========================================");

if (status === "UNSAFE") {
  process.exit(1);
} else {
  process.exit(0);
}
