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

    const internalQa = evaluateModelEntitlement(modelId, { verifiedInternalPremiumQaEntitlement: true });
    assert.equal(internalQa.allowed, true);
    assert.equal(internalQa.entitlementStatus, "verified_internal_qa_entitlement");
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
  const guardPosition = routeSource.indexOf("evaluateModelEntitlement(selectedModelId,");
  const reportBalancePosition = routeSource.indexOf("await getPublicReportAccess(input, requestedPublicReportType)");
  assert.ok(guardPosition > -1);
  assert.ok(reportBalancePosition > guardPosition);
  assert.ok(guardPosition < routeSource.indexOf("requestOpenRouterJson({"));
});

test("internal tier configuration stays locked while public clients expose no model selector", () => {
  const models = Object.fromEntries(naliModels.map((model) => [model.id, model]));
  assert.equal(models.peregrine.lockedWithoutEntitlement, false);
  assert.equal(models.obsidian.lockedWithoutEntitlement, true);
  assert.equal(models.zephyr.lockedWithoutEntitlement, true);

  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSource = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  for (const source of [formSource, workspaceSource]) {
    assert.doesNotMatch(source, /selectedModel|naliModels|Peregrine|Obsidian|Zephyr|CP1_PREMIUM_ACCESS_MESSAGE/);
    assert.match(source, /min-h-\[44px\]/);
    assert.match(source, /Buat Laporan/);
  }
});

test("safe readiness status states that the entitlement gate is enabled while activation remains off", async () => {
  const response = await getReadiness();
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.entitlementGate, "enabled");
  assert.equal(body.premiumEntitlementAudit, "enabled");
  assert.equal(body.premiumModelsLockedByDefault, true);
  assert.equal(body.peregrineAvailable, true);
  assert.equal(body.publicPremiumActivation, "disabled");
  assert.equal(body.paymentActivation, "disabled");
  assert.equal(body.midtrans, "deferred_inactive");
  assert.equal(body.publicExport, "locked_inactive");
  assert.equal(body.singleReportProduct, "enabled");
  assert.equal(body.reportBalanceArchitecture, "enabled");
});
