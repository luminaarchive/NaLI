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

  assert.ok(formatAnalysisExists, "Format analysis must exist");
  assert.ok(researchExists, "Stack research must exist");
  assert.ok(auditExists, "Dependency audit must exist");
});

test("2. Rendering dependencies are not imported in public client components", () => {
  const composerSource = fs.readFileSync(path.join(repoRoot, "src/components/report/CreateReportForm.tsx"), "utf8");
  assert.equal(composerSource.includes('from "pdf-lib"'), false);
  assert.equal(composerSource.includes('from "docx"'), false);
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
