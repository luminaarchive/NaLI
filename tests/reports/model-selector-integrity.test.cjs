const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");
const { naliModels } = require("../../src/lib/models/naliModels");
const { validateReportRequest, buildReportPrompt } = require("../../src/lib/reports/reportGenerator");

const repoRoot = path.join(__dirname, "../..");

// ─── Test 1: Models Metadata Config ──────────────────────────────────────────

test("model configuration exposes exactly peregrine, obsidian, and zephyr with proper metadata", () => {
  assert.strictEqual(naliModels.length, 3);
  const ids = naliModels.map((m) => m.id);
  assert.ok(ids.includes("peregrine"));
  assert.ok(ids.includes("obsidian"));
  assert.ok(ids.includes("zephyr"));

  for (const model of naliModels) {
    assert.ok(model.label.length > 0);
    assert.ok(model.shortDescription.length > 0);
    assert.ok(model.intent.length > 0);
    assert.ok(Array.isArray(model.safeCapabilities));
    assert.ok(Array.isArray(model.forbiddenClaims));
  }
});

// ─── Test 2: Request Validation and Defaulting ──────────────────────────────

test("validateReportRequest defaults to peregrine and preserves valid choices", () => {
  const baseInput = {
    mode: "draft_from_materials",
    mainText: "Saya melihat buaya di rawa terdekat Semarang.",
    integrityConsent: true,
  };

  // Case A: Missing chosen model -> default to peregrine
  const resDefault = validateReportRequest(baseInput);
  assert.ok(resDefault.success);
  assert.strictEqual(resDefault.data.selectedModel, "peregrine");

  // Case B: Valid choice -> obsidian
  const resObs = validateReportRequest({ ...baseInput, selectedModel: "obsidian" });
  assert.ok(resObs.success);
  assert.strictEqual(resObs.data.selectedModel, "obsidian");

  // Case C: Valid choice -> zephyr
  const resZeph = validateReportRequest({ ...baseInput, selectedModel: "zephyr" });
  assert.ok(resZeph.success);
  assert.strictEqual(resZeph.data.selectedModel, "zephyr");

  // Case D: Invalid choice -> fallback to peregrine
  const resInvalid = validateReportRequest({ ...baseInput, selectedModel: "fake-model" });
  assert.ok(resInvalid.success);
  assert.strictEqual(resInvalid.data.selectedModel, "peregrine");
});

// ─── Test 3: Prompt Construction and Boundaries ─────────────────────────────

test("buildReportPrompt injects appropriate profile-specific instructions into system prompts", () => {
  const baseInput = {
    mode: "draft_from_materials",
    reportTemplate: "Laporan Observasi Lingkungan",
    role: "pengguna",
    title: "Laporan Semarang",
    mainText: "Sungai keruh setelah hujan deras.",
    topic: "",
    sourceUrls: [],
    location: "Semarang",
    fileDescription: "",
    integrityConsent: true,
  };

  // Peregrine prompt instructions
  const pPrompt = buildReportPrompt({ ...baseInput, selectedModel: "peregrine" });
  assert.match(pPrompt, /MODEL PROFILE \(Peregrine\)/);
  assert.match(pPrompt, /Prioritize quick structure/);

  // Obsidian prompt instructions
  const oPrompt = buildReportPrompt({ ...baseInput, selectedModel: "obsidian" });
  assert.match(oPrompt, /MODEL PROFILE \(Obsidian\)/);
  assert.match(oPrompt, /Prioritize evidence boundaries/);

  // Zephyr prompt instructions
  const zPrompt = buildReportPrompt({ ...baseInput, selectedModel: "zephyr" });
  assert.match(zPrompt, /MODEL PROFILE \(Zephyr\)/);
  assert.match(zPrompt, /Prioritize clarity, flow/);
});

// ─── Test 4: Model Selector UI Static Integrity ──────────────────────────────

test("model selector UI is rendered under composer areas with exact label references", () => {
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  // CreateReportForm references
  assert.match(formSrc, /Pilih Profil Pemrosesan \(Model\)/);
  assert.match(formSrc, /form\.selectedModel\s*===\s*model\.id/);
  assert.match(formSrc, /updateField\("selectedModel",\s*model\.id\)/);

  // AgentWorkspace references
  assert.match(workspaceSrc, /Profil Pemrosesan \(Model\)/);
  assert.match(workspaceSrc, /selectedModel\s*===\s*model\.id/);
  assert.match(workspaceSrc, /setSelectedModel\(model\.id\)/);
  assert.match(workspaceSrc, /selectedModel,\s*\n\s*\}\)/); // submitted in JSON payload

  // Model Descriptions check
  assert.match(formSrc, /Peregrine: cepat untuk draft awal/);
  assert.match(formSrc, /Obsidian: lebih kuat untuk batas klaim dan struktur/);
  assert.match(formSrc, /Zephyr: lebih halus untuk kejernihan dan gaya/);

  assert.match(workspaceSrc, /Peregrine: cepat untuk draft awal/);
  assert.match(workspaceSrc, /Obsidian: lebih kuat untuk batas klaim dan struktur/);
  assert.match(workspaceSrc, /Zephyr: lebih halus untuk kejernihan dan gaya/);
});

// ─── Test 5: Prohibited and Safe Personalization keywords ────────────────────

test("Zephyr, Obsidian, and Peregrine descriptions strictly avoid unsafe cheating terms", () => {
  const prohibited = [
    "humanizer",
    "turnitin",
    "bypass",
    "evasion",
    "undetectable",
    "plagiarism-proof",
  ];

  for (const model of naliModels) {
    const rawDesc = [
      model.label,
      model.shortDescription,
      model.intent,
      model.safeCapabilities.join(" "),
    ].join(" ").toLowerCase();

    for (const term of prohibited) {
      assert.ok(!rawDesc.includes(term), `Model ${model.id} config contains prohibited cheating word: ${term}`);
    }
  }
});

// ─── Test 6: Mobile Class layout regression & Logo Verification ──────────────

test("model selector elements preserve mobile safe-area paddings and keep touch targets accessible", () => {
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  // Ensure 44px+ touch-target compatibility
  assert.match(formSrc, /min-h-\[44px\]/);
  assert.match(workspaceSrc, /min-h-\[44px\]/);

  // Ensure flex responsive layout class is used
  assert.match(formSrc, /flex\s+flex-wrap\s+gap-2/);
  assert.match(workspaceSrc, /flex\s+flex-wrap\s+gap-2/);

  // Ensure mobile form safe-bottom padding classes are untouched
  assert.match(formSrc, /safe-bottom/);
  assert.match(workspaceSrc, /safe-area-inset-bottom/);

  // Ensure NaLILogoMark is imported and rendered instead of wrong Sparkles icon
  assert.match(workspaceSrc, /import\s+\{\s*NaLILogoMark\s*\}\s+from\s+"@\/components\/ui\/NaLILogoMark"/);
  assert.match(workspaceSrc, /<NaLILogoMark\s+size="md"/);
  assert.ok(!workspaceSrc.includes('<Sparkles className="h-7 w-7 text-white animate-pulse" />'));
});
