# Audit: Local Image Metadata Helper & Offline Copy Export UX

This document audits the current report field structure, copy/download mechanics, and privacy/performance boundaries for NaLI CP1 Sprint 0.8.

## Existing Copy/Export Behavior

1. **Workspace / Composer (`AgentWorkspace.tsx`)**:
   - Supports "Salin Markdown" via `navigator.clipboard.writeText`.
   - "Download PDF" and "Download Markdown" are triggered via `window.open` targeting `/api/reports/[id]/export?token=...`.
   - If payment is not ready, it prompts with a紫 purple button: "Unlock PDF (15 Kredit / Bayar)" which triggers payment gateway placeholders.
2. **Result Page (`ReportResultClient.tsx`)**:
   - "Salin Preview" copies markdown content.
   - "Download Markdown" and "Download PDF" links open the server-side export route.
   - "Export versi rapi" button triggers the payment gateway flow.

## Form Fields & Prefill Scope

In `CreateReportForm.tsx`, the fields available for prefilling are:
- `location` (Lokasi opsional): Suitable for GPS coordinates/approximate description.
- `fileDescription` (Keterangan bahan/lampiran): Suitable for appending localized photo capture timestamps (since there is no dedicated date input).

## Upload & Evidence Verification Boundaries

- **Upload is INACTIVE**: Users cannot upload files to the server.
- **Local-Only Processing**: The photo file chosen by the user must never leave the browser. We must parse it using local JavaScript and immediately release references.
- **Copy Standards**: The UI must clearly convey that metadata is local and unverified. No claims of "verified location", "official GPS evidence", or "authentic photo proof" are allowed.

## Privacy & Security Risks

- **Privacy Leak**: Storing file paths, absolute paths, raw metadata structures, or base64 binary chunks in browser history or recovery records violates NaLI safety rules.
- **Redaction**: Staged files must NOT be stored in `localStorage` client recovery. Only clean coordinates or timestamp text can be written to form fields.

## Performance & Bundle Impact

- **Static Import Risk**: Static importing `exifr` increases the chunk size of the initial page load `/create-report` by about 30kB.
- **Dynamic Chunking**: We resolve this by using a dynamic import `const exifr = await import("exifr")` triggered only after the user chooses a file. This ensures the bundle footprint of `/create-report` on initial load is completely unaffected.
- **Memory Safety**: Clean up image object URLs and release file references immediately after parsing.

## Recommended Minimal Implementation

1. **Helper**: `readLocalImageMetadata` dynamically imports `exifr` and returns coordinates/dates.
2. **Form integration**: Inline file input in `CreateReportForm` details panel, with preview of metadata and an explicit button to confirm applying the data to fields.
3. **Copy/Export UX**: Implement free local copy plain text, download `.md` file, and download `.txt` file entirely client-side using `Blob` URLs and anchor downloads. Preserve existing locked PDF styling.
