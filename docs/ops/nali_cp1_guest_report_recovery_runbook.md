# NaLI CP1 — Guest Report Recovery Operations Runbook

This runbook guides operators and developers on managing, verifying, and troubleshooting the client-side guest report recovery system.

## 1. System Architecture Overview
The recovery layer is entirely client-side (`use client`) and resides in the browser's `localStorage` under the key:
`nali-recovery-snapshots`

### Data Flow
1. **User Types Prompt**: As soon as the user triggers a generation, a temporary recovery snapshot is created with state `status: "generation_failed"`.
2. **Server Response**:
   - **Generation Succeeds**: The temporary snapshot is cleared, and a new snapshot with `status: "draft_ready"` and the generated report `id` is persisted.
   - **Server Reject (Abuse)**: If the server rejects the request with an integrity error (e.g. academic cheating, data fabrication), the temporary snapshot is cleared immediately.
   - **Network Error / Crash**: If the browser loses network connection, crashes, or the user navigates away, the temporary snapshot with `status: "generation_failed"` remains in the list.
3. **Mount Check**: When the user opens the workspace (`/create-report` or `/create-report` view in `/report`), the system checks the latest recovery snapshot:
   - If a snapshot exists, a `NaliAlert` banner is shown.
   - If the user clicks **"Pulihkan"**:
     - For `draft_ready` status: The app attempts to load the matching `report_access_key` from localStorage. If found, it redirects the user to `/report/[id]?token=...`. If the key is missing, it falls back to composer prefill.
     - For `generation_failed` / `chat_updated` status: The app prefills all inputs into the composer/form.
   - If the user clicks **"Hapus"**: The snapshot is dropped from storage.

---

## 2. Troubleshooting & Operations

### A. How to inspect recovery storage in Developer Console
Open the browser developer tools (F12) -> Console, and run:
```javascript
// List all active recoveries
JSON.parse(localStorage.getItem('nali-recovery-snapshots') || '[]')
```

### B. How to clear recovery storage manually
If a user reports layout bugs or recovery issues, you can instruct them to run:
```javascript
localStorage.removeItem('nali-recovery-snapshots')
```
Or use the application's built-in clear helper programmatically:
```typescript
import { clearGuestReportRecovery } from "@/lib/reports/clientRecovery";
clearGuestReportRecovery(); // Clears all
```

### C. Troubleshooting TTL issues
Recovery snapshots expire after **24 hours**. If a snapshot isn't appearing:
1. Verify the timestamp in the snapshot object.
2. Check that the device clock is synchronized. An incorrect device time can cause immediate pruning of snapshots.

---

## 3. Verification & CI/CD Checks

Before pushing any changes to this module:

### Run unit tests
```bash
node --test tests/reports/guest-report-recovery.test.cjs
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
- **Human Testing**: PAUSED. Do not ask users to manually test recovery behaviors; rely on programmatic assertions.
- **Honest recovery labels only**: Do not market this as a cloud backup or account sync.
