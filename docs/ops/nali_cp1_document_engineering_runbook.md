# Operations Runbook: Document Engineering QA

This procedure is for NaLI CP1 founder/admin local QA artifacts only. It must not be connected to public downloads, paid export, upload, or source-verification behavior.

## Generate V5 Artifacts

From the repository root:

```bash
npm install
node scratch/generate_reference_journal_v5.cjs
ls -lah ~/Downloads/NaLI-QA
```

The script generates `peregrine`, `obsidian`, and `zephyr` outputs in `.html`, `.md`, `.txt`, `.pdf`, and `.docx` formats. Output is written to `~/Downloads/NaLI-QA/`, with `/tmp/nali-qa/` as a fallback.

If the Playwright Chromium executable is missing on a new local environment, install that development browser runtime before regenerating:

```bash
npx playwright install chromium
```

## Rendering Boundary

- PDF v5 uses `src/lib/reports/journalHtmlTemplate.ts` plus local Playwright rendering in `src/lib/reports/journalHtmlPdfRenderer.ts`.
- Playwright is a development dependency and must remain out of `src/app` public routes and `src/components` client components.
- DOCX uses the structured Word renderer in `src/lib/reports/journalDocxRenderer.ts`; it must receive structured journal content, not raw markdown.
- `pdf-lib` is no longer the primary journal-quality PDF renderer for these local QA artifacts.

## Inspect Quality

For each v5 PDF, confirm:

- Page 1 is a NaLI-branded cover with no benchmark publisher branding.
- Page 2 contains article metadata, abstract, and keywords.
- Body pages include structured prose, a clean results table, an intentional unfilled figure slot, annexure, and references statement.
- There are no invented DOI, ISSN, references, species identifications, photographs, or verification claims.

For DOCX, open or render the files in a Word-compatible page renderer and confirm the cover, metadata table, headings, results table, evidence slot, annexure, and references statement remain clean and editable.

## Safety Gates

- Human Testing remains `PAUSED`.
- Paid launch remains `NO-GO`; do not activate Midtrans here.
- Public/user PDF and DOCX export remains locked or inactive.
- Upload and source verification remain inactive.
- Never stage artifacts in `~/Downloads/NaLI-QA/` or `/tmp/nali-qa/`.
- Never stage `.env.local`, service keys, payment secrets, report access values, hashes, or guest session values.

## Verification

Before committing renderer work, run:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
node --test tests/reports/*.test.cjs
```

Record failures honestly. A local artifact is not a published article and is not eligible for public release solely because generation succeeds.
