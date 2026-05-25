# NaLI CP1 V7 Dependency Install Audit

This document logs the tools, libraries, and packages configured or audited for the V7 document intelligence engine build.

---

## 1. Selected and Audited Packages

| Package / Tool | Version | Status | Why Chosen / Purpose | Client Bundle Impact |
| :--- | :--- | :--- | :--- | :--- |
| **playwright** | `^1.60.0` | Pre-installed | Selected as the PDF generation driver. Automates headless Chromium print media to produce publisher-grade page layouts. | **None**. Playwright is listed in `devDependencies` and is only imported/run server-side in local QA CLI scripts and admin render endpoints. |
| **docx** | `^9.6.1` | Pre-installed | Programmatic OOXML constructor used to build Word documents with custom styles, headers, cover plates, and table widths. | **None**. Only used inside server-side controllers and generation scripts. |
| **typescript** | `^5.9.3` | Pre-installed | Transpiles the codebase and type-checks the modules. | **None**. Development time compile tooling. |

---

## 2. Programmatic Decision: Zero-Dependency Citation Engine

To avoid adding massive external libraries (like `citation-js` or `citeproc-js`) that could bloat the codebase, cause dependency resolution issues with React 19/Next 16, or increase cold-starts, we have engineered a custom lightweight citation processor:

*   **File**: `src/lib/reports/journalCitationEngine.ts`
*   **Approach**: Parsed directly from user-supplied references. Renders standard citation markers (e.g. `[1]`, `[2]`) in text and outputs formatted bibliographies.
*   **Security & Integrity**: Ensures no fake citations or DOIs are synthesized under any circumstances. If no references are provided by the user, it correctly states that none were supplied.

---

## 3. Rejected CLI Installs

*   **quarto / typst / pandoc**: Audited in the local Mac path and found to be missing. To maintain environment independence and prevent setup drift between developer machines and CI/CD pipelines, we chose not to force a native Homebrew installation of these compilers. Playwright + HTML/CSS print media offers equal layout flexibility while running out-of-the-box.
