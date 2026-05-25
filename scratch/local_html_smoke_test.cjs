const { spawn } = require("child_process");
const assert = require("assert");

async function checkPage(url, assertions) {
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  assert.strictEqual(res.status, 200, `Page ${url} should load with status 200`);
  const html = await res.text();
  assert.ok(html.length > 500, `Page ${url} should have substantial content`);
  
  // Basic sanity check to ensure it's not a generic Next.js crash page
  assert.ok(!html.includes("Application error: a client-side exception has occurred"), `Page ${url} should not have a client-side exception message`);
  assert.ok(!html.includes("Internal Server Error"), `Page ${url} should not display an internal server error`);

  if (assertions) {
    assertions(html);
  }
  console.log(`🟢 ${url} loads and passes all basic checks!`);
}

async function runLocalSmokeTests() {
  console.log("=== STARTING LOCAL HTML SMOKE TEST SERVER ===");
  
  // Spawn Next.js dev server on port 3001 to avoid conflicts
  const devServer = spawn("npx", ["next", "dev", "-p", "3001"], {
    cwd: "/Users/macintosh/Documents/NaLI",
    env: { ...process.env, PORT: "3001" },
    shell: true
  });

  // Track if dev server output shows ready
  let serverReady = false;

  devServer.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("[dev-server-stdout]", output.trim());
    if (output.includes("Ready in") || output.includes("ready on") || output.includes("http://localhost:3001")) {
      serverReady = true;
    }
  });

  devServer.stderr.on("data", (data) => {
    console.error("[dev-server-stderr]", data.toString().trim());
  });

  // Wait for the dev server to start
  console.log("Waiting for local server to be ready on port 3001...");
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (serverReady) {
      break;
    }
    // Attempt a silent fetch to see if it responds
    try {
      const ping = await fetch("http://localhost:3001");
      if (ping.status === 200) {
        serverReady = true;
        break;
      }
    } catch (e) {
      // Keep waiting
    }
  }

  if (!serverReady) {
    console.error("❌ Timeout waiting for local server to start.");
    devServer.kill("SIGTERM");
    process.exit(1);
  }

  console.log("Server ready! Initiating route checks...");

  try {
    // 1. Check Homepage
    await checkPage("http://localhost:3001/", (html) => {
      assert.ok(html.includes("Mulai Susun Laporan") || html.includes("Mulai buat laporan") || html.includes("create-report"), "Homepage should contain CTA to create report");
      assert.ok(!html.includes("OpenAI") && !html.includes("Claude") && !html.includes("OpenRouter"), "Homepage should not expose provider names");
    });

    // 2. Check /learn-report
    await checkPage("http://localhost:3001/learn-report", (html) => {
      assert.ok(html.includes("Public") || html.includes("Laporan") || html.includes("Panduan"), "Learn page should describe Public mode/features");
    });

    // 3. Check /create-report
    await checkPage("http://localhost:3001/create-report", (html) => {
      assert.ok(html.includes("textarea") || html.includes("composer") || html.includes("form") || html.includes("Bahan") || html.includes("laporan"), "Composer page should contain a workspace input area");
    });

    // 4. Check /pricing
    await checkPage("http://localhost:3001/pricing", (html) => {
      assert.ok(html.includes("kredit") || html.includes("credit") || html.includes("Starter") || html.includes("Pro"), "Pricing should showcase credit tiers");
      assert.ok(!html.includes("Langganan bulanan") && !html.includes("Subskripsi"), "Pricing should focus on credit packs, not active subscriptions");
    });

    // 5. Check /field-intelligence
    await checkPage("http://localhost:3001/field-intelligence", (html) => {
      assert.ok(html.includes("informasi") || html.includes("Field Intelligence") || html.includes("Professional"), "Field intelligence page should load info");
    });

    console.log("=== ALL LOCAL HTML SMOKE TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Local HTML Smoke Test Failed:", err);
    devServer.kill("SIGTERM");
    process.exit(1);
  }

  // Shut down the dev server
  console.log("Shutting down local server...");
  devServer.kill("SIGTERM");
  process.exit(0);
}

runLocalSmokeTests().catch(err => {
  console.error("Fatal Error running local smoke test:", err);
  process.exit(1);
});
