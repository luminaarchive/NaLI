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

  assert.equal(naliModels.find((model) => model.id === "peregrine").lockedWithoutEntitlement, false);
  assert.equal(naliModels.find((model) => model.id === "obsidian").lockedWithoutEntitlement, true);
  assert.equal(naliModels.find((model) => model.id === "zephyr").lockedWithoutEntitlement, true);
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

// ─── Test 4: Single report public UI and internal-only tier registry ─────────

test("public composer hides model selector while internal registry remains for server QA", () => {
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const modelSrc = fs.readFileSync(path.join(repoRoot, "src/lib/models/naliModels.ts"), "utf8");

  for (const source of [formSrc, workspaceSrc]) {
    assert.doesNotMatch(source, /Pilih Profil Pemrosesan|Profil Pemrosesan|selectedModel|naliModels/);
    assert.doesNotMatch(source, /Peregrine|Obsidian|Zephyr|Haiku|Sonnet/);
    assert.match(source, /Buat Laporan/);
  }

  // Internal-only differentiated registry remains for routing and QA artifacts.
  assert.match(modelSrc, /Peregrine — Starter Cepat/);
  assert.match(modelSrc, /Obsidian — Evidence Audit/);
  assert.match(modelSrc, /Zephyr — Premium Journal Draft/);
  assert.match(modelSrc, /tidak sedalam Obsidian atau sehalus Zephyr/);
  assert.match(modelSrc, /audit bukti, batas klaim, risiko data/);
  assert.match(modelSrc, /Model paling mahal dan paling kuat/);
  assert.match(modelSrc, /checkout\/pembayaran tidak diaktifkan di CP1/i);
});

// ─── Test 5: Prohibited and Safe Personalization keywords ────────────────────

test("Zephyr, Obsidian, and Peregrine descriptions strictly avoid unsafe cheating terms", () => {
  const prohibited = ["humanizer", "turnitin", "bypass", "evasion", "undetectable", "plagiarism-proof"];

  for (const model of naliModels) {
    const rawDesc = [model.label, model.shortDescription, model.intent, model.safeCapabilities.join(" ")]
      .join(" ")
      .toLowerCase();

    for (const term of prohibited) {
      assert.ok(!rawDesc.includes(term), `Model ${model.id} config contains prohibited cheating word: ${term}`);
    }
  }
});

// ─── Test 6: Mobile Class layout regression & Logo Verification ──────────────

test("single-report controls preserve mobile safe-area paddings and touch targets", () => {
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const backgroundSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/FluidVideoBackground.tsx"), "utf8");

  // Ensure 44px+ touch-target compatibility
  assert.match(formSrc, /min-h-\[44px\]/);
  assert.match(workspaceSrc, /min-h-\[44px\]/);

  assert.match(formSrc, /min-h-12/);
  assert.match(workspaceSrc, /h-9 w-9/);

  // Ensure mobile form safe-bottom padding classes are untouched
  assert.match(formSrc, /safe-bottom/);
  assert.match(workspaceSrc, /safe-area-inset-bottom/);

  // Ensure the shared inline SVG logo is rendered instead of raster assets or an unrelated icon.
  assert.match(workspaceSrc, /import\s+\{\s*NaLILogo,\s*NaLILogoMark\s*\}\s+from\s+"@\/components\/ui\/NaLILogo"/);
  assert.match(workspaceSrc, /<NaLILogoMark\s+variant="light"/);
  assert.doesNotMatch(workspaceSrc, /nali-mark\.jpg|nali-wordmark\.jpg/);
  assert.match(backgroundSrc, /#060b08/);
  assert.doesNotMatch(backgroundSrc, /#07090e|rgba\(124,58,237|rgba\(6,182,212/);
  assert.ok(!workspaceSrc.includes('<Sparkles className="h-7 w-7 text-white animate-pulse" />'));
});
