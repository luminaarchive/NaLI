const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const test = require("node:test");

const repoRoot = path.join(__dirname, "../..");

test("AgentWorkspace tracks composer focus state and adjusts bottom padding dynamically", () => {
  const filepath = path.join(repoRoot, "src/components/report/AgentWorkspace.tsx");
  const code = fs.readFileSync(filepath, "utf8");

  // 1. Tracks composer focus state
  assert.match(
    code,
    /const\s+\[isComposerFocused,\s*setIsComposerFocused\]\s*=\s*useState\(false\)/,
    "AgentWorkspace should track the focus state of the composer textarea",
  );

  // 2. Textarea has onFocus and onBlur handlers
  assert.match(
    code,
    /onFocus=\{\(\)\s*=>\s*setIsComposerFocused\(true\)\}/,
    "Composer textarea should set focus state to true on focus",
  );
  assert.match(
    code,
    /onBlur=\{\(\)\s*=>\s*setIsComposerFocused\(false\)\}/,
    "Composer textarea should set focus state to false on blur",
  );

  // 3. Dynamic bottom padding is applied depending on focus state
  assert.match(
    code,
    /pb-\[calc\(18rem\+env\(safe-area-inset-bottom\)\)\]/,
    "Composer focused state should increase bottom padding to 18rem on mobile viewports",
  );
  assert.match(
    code,
    /pb-\[calc\(12rem\+env\(safe-area-inset-bottom\)\)\]/,
    "Composer default/unfocused state should use the standard 12rem bottom padding on mobile",
  );

  // 4. Composer retains safe-area bottom handling
  assert.match(
    code,
    /pb-\[calc\(1rem\+env\(safe-area-inset-bottom\)\)\]/,
    "Bottom composer container must retain env(safe-area-inset-bottom) support",
  );

  // 5. Suggested actions retain min-h-[44px] touch targets and wrapping
  assert.match(
    code,
    /flex flex-wrap justify-center gap-2 py-1/,
    "Bottom composer suggested actions container should wrap flex items",
  );
  assert.match(code, /min-h-\[44px\]/, "Suggested action buttons must keep a minimum touch target height of 44px");

  // 6. Model selector remains compact and desktop responsive layout classes exist
  assert.match(code, /flex flex-wrap gap-2/, "Model selector buttons container should wrap and be compact");
  assert.match(
    code,
    /flex-1 items-center justify-center gap-1\.5 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 sm:flex-none/,
    "Model selector buttons should fill row on mobile and display naturally on desktop",
  );
  assert.match(code, /disabled=\{isLocked\}/, "Locked premium model buttons must be disabled on mobile.");
  assert.match(code, /cursor-not-allowed/, "Locked premium model buttons must not imply selectable actions.");

  // 7. No Midtrans checkout link or payment activation is present
  assert.strictEqual(code.includes("midtransCheckoutActive = true"), false, "Midtrans/payments must not be activated");

  // 8. No public /founder admin routes are linked
  assert.strictEqual(
    code.includes('href="/founder"'),
    false,
    "AgentWorkspace should not leak the /founder path in the UI",
  );
});
