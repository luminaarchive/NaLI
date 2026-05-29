const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");

require("../helpers/register-ts.cjs");
const { getSystemReadiness } = require("../../src/lib/system/readiness");

test("CreateReportForm contains mobile-safe touch targets and expanded checkboxes", () => {
  const filepath = path.join(__dirname, "../../src/components/report/CreateReportForm.tsx");
  const code = fs.readFileSync(filepath, "utf8");

  // 1. Submit button has min-h-12
  assert.match(
    code,
    /inline-flex min-h-12 items-center justify-center/g,
    "Submit button should have a uniform 48px touch-target height (min-h-12)",
  );

  // 2. ModeButton has p-3 and min-h-[48px]
  assert.match(
    code,
    /"min-h-\[48px\] rounded-xl border p-3 text-left transition-all duration-200 sm:p-4"/,
    "ModeButton should have p-3 padding and minimum height of 48px on mobile",
  );

  // 3. Optional details summary has min-h-[48px]
  assert.match(
    code,
    /<summary className="flex min-h-\[48px\].*text-sm font-semibold text-white\/80">/,
    "Details summary should have min-h-[48px] touch-target",
  );

  // 4. Integrity checkbox label has expanded padding and cursor pointer
  assert.match(
    code,
    /cursor-pointer items-start.*p-3 text-left/,
    "Integrity consent label wrapper should have p-3 padding and cursor-pointer",
  );
});

test("AgentWorkspace contains mobile-safe layout, composer, suggested actions, and card actions", () => {
  const filepath = path.join(__dirname, "../../src/components/report/AgentWorkspace.tsx");
  const code = fs.readFileSync(filepath, "utf8");

  // 1. Responsive bottom padding for message list
  assert.match(
    code,
    /pb-\[calc\(12rem\+env\(safe-area-inset-bottom\)\)\] sm:pb-\[calc\(8\.5rem\+env\(safe-area-inset-bottom\)\)\]/,
    "Message list bottom padding should be responsive to avoid excessive desktop spacing",
  );

  // 2. Inline suggested action buttons have min-h-[44px]
  assert.match(
    code,
    /inline-flex min-h-\[44px\] cursor-pointer items-center rounded-full border border-white\/\[0\.06\] bg-white\/\[0\.02\] px-3\.5 py-2 text-left text-xs/,
    "Inline suggested action chips should have at least 44px min-height",
  );

  // 3. Bottom composer suggested actions have h-[42px]
  assert.match(
    code,
    /inline-flex h-\[42px\] cursor-pointer items-center rounded-full border border-white\/\[0\.07\] bg-\[#2a2a2a\] px-4 py-2 text-xs/,
    "Bottom suggested action chips should have at least 42px height and neutral styling",
  );

  // 4. Input composer container has min-h-[48px] sm:min-h-[56px]
  assert.match(code, /min-h-\[48px\]/, "Textarea container should have min-h-[48px] on mobile");
  assert.match(code, /sm:min-h-\[56px\]/, "Textarea container should have sm:min-h-[56px] on desktop");

  // 5. Submit button is touch-safe and announces the public report action
  assert.match(
    code,
    /aria-label=\{selectedMode === "draft_from_materials" \? "Buat Laporan" : "Buat Panduan Awal"\}/,
    "Submit button should announce the selected public report action",
  );
  assert.match(
    code,
    /inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/,
    "Send button should match Manus style (circular h-9 w-9)",
  );

  // 6. Card action buttons have responsive h-11 sm:h-8 touch-safe overrides
  assert.match(
    code,
    /className="h-11 cursor-pointer border-white\/\[0\.08\] text-white\/60 hover:bg-white\/\[0\.04\] hover:text-white sm:h-8"/,
    "Salin button should have responsive h-11 sm:h-8 height",
  );
  assert.match(code, /Unduh Markdown lokal/);
  assert.match(code, /PDF\/DOCX publik tetap terkunci \/ inactive di CP1/);
  assert.doesNotMatch(code, /Unlock PDF|\/api\/payments\/create|Kredit/);
});

test("Public navigation does not link to founder admin routes", () => {
  const filepath = path.join(__dirname, "../../src/components/ui/CodexNav.tsx");
  const code = fs.readFileSync(filepath, "utf8");

  assert.strictEqual(
    code.includes("/founder"),
    false,
    "Public CodexNav navigation should not leak or contain references to the /founder console",
  );
});

test("System readiness preserves Midtrans DEFERRED and Paid Launch inactive configurations", () => {
  const prevServerKey = process.env.MIDTRANS_SERVER_KEY;
  delete process.env.MIDTRANS_SERVER_KEY; // Force staging/deferred mode

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
