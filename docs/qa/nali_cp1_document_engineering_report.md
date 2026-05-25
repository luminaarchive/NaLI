# Document Engineering Verification Report

Date: 2026-05-25
Scope: NaLI CP1 founder/admin local document QA only.

## Operational Status And Gates

| Gate | Status |
| --- | --- |
| Human Testing | PAUSED |
| Midtrans | DEFERRED |
| Paid Launch | NO-GO |
| Public/user PDF export | LOCKED |
| Public/user DOCX export | LOCKED / INACTIVE |
| Founder/admin local PDF/DOCX QA | CONDITIONAL GO |
| V4 journal quality | FAIL |
| V5 visual/professional similarity | FAIL |
| V6 local publication-template quality | CONDITIONAL GO |

`CONDITIONAL GO` permits continued founder/admin local artifact QA. It is not publishability, evidence verification, or a public-export release decision.

## Renderer And Template State

V4's coordinate-drawn `pdf-lib` journal approach failed. V5 introduced the correct local renderer class, HTML/CSS print layout through Playwright, but founder review and subsequent visual audit found its presentation unacceptable. V6 retains the proper renderer while replacing the publication design and depth contract:

- `playwright@^1.60.0` remains a `devDependency` used only by local QA rendering.
- `src/lib/reports/journalHtmlTemplate.ts` now produces an original full cover composition, publication opener, two-column body, reserved figure plate, and styled tables.
- `src/lib/reports/journalHtmlPdfRenderer.ts` renders A4 PDF only to allowed external QA paths and uses category-based page furniture.
- `src/lib/reports/journalArticleTemplate.ts` provides long-form content and visible editorial distinctions for Peregrine, Obsidian, and Zephyr.
- `src/lib/reports/journalDocxRenderer.ts` creates structured editable Word documents without raw markdown or visible absent-identifier furniture.
- No client component or public endpoint imports or activates Playwright/DOCX generation.

## External Artifacts And Inspection

The V6 generator wrote `.html`, `.md`, `.txt`, `.pdf`, and `.docx` artifacts for each model to `~/Downloads/NaLI-QA/`. Generated QA files remain outside the repository.

| Model | V6 PDF | V6 Word-rendered DOCX | Article identity |
| --- | --- | --- | --- |
| Peregrine | 5 pages / 1,982 words | 7 pages / 2,027 words | Short Communication / Practicum Note |
| Obsidian | 5 pages / 1,963 words | 7 pages / 2,011 words | Evidence Audit Article |
| Zephyr | 5 pages / 1,938 words | 7 pages / 1,984 words | Polished Academic Article Draft |

PDF pages were rasterized with macOS PDFKit and examined page-by-page. DOCX files were opened and exported through installed Microsoft Word to temporary PDFs, then inspected visually. V6 repairs the V5 visual failures: cover composition is strong, opener is journal-like, body is dense/readable, the figure plate is deliberate, and annexure pagination is coherent. DOCX remains cleaner and editable but intentionally simpler than the PDF cover.

## Integrity And Boundary Checks

- Visible V6 article design omits missing DOI/ISSN furniture and does not invent identifiers.
- No references were supplied; the document states that NaLI did not generate artificial references.
- No photo was supplied; figure areas state that clearly and synthesize no evidence image.
- No species identification, field verification, payment activation, upload activation, or source-verification activation is asserted.
- Public PDF/DOCX export remains locked; V6 output is founder/admin local QA only.

## Verification Required For Commit

Final verification commands are:

```bash
npm run lint
npm run typecheck
npm run build
npm run test:demo
node --test tests/reports/*.test.cjs
```

The final commit record must state their results after execution.
