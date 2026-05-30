/**
 * Test NaLI AI engine against the running dev server.
 * Run: npx tsx scripts/test-ai-engine.ts
 * Requires: npm run dev is running, OPENROUTER_API_KEY set in .env.local
 */

const BASE = process.env.TEST_BASE_URL || "http://localhost:3000";

async function testAIEngine() {
  console.log("Testing NaLI AI engine...\n");

  const res = await fetch(`${BASE}/api/generate-report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt:
        "Saya mengamati burung elang jawa (Nisaetus bartelsi) di lereng Gunung Semeru pada ketinggian 1800 mdpl. Kondisi habitat: hutan primer campuran, tutupan kanopi 80%. Durasi observasi: 2 jam. Jumlah individu: 1 ekor dewasa.",
    }),
  });

  const data = await res.json();
  if (res.ok && data.result) {
    console.log("PASS -- model used:", data.model);
    console.log("Result preview:", data.result?.slice(0, 200));
  } else {
    console.log("FAIL --", data.error);
    console.log("Detail:", data.lastError ?? data.detail);
    process.exit(1);
  }
}

testAIEngine().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
