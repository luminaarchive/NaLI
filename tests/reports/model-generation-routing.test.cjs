const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");
const { validateReportRequest, buildReportPrompt } = require("../../src/lib/reports/reportGenerator");
const { naliModels } = require("../../src/lib/models/naliModels");

const repoRoot = path.join(__dirname, "../..");

const validPayload = {
  mode: "draft_from_materials",
  reportTemplate: "Laporan Observasi Lingkungan",
  mainText: "Saya mahasiswa biologi. Saya mengamati dua jenis daun di sekitar kampus. Daun A berbentuk lonjong, tepi rata, warna hijau tua. Daun B berbentuk menjari, tepi bergerigi, warna hijau muda. Bantu buatkan struktur laporan observasi dan jelaskan bukti apa yang masih perlu saya siapkan.",
  integrityConsent: true,
  guestSessionId: "guest-session-for-routing-test",
};

// ─── Test 1: Route POST works for each model and uses safe labels ────────────

test("generation route routes each selectable model and returns safe public labels", async () => {
  const models = ["peregrine", "obsidian", "zephyr"];

  for (const modelId of models) {
    const payload = { ...validPayload, selectedModel: modelId };
    const response = await postGenerate(
      new Request("http://localhost/api/reports/generate", {
        body: JSON.stringify(payload),
        method: "POST",
      })
    );

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.ok(body.report);
    assert.strictEqual(body.report.mode, "draft_from_materials");
    
    // Check that model_used contains safe public label and NO provider name
    const modelUsed = body.report.model_used;
    assert.match(modelUsed, /NaLI (Peregrine|Obsidian|Zephyr)/);
    assert.strictEqual(modelUsed.includes("OpenRouter"), false);
    assert.strictEqual(modelUsed.includes("Claude"), false);
    assert.strictEqual(modelUsed.includes("GPT"), false);
  }
});

// ─── Test 2: Invalid selectedModel fallback ──────────────────────────────────

test("generation route falls back to peregrine on invalid model input", async () => {
  const payload = { ...validPayload, selectedModel: "invalid-fake-model" };
  const response = await postGenerate(
    new Request("http://localhost/api/reports/generate", {
      body: JSON.stringify(payload),
      method: "POST",
    })
  );

  assert.strictEqual(response.status, 200);
  const body = await response.json();
  assert.ok(body.report);
  assert.strictEqual(body.report.model_used, "NaLI Peregrine");
});

// ─── Test 3: Prompt Profile Injection Rules ──────────────────────────────────

test("buildReportPrompt injects correct processing profile rules without fabricating details", () => {
  const baseInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    role: "pengguna",
    title: "Observasi Daun Kampus",
    mainText: "Daun A berbentuk lonjong. Daun B berbentuk menjari.",
    sourceUrls: [],
    location: "Kampus",
    fileDescription: "",
    integrityConsent: true,
  };

  // Peregrine profile injection rules check
  const pPrompt = buildReportPrompt({ ...baseInput, selectedModel: "peregrine" });
  assert.match(pPrompt, /MODEL PROFILE \(Peregrine\)/);
  assert.match(pPrompt, /Prioritize quick structure/);

  // Obsidian profile injection rules check
  const oPrompt = buildReportPrompt({ ...baseInput, selectedModel: "obsidian" });
  assert.match(oPrompt, /MODEL PROFILE \(Obsidian\)/);
  assert.match(oPrompt, /Prioritize evidence boundaries/);

  // Zephyr profile injection rules check
  const zPrompt = buildReportPrompt({ ...baseInput, selectedModel: "zephyr" });
  assert.match(zPrompt, /MODEL PROFILE \(Zephyr\)/);
  assert.match(zPrompt, /Prioritize clarity, flow/);

  // Verify that the prompts contain NO Turnitin bypass/plagiarism evasion instructions (except in the negative warning guidelines)
  for (const prompt of [pPrompt, oPrompt, zPrompt]) {
    if (prompt.toLowerCase().includes("turnitin") || prompt.toLowerCase().includes("humanizer") || prompt.toLowerCase().includes("bypass")) {
      assert.match(prompt, /Never use Humanizer, Turnitin-safe, or detector-bypass wording/i);
      
      // Ensure no OTHER occurrences of these terms exist in the prompt
      const parts = prompt.split(/Never use Humanizer, Turnitin-safe, or detector-bypass wording/i);
      for (const part of parts) {
        assert.strictEqual(part.toLowerCase().includes("turnitin"), false, "Should not contain Turnitin outside safety negation");
        assert.strictEqual(part.toLowerCase().includes("humanizer"), false, "Should not contain Humanizer outside safety negation");
        assert.strictEqual(part.toLowerCase().includes("bypass"), false, "Should not contain bypass outside safety negation");
      }
    }
  }
});

// ─── Test 4: UI Model IDs map strictly to backend configuration IDs ──────────

test("UI component selector buttons map exactly to the naliModels configuration IDs", () => {
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  const configIds = naliModels.map((m) => m.id);

  // Asserts selector updates match configIds
  assert.ok(configIds.includes("peregrine"));
  assert.ok(configIds.includes("obsidian"));
  assert.ok(configIds.includes("zephyr"));

  assert.match(formSrc, /form\.selectedModel\s*===\s*model\.id/);
  assert.match(workspaceSrc, /selectedModel\s*===\s*model\.id/);
});

// ─── Test 5: No model configuration makes false capability claims ─────────────

test("no model configuration claims source verification, pro features, or payment unlocking", () => {
  for (const model of naliModels) {
    const raw = JSON.stringify(model).toLowerCase();
    
    // Prohibited marketing claims
    assert.strictEqual(raw.includes("source verification active"), false);
    assert.strictEqual(raw.includes("realtime data"), false);
    assert.strictEqual(raw.includes("paid unlock"), false);
    assert.strictEqual(raw.includes("midtrans"), false);
  }
});
