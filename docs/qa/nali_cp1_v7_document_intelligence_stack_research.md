# NaLI CP1 V7 Document Intelligence Stack Research

This document outlines the evaluation and selection of academic document rendering, citation styling, and QA tooling for the NaLI V7 International Journal Document Intelligence Engine.

---

## 1. Academic Manuscript Engines

| Tool | Installation | License | Expected Quality | Performance / Portability | Recommendation & Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Quarto** | CLI (system) | GPL-2.0 | Elite (academic drafts) | Heavy, requires CLI installation; high cold start. | **REJECTED** for server bundle. Highly valuable for offline local compiler pipelines. |
| **Pandoc** | CLI (system) | GPL-2.0 | High (universal) | Requires Haskell-based binary. Non-portable. | **REJECTED** for core runtime, but supported as optional CLI pipeline. |
| **Typst** | CLI / WASM | Apache-2.0 | Elite (modern LaTeX substitute) | Instant rendering times. Heavy CLI binary (~20MB). | **REJECTED** for standard production; considered as future high-fidelity offline option. |
| **CSL Workflows** | CSL Repository | CC-BY-SA | High (APA, Vancouver, etc.) | High complexity to manage XML sheets in Node. | **REJECTED** for Sprint 0.7; we will implement a custom, lightweight citation engine instead. |

---

## 2. PDF Generation Engines

| Tool | Installation | License | Expected Quality | Performance / Portability | Recommendation & Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Playwright PDF** | `playwright` (npm) | Apache-2.0 | Excellent (CSS Paged Media) | Heavy Chromium download, but already in devDependencies. Portability limited in standard Vercel serverless functions, but perfect for local/admin QA. | **SELECTED** for local founder/admin QA PDF generation. Allows precise CSS styling, two-column layouts, SVGs, and header/footer templates. |
| **pdf-lib** | `pdf-lib` (npm) | MIT | Medium-High (manual drawing) | Super lightweight, highly portable. Runs on edge. Excellent for base public reports, but styling complex layouts takes massive programmatic effort. | **REJECTED** for V7 journal-grade QA PDF generation due to visual complexity; Playwright HTML/CSS print is preferred. |
| **WeasyPrint** | Python CLI | BSD-3-Clause | High (CSS Paged Media) | Requires Python, Pango, and Gtk+. Poor portability. | **REJECTED**. |

---

## 3. DOCX Generation Engines

| Tool | Installation | License | Expected Quality | Performance / Portability | Recommendation & Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **docx (docx.js)** | `docx` (npm) | MIT | High (programmatic OOXML) | Lightweight, native JavaScript/TypeScript. Run on node and browser. Already in dependencies. | **SELECTED**. We will upgrade `journalDocxRenderer.ts` using this package to support complex covers, headers, footers, lists, and reference tables. |
| **docx-templates** | `docx-templates` | MIT | Medium (template filling) | Requires prepopulated .docx file, making dynamic programmatic structures like nested tables hard. | **REJECTED**. |
| **docxtemplater** | `docxtemplater` | Commercial/Free | Medium (template filling) | Free version has limitations; paid plugins needed for advanced features. | **REJECTED**. |

---

## 4. Citation and Reference Engines

| Tool | Installation | License | Expected Quality | Performance / Portability | Recommendation & Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Citation.js** | `citation-js` | MIT | High | Moderately heavy, handles BibTeX/CSL conversions. | **REJECTED** for V7 to minimize bloat; we will write a streamlined parsing engine in `journalCitationEngine.ts`. |
| **citeproc-js** | `citeproc-js` | CPAL-1.0 | Standard CSL formatting | Large, complex API built on Rhino/Browser. | **REJECTED**. |
| **Custom Engine** | In-house | MIT | Accurate to input data | Zero dependencies, highly performant, guarantees no fake references or citations are generated. | **SELECTED**. A dedicated module `journalCitationEngine.ts` will render user-supplied references and process text citations. |

---

## 5. QA Verification and Inspection Tools

*   **Playwright Screenshots / Visual QA**: Used locally to capture renders of the journal HTML outputs for visual consistency checks.
*   **pdfjs-dist**: Used in tests to parse compiled PDFs and verify text structure, page count, and presence of mandatory disclaimers.
*   **Text Extraction**: A simple CLI string scan to check for keywords, layout blocks, and disclaimers.

---

## 6. Recommended V7 Architecture

1.  **Rich Evidence Fixture**: Create `src/lib/reports/journalRichEvidenceFixture.ts` to construct a detailed botanical observation package with measurements and references.
2.  **Citation Engine**: Build `src/lib/reports/journalCitationEngine.ts` to parse references and format citations without fabricating metadata.
3.  **PDF/HTML Renderer**: Leverage Playwright Chromium print in `src/lib/reports/journalHtmlPdfRenderer.ts` using `src/lib/reports/journalHtmlTemplate.ts` with enhanced CSS layout (covers, article opener metadata box, two-column text flow, SVG graphics, and nested tables).
4.  **DOCX Renderer**: Upgrade `src/lib/reports/journalDocxRenderer.ts` using programmatically assembled Open XML structures.
5.  **QA Runner**: Use `scratch/generate_reference_journal_v7.cjs` to output V7 reports for Peregrine, Obsidian, and Zephyr into `~/Downloads/NaLI-QA/`.
