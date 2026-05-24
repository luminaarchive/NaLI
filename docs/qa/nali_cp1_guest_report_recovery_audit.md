# NaLI CP1 — Guest Report Persistence & Recovery Audit

This audit evaluates the current browser storage mechanisms used in NaLI CP1 and designs a safe client-side recovery layout for guest report sessions.

## 1. Current Local Persistence Behavior

Currently, NaLI uses standard browser `localStorage` for several tasks:
- `nali-guest-session-id`: Stores a guest UUID.
- `nali-threads`: Stores a history list of recent thread metadata (`id`, `title`, `mode`, `created_at`, `token`).
- `nali-report:${reportId}`: Caches the full generated report JSON payload.
- `nali-messages:${reportId}`: Caches the thread's messages array.
- `nali-report-access:${reportId}` and its aliases: Stores the raw `report_access_key` (token) required to view or follow up on the persisted report.
- `nali-report-notice:${reportId}`: Stores any pending warning or system notices.

## 2. Recovery Vulnerability (What gets lost)
- **Generation Phase**: If the client sends a `/api/reports/generate` request but the browser crashes, refreshes, or loses internet connection before receiving the response, the raw user text input and settings are completely lost.
- **Editing Phase**: Active composer draft adjustments are held in component state and get lost on a hard refresh or navigation.

## 3. Storage Privacy & Constraints
To ensure privacy and maintain the CP1 integrity boundaries:
- **No Cloud Claims**: The recovery feature will be marketed exclusively as **"local browser recovery"** or **"recent draft recovery"**. No claims of cloud backups, account sync, or permanent recovery will be made.
- **Sensitive Fields Avoided**: Do **not** store API keys, provider internals, secret environment details, report access token hashes, or Midtrans transaction details.
- **Sanitized Prompts**: Raw user prompts will be trimmed (limit length), sanitized to prevent code injection, and auto-pruned after 24 hours (TTL).
- **Abuse Filtering**: Prompts blocked due to server-side integrity check (abusive requests) will NOT be stored as recovery entries.
- **Storage Limits**: A maximum of 3 recovery entries will be kept, sorted newest first. Quota or browser-disabled storage states will degrade gracefully without throwing UI crashes.
