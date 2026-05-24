# NaLI CP1 — Guest Report Recovery & Local History Operations Runbook

This runbook guides operators and developers on managing, verifying, and troubleshooting the client-side guest report recovery, debounced autosave, and local history management systems.

## 1. System Architecture Overview
The recovery, autosave, and local history layer is entirely client-side (`use client`) and resides in the browser's `localStorage` under the key:
`nali-recovery-snapshots`

### Data Flow & Autosave Behavior
1. **User Types Prompt**: As soon as the user enters at least 20 characters of main text in `/create-report` or `/report/[id]`, a debounced autosave process is triggered.
2. **Debounce Timing**: The system waits for **2,000ms (2 seconds)** of inactivity before saving the current form or composer state under the snapshot ID `"composer-autosave"` with `status: "autosaved_draft"`.
3. **Triggering Generation**: When the user clicks "Buat Draf" or "Buat Panduan", the active `"composer-autosave"` snapshot is immediately cleared from storage, and a temporary snapshot with `status: "generation_failed"` is generated to cover crashes during the active network connection.
4. **Server Response**:
   - **Generation Succeeds**: The temporary snapshot is cleared, and a new snapshot with `status: "draft_ready"` and the permanent `reportId` is saved.
   - **Server Reject (Abuse)**: If the server rejects the request with an integrity error (e.g. academic cheating, data fabrication), all temporary and autosaved snapshots are cleared immediately.
   - **Network Error / Crash**: If the browser loses network connection, crashes, or the user navigates away, the last autosaved draft or the temporary `generation_failed` snapshot remains in storage.
5. **Local History Panel ("Riwayat lokal browser")**:
   - Renders a collapsed-by-default history card when snapshots exist in `localStorage` (up to 3 max entries).
   - Allows users to **Pulihkan** (Restore), **Ganti nama** (Rename), **Hapus** (Delete one), and **Hapus semua** (Clear all recoveries).

---

## 2. Troubleshooting & Operations

### A. What users may see
- **History Panel (`"Riwayat lokal browser"`)**:
  - Displays a list of up to 3 local recovery snapshots with relative timestamps and status tags (`Autosave`, `Gagal`, `Siap`, `Chat`).
  - **"Pulihkan" (Restore)**:
    - Restores snapshot state.
    - If the user has active input text in the fields, prompts a confirmation dialog (`window.confirm`) to avoid accidental overwrites.
    - **Safe Restore Behavior**: If the snapshot status is `draft_ready` or `chat_updated` but the access token/key is missing from the local browser storage, it will automatically fall back to pre-filling the text composer fields instead of redirecting the user to a broken, unauthorized `/report/[id]` view.
  - **"Ganti nama" (Rename)**:
    - Prompts the user for a new title.
    - Sanitizes input: strips HTML, removes potential token/secret strings, and clamps title length to 80 characters.
  - **"Hapus" (Delete)**: Removes the single snapshot by ID from `localStorage`.
  - **"Hapus semua" (Clear All)**: Removes all NaLI recovery snapshots without touching other unrelated keys in `localStorage`.

### B. How to inspect recovery storage in Developer Console
Open the browser developer tools (F12) -> Console, and run:
```javascript
// List all active recoveries/autosaves
JSON.parse(localStorage.getItem('nali-recovery-snapshots') || '[]')
```

### C. Programmatic Recovery Operations
```typescript
import {
  clearGuestReportRecovery,
  renameGuestReportRecovery,
  listGuestReportRecoveries,
  getGuestRecoveryStats
} from "@/lib/reports/clientRecovery";

// Clear autosave snapshot only
clearGuestReportRecovery("composer-autosave"); 

// Clear all local snapshots
clearGuestReportRecovery(); 

// Rename a snapshot by ID
renameGuestReportRecovery("snapshot-id", "New Sanitized Title");

// Retrieve local history metrics
const stats = getGuestRecoveryStats();
console.log(`Saved entries: ${stats.count}, footprint: ${stats.storageBytes} bytes`);
```

### D. Privacy & Safety Warning
- **Purely Local**: Storage is restricted to the current browser/device. No account systems or cloud sync mechanics are introduced.
- **Sanitized Fields**: No API keys, credentials, report access tokens (`report_access_token_hash`), payment transactions, or stack traces are stored.
- **Auto-Deletion**: Snapshots are automatically cleared upon successful report generation or when academic abuse checks are triggered.

---

## 3. Verification & CI/CD Checks

Before pushing any changes to this module:

### Run unit, autosave, and history tests
```bash
node --test tests/reports/guest-report-recovery.test.cjs
node --test tests/reports/guest-report-autosave.test.cjs
node --test tests/reports/local-report-history.test.cjs
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
- **Human Testing**: PAUSED. Rely on programmatic assertions for verifying local history, rename/delete, and clear flows.
- **Honest recovery labels only**: Do not market this as a cloud backup or account sync.
