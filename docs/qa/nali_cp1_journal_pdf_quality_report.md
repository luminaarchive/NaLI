# QA Report: Journal & PDF Quality Verification (v2)

This report details the verification of the improved journal-style report structure, model-specific output differentiation, and professional PDF rendering layout.

## Operational Status & Gates
- **Human Testing**: PAUSED
- **Midtrans**: DEFERRED
- **Paid Launch**: NO-GO
- **Public/User PDF Export**: LOCKED
- **Founder/Admin QA PDF Generation**: GO
- **Journal Output Quality**: GO
- **PDF Renderer Quality**: GO

---

## 1. What Was Wrong Before (v1)
- The three models generated identical content because the mock generator fallback structure did not differentiate by model type.
- PDFs were rendered line-by-line as raw unformatted text blocks.
- Markdown tables in PDFs were broken and misaligned due to variable-width font characters.
- Disclaimer boxes and evidence/photo slots were plain text bullet points with no visual structure.

## 2. What Was Fixed (v2)
- **Model Differentiation**: Added `src/lib/reports/journalReportContract.ts` which populates distinct, profile-specific sections (Peregrine: simple and concise; Obsidian: focusing on strict boundaries, limits, and uncertainties; Zephyr: high-quality academic prose).
- **Zebra-Striped Tables**: Designed a cell-level text wrapping table renderer in `src/lib/reports/pdf.ts` that dynamically draws boxes, dividers, and alignments.
- **Academic Callouts**: Implemented warning boxes with crimson borders/pink background for disclaimers.
- **Evidence Cards**: Created light-green borders/backgrounds for unverified evidence/photo slots.
- **Premium Cover Page**: Rendered a navy blue header box at the top of page 1 containing the title, template, model used, and date.
- **Page Footers**: Added header-footer page number dividers at the bottom of all pages dynamically.

---

## 3. Files Changed
- `src/lib/reports/reportGenerator.ts`
- `src/lib/reports/pdf.ts`
- `src/lib/reports/journalReportContract.ts` (NEW)
- `scratch/generate_qa_artifacts.cjs`

---

## 4. Per-Model Quality Results

| Model ID | Journal Contract Check | Table Alignment | Evidence Cards | Title Banner | Overall Grade |
| --- | --- | --- | --- | --- | --- |
| **Peregrine** | PASS (IMRaD concise) | PASS (Aligned) | PASS (Correct slots) | PASS (Printed) | PASS |
| **Obsidian** | PASS (Strict limits) | PASS (Aligned) | PASS (Correct slots) | PASS (Printed) | PASS |
| **Zephyr** | PASS (Academic prose) | PASS (Aligned) | PASS (Correct slots) | PASS (Printed) | PASS |

- **Best Model Result**: Obsidian / Zephyr (Extremely clear wording highlighting evidence limits and academic tone).
- **Weakest Model Result**: Peregrine (More basic, but fully structured).

---

## 5. Generated Artifact Location
- **Folder**: `~/Downloads/NaLI-QA/`
- **Files**:
  - `nali-peregrine-journal-v2.md`, `.txt`, `.pdf`
  - `nali-obsidian-journal-v2.md`, `.txt`, `.pdf`
  - `nali-zephyr-journal-v2.md`, `.txt`, `.pdf`
- **Git Exclusions**: Confirmed. These files are located outside the project directory and are untracked and uncommitted.

---

## 6. Remaining Blockers
- **Blockers**: None.
