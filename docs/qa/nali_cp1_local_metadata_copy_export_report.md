# QA Report: Local Image Metadata Helper & Offline Copy Export UX

- Human Testing: PAUSED
- Midtrans: DEFERRED
- Paid Launch: NO-GO
- Local Image Metadata Helper: GO
- Local Copy & Offline Export UX: GO

## What Was Built

1. **Local Image Metadata Parser (`localImageMetadata.ts`)**:
   - Client-side EXIF/GPS parser that dynamically loads `exifr` module only upon user action (file selection) to preserve the initial page load bundle.
   - Extracts metadata safely inside the browser, sanitizes filenames (up to 80 chars, removes double dots and traversal characters), returns a fallback file modified time when EXIF date/GPS tags are absent, and ensures no binary/base64 data remains in memory.
2. **Form prefill card in `/create-report` (`CreateReportForm.tsx`)**:
   - Integrates the metadata parser inside the details dropdown under the label "Bantu isi dari metadata foto lokal".
   - Warns users clearly: "Pilih foto dari perangkatmu untuk membaca metadata lokal seperti waktu atau koordinat jika tersedia. File tidak diupload."
   - Requires user confirmation via "Gunakan sebagai isian awal" before writing coordinates to "Lokasi" and dates to "Keterangan bahan/lampiran".
   - Confirms overwrite if target fields already contain text.
3. **Local Copy / Offline Export UX (`ReportResultClient.tsx` & `AgentWorkspace.tsx`)**:
   - Exposes free local copy/download features directly in browser without server network calls or payment restrictions.
   - Adds "Salin teks biasa" (markdown stripped), "Unduh Markdown lokal", and "Unduh teks lokal" (custom Blob anchors).
   - Preserves visually locked styling for Premium PDF exports, showing the warning: "PDF berbayar belum aktif di fase testing ini. Export berbayar masih terkunci."

## What Was NOT Built

- **File Upload/Server storage**: The photo selected is purely loaded into memory, scanned, and immediately dereferenced. No API endpoint exists on the server to upload pictures.
- **Evidence verification registry**: There is no official verification or validation hash checking for photos. Prefills are strictly for user convenience during early drafting.

## Storage/Privacy & Security Model

- Selected files are handled via standard browser File Web APIs.
- No binary file buffer, raw binary strings, or base64 blobs are written to `localStorage` client recovery or passed to the network.
- Filenames are sanitized, and the coordinate/date outputs are stored as plain text inside the `form` states.

## AI-Run Test Method

- Verified all module unit logic, sanitization behaviors, fallback mechanisms, file size limits, and source file assertions using Node's test runner:
  `node --test tests/reports/local-image-metadata-copy-export.test.cjs`
- Confirmed that "File tidak diupload" copy is visible in the UI and no payment or upload endpoints are exposed.

## Blockers

- **P0/P1/P2/P3 Blockers**: None. All 11 tests pass successfully.
