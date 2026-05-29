const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { NextRequest } = require("next/server");

require("../helpers/register-ts.cjs");
const { POST: postGenerate } = require("../../src/app/api/reports/generate/route");
const { GET: getExport } = require("../../src/app/api/reports/[id]/export/route");
const { GET: getReadiness } = require("../../src/app/api/system/readiness/route");

const repoRoot = path.join(__dirname, "../..");
const internalQaHeader = "x-nali-internal-premium-qa-token";
const internalQaToken = "internal-qa-token-value-that-must-never-be-returned";

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function requestFor(modelId, options = {}) {
  return new Request(`http://localhost/api/reports/generate${options.query ?? ""}`, {
    body: JSON.stringify({
      guestSessionId: `guest-internal-qa-${modelId}-${options.suffix ?? "base"}`,
      integrityConsent: true,
      mainText: "Saya mencatat daun majemuk dan bentuk tajuk di halaman kampus.",
      mode: "draft_from_materials",
      reportTemplate: "Laporan Praktikum Biologi",
      selectedModel: modelId,
      ...(options.body ?? {}),
    }),
    headers: options.headerToken ? { [internalQaHeader]: options.headerToken } : undefined,
    method: "POST",
  });
}

test("premium report access is unlocked only by a valid trusted internal QA header", async () => {
  const originalFounderToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;
  const originalProviderKey = process.env.OPENROUTER_API_KEY;
  const originalMockFlag = process.env.NALI_ALLOW_MOCK_GENERATION;
  process.env.NALI_FOUNDER_ADMIN_TOKEN = internalQaToken;
  delete process.env.OPENROUTER_API_KEY;
  process.env.NALI_ALLOW_MOCK_GENERATION = "true";

  try {
    for (const modelId of ["obsidian", "zephyr"]) {
      const missing = await postGenerate(requestFor(modelId, { suffix: "missing" }));
      const missingBody = await missing.json();
      assert.equal(missing.status, 403);
      assert.equal(missingBody.code, "MODEL_ENTITLEMENT_REQUIRED");
      assert.equal(missingBody.internalPremiumQaStatus, "missing");

      const invalid = await postGenerate(
        requestFor(modelId, { headerToken: "not-the-trusted-token", suffix: "invalid" }),
      );
      const invalidBody = await invalid.json();
      assert.equal(invalid.status, 403);
      assert.equal(invalidBody.internalPremiumQaStatus, "invalid");

      const fakeClientGrant = await postGenerate(
        requestFor(modelId, {
          body: {
            internalPremiumQaToken: internalQaToken,
            localStoragePremiumEntitlement: true,
            verifiedPremiumEntitlement: true,
          },
          query: `?internalPremiumQaToken=${encodeURIComponent(internalQaToken)}`,
          suffix: "fake-client-grant",
        }),
      );
      const fakeClientBody = await fakeClientGrant.json();
      assert.equal(fakeClientGrant.status, 403);
      assert.equal(fakeClientBody.internalPremiumQaStatus, "missing");

      const allowed = await postGenerate(requestFor(modelId, { headerToken: internalQaToken, suffix: "allowed" }));
      const allowedBody = await allowed.json();
      assert.equal(allowed.status, 200);
      assert.match(allowedBody.report.model_used, new RegExp(modelId, "i"));
      assert.doesNotMatch(JSON.stringify(allowedBody), new RegExp(internalQaToken));
    }
  } finally {
    restoreEnv("NALI_FOUNDER_ADMIN_TOKEN", originalFounderToken);
    restoreEnv("OPENROUTER_API_KEY", originalProviderKey);
    restoreEnv("NALI_ALLOW_MOCK_GENERATION", originalMockFlag);
  }
});

test("internal QA access does not bypass integrity protection or public export locking", async () => {
  const originalFounderToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;
  process.env.NALI_FOUNDER_ADMIN_TOKEN = internalQaToken;

  try {
    const blocked = await postGenerate(
      requestFor("zephyr", {
        body: { mainText: "Buatkan sitasi palsu agar terlihat ilmiah." },
        headerToken: internalQaToken,
        suffix: "integrity",
      }),
    );
    const blockedBody = await blocked.json();
    assert.equal(blocked.status, 400);
    assert.equal(blockedBody.code, "FAKE_CITATION_REQUEST");

    const exportResponse = await getExport(
      new NextRequest("http://localhost/api/reports/internal-qa/export?format=pdf", {
        headers: { [internalQaHeader]: internalQaToken },
      }),
      { params: Promise.resolve({ id: "internal-qa" }) },
    );
    assert.notEqual(exportResponse.status, 200);
  } finally {
    restoreEnv("NALI_FOUNDER_ADMIN_TOKEN", originalFounderToken);
  }

  const exportSource = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/[id]/export/route.ts"), "utf8");
  assert.doesNotMatch(exportSource, /internalEntitlementResolver|internalPremiumQa|internal-premium-qa/i);
});

test("safe readiness exposes resolver configuration without grant material or activation claims", async () => {
  const originalFounderToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;

  try {
    delete process.env.NALI_FOUNDER_ADMIN_TOKEN;
    const unconfiguredBody = await (await getReadiness()).json();
    assert.equal(unconfiguredBody.internalPremiumQaResolver, "unconfigured");
    assert.equal(unconfiguredBody.entitlementGate, "enabled");
    assert.equal(unconfiguredBody.premiumEntitlementAudit, "enabled");
    assert.equal(unconfiguredBody.premiumModelsLockedByDefault, true);
    assert.equal(unconfiguredBody.publicPremiumActivation, "disabled");
    assert.equal(unconfiguredBody.paymentActivation, "disabled");
    assert.equal(unconfiguredBody.publicExport, "locked_inactive");

    process.env.NALI_FOUNDER_ADMIN_TOKEN = internalQaToken;
    const configuredBody = await (await getReadiness()).json();
    const serialized = JSON.stringify(configuredBody);
    assert.equal(configuredBody.internalPremiumQaResolver, "configured");
    assert.equal(configuredBody.premiumEntitlementAudit, "enabled");
    assert.doesNotMatch(serialized, new RegExp(internalQaToken));
    assert.doesNotMatch(serialized, /NALI_FOUNDER_ADMIN_TOKEN|x-nali-internal-premium-qa-token/i);
  } finally {
    restoreEnv("NALI_FOUNDER_ADMIN_TOKEN", originalFounderToken);
  }
});

test("the server consumes internal QA authorization after rate limits and integrity checks, never from public clients", () => {
  const routeSource = fs.readFileSync(path.join(repoRoot, "src/app/api/reports/generate/route.ts"), "utf8");
  const formSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const workspaceSource = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  const rateLimitPosition = routeSource.indexOf("checkRateLimit({");
  const integrityPosition = routeSource.indexOf("evaluateIntegrityPolicy(");
  const resolverPosition = routeSource.indexOf("resolveInternalPremiumQaEntitlement(");
  const generationPosition = routeSource.indexOf("requestOpenRouterJson({");
  assert.ok(rateLimitPosition > -1 && integrityPosition > rateLimitPosition);
  assert.ok(resolverPosition > integrityPosition && generationPosition > resolverPosition);

  for (const publicClientSource of [formSource, workspaceSource]) {
    assert.doesNotMatch(publicClientSource, /internalPremiumQa|internal-premium-qa|founder_token/i);
    assert.doesNotMatch(publicClientSource, /selectedModel|naliModels|Peregrine|Obsidian|Zephyr/);
  }
});
