# Operations Runbook: Document Engineering QA

This runbook guides NaLI administrators and founders through compiling, inspecting, and troubleshooting the local journal-style PDF and DOCX QA artifacts.

---

## 1. Compiling Local QA Artifacts

Run the compiler script from the project root:
```bash
node scratch/generate_qa_artifacts.cjs
```

This script will compile draft reports for `peregrine`, `obsidian`, and `zephyr` using the leaf morphology prompt, and save them in the following formats:
- Markdown (`.md`)
- Plain text (`.txt`)
- PDF (`.pdf`)
- DOCX (`.docx`)

### Output Folder
`~/Downloads/NaLI-QA/` (with fallback to `/tmp/nali-qa/`)

---

## 2. Dependencies & Bundle Isolation
- Generation utilizes `pdf-lib` and `docx` JS dependencies.
- Ensure these libraries are **never** imported inside client-side React files (`src/components/...` or `src/app/...` without a dynamic import/API handler wrap) to prevent bloating the `/create-report` client-side bundle size.

---

## 3. Public Export Locking Gates
- In CP1, public user-facing downloads for PDF and DOCX remain locked under `paidExportActive = false` (returned by `/api/system/readiness`).
- Do not expose any public UI buttons for DOCX or PDF downloads.
- Do not bypass verification status checks or configure active Midtrans checkout URLs.

---

## 4. Git Stage Rules (What NOT to commit)
- Never stage or commit the files inside `~/Downloads/NaLI-QA/` or `/tmp/nali-qa/`.
- Do not commit local environment secrets (`.env.local`).

---

## 5. Troubleshooting
*   **Fonts Not Rendering Correctly in PDF**: The PDF renderer uses Standard Fonts (Helvetica and Helvetica-Bold). If special botanical/unicode glyphs are used, they will fallback to `?` to avoid crashing. Keep inputs within standard ASCII/Latin ranges.
*   **DOCX Doesn't Open**: Ensure the generated binary is intact by checking that the file size is greater than 1KB. Ensure no raw markdown strings are fed into heading/paragraph constructors.
