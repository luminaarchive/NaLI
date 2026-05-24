const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");

require("../helpers/register-ts.cjs");
const { normalizePublicError, sanitizeErrorMessage } = require("../../src/lib/errors/publicErrors");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

test("normalizePublicError maps error scenarios safely", () => {
  // 1. Rate limit / 429
  const errRateLimit = normalizePublicError({ status: 429, retryAfterSeconds: 45 });
  assert.strictEqual(errRateLimit.category, "RATE_LIMIT");
  assert.strictEqual(errRateLimit.title, "Batas percobaan tercapai");
  assert.match(errRateLimit.explanation, /45 detik/);
  assert.strictEqual(errRateLimit.severity, "warning");

  // 2. Integrity violations (fake citations, plagiarism, cheating)
  const errFakeCitation = normalizePublicError({ code: "FAKE_CITATION_REQUEST" });
  assert.strictEqual(errFakeCitation.category, "INTEGRITY_BLOCK");
  assert.strictEqual(errFakeCitation.title, "Permintaan tidak bisa diproses");
  assert.strictEqual(errFakeCitation.severity, "error");

  const errPlagiarism = normalizePublicError({ code: "PLAGIARISM_EVASION" });
  assert.strictEqual(errPlagiarism.category, "INTEGRITY_BLOCK");

  const errDishonesty = normalizePublicError({ code: "ACADEMIC_DISHONESTY" });
  assert.strictEqual(errDishonesty.category, "INTEGRITY_BLOCK");

  const errFabrication = normalizePublicError({ code: "DATA_FABRICATION" });
  assert.strictEqual(errFabrication.category, "INTEGRITY_BLOCK");

  // 3. Export locked / 402
  const errExportLocked = normalizePublicError({ status: 402 });
  assert.strictEqual(errExportLocked.category, "EXPORT_LOCKED");
  assert.strictEqual(errExportLocked.title, "Ekspor dokumen premium terkunci");
  assert.match(errExportLocked.explanation, /Midtrans ditangguhkan/);
  assert.strictEqual(errExportLocked.severity, "locked");

  // 4. Unauthorized / 401 / 403
  const errUnauthorized = normalizePublicError({ status: 401 });
  assert.strictEqual(errUnauthorized.category, "UNAUTHORIZED");
  assert.strictEqual(errUnauthorized.title, "Akses tidak valid");

  // 5. Network / Server Failure
  const errNetwork = normalizePublicError({ status: 502 });
  assert.strictEqual(errNetwork.category, "NETWORK_OR_SERVER");
  assert.strictEqual(errNetwork.title, "Koneksi atau server bermasalah");

  // 6. Unknown / Generic
  const errGeneric = normalizePublicError({ message: "Something went wrong" });
  assert.strictEqual(errGeneric.category, "GENERIC");
  assert.strictEqual(errGeneric.title, "Terjadi kesalahan");
});

test("sanitizeErrorMessage removes secrets, stack traces, and local paths", () => {
  // sk- API key
  const s1 = sanitizeErrorMessage("Failed to authenticate key sk-12345abcdefghijklmnopqrstuvwxyz67890.");
  assert.doesNotMatch(s1, /sk-12345/);
  assert.match(s1, /\[API_KEY\]/);

  // Stack trace
  const s2 = sanitizeErrorMessage("Error: connection failed\n    at requestOpenRouterJson (/Users/macintosh/Documents/NaLI/src/lib/ai/openrouter.ts:45:12)\n    at POST (/Users/macintosh/Documents/NaLI/src/app/api/reports/generate/route.ts:74:9)");
  assert.doesNotMatch(s2, /at requestOpenRouterJson/);
  assert.doesNotMatch(s2, /at POST/);

  // Local path
  const s3 = sanitizeErrorMessage("File not found: /Users/macintosh/Documents/NaLI/src/components/report/CreateReportForm.tsx");
  assert.doesNotMatch(s3, /\/Users\/macintosh/);
  assert.match(s3, /\[internal_path\]/);

  // Provider names
  const s4 = sanitizeErrorMessage("OpenRouter API error or OpenAI stack trace");
  assert.doesNotMatch(s4, /OpenRouter/i);
  assert.doesNotMatch(s4, /OpenAI/i);
  assert.match(s4, /NaLI Engine/i);
});

test("NaliAlert source contains mobile-safe classes and accessible rules", () => {
  const filepath = path.join(__dirname, "../../src/components/ui/NaliAlert.tsx");
  const code = fs.readFileSync(filepath, "utf8");

  // Accessible semantics
  assert.match(code, /role=\{role\}/, "NaliAlert should set HTML role dynamically");
  assert.match(code, /aria-live=\{ariaLive\}/, "NaliAlert should set aria-live dynamically");
  assert.match(code, /role = isAssertive \? "alert" : "status"/, "NaliAlert must use role='alert' for warnings/errors only");

  // Mobile-safe layout classes
  assert.match(code, /flex flex-col md:flex-row/, "NaliAlert should stack vertically on mobile");
  assert.match(code, /min-h-\[44px\]/, "Action button must use touch target of at least 44px");
  assert.match(code, /whitespace-normal/, "NaliAlert text containers must allow text wrapping");
  assert.match(code, /break-words/, "NaliAlert text containers must break long words safely");
});

test("System readiness preserves Midtrans DEFERRED and Paid Launch inactive configurations", () => {
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_SERVER_KEY; // Ensure deferred mode

  try {
    const readiness = getSystemReadiness();
    assert.strictEqual(readiness.midtransConfigured, false, "Midtrans configuration should remain deferred/inactive");
    assert.strictEqual(readiness.paidCheckoutActive, false, "Paid launch checkout should remain inactive");
    assert.strictEqual(readiness.creditPurchaseActive, false, "Paid credit purchase should remain inactive");
    assert.strictEqual(readiness.exportGateStatus, "prepared_locked", "Export gate status should be prepared_locked");
  } finally {
    process.env.MIDTRANS_SERVER_KEY = prevServerKey;
  }
});
