# NaLI CP1 — Debounced Guest Draft Autosave QA Report

This QA report details the verification and validation results for the Debounced Local Composer Autosave feature.

## Status Summary
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Guest Report Recovery**: GO
- **Debounced Local Composer Autosave**: GO

---

## 1. Autosave Storage & Debounce Model
- **Storage Mechanism**: HTML5 `localStorage` under key `nali-recovery-snapshots`.
- **Debounce Mechanism**: React `useEffect` hook utilizing standard `setTimeout` and `clearTimeout` timers.
- **Debounce Delay**: **2,000ms (2 seconds)** of typing inactivity.
- **Threshold**: Requires a minimum of **20 characters** in the primary composer text (`mainText`) to trigger autosaving, preventing clutter from empty inputs or accidental clicks.
- **Eviction/TTL**: Shares the existing recovery limits (max 3 snapshots, 24-hour TTL pruning).
- **Snapshot ID**: Uses the dedicated static ID `"composer-autosave"` with status `"autosaved_draft"`.

---

## 2. Privacy & Security Model
- **Stripped Fields**: All autosaves pass through `stripForbiddenFields` to remove:
  - `report_access_token_hash` / `reportAccessTokenHash`
  - `apikey` / `apikeyhash`
  - `provider`
  - `serverkey`
  - `stack`
  - `payment` / `payment_token` / `transaction` / `midtrans` / `token`
- **Zero Duplication**: Autosaves never cache or duplicate raw report access keys.
- **Abuse Prevention**: Snapshot is instantly deleted from storage if a user request triggers server-side academic cheating or fake data verification blocks, ensuring bad-faith prompts cannot be recovered.

---

## 3. User-Facing Copy
- **UI Copy Framing**: strictly framed as local browser helper text:
  - `"Draft lokal tersimpan"`
  - `"Tersimpan di browser ini"`
  - `"Draft terakhir ditemukan"`
  - `"Pulihkan"` / `"Hapus"`
- **Strictly Avoided Copy**: No mention of "cloud sync", "permanent backup", "account storage", or "guaranteed restore".

---

## 4. AI-Run Test Methods
- Verified programmatically using the Node.js test runner in [guest-report-autosave.test.cjs](file:///Users/macintosh/Documents/NaLI/tests/reports/guest-report-autosave.test.cjs):
  1. Tested validation of `"autosaved_draft"` status in client recovery utility.
  2. Tested minimum character checks (ignores inputs shorter than 20 chars).
  3. Tested forbidden keys stripping during autosave generation.
  4. Tested max-3 capacity limits and TTL pruning bounds.
  5. Asserted code-level presence of debounce timers (`setTimeout`/`clearTimeout`) in `CreateReportForm.tsx` and `AgentWorkspace.tsx` source code.
  6. Asserted absence of forbidden cloud-sync keywords in UI files.
  7. Verified Midtrans remains deferred/inactive.

---

## 5. Browser/Static Limitations
* **Live browser autosave/restore interaction was not visually verified; AI helper/static autosave checks passed.**
* **Local Storage Boundary**: Autosave drafts are bound to the specific browser app and device, and do not persist across multiple devices or incognito sessions.

---

## 6. Blockers Audit
- **P0 Blockers**: None.
- **P1 Blockers**: None.
- **P2 Blockers**: None.
- **P3 Blockers**: None.
