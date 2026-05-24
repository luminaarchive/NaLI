# NaLI CP1 — Guest Report Recovery & Autosave Operations Runbook

This runbook guides operators and developers on managing, verifying, and troubleshooting the client-side guest report recovery and debounced autosave systems.

## 1. System Architecture Overview
The recovery and autosave layer is entirely client-side (`use client`) and resides in the browser's `localStorage` under the key:
`nali-recovery-snapshots`

### Data Flow & Autosave Behavior
1. **User Types Prompt**: As soon as the user enters at least 20 characters of main text in `/create-report` or `/report/[id]`, a debounced autosave process is triggered.
2. **Debounce Timing**: The system waits for **2,000ms (2 seconds)** of inactivity before saving the current form or composer state under the snapshot ID `"composer-autosave"` with `status: "autosaved_draft"`.
3. **Triggering Generation**: When the user clicks "Buat Draf" or "Buat Panduan", the active `"composer-autosave"` snapshot is immediately cleared from storage, and a temporary snapshot with `status: "generation_failed"` is generated to cover crashes during the active network connection.
4. **Server Response**:
   - **Generation Succeeds**: The temporary snapshot is cleared, and a new snapshot with `status: "draft_ready"` and the permanent `reportId` is saved.
   - **Server Reject (Abuse)**: If the server rejects the request with an integrity error (e.g. academic cheating, data fabrication), all temporary and autosaved snapshots are cleared immediately.
   - **Network Error / Crash**: If the browser loses network connection, crashes, or the user navigates away, the last autosaved draft or the temporary `generation_failed` snapshot remains in storage.
5. **Mount Check & UI Display**:
   - When the user opens `/create-report` (welcome state): The system looks at the latest snapshot. If a valid recovery or autosaved snapshot exists, a mobile-safe `NaliAlert` banner is shown.
   - When the user opens a chat thread `/report/[id]` where they had an autosaved follow-up query: If the snapshot has `status: "autosaved_draft"` and matches the `reportId` of the current page, it auto-prefills the empty input field directly, clearing the snapshot from storage so it does not reappear.

---

## 2. Troubleshooting & Operations

### A. What users may see
- **On `/create-report` or welcome page**:
  - Alert Title: `"Draft terakhir ditemukan"`
  - Alert Message: `"NaLI menemukan draft terbaru yang tersimpan di browser ini. Kamu bisa memulihkannya atau menghapusnya."`
  - Button **"Pulihkan"**:
    - If `status === "draft_ready"`, attempts redirect using the access key in localStorage.
    - If `status === "autosaved_draft"` or `generation_failed`, prefills the composer text.
    - If user already typed some text, asks for confirmation using `window.confirm` to avoid accidental overwrites.
  - Button **"Hapus"**: Deletes the snapshot from local storage.
- **On `/report/[id]` (chat thread)**:
  - If a user was typing a long chat update and refreshed the page, their input field will automatically contain their unsaved text on page load. No noisy alert banner is rendered in this view.

### B. How to inspect recovery storage in Developer Console
Open the browser developer tools (F12) -> Console, and run:
```javascript
// List all active recoveries/autosaves
JSON.parse(localStorage.getItem('nali-recovery-snapshots') || '[]')
```

### C. How to clear local autosave manually
Instruct the user to run:
```javascript
localStorage.removeItem('nali-recovery-snapshots')
```
Or programmatically:
```typescript
import { clearGuestReportRecovery } from "@/lib/reports/clientRecovery";
clearGuestReportRecovery("composer-autosave"); // Clears autosave draft only
clearGuestReportRecovery(); // Clears all snapshots
```

### D. Privacy Warning
- **Purely Local**: Storage is restricted to the current browser/device.
- **Sanitized Fields**: No API keys, credentials, report access keys (`report_access_token_hash`), payment transactions, or stack traces are stored.
- **Auto-Deletion**: Snapshots are automatically cleared upon successful report generation or when academic abuse checks are triggered.

---

## 3. Verification & CI/CD Checks

Before pushing any changes to this module:

### Run unit and autosave tests
```bash
node --test tests/reports/guest-report-recovery.test.cjs
node --test tests/reports/guest-report-autosave.test.cjs
```

### Run full lint and type checking
```bash
npm run lint
npm run typecheck
```

### Build production bundle locally
```bash
npm run build
```
Ensure there are no build errors.

---

## 4. Operational Boundaries
- **Midtrans Integration**: DEFERRED. Never expose credit/token purchasing interfaces or trigger payment checkout prompts.
- **Human Testing**: PAUSED. Do not ask users or founders to manually test recovery/autosave behaviors; rely on programmatic assertions.
- **Honest recovery labels only**: Do not market this as a cloud backup or account sync.
