# QA Report: NaLI CP1 Debounced Form Input Validation

- Human Testing: PAUSED
- Midtrans: DEFERRED
- Paid Launch: NO-GO
- Debounced Input Validation: GO

## Validation Scope

The validation layer is implemented purely on the client-side to prevent unnecessary API network calls, improve mobile usability, and ensure compliance with academic integrity guidelines. It includes:
1. **Persetujuan Integritas (Consent)**: Checks that the academic integrity tickbox is checked before generating reports.
2. **Kekosongan Input (Empty)**: Prevents form/composer submissions of empty or whitespace-only messages.
3. **Kekecilan Input (Too Short)**: Minimum length requirements (>= 15 characters for initial form, >= 4 characters for follow-up chat queries).
4. **Karakter Berulang (Spam)**: Detects repeated characters (e.g. `aaaa...`) or short patterns (e.g. `abcabc...`) to prevent spam submissions.
5. **Integritas Akademik (Evasion Keywords)**: Blocks requests containing cheating/bypass keywords (e.g. "bypass turnitin", "buat data palsu", "humanizer", "jasa skripsi").
6. **URL Rujukan (Malformed URL)**: Validates that URLs are prefixed with `http://` or `https://` if URLs are entered.
7. **Fitur Tertunda (Unsupported Features)**: Warns users requesting file uploads, NCBI/Crossref live verification, or Midtrans checkout that these features are inactive in the MVP.
8. **Materi Minim (Weak Input)**: Displays warning alerts for short inputs (15-40 characters) without blocking submission.
9. **Kelebihan Karakter (Overlong Input)**: Warns users about clipping/performance issues if the input exceeds 6,000 characters without blocking submission.

## Debounce Model

- Implemented via a lightweight React hook: `useDebouncedReportValidation` and `useDebouncedComposerValidation`.
- Validation state runs with a **500ms delay** after the user stops typing to avoid rendering lag or performance overhead.
- React `useEffect` ensures that previous timeouts are cleared (`clearTimeout`) on subsequent keypresses or component unmounts.

## Hard-Block vs Warning Rules

| Trigger Code | Severity | Blocks Submission? | User Action |
|---|---|---|---|
| `INTEGRITY_CONSENT_REQUIRED` | error | Yes | Centang Persetujuan |
| `EMPTY_INPUT` / `EMPTY_QUERY` | error | Yes | Tulis Materi / Pesan |
| `TOO_SHORT` / `QUERY_TOO_SHORT` | error | Yes | Tambah Detail |
| `SPAM_DETECTED` | error | Yes | Bersihkan Teks |
| `INTEGRITY_VIOLATION` | error | Yes | Revisi Teks Rujukan |
| `MALFORMED_URL` | error | Yes | Perbaiki Tautan |
| `WEAK_INPUT` | warning | No | Tampilkan Warning / Klik Kirim |
| `INPUT_TOO_LONG` | warning | No | Tampilkan Warning / Klik Kirim |
| `UNSUPPORTED_UPLOAD` | warning | No | Tampilkan Petunjuk Copy-Paste |
| `UNSUPPORTED_VERIFICATION` | info | No | Tampilkan Info Rujukan Manual |
| `UNSUPPORTED_PAYMENTS` | warning | No | Tampilkan Info Fitur Salin Gratis |

## Files Changed

- **Helper & Validation logic**:
  - `src/lib/reports/inputValidation.ts`
  - `src/lib/reports/useDebouncedValidation.ts`
- **Components UI**:
  - `src/components/report/CreateReportForm.tsx` (validated state, checked prior to submit, `NaliAlert` for issues)
  - `src/components/report/AgentWorkspace.tsx` (validated query in follow-up chat, `NaliAlert` layout)
- **Tests**:
  - `tests/reports/debounced-input-validation.test.cjs`

## AI-Run Test Method

- Direct unit and static assertion suite run via `node --test tests/reports/debounced-input-validation.test.cjs`.
- Validation checks for cleanups, correct Indonesian copy, absence of provider secrets, non-leakage of backend keys, and preservation of recovery features are fully covered.
- Visual verification was performed via static file pattern matching. Visual interface testing is deferred while human testing remains paused.

## Blockers

- **P0/P1/P2/P3 Blockers**: None. All tests pass successfully.
