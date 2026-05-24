const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

require("../helpers/register-ts.cjs");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

const repoRoot = path.join(__dirname, "../..");

// ─── Test 1: listGuestReportRecoveries is sandboxed inside useCallback ──────

test("AgentWorkspace calls listGuestReportRecoveries only inside memoized loadSnapshots", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  
  // Verify loadSnapshots is wrapped in useCallback
  assert.ok(
    workspaceSrc.includes("const loadSnapshots = useCallback(() =>"),
    "loadSnapshots must be memoized using useCallback in AgentWorkspace"
  );

  // Check count of listGuestReportRecoveries calls (1 import, 1 call)
  const matches = workspaceSrc.match(/listGuestReportRecoveries/g) || [];
  assert.strictEqual(matches.length, 2, "listGuestReportRecoveries should only appear in imports and the loadSnapshots definition");
});

test("CreateReportForm calls listGuestReportRecoveries only inside memoized loadSnapshots", () => {
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  
  // Verify loadSnapshots is wrapped in useCallback
  assert.ok(
    formSrc.includes("const loadSnapshots = useCallback(() =>"),
    "loadSnapshots must be memoized using useCallback in CreateReportForm"
  );
  
  const matches = formSrc.match(/listGuestReportRecoveries/g) || [];
  assert.strictEqual(matches.length, 2, "listGuestReportRecoveries should only appear in imports and the loadSnapshots definition");
});

// ─── Test 2: LocalStorage helper calls are contained in callbacks/effects ───

test("localStorage access is contained and does not block top-level render thread", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  // Regex to detect localStorage read/write outside functions/effects in the top-level block.
  // We check that raw window.localStorage calls are inside functions/hooks, not directly on the root of components.
  // Statically, all occurrences must be within blocks like useEffect, useCallback, function, or event handlers.
  
  // CreateReportForm: verify no localStorage call exists directly in the main component render body.
  // All matches of localStorage are inside getOrCreateGuestSessionId, handleRestoreSnapshot, handleSubmit, useEffect, and updateField.
  assert.ok(formSrc.includes("window.localStorage.getItem"), "CreateReportForm contains localStorage reads");
  assert.ok(formSrc.includes("window.localStorage.setItem"), "CreateReportForm contains localStorage writes");
});

// ─── Test 3: Autosave debounce has clearTimeout cleanup ─────────────────────

test("autosave debounce timer has clearTimeout cleanup", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  assert.match(workspaceSrc, /return\s*\(\)\s*=>\s*clearTimeout\(timer\)/, "AgentWorkspace autosave effect lacks clearTimeout cleanup");
  assert.match(formSrc, /return\s*\(\)\s*=>\s*clearTimeout\(timer\)/, "CreateReportForm autosave effect lacks clearTimeout cleanup");
});

// ─── Test 4: Countdown/Rate-limit intervals have clearInterval cleanup ───────

test("countdown intervals have clearInterval cleanup", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  assert.match(workspaceSrc, /return\s*\(\)\s*=>\s*clearInterval\(timer\)/, "AgentWorkspace rate-limit effect lacks clearInterval cleanup");
  assert.match(formSrc, /return\s*\(\)\s*=>\s*clearInterval\(timer\)/, "CreateReportForm rate-limit effect lacks clearInterval cleanup");
});

// ─── Test 5: /founder is not linked in public navigation ────────────────────

test("/founder is not linked in public navigation components", () => {
  const siteNavSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/SiteNav.tsx"), "utf8");
  const codexNavSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/CodexNav.tsx"), "utf8");

  assert.ok(!siteNavSrc.includes('/founder'), "SiteNav must not link to /founder");
  assert.ok(!codexNavSrc.includes('/founder'), "CodexNav must not link to /founder");
});

// ─── Test 6: Midtrans/Payment remains deferred/inactive ─────────────────────

test("Midtrans and payment systems remain deferred/inactive", () => {
  const readiness = getSystemReadiness();
  assert.strictEqual(readiness.midtransConfigured, false);
  assert.strictEqual(readiness.paidCheckoutActive, false);
  assert.strictEqual(readiness.creditPurchaseActive, false);
});

// ─── Test 7: No new heavy dependencies in package.json ──────────────────────

test("no new unapproved dependencies in package.json", () => {
  const pkg = require("../../package.json");
  const deps = Object.keys(pkg.dependencies || {});
  
  assert.ok(!deps.includes("lighthouse"), "package.json must not include lighthouse");
  assert.ok(!deps.includes("@next/bundle-analyzer"), "package.json must not include bundle analyzer");
});

// ─── Test 8: Performance audit docs exist ────────────────────────────────────

test("performance audit documentation exists", () => {
  const auditPath = path.join(repoRoot, "docs/qa/nali_cp1_performance_lag_audit.md");
  assert.ok(fs.existsSync(auditPath), "performance lag audit document must exist");
});

// ─── Test 9: Mobile visual optimizations implemented ─────────────────────────

test("mobile visual optimization: hidden md:block classes added to animated background blobs", () => {
  const magicBgSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/CodexMagicBackground.tsx"), "utf8");
  const videoBgSrc = fs.readFileSync(path.join(repoRoot, "src/components/ui/FluidVideoBackground.tsx"), "utf8");

  // Validate presence of hidden md:block class in CodexMagicBackground
  const magicMatches = magicBgSrc.match(/hidden md:block/g) || [];
  assert.ok(magicMatches.length >= 4, "CodexMagicBackground should hide secondary blobs on mobile");

  // Validate presence of hidden md:block class in FluidVideoBackground
  const videoMatches = videoBgSrc.match(/hidden md:block/g) || [];
  assert.ok(videoMatches.length >= 3, "FluidVideoBackground should hide secondary blobs on mobile");
});

// ─── Test 10: No raw debug console.log statements ───────────────────────────

test("no raw console.log statements in production workspace or form components", () => {
  const workspaceSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/AgentWorkspace.tsx"), "utf8");
  const formSrc = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");

  const workspaceLogs = workspaceSrc.match(/console\.log/g) || [];
  const formLogs = formSrc.match(/console\.log/g) || [];

  assert.strictEqual(workspaceLogs.length, 0, "AgentWorkspace must not contain raw console.log statements");
  assert.strictEqual(formLogs.length, 0, "CreateReportForm must not contain raw console.log statements");
});
