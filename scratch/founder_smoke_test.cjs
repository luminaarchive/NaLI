const { spawn } = require("child_process");
const assert = require("assert");

async function runFounderSmokeTests() {
  console.log("=== STARTING FOUNDER CONSOLE SMOKE TEST SERVER ===");

  const adminToken = "secret_founder_smoke_token";

  // Spawn Next.js production server on port 3001 with custom NALI_FOUNDER_ADMIN_TOKEN
  const devServer = spawn("npx", ["next", "start", "-p", "3001"], {
    cwd: "/Users/macintosh/Documents/NaLI",
    env: {
      ...process.env,
      PORT: "3001",
      NALI_FOUNDER_ADMIN_TOKEN: adminToken
    },
    shell: true
  });

  let serverReady = false;

  devServer.stdout.on("data", (data) => {
    const output = data.toString();
    console.log("[dev-server]", output.trim());
    if (output.includes("Ready in") || output.includes("ready on") || output.includes("http://localhost:3001")) {
      serverReady = true;
    }
  });

  devServer.stderr.on("data", (data) => {
    console.error("[dev-server-err]", data.toString().trim());
  });

  // Wait for server to boot
  console.log("Waiting for server...");
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    if (serverReady) break;
    try {
      const ping = await fetch("http://localhost:3001");
      if (ping.status === 200) {
        serverReady = true;
        break;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!serverReady) {
    console.error("❌ Server timeout.");
    devServer.kill("SIGTERM");
    process.exit(1);
  }

  try {
    // Test 1: Access without token
    console.log("Fetching /founder without token...");
    const resNoToken = await fetch("http://localhost:3001/founder");
    assert.strictEqual(resNoToken.status, 200);
    const htmlNoToken = await resNoToken.text();
    console.log("HTML NO TOKEN LENGTH:", htmlNoToken.length);
    const bodyMatch = htmlNoToken.match(/<body[^>]*>([\s\S]*)<\/body>/);
    const bodyNoToken = bodyMatch ? bodyMatch[1].trim() : "";
    console.log("HTML NO TOKEN BODY:", bodyNoToken.slice(0, 800));
    assert.ok(bodyNoToken.includes("Please enter your NALI_FOUNDER_ADMIN_TOKEN"), "Should prompt for token");
    assert.ok(!bodyNoToken.includes("Internal Ops Console"), "Should not show main dashboard");

    // Test 2: Access with invalid token
    console.log("Fetching /founder with invalid token...");
    const resWrongToken = await fetch("http://localhost:3001/founder?token=wrong_token");
    assert.strictEqual(resWrongToken.status, 200);
    const htmlWrongToken = await resWrongToken.text();
    const bodyWrongMatch = htmlWrongToken.match(/<body[^>]*>([\s\S]*)<\/body>/);
    const bodyWrongToken = bodyWrongMatch ? bodyWrongMatch[1].trim() : "";
    console.log("HTML WRONG TOKEN LENGTH:", htmlWrongToken.length);
    assert.ok(bodyWrongToken.includes("Please enter your NALI_FOUNDER_ADMIN_TOKEN"), "Should prompt for token");
    assert.ok(!bodyWrongToken.includes("Internal Ops Console"), "Should not show main dashboard");

    // Test 3: Access with correct token
    console.log("Fetching /founder with valid token...");
    const resCorrectToken = await fetch(`http://localhost:3001/founder?token=${adminToken}`, {
      redirect: "manual" // Redirect is triggered to set cookie
    });
    
    // In Next.js redirecting returns 303 or 307
    console.log("Redirect Status:", resCorrectToken.status);
    assert.ok(resCorrectToken.status === 307 || resCorrectToken.status === 303 || resCorrectToken.status === 200, "Should succeed or redirect");

    // If redirected, fetch with Cookie
    let cookieHeader = "";
    if (resCorrectToken.headers.has("set-cookie")) {
      cookieHeader = resCorrectToken.headers.get("set-cookie").split(";")[0];
      console.log("Session Cookie captured:", cookieHeader);
    }

    console.log("Fetching /founder again with authenticated session...");
    const resDashboard = await fetch("http://localhost:3001/founder", {
      headers: {
        Cookie: cookieHeader || `founder_token=${adminToken}`
      }
    });
    assert.strictEqual(resDashboard.status, 200);
    const htmlDashboard = await resDashboard.text();
    const bodyDashMatch = htmlDashboard.match(/<body[^>]*>([\s\S]*)<\/body>/);
    console.log("HTML DASHBOARD BODY:", bodyDashMatch ? bodyDashMatch[1].trim().slice(0, 1000) : "no body");
    
    assert.ok(htmlDashboard.includes("NaLI Founder Console"), "Dashboard title should be visible");
    assert.ok(htmlDashboard.includes("System Readiness Status"), "Readiness section should be visible");
    assert.ok(htmlDashboard.includes("Report Generation Health"), "Reports section should be visible");
    assert.ok(htmlDashboard.includes("Feedback Intelligence"), "Feedback section should be visible");
    assert.ok(htmlDashboard.includes("API Usage") && htmlDashboard.includes("Cost Analysis"), "Usage/Cost section should be visible");
    
    // Check locked states are truthy
    assert.ok(htmlDashboard.includes("PAUSED"), "Should show PAUSED human testing state");
    assert.ok(htmlDashboard.includes("DEFERRED"), "Should show DEFERRED Midtrans state");
    assert.ok(htmlDashboard.includes("NO-GO"), "Should show NO-GO paid launch state");
    assert.ok(htmlDashboard.includes("DORMANT"), "Should show DORMANT upload state");
    
    // Verify no secret leak
    assert.ok(!htmlDashboard.includes(adminToken), "Should not leak admin token in HTML source");

    console.log("=== ALL FOUNDER CONSOLE SMOKE TESTS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("❌ Founder Console Smoke Test Failed:", err);
    devServer.kill("SIGTERM");
    process.exit(1);
  }

  devServer.kill("SIGTERM");
  process.exit(0);
}

runFounderSmokeTests().catch(err => {
  console.error("Fatal Error running founder smoke test:", err);
  process.exit(1);
});
