# Journal Document Dependency Audit

This document summarizes the dependency audit and security check performed before configuring the document export pipeline in NaLI CP1.

---

## 1. Audited Packages

| Package | Version | Purpose | Dependency Type | License | Security/Audit Status |
| --- | --- | --- | --- | --- | --- |
| **docx** | `9.6.1` | DOCX document model compiler | Production | MIT | **PASS**. Pure JS/TS dependency, no native binding requirements, no network activity, and runs safely in Edge runtimes. |
| **pdf-lib** | `1.17.1` | Canvas-like PDF stream builder | Production | MIT | **PASS**. Pure JS library, no native platform binary requirements, no network request triggers, and Edge-compliant. |

---

## 2. Installation Details
- **New Packages Installed**: `None` (Both libraries are already present in `package.json` and locked in `package-lock.json`).
- **Rejected Packages**: Any native binaries or CLI tools (e.g. `typst-cli`, `pandoc-cli`, `weasyprint`) to avoid bundle bloat and ensure Edge/Serverless deployment compatibility.

---

## 3. Bundling & Security Gates
*   **Zero Client-Side Imports**: The `docx` and `pdf-lib` libraries are imported strictly inside server-only route handlers (`src/app/api/...`) or local QA scripts (`scratch/`).
*   **Initial Bundle Integrity**: No client-side bundle size increase occurs for `/create-report`, preserving optimal LCP and INP metrics.
*   **Secrets Exposure**: No system keys, API keys, or stack traces are fed into the compilers. Input is strictly sanitized before rendering.
*   **Upload/Source Verification Inactive**: The document generators do not trigger any background upload actions or activate remote source validations.
