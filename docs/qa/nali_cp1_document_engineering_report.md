# Document Engineering Verification Report

This report documents the verification of the PDF and DOCX document compilers built for NaLI CP1.

## Operational Status & Gates
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Public/User PDF Export**: LOCKED
- **Public/User DOCX Export**: LOCKED / INACTIVE
- **Founder/Admin QA PDF Generation**: GO
- **Founder/Admin QA DOCX Generation**: GO
- **Reference Journal Template Quality**: GO
- **PDF Renderer Quality**: GO
- **DOCX Renderer Quality**: GO

---

## 1. Dependency Analysis

*   **Libraries Utilized**:
    *   `pdf-lib@1.17.1` (already installed in package.json)
    *   `docx@9.6.1` (already installed in package.json)
*   **Libraries Rejected**:
    *   `typst-cli`, `weasyprint`, `playwright-pdf`, `pandoc` (rejected to avoid native binaries in edge/production and cold-start overhead).
*   **Bundler Footprint**: Pure JS/TS libraries, loaded strictly inside backend API routes or local QA scripts. 0 bytes added to the client bundles.

---

## 2. Generated Artifacts Summary

- **Folder Location**: `~/Downloads/NaLI-QA/`
- **Confirmation**: `Verified`. All generated QA files reside outside the git repository and are not tracked or committed.
- **Files Generated**:
  *   `nali-peregrine-journal-reference-v4.md`, `.txt`, `.pdf`, `.docx`
  *   `nali-obsidian-journal-reference-v4.md`, `.txt`, `.pdf`, `.docx`
  *   `nali-zephyr-journal-reference-v4.md`, `.txt`, `.pdf`, `.docx`

---

## 3. Per-Model QA Table

| Model ID | PDF Cover | Abstract Block | Results Table | Evidence Slots | DOCX Structure | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| **Peregrine** | PASS | PASS | PASS | PASS | PASS | PASS |
| **Obsidian** | PASS | PASS (Strict limits) | PASS | PASS | PASS | PASS |
| **Zephyr** | PASS | PASS (Polished prose) | PASS | PASS | PASS | PASS |

- **Best Wording Model**: Obsidian (Very clear, explicit evidence bounds).
- **Best Formatting Model**: Zephyr (Smooth flow and clean layout spacing).

---

## 4. Remaining Blockers
- **Blockers**: None.
