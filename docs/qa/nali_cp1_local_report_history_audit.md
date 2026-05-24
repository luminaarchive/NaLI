# NaLI CP1 Local Report History & Deletion Audit

This document audits the current local recovery/autosave system and designs the lightweight local history management controls for guest users in NaLI CP1.

## 1. Current Storage & Recovery Model

- **Key**: `nali-recovery-snapshots` in `localStorage`.
- **Entries Max limit**: `3` entries.
- **Expiry (TTL)**: `24 hours` (`86,400,000` ms).
- **Autosave Snapshot ID**: `"composer-autosave"` with status `"autosaved_draft"`.
- **Integrity Check**: Server-side academic integrity violations (such as `FAKE_CITATION_REQUEST`, `PLAGIARISM_EVASION`, etc.) immediately purge the active temporary and autosaved snapshots.

## 2. Current User Management Gaps

Currently:
1. Users can only see the latest snapshot via the `"Draft terakhir ditemukan"` banner.
2. Users cannot view the list of multiple saved snapshots.
3. Users cannot rename snapshots (they defaults to `"Draft Laporan"` or the template title).
4. Users cannot delete a specific snapshot without deleting all snapshots.
5. Users cannot clear all snapshots easily from the UI.

## 3. Privacy & Security Constraints

- **Multi-user / Shared Device Risk**: If multiple guest users share a device/browser, they can read each other's recent local drafts. 
- **Required Mitigation**:
  - Never store `report_access_token_hash` or duplicate raw access tokens in `nali-recovery-snapshots`.
  - Strip API keys, stack traces, and payment/Midtrans payloads using `stripForbiddenFields`.
  - Sanitize all titles (remove HTML, limit length to 80 characters).
  - Explicitly frame the feature as "local browser history" and "recent drafts on this device" so users understand it is browser-bound.
  - Do not introduce cloud sync, permanent backup, or synced account messaging.

## 4. Proposed Utilities Extension

Extend [clientRecovery.ts](file:///Users/macintosh/Documents/NaLI/src/lib/reports/clientRecovery.ts) with:
- `renameGuestReportRecovery(id, title)`: Sanitizes title and updates the snapshot title.
- `getGuestReportRecoveryById(id)`: Returns a specific snapshot.
- `clearExpiredGuestRecoveries()`: Prunes older snapshots.
- `getGuestRecoveryStats()`: Returns snapshot count and storage footprint.
- `clearAutosaveOnly()`: Discards the `"composer-autosave"` snapshot.

## 5. UI Integration

- Render a collapsed-by-default history card: `"Draft lokal terbaru"`.
- Visible only if guest recovery snapshots exist in storage.
- Actions:
  - **Pulihkan** (Restore): Restores text, warning first if active text exists in input.
  - **Ganti nama** (Rename): Sanitizes and prompts for new title (max 80 chars).
  - **Hapus** (Delete): Removes single entry by ID.
  - **Hapus semua** (Clear all): Removes all NaLI recovery snapshots without touching other localStorage items.
