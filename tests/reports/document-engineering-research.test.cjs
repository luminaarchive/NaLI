require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const fs = require("node:fs");

const repoRoot = path.join(__dirname, "../..");

test("1. Research and audit documents exist", () => {
  const formatAnalysisExists = fs.existsSync(path.join(repoRoot, "docs/qa/nali_cp1_reference_journal_format_analysis.md"));
  const researchExists = fs.existsSync(path.join(repoRoot, "docs/qa/nali_cp1_journal_document_engineering_stack_research.md"));
  const auditExists = fs.existsSync(path.join(repoRoot, "docs/qa/nali_cp1_journal_document_dependency_audit.md"));
  const replacementExists = fs.existsSync(path.join(repoRoot, "docs/qa/nali_cp1_journal_renderer_replacement_research.md"));
  const failureAuditExists = fs.existsSync(path.join(repoRoot, "docs/qa/nali_cp1_journal_v4_failure_audit.md"));

  assert.ok(formatAnalysisExists, "Format analysis must exist");
  assert.ok(researchExists, "Stack research must exist");
  assert.ok(auditExists, "Dependency audit must exist");
  assert.ok(replacementExists, "Replacement renderer research must exist");
  assert.ok(failureAuditExists, "V4 failure audit must exist");
});

test("2. Rendering dependencies are not imported in public client components", () => {
  const composerSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  const resultSource = fs.readFileSync(path.join(repoRoot, "src/components/report/ReportResultClient.tsx"), "utf8");
  assert.equal(composerSource.includes('from "pdf-lib"'), false);
  assert.equal(composerSource.includes('from "docx"'), false);
  assert.equal(composerSource.includes('from "playwright"'), false);
  assert.equal(resultSource.includes('from "playwright"'), false);
});

test("3. Public payment and export gates remain strictly locked", () => {
  const { getSystemReadiness } = require("../../src/lib/system/readiness");
  const readiness = getSystemReadiness();
  
  assert.equal(readiness.midtransConfigured, false, "Midtrans must not be configured by default");
  assert.equal(readiness.paidCheckoutActive, false, "Paid checkout must remain inactive");
  assert.equal(readiness.uploadActive, false, "Upload must remain inactive");
  assert.equal(readiness.sourceVerificationActive, false, "Source verification must remain inactive");
  assert.equal(readiness.professionalFieldIntelligence, "positioning_only", "Field Intelligence must remain positioning only");
});

test("4. Playwright is declared as a development-only renderer dependency", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
  assert.ok(pkg.devDependencies.playwright, "Playwright must be explicit for reproducible local QA");
  assert.equal(pkg.dependencies.playwright, undefined, "Playwright must not be a runtime/public dependency");
});
