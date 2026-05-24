require("../helpers/register-ts.cjs");
const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const {
  validateReportInput,
  validateComposerInput
} = require("../../src/lib/reports/inputValidation");

// 1. Empty input returns canSubmit false
test("validateReportInput - empty mainText returns canSubmit false", () => {
  const result = validateReportInput({
    mainText: "",
    integrityConsent: true,
    mode: "draft_from_materials"
  });
  assert.equal(result.canSubmit, false);
  assert.equal(result.code, "EMPTY_INPUT");
  assert.equal(result.severity, "error");
});

// 2. Whitespace-only input returns canSubmit false
test("validateReportInput - whitespace only returns canSubmit false", () => {
  const result = validateReportInput({
    mainText: "     \n    ",
    integrityConsent: true,
    mode: "draft_from_materials"
  });
  assert.equal(result.canSubmit, false);
  assert.equal(result.code, "EMPTY_INPUT");
});

// 3. Too-short input returns canSubmit false
test("validateReportInput - too short input returns canSubmit false", () => {
  const result = validateReportInput({
    mainText: "pendek", // < 15 characters
    integrityConsent: true,
    mode: "draft_from_materials"
  });
  assert.equal(result.canSubmit, false);
  assert.equal(result.code, "TOO_SHORT");
});

// 4. Weak beginner input returns warning but canSubmit true if above threshold
test("validateReportInput - weak beginner input returns warning but canSubmit true", () => {
  const result = validateReportInput({
    mainText: "Catatan observasi singkat di pekarangan rumah", // 45 chars is medium, let's use 25 chars
    integrityConsent: true,
    mode: "draft_from_materials"
  });
  const shortResult = validateReportInput({
    mainText: "Catatan observasi 20 char", // 25 characters
    integrityConsent: true,
    mode: "draft_from_materials"
  });
  assert.equal(shortResult.canSubmit, true);
  assert.equal(shortResult.severity, "warning");
  assert.equal(shortResult.code, "WEAK_INPUT");
});

// 5. Useful practicum input returns canSubmit true
test("validateReportInput - useful practicum input returns canSubmit true with no warnings", () => {
  const result = validateReportInput({
    mainText: "Hasil pengamatan mikroskop sel epidermis bawang merah menunjukkan adanya dinding sel, sitoplasma, dan inti sel yang berwarna merah muda setelah diberi pewarna.",
    integrityConsent: true,
    mode: "draft_from_materials"
  });
  assert.equal(result.canSubmit, true);
  assert.equal(result.severity, "none");
});

// 6. Unsupported upload/source verification request returns clear CP1 inactive warning or block
test("validateReportInput - unsupported upload and source verification returns warnings", () => {
  const uploadResult = validateReportInput({
    mainText: "Saya ingin melakukan upload pdf berkas pengamatan biologi saya.",
    integrityConsent: true
  });
  assert.equal(uploadResult.canSubmit, true); // Warn but do not block
  assert.equal(uploadResult.severity, "warning");
  assert.equal(uploadResult.code, "UNSUPPORTED_UPLOAD");
  assert.match(uploadResult.title, /Unggah/i);
  assert.match(uploadResult.message, /observasi berkas/i);

  const verifResult = validateReportInput({
    mainText: "Tolong lakukan verifikasi database resmi ncbi live lookup untuk jurnal ini.",
    integrityConsent: true
  });
  assert.equal(verifResult.canSubmit, true);
  assert.equal(verifResult.severity, "info");
  assert.equal(verifResult.code, "UNSUPPORTED_VERIFICATION");
  assert.match(verifResult.message, /belum/i);
});

// 7. Overlong input returns warning/error without heavy processing
test("validateReportInput - overlong input returns warning", () => {
  // Use a sentence of > 20 characters repeated to avoid spam detection
  const longText = "Catatan praktikum observasi lapangan biologi di pekarangan rumah saya yang sangat luas sekali. ".repeat(100);
  const result = validateReportInput({
    mainText: longText,
    integrityConsent: true
  });
  assert.equal(result.canSubmit, true);
  assert.equal(result.severity, "warning");
  assert.equal(result.code, "INPUT_TOO_LONG");
});

// 8. Malformed URL/source field returns warning/error if URL fields exist
test("validateReportInput - malformed URL returns error", () => {
  const result = validateReportInput({
    mainText: "Catatan pengamatan mikroskop panjang di laboratorium biologi",
    sourceUrls: "not-a-valid-url-format",
    integrityConsent: true
  });
  assert.equal(result.canSubmit, false);
  assert.equal(result.code, "MALFORMED_URL");
  assert.equal(result.severity, "error");
});

// 9. Validation output copy does not claim upload/source verification active
test("inputValidation copy - does not claim upload/source verification active", () => {
  const codePath = path.join(__dirname, "../../src/lib/reports/inputValidation.ts");
  const code = fs.readFileSync(codePath, "utf-8");
  
  // Should state they are NOT active or pending in MVP
  assert.match(code, /belum aktif/i);
  assert.doesNotMatch(code, /unggah berkas sekarang aktif/i);
  assert.doesNotMatch(code, /live verification active/i);
});

// 10. Validation output copy does not claim paid launch active
test("inputValidation copy - does not claim paid launch active", () => {
  const codePath = path.join(__dirname, "../../src/lib/reports/inputValidation.ts");
  const code = fs.readFileSync(codePath, "utf-8");
  
  assert.match(code, /sistem pembayaran belum aktif/i);
  assert.doesNotMatch(code, /pembayaran sukses/i);
  assert.doesNotMatch(code, /pembelian kredit aktif/i);
});

// 11. Validation output does not expose provider names/secrets
test("inputValidation copy - does not expose provider names or secrets", () => {
  const codePath = path.join(__dirname, "../../src/lib/reports/inputValidation.ts");
  const code = fs.readFileSync(codePath, "utf-8");
  
  const forbiddenProviders = /\b(OpenAI|Claude|GPT|OpenRouter|Gemini|Anthropic)\b/i;
  assert.doesNotMatch(code, forbiddenProviders);
  assert.doesNotMatch(code, /sk-[a-zA-Z0-9]{24,}/);
});

// 12. Debounce hook/source includes clearTimeout cleanup
test("useDebouncedValidation - includes clearTimeout cleanup", () => {
  const hookPath = path.join(__dirname, "../../src/lib/reports/useDebouncedValidation.ts");
  const hookCode = fs.readFileSync(hookPath, "utf-8");
  
  assert.match(hookCode, /clearTimeout\(/);
});

// 13. CreateReportForm integrates validation without removing autosave/recovery
test("CreateReportForm - integrates validation and preserves autosave", () => {
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  const formCode = fs.readFileSync(formPath, "utf-8");
  
  assert.match(formCode, /useDebouncedReportValidation/);
  assert.match(formCode, /validateReportInput/);
  // Check that guest autosave/recovery mechanisms are intact
  assert.match(formCode, /loadLatestGuestReportRecovery/);
  assert.match(formCode, /saveGuestReportRecovery/);
});

// 14. AgentWorkspace integrates validation without breaking rate-limit retry
test("AgentWorkspace - integrates validation and preserves rate-limit retry", () => {
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");
  
  assert.match(workspaceCode, /useDebouncedComposerValidation/);
  assert.match(workspaceCode, /validateComposerInput/);
  // Check that rate limit check / countdown is still in the file
  assert.match(workspaceCode, /retryAfterSeconds/);
});

// 15. No public /founder nav link introduced
test("CreateReportForm & AgentWorkspace - no public founder links in navigation", () => {
  const formPath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  const workspacePath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  
  const formCode = fs.readFileSync(formPath, "utf-8");
  const workspaceCode = fs.readFileSync(workspacePath, "utf-8");
  
  assert.doesNotMatch(formCode, /href=['"]\/founder['"]/g);
  assert.doesNotMatch(workspaceCode, /href=['"]\/founder['"]/g);
});

// 16. No new dependency added to package.json
test("package.json - no heavy validation libraries added", () => {
  const pkgPath = path.join(__dirname, "../../package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  
  const deps = pkg.dependencies || {};
  const forbiddenDeps = ["yup", "joi", "validator", "superstruct", "class-validator", "ajv"];
  for (const dep of forbiddenDeps) {
    assert.equal(deps[dep], undefined, `Dependency ${dep} should not be added.`);
  }
});
