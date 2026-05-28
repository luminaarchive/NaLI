import { execSync } from "node:child_process";

console.log("=========================================");
console.log("         NaLI Fast Verification          ");
console.log("=========================================");

function runCommand(command, description) {
  console.log(`\nRunning: ${description}...`);
  try {
    execSync(command, { stdio: "inherit" });
    console.log(`[PASS] ${description}`);
  } catch (error) {
    console.error(`[FAIL] ${description} failed.`);
    process.exit(1);
  }
}

// 1. Git Clean Check
runCommand("node scripts/agent/check-git-clean.mjs", "Git Status Verification");

// 2. Env Readiness
runCommand("node scripts/agent/check-env-readiness.mjs", "Environment Verification");

// 3. Lint Check
runCommand("npm run lint", "Lint Verification");

// 4. Type Check
runCommand("npm run typecheck", "Type Verification");

// 5. Selected Unit Tests
runCommand("node --test tests/reports/auth-persistence-linking.test.cjs", "Auth Persistence unit tests");
runCommand("node --test tests/reports/seo-og-metadata.test.cjs", "SEO OG Metadata unit tests");

console.log("\n=========================================");
console.log("Fast Verification Result: ALL PASSED");
console.log("=========================================");
process.exit(0);
