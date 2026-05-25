# Journal Document Engineering Stack Research

This document outlines the research, feasibility, and security audit of the various technical stacks considered for producing professional, international-grade journal article PDFs and DOCX documents in NaLI CP1.

---

## 1. PDF Generation Stack Options

### Option A: Typst (CLI / Node Native)
*   **Quality**: Elite, publisher-grade typesetting layout. Matches exact LaTeX quality.
*   **Local QA Feasibility**: High (simple Typst binary execution).
*   **Vercel/Production Feasibility**: Low/Medium. Requires bundling a native Typst CLI binary or using a WASM version, which increases cold-starts, storage footprint, and compatibility risks in restricted edge/serverless environments.
*   **Install Size**: >20MB binary.
*   **Decision**: **REJECTED** for CP1 core production build to prevent bundle bloat and deployment errors on Vercel. (Retained only as a future roadmap consideration for professional-grade offline server compilations).

### Option B: HTML/CSS to PDF (Playwright / Puppeteer)
*   **Quality**: High (leverages standard browser rendering engine).
*   **Feasibility**: Low in Vercel. Chromium binaries exceed serverless zip size limits and suffer from severe cold-starts.
*   **Decision**: **REJECTED**.

### Option C: pdf-lib (Embedded canvas-style drawing)
*   **Quality**: High (with custom template styling, precise font alignment, cell-level wrapping, custom shapes, and borders).
*   **Feasibility**: Extremely high. Already installed in the project, lightweight, runs natively in Node and edge runtime without extra binaries or external network calls.
*   **License/Maintenance**: MIT. Actively maintained.
*   **Install Size**: 0 additional bytes (already in `package.json`).
*   **Decision**: **SELECTED**. By upgrading the PDF layout engine built on `pdf-lib`, we can draw custom banners, zebra-striped tables, multi-page footers, and callouts while maintaining edge-readiness.

---

## 2. DOCX Generation Stack Options

### Option A: docx (docx.js library)
*   **Quality**: Professional. Generates real Office Open XML (OOXML) documents natively readable in Word/Pages/LibreOffice.
*   **Feasibility**: High. Already installed in `package.json`. Runs in Node/browser, lightweight, and supports headings, tables, margins, and borders programmatically.
*   **License/Maintenance**: MIT. Actively maintained.
*   **Decision**: **SELECTED**. We will use `docx` to construct the layout programmatically.

### Option B: Pandoc (CLI compiler)
*   **Quality**: High.
*   **Feasibility**: Low. Requires native OS installation of Pandoc and Haskell libraries, which is incompatible with serverless environments.
*   **Decision**: **REJECTED**.

---

## 3. Engineering Decision Summary

1.  **PDF Generation**: Use current `pdf-lib` dependency. Build custom layout structures directly inside the PDF stream.
2.  **DOCX Generation**: Use current `docx` dependency. Maintain DOCX assembly exclusively server-side / local-script to prevent bloating the client bundle of `/create-report`.
3.  **Visual Locks**: The user-facing PDF/DOCX downloads will remain locked underCP1 payment validations; the generation code will run in the background for local founder/admin QA checks.
