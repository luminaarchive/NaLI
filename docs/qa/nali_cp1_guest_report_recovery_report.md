# NaLI CP1 — Guest Report Recovery QA Report

This QA report details the verification and validation results for the Client-side Guest Report Recovery feature.

## Status Summary
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Guest Report Recovery**: GO

---

## 1. Recovery Storage Model
- **Mechanism**: HTML5 `localStorage` only.
- **Auto-Pruning (TTL)**: 24 hours. Expired items are drop-filtered on retrieve and physically pruned from browser storage on load.
- **Size Constraints**: Maximum of 3 recovery entries. Newer snapshots displace the oldest when exceeding this threshold.
- **Graceful Failbacks**: Handled using explicit try-catch blocks and storage checking (`safeStorageAvailable`) to avoid crashes if `localStorage` is disabled or full.

---

## 2. Privacy & Security Model
- **No Cloud Association**: The recovery system behaves purely locally. UI text frames it strictly as "local browser recovery", "recent draft recovery", or "saved on this device/browser".
- **Sensitive Field Stripping**: All snapshots pass through a stripping function that deletes keys containing:
  - `report_access_token_hash` / `reportAccessTokenHash`
  - `apikey` / `apikeyhash`
  - `provider`
  - `serverkey`
  - `stack`
  - `payment` / `payment_token` / `transaction` / `midtrans` / `token`
- **Keyword & HTML Sanitization**: Input fields are trimmed to maximum lengths (e.g. 5,000 characters for primary query) and stripped of HTML/script tags before being written.
- **Abuse Prevention**: Prompts blocked due to server-side integrity errors (such as empty inputs, final assignment generation, plagiarism evasion, fake data, or fake citation requests) are immediately cleared and never saved as recovery drafts.

---

## 3. User-Facing Copy
- **NaliAlert Banner Title**: `“Draft terakhir ditemukan”`
- **NaliAlert Banner Message**: `“NaLI menemukan draft terbaru yang tersimpan di browser ini. Kamu bisa memulihkannya atau menghapusnya.”`
- **Action Buttons**:
  - `“Pulihkan”`: Prefills composer/form fields or redirects to the generated report if the access token is present in the browser storage.
  - `“Hapus”`: Discards the recovery snapshot.

---

## 4. AI-Run Test Methods
- Verified programmatically using the Node.js test runner in [guest-report-recovery.test.cjs](file:///Users/macintosh/Documents/NaLI/tests/reports/guest-report-recovery.test.cjs).
- Mocks were implemented for `window.localStorage` and `safeStorageAvailable` to test edge cases:
  1. Disabled/unavailable storage gracefully falls back to returning false instead of throwing.
  2. Saving, loading, listing, and clearing items.
  3. Max 3 entries limit check.
  4. TTL pruning.
  5. Quota error safe handling.
  6. Malformed JSON parsing safe recovery.
  7. Stripping of forbidden/sensitive keys and HTML tags.
  8. Static analysis check for copy guidelines (absence of "cloud sync/backup" and presence of honest recovery copy).
  9. Verification that no public `/founder` dashboard links are rendered.
  10. System readiness verification (ensuring Midtrans remains deferred/inactive).

---

## 5. Browser/Static Limitations
- **Cross-device/Cross-browser**: Since data is stored in `localStorage`, recovery is local to the specific device and browser app. If a user switches from Safari to Chrome or uses incognito mode, the recovery draft will not be accessible.
- **Honest Restore**: If the access key is missing from local storage, the app cannot safely reload the report from the server. Instead, it falls back to prefilling the composer text fields so the user can re-generate the draft.

---

## 6. Blockers Audit
- **P0 Blockers**: None. All core recovery functions, routing, and error handlings pass verification.
- **P1 Blockers**: None.
- **P2 Blockers**: None.
- **P3 Blockers**: None.
