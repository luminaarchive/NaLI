# Operations Runbook: Document Engineering QA

This procedure is for NaLI CP1 founder/admin local QA artifacts only. It must not be connected to public downloads, paid export, upload, or source verification.

## Generate V6 Artifacts

From the repository root:

```bash
npm install
node scratch/generate_reference_journal_v6.cjs
ls -lah ~/Downloads/NaLI-QA
```

The script generates `peregrine`, `obsidian`, and `zephyr` outputs in `.html`, `.md`, `.txt`, `.pdf`, and `.docx` formats. It writes to `~/Downloads/NaLI-QA/`, with `/tmp/nali-qa/` as fallback.

If Chromium is missing on a new QA machine, install only Playwright's required local browser runtime:

```bash
npx playwright install chromium
```

## Rendering Boundary

- V6 PDF uses `src/lib/reports/journalHtmlTemplate.ts` and local Playwright rendering in `src/lib/reports/journalHtmlPdfRenderer.ts`.
- Playwright is a development dependency and must not be imported by `src/app` public routes or `src/components` client components.
- DOCX uses `src/lib/reports/journalDocxRenderer.ts` and structured article data, not a markdown dump.
- `pdf-lib` is not the primary journal-quality renderer for founder/admin QA output.
- Generation paths are restricted to `~/Downloads/NaLI-QA/` and `/tmp/nali-qa/`; generated documents must never be staged.

## Inspect Quality

For each V6 PDF, inspect rendered pages and record PASS, PARTIAL, or FAIL:

- Page 1 has the original NaLI full green cover composition, volume/issue block, article category, and clean publisher band.
- Page 2 has a journal opener with title/byline, restrained information panel, abstract, keywords, and introduction.
- Body pages have readable two-column flow, a styled result table, a deliberate no-photo figure plate, conclusions, annexure, and references statement.
- Running furniture identifies the journal and article category without dominant operational QA language.
- The artifact does not show fake DOI/ISSN/citations, supplied-photo claims, species identification, source verification, or copied benchmark branding.

For DOCX, open or render each file in Microsoft Word or another page-compatible renderer and confirm that cover, metadata, headings, tables, reserved figure plate, annexure, references, and editing behavior remain clean. PDF may be visually richer; DOCX must remain structurally professional and editable.

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

Treat V5 as a visual/professional `FAIL`. V6 may be called `CONDITIONAL GO` only after page-level visual inspection and integrity checks pass; neither result unlocks public export or makes the evidence-limited draft a published article.
