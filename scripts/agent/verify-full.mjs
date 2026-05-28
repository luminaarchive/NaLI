import { execSync, spawn } from "node:child_process";

console.log("=========================================");
console.log("         NaLI Full Verification          ");
console.log("=========================================");

function runCommand(command, description) {
  console.log(`\nRunning: ${description}...`);
  try {
    execSync(command, { stdio: "inherit" });
    console.log(`[PASS] ${description}`);
  } catch (error) {
    console.error(`[FAIL] ${description} failed.`);
    throw error;
  }
}

async function run() {
  try {
    // 1. Env Readiness
    runCommand("node scripts/agent/check-env-readiness.mjs", "Environment Verification");

    // 2. Lint Check
    runCommand("npm run lint", "Lint Verification");

    // 3. Type Check
    runCommand("npm run typecheck", "Type Verification");
    runCommand("npm run typecheck:build", "Build-specific Type Verification");

    // 4. Production Build
    runCommand("npm run build", "Next.js Production Build");

    // 5. Integration / Domain Tests
    runCommand("npm run check:i18n", "i18n Translation Coverage");
    runCommand("npm run test:demo", "Species Demo Verification");
    runCommand("npm run test:reasoning", "Operational Reasoning Engine");

    // 6. Complete Unit Test Suite
    runCommand("node --test tests/reports/*.test.cjs", "Full Reports Unit Tests Suite");

    // 7. E2E Playwright Suite
    runCommand("npx playwright test", "E2E Playwright Specs");

    // 8. Workspaces verification helper
    runCommand("npm run verify", "Final Workspace Verification");

    // 9. Local Routes & SEO Smoke Check
    console.log("\nStarting local production server for Smoke Checks...");
    const server = spawn("npx", ["next", "start", "-p", "3002"], {
      stdio: "ignore",
      detached: true,
    });

    let attempts = 0;
    const maxAttempts = 15;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let isUp = false;
    while (attempts < maxAttempts) {
      try {
        const res = await fetch("http://localhost:3002/robots.txt");
        if (res.ok) {
          console.log("Local production server is up on port 3002.");
          isUp = true;
          break;
        }
      } catch (e) {
        // Ignored
      }
      attempts++;
      await delay(1000);
    }

    if (!isUp) {
      console.error("Local production server failed to start.");
      try {
        process.kill(-server.pid);
      } catch (e) {
        server.kill();
      }
      throw new Error("Server failed to start");
    }

    try {
      runCommand(
        "NALI_PROD_URL=http://localhost:3002 node scripts/agent/check-production-routes.mjs",
        "Local Route Health Check"
      );
      runCommand(
        "NALI_PROD_URL=http://localhost:3002 node scripts/agent/check-seo-routes.mjs",
        "Local SEO Configuration Check"
      );
    } finally {
      console.log("Stopping local production server...");
      try {
        process.kill(-server.pid);
      } catch (e) {
        try {
          server.kill();
        } catch (err) {
          // Ignored
        }
      }
    }

    console.log("\n=========================================");
    console.log("Full Verification Result: ALL PASSED");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n=========================================");
    console.log("Full Verification Result: FAILED");
    console.log("=========================================");
    process.exit(1);
  }
}

run();
