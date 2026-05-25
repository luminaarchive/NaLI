# QA Report: Local Image Metadata Helper & Offline Copy Export UX

## Operational Status & Gates
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Upload API / persistent file upload**: INACTIVE / BLOCKED
- **Local Image Metadata Helper**: GO
- **Local Copy & Offline Export UX**: GO

## File Handling Model
- The selected image file is handled entirely in memory in the browser client side.
- It is never uploaded to any server.
- No upload API route or controller is introduced.
- Selecting and parsing the image triggers no network requests.
- No image binary, base64, or ArrayBuffer is stored in `localStorage` or `clientRecovery`.
- The raw EXIF payload is never stored; only parsed coordinates/timestamps are used to pre-fill standard form fields.
- Metadata is previewed in the UI first.
- Values are applied to form fields only after explicit user confirmation.
- Metadata is never claimed as verified evidence; GPS and timestamps are clearly labeled as unverified/local.

## Dependency & Bundle Safety Result
- The `exifr` library is dynamically imported using `await import("exifr")` only when a user selects a file.
- No static, top-level `import exifr` exists in `CreateReportForm`, `AgentWorkspace`, or the entry route components.
- The initial bundle size of the `/create-report` route remains completely unaffected.
- Dynamic chunks for `exifr` are lazy-loaded after the user triggers a file input selection.

## Metadata Limitations
- Metadata extraction depends entirely on the file selected containing valid EXIF records (`DateTimeOriginal`, GPS latitude/longitude).
- Files saved from messaging clients (WhatsApp, Telegram, etc.) or screenshot images typically have EXIF data stripped, yielding no coordinates/date tags.
- Fallback mechanisms handle cases where metadata is missing by extracting only the local file modified time, explicitly marked as fallback modified time.

## Privacy & Security Model
- Strictly local browser-based execution.
- File names are sanitized to prevent directory traversal (`..`), HTML script injection, or malicious characters, clamped to 80 characters.
- No persistence of raw images or sensitive metadata records.

## Copy & Export Boundaries
- **Copy Markdown**: Works entirely locally using the client-side clipboard API with a fallback textarea copy.
- **Copy Plain Text**: Works entirely locally by stripping markdown syntax and copying to the clipboard.
- **Download .md / .txt**: Generated on the client side using browser memory `Blob` and dynamically created anchor elements.
- **PDF Export**: Remains strictly locked; paid exports are inactive and Midtrans is deferred. No claims of "official export", "verified report", or "paid export active" are shown to the user.

## AI-Run Test Method
- Verified the local parsing helper, sanitization, fallbacks, and bundle constraints using the Node.js test runner:
  `node --test tests/reports/local-image-metadata-copy-export.test.cjs`
- Full regression tests executed (all 202 tests passed).

## Browser & Static Limitations
- Browser must support the File API, Blobs, dynamic imports, and `navigator.clipboard`.
- In headless/CI environments where browser APIs or certain window parameters might be absent, fallbacks degrade gracefully.

## P0/P1/P2/P3 Blockers
- **Blockers**: None. All 202 checks passed, and the production build succeeded without bundles getting bloated.
