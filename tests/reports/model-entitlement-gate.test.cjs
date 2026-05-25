const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

require("../helpers/register-ts.cjs");
const { evaluateModelEntitlement } = require("../../src/lib/entitlements/modelEntitlements");
const { naliModels } = require("../../src/lib/models/naliModels");
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");

const repoRoot = path.join(__dirname, "../..");
const validPayload = {
  guestSessionId: "guest-entitlement-gate-direct-bypass",
  integrityConsent: true,
  mainText: "Saya mengamati daun lonjong dan daun menjari di halaman kampus.",
  mode: "draft_from_materials",
  reportTemplate: "Laporan Praktikum Biologi",
};

test("Peregrine is available by default while premium models require a trusted entitlement", () => {
  const peregrine = evaluateModelEntitlement("peregrine");
  assert.equal(peregrine.allowed, true);
  assert.equal(peregrine.modelId, "peregrine");
  assert.equal(peregrine.requiredEntitlement, "none");
  assert.equal(peregrine.entitlementStatus, "starter_available");

  for (const modelId of ["obsidian", "zephyr"]) {
    const locked = evaluateModelEntitlement(modelId);
    assert.equal(locked.allowed, false);
    assert.equal(locked.requiredEntitlement, "premium_model_entitlement_or_credit");
    assert.equal(locked.entitlementStatus, "locked_by_default");

    const entitled = evaluateModelEntitlement(modelId, { verifiedPremiumEntitlement: true });
    assert.equal(entitled.allowed, true);
    assert.equal(entitled.entitlementStatus, "verified_entitlement");

    const credited = evaluateModelEntitlement(modelId, { verifiedPremiumCredit: true });
    assert.equal(credited.allowed, true);
    assert.equal(credited.entitlementStatus, "verified_credit");
  }
});

test("a direct API bypass attempt cannot generate Obsidian or Zephyr without entitlement", async () => {
  for (const modelId of ["obsidian", "zephyr"]) {
    const response = await postGenerate(
      new Request("http://localhost/api/reports/generate", {
        body: JSON.stringify({ ...validPayload, selectedModel: modelId }),
        method: "POST",
      }),
    );
    const body = await response.json();
    const serialized = JSON.stringify(body).toLowerCase();

    assert.equal(response.status, 403);
    assert.equal(body.code, "MODEL_ENTITLEMENT_REQUIRED");
    assert.equal(body.entitlement.allowed, false);
    assert.equal(body.entitlement.modelId, modelId);
    assert.equal(body.entitlement.entitlementStatus, "locked_by_default");
    assert.match(body.error, /premium|peregrine/i);
    assert.doesNotMatch(serialized, /openrouter|provider|api[_ -]?key|secret|token|midtrans|balance/);
  }

  const routeSource = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/generate/route.ts"), "utf8");
  const guardPosition = routeSource.indexOf("evaluateModelEntitlement(selectedModelId)");
  assert.ok(guardPosition > -1);
  assert.ok(guardPosition < routeSource.indexOf("getEnergyBalance(input.guestSessionId)"));
  assert.ok(guardPosition < routeSource.indexOf("requestOpenRouterJson({"));
});

test("selector configuration and client submission paths keep premium models locked in CP1", () => {
  const models = Object.fromEntries(naliModels.map((model) => [model.id, model]));
  assert.equal(models.peregrine.lockedWithoutEntitlement, false);
  assert.equal(models.obsidian.lockedWithoutEntitlement, true);
  assert.equal(models.zephyr.lockedWithoutEntitlement, true);

  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSource = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const modelSource = fs.readFileSync(path.join(repoRoot, "src/lib/models/naliModels.ts"), "utf8");

  for (const source of [formSource, workspaceSource]) {
    assert.match(source, /model\.lockedWithoutEntitlement/);
    assert.match(source, /disabled=\{isLocked\}/);
    assert.match(source, /CP1_PREMIUM_ACCESS_MESSAGE/);
    assert.match(source, /min-h-\[44px\]/);
  }

  assert.match(modelSource, /checkout\/pembayaran tidak diaktifkan di CP1/i);
  assert.match(formSource, /MODEL_ENTITLEMENT_REQUIRED/);
  assert.match(workspaceSource, /MODEL_ENTITLEMENT_REQUIRED/);
});

test("safe readiness status states that the entitlement gate is enabled while activation remains off", async () => {
  const response = await getReadiness();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.entitlementGate, "enabled");
  assert.equal(body.premiumModelsLockedByDefault, true);
  assert.equal(body.peregrineAvailable, true);
  assert.equal(body.paymentActivation, "disabled");
  assert.equal(body.midtrans, "deferred_inactive");
  assert.equal(body.publicExport, "locked_inactive");
});
