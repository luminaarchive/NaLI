# NaLI CP1 — Local Report History QA Report

**Date**: 2026-05-24
**Build**: Lightweight Local Report History & Deletion Management
**Sprint**: CP1 Sprint 0.7

---

## Status Summary

| Area | Status |
|------|--------|
| Human Testing | **PAUSED** |
| Midtrans | **DEFERRED** |
| Paid Launch | **NO-GO** |
| Guest Report Recovery | **GO** |
| Local Report History | **GO** |

---

## 1. Storage & Expiry Model
* **Mechanism**: Stored in HTML5 `localStorage` under the `nali-recovery-snapshots` key.
* **Constraints**: Hard capped at 3 entries max. Older entries are automatically evicted (LIFO order).
* **Expiry**: 24-hour TTL. Expired items are drop-filtered on retrieve and physically pruned from browser storage on load.
* **Fallback Safety**: Gracefully handles disabled storage, storage quota errors (`QuotaExceededError`), and malformed JSON parsing without throwing runtime errors or crashing the application UI.

---

## 2. Privacy & Security Model
* **Secrets Sandboxing**: Strips API keys, stack traces, and payment/Midtrans payloads using `stripForbiddenFields` before snapshots are stored.
* **No Access Key Duplication**: Never stores `report_access_token_hash` or duplicates raw access tokens in `nali-recovery-snapshots`.
* **Honest Copy & Framing**: Labeled as `"Riwayat lokal browser"`, `"Draft lokal terbaru"`, and `"saved on this device"`. Synced messaging (e.g. cloud/account sync) is completely absent.
* **Integrity Purge**: Snapshots are automatically cleared upon successful report generation or when server-side academic abuse policies (e.g. plagiarism, data fabrication) block the request.

---

## 3. UI and Actions Behavior
* **Layout**: Collapsed by default. Only visible if local snapshots exist in the browser. Compact, touch-safe (`min-h-[44px]`), and styled in the NaLI dark premium theme.
* **Touch-Safe Actions**:
  * **Pulihkan** (Restore): Restores text, warning the user first if active text already exists in fields. If the snapshot has a `reportId` but no safe access key exists in localStorage, it falls back to restoring the composer state rather than redirecting to a broken page.
  * **Ganti nama** (Rename): Prompts for new title, sanitizes (strips HTML, limits to 80 chars, fallback to defaults).
  * **Hapus** (Delete): Removes one NaLI recovery snapshot only.
  * **Hapus semua** (Clear all): Removes only NaLI recovery snapshots without touching unrelated localStorage keys.

---

## 4. Verification Results

All required verification tests passed:

* **New Test Suite (`local-report-history.test.cjs`)**: ✅ PASS (9/9 assertions pass)
* **Demo Tests (`test:demo`)**: ✅ PASS
* **Typecheck (`tsc`)**: ✅ PASS
* **Linter (`eslint`)**: ✅ PASS
* **Build (`next build`)**: ✅ PASS
* **Regression Tests**: ✅ PASS (137/137 assertions pass)

---

## 5. Browser/Static Limitations
* **Incognito/Privacy Mode**: If a user runs the browser in private/incognito mode, local history snapshots are deleted when the browser window closes.
* **Cross-device**: Local browser history is device-bound and browser-bound.
* **Honest Restore**: If the access key is missing from local storage, the app cannot safely reload the report from the server. Instead, it falls back to prefilling the composer text fields so the user can re-generate the draft.

---

## 6. Project Blockers
* **P0 Blockers**: None.
* **P1 Blockers**: Midtrans integration remains deferred.
* **P2 Blockers**: Mobile browser viewport testing is deferred (human testing paused).
* **P3 Blockers**: None.
