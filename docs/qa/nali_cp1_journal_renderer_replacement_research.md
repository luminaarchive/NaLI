# CP1 Journal Renderer Replacement Research

Date: 2026-05-25
Decision: use HTML/CSS print layout rendered locally through Playwright for founder/admin QA PDF artifacts.

## Why V4 Failed

V4 treated a journal article as a sequence of text drawing operations in `pdf-lib`. That is sufficient for a controlled receipt or simple report export, but it requires hand-building typography, columns, page breaking, figure composition, metadata panels, table flow, and page furniture. The audited v4 result is three sparse pages with a blank-looking cover, report-style body, and no credible publication design; its DOCX preview also collapses visibly. Continuing to patch coordinate drawing would deepen the wrong abstraction.

## Options Considered

| Option | Fit | Decision |
| --- | --- | --- |
| `pdf-lib` drawing expansion | Already present, but requires manual typesetting and caused v4 failure | Rejected as primary journal renderer |
| Typst CLI | Strong page-layout engine, but introduces an additional system/runtime dependency not present in this repository | Not selected |
| HTML/CSS print layout plus Playwright | Native typography/layout primitives, CSS columns/tables/page rules, testable HTML artifact, direct local PDF generation | Selected |

## Selected Renderer

- Dependency: `playwright@^1.60.0`, declared in `devDependencies` only.
- HTML template: `src/lib/reports/journalHtmlTemplate.ts`.
- PDF helper: `src/lib/reports/journalHtmlPdfRenderer.ts`.
- Local generation command: `node scratch/generate_reference_journal_v5.cjs`.
- Allowed output directories: `~/Downloads/NaLI-QA/` and `/tmp/nali-qa/`.

The PDF helper uses A4 CSS page sizing, print backgrounds, and Chromium PDF pagination. It loads an internally generated HTML document only and aborts outbound page requests. It does not accept a public route request and rejects output paths inside the repository.

## Development And Production Boundary

This pipeline is **founder/admin local QA only**. It is not wired into `/create-report`, no public component imports Playwright, and the public PDF/DOCX export gate remains locked. Existing `pdf-lib` behavior used by protected/export-gated product code is not activated or replaced for public users in this task.

Playwright is deliberately a development dependency because local print rendering requires a browser engine and must not enter the browser client bundle or become a CP1 production-service requirement.

## Bundle Impact

- Client bundle impact: none intended; tests scan `src/components/report` for Playwright imports.
- Server/public route impact: none; no endpoint is introduced and no export gate is changed.
- Local tooling impact: one explicit devDependency plus its existing browser-engine requirement for artifact generation.

## Security And Integrity Impact

- Rendering is local and output-path restricted; generated artifacts stay outside git.
- The template does not fetch external assets or copy benchmark logos/branding.
- DOI is rendered as `not assigned in CP1`; ISSN is rendered as `not applicable`.
- No citations, photographs, species identifications, or source-verification claims are synthesized.
- Payment, upload, public export, and source-verification activation remain outside scope and unchanged.

## Known Operational Limitation

The bundled DOCX review script requires LibreOffice (`soffice`), which is not installed in this environment. For v5 verification, each generated DOCX was instead exported to a temporary PDF through the locally installed Microsoft Word application and visually inspected from that rendered output. This is adequate for local QA evidence, but it does not convert the DOCX pipeline into a publication or public export service.
