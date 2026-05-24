const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

const repoRoot = path.join(__dirname, "../..");

// ─── Test 1: Founder monitoring modules are not imported in public files ─────

test("founder monitoring modules are not imported by public client components", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const siteNavSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/SiteNav.tsx"), "utf8");
  const codexNavSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/CodexNav.tsx"), "utf8");

  const monitoringRegex = /from\s+['"]@\/lib\/system\/monitoring['"]/i;
  const qualityRegex = /from\s+['"]@\/lib\/quality\/reportQualityMemory['"]/i;

  assert.ok(!monitoringRegex.test(workspaceSrc), "AgentWorkspace must not import monitoring modules");
  assert.ok(!qualityRegex.test(workspaceSrc), "AgentWorkspace must not import quality memory modules");
  assert.ok(!monitoringRegex.test(formSrc), "CreateReportForm must not import monitoring modules");
  assert.ok(!qualityRegex.test(formSrc), "CreateReportForm must not import quality memory modules");
  assert.ok(!monitoringRegex.test(siteNavSrc), "SiteNav must not import monitoring modules");
  assert.ok(!monitoringRegex.test(codexNavSrc), "CodexNav must not import monitoring modules");
});

// ─── Test 2: /create-report page does not import founder modules ────────────

test("/create-report page does not import monitoring or quality memory modules", () => {
  const pageSrc = fs.readFileSync(path.join(repoRoot, "src/app/create-report/page.tsx"), "utf8");

  const monitoringRegex = /monitoring|quality/i;
  assert.ok(!monitoringRegex.test(pageSrc), "/create-report/page.tsx must not import founder monitoring/quality memory");
});

// ─── Test 3: Local history panel is collapsed by default ────────────────────

test("local history panel is collapsed by default", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  // Validate state default isOpen is false
  assert.match(workspaceSrc, /const\s*\[isOpen,\s*setIsOpen\]\s*=\s*useState\(false\)/, "LocalHistoryPanel in AgentWorkspace must start collapsed (isOpen = false)");
  assert.match(formSrc, /const\s*\[isOpen,\s*setIsOpen\]\s*=\s*useState\(false\)/, "LocalHistoryPanel in CreateReportForm must start collapsed (isOpen = false)");
});

// ─── Test 4: clientRecovery localStorage parsing is lazy ────────────────────

test("localStorage list guest recoveries function is only called in effects or callbacks", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  // Verify listGuestReportRecoveries is only in useCallback wrapper
  assert.ok(workspaceSrc.includes("const loadSnapshots = useCallback(() =>"), "loadSnapshots must be a useCallback in AgentWorkspace");
  assert.ok(formSrc.includes("const loadSnapshots = useCallback(() =>"), "loadSnapshots must be a useCallback in CreateReportForm");
});

// ─── Test 5: No new heavy dependencies in package.json ──────────────────────

test("no new unapproved dependencies in package.json", () => {
  const pkg = require("../../package.json");
  const deps = Object.keys(pkg.dependencies || {});
  
  assert.ok(!deps.includes("lighthouse"), "package.json must not include lighthouse");
  assert.ok(!deps.includes("@next/bundle-analyzer"), "package.json must not include bundle analyzer");
});

// ─── Test 6: Dynamic imports/lazy rendering verification ────────────────────

test("UpgradeModal in AgentWorkspace is lazy-rendered conditionally", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");

  // Statically check for conditional render
  assert.ok(workspaceSrc.includes("{isUpgradeOpen && ("), "AgentWorkspace must conditionally render UpgradeModal on demand");
});

// ─── Test 7: Payment/Midtrans remains deferred ──────────────────────────────

test("Midtrans and payment systems remain deferred/inactive", () => {
  const readiness = getSystemReadiness();
  assert.strictEqual(readiness.midtransConfigured, false);
  assert.strictEqual(readiness.paidCheckoutActive, false);
  assert.strictEqual(readiness.creditPurchaseActive, false);
});

// ─── Test 8: Public navigation does not link to founder ─────────────────────

test("/founder is not linked in public navigation components", () => {
  const siteNavSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/SiteNav.tsx"), "utf8");
  const codexNavSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/CodexNav.tsx"), "utf8");

  assert.ok(!siteNavSrc.includes('/founder'), "SiteNav must not link to /founder");
  assert.ok(!codexNavSrc.includes('/founder'), "CodexNav must not link to /founder");
});

// ─── Test 9: Performance bundle audit/report docs exist ─────────────────────

test("performance bundle audit documentation exists", () => {
  const auditPath = path.join(repoRoot, "docs/qa/nali_cp1_performance_bundle_audit.md");
  assert.ok(fs.existsSync(auditPath), "performance bundle audit document must exist");
});
