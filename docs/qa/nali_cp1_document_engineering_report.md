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
| V4 reference-journal quality | FAIL |
| V5 reference-journal template quality | CONDITIONAL GO |

`CONDITIONAL GO` means the new local renderer is suitable for continued founder/admin artifact QA. It does not mean the evidence-limited sample is publishable, source-verified, or available through public export.

## Renderer Replacement

V4 used `pdf-lib` coordinate drawing as its primary PDF article layout engine. Inspection found three sparse pages, weak article identity, shallow content, and a broken-looking DOCX preview. V5 replaces that local QA path with an HTML/CSS print template rendered by Playwright Chromium:

- `playwright@^1.60.0` is installed as a `devDependency` only.
- `src/lib/reports/journalHtmlTemplate.ts` supplies A4 print CSS, a NaLI-branded cover, article front matter, two-column main body, figure slot, and styled tables.
- `src/lib/reports/journalHtmlPdfRenderer.ts` renders only to external QA folders and blocks external page requests.
- `src/lib/reports/journalDocxRenderer.ts` now creates editable Word sections with a cover, metadata table, full article content, evidence figure slot, annexure, and references statement.
- No Playwright import or renderer activation was added to public client components or public endpoints.

## External QA Artifacts

Artifacts are generated into `~/Downloads/NaLI-QA/` and are not repository files.

| Model | V4 PDF baseline | V5 PDF inspected | V5 DOCX inspected |
| --- | --- | --- | --- |
| Peregrine | 3 pages / 603 words | 5 pages / 1,732 words | Word-rendered, 6 pages |
| Obsidian | 3 pages / 738 words | 5 pages / 1,907 words | Word-rendered, 7 pages |
| Zephyr | 3 pages / 697 words | 5 pages / 1,877 words | Word-rendered, 7 pages |

Each v5 model generated `.html`, `.md`, `.txt`, `.pdf`, and `.docx` files. PDF visual inspection found the intended cover, article first page, readable two-column body, clean result table, deliberate no-photo figure slot, annexure, and references statement. DOCX files were exported to temporary PDFs through installed Microsoft Word for page-level inspection because LibreOffice is unavailable.

## Integrity And Boundary Checks

- DOI is expressly shown as not assigned in CP1; ISSN is shown as not applicable.
- No supplied references means the document states that no references were supplied and NaLI did not generate artificial references.
- Figure areas state that a photo was not provided; no evidence image is synthesized.
- The article does not assert species identification, field verification, functional plant conclusions, payment activation, upload activation, or source-verification activation.
- Public PDF/DOCX export remains locked; generated artifacts are local QA output only.

## Verification Performed

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run test:demo` | PASS (5 tests) |
| `node --test tests/reports/*.test.cjs` | PASS (252 tests) |
| Direct PDF visual inspection | PASS for v5 cover/front matter/body/table/figure/annexure checks |
| Word-rendered DOCX inspection | PASS for all three v5 profiles |

## Remaining Limitations

- The sample input provides two brief morphology notes, no photo, no measurements, no replicated observations, and no references; the article must therefore remain a draft with explicit limits.
- V5 is intentionally NaLI-branded rather than an imitation of the supplied publisher benchmark.
- DOCX provides a professional editable structure, but PDF remains the stronger controlled visual output for founder/admin layout QA.
