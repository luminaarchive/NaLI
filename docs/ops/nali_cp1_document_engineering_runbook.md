# Operations Runbook: Document Engineering QA

This procedure is for NaLI CP1 founder/admin local QA artifacts only. It must not be connected to public downloads, paid export, upload, or source verification.

## Generate V7 Artifacts

From the repository root:

```bash
npm install
node scratch/generate_reference_journal_v7.cjs
ls -lah ~/Downloads/NaLI-QA
```

The script generates `peregrine`, `obsidian`, and `zephyr` outputs in `.html`, `.md`, `.txt`, `.pdf`, and `.docx` formats. It writes to `~/Downloads/NaLI-QA/`, with `/tmp/nali-qa/` as fallback.

If Chromium is missing on a new QA machine, install only Playwright's required local browser runtime:

```bash
npx playwright install chromium
```

## Rendering Boundary

- V7 PDF uses `src/lib/reports/journalHtmlTemplate.ts` and local Playwright rendering in `src/lib/reports/journalHtmlPdfRenderer.ts`.
- Playwright is a development dependency and must not be imported by `src/app` public routes or `src/components` client components.
- DOCX uses `src/lib/reports/journalDocxRenderer.ts` and structured article data, not a markdown dump.
- Generation paths are restricted to `~/Downloads/NaLI-QA/` and `/tmp/nali-qa/`; generated documents must never be staged.

## Inspect Quality (V7 Quality Gate)

For each V7 PDF, verify the following:

- **Cover page**: Premium nature-themed dark green design with NaLI logo, custom issue/edition block, and appropriate local QA fixture disclaimer.
- **Article opener**: Desired metadata info box on the left, abstract on the right, and introduction in standard two-column academic grid.
- **Measurements & replicates**: Actual replicates table (A1-A3, B1-B3) and summary stats (mean length, mean width, mean petiole length) are rendered.
- **Figure plates**: Figure 1 (Leaf shapes) and Figure 2 (Measurement workflow) appear as clean inline SVG vector art.
- **Citations**: References parsed from the rich evidence fixture; in-text citation keys mapped to standard numbered brackets `[1]` and `[2]`.
- **Labeling**: Figures, text, and tables are labeled with approved terms (`synthetic QA placeholder`, `local QA fixture`, `not externally verified`) to prevent false validation assertions.

For DOCX, open each file in Microsoft Word or LibreOffice and confirm that headings, cover block, replicates, stats, and references tables remain clean, structured, and editable.

## Safety Gates

- Human Testing remains `PAUSED`.
- Midtrans remains `DEFERRED`; do not activate payment here.
- Paid launch remains `NO-GO`.
- Public/user PDF and DOCX export remains `LOCKED` or inactive.
- Upload and source verification remain inactive.
- Never stage QA artifacts, temporary rendered previews, `.env.local`, service keys, payment secrets, access values, hashes, or guest session values.

## Verification

Before committing renderer work, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
node --test tests/reports/*.test.cjs
```
