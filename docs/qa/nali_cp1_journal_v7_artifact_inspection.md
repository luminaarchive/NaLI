# NaLI V7 Artifact Inspection Log

This document records the programmatic and visual inspection details for the NaLI V7 International Journal Document Intelligence Engine.

**AI-run visual/static QA completed on: 2026-05-25**

---

## 1. Generation Outputs & Integrity Check

The QA generator compiled five formats for each model (HTML, MD, TXT, PDF, DOCX) into `~/Downloads/NaLI-QA/`.

| Model / Persona | Format | Status / Page Count | Key Checklists Verified |
| :--- | :--- | :--- | :--- |
| **NaLI Peregrine** | PDF | **6 Pages** (PASS) | Cover, Abstract, Introduction, Lit Review, Materials & Methods, Results Table, Stats Table, Figures 1 & 2, Annexure Tables A1 & A2, References. |
| | DOCX | **Structured** (~21KB) | All headings, tables, and reference sections present; editable. |
| **NaLI Obsidian** | PDF | **8 Pages** (PASS) | Extended audit sections, forced page breaks (Results, Figures, Annexure, References), no overlaps. |
| | DOCX | **Structured** (~21KB) | Multi-page layout, formatted tables. |
| **NaLI Zephyr** | PDF | **8 Pages** (PASS) | Polished narrative, smooth academic transitions, page breaks. |
| | DOCX | **Structured** (~21KB) | Word-compatible typography and border paddings. |

---

## 2. Specific Layout Audits

### Cover Page
*   **Visual Style**: Premium nature-themed dark green gradient with clean brand lockup and vector SVG waves.
*   **Text and Metadata**: Custom volume/issue block (Vol 1, Issue 1, Year 2026) and CP1 local QA edition details. Labeled clearly with `[local QA fixture, not externally verified]`.

### Article Opener
*   **Masthead**: Running header with page count.
*   **Structure**: Clear metadata info card on the left column, abstract and keywords on the right, followed by a double-column introduction.

### Figure Plates
*   **Figure 1**: Comparative visual plate of Daun A (ovate) and Daun B (palmate) drawn using beautiful inline SVG elements.
*   **Figure 2**: Measurement protocol schematic diagram defining leaf parameters (length, width, petiole) as a vector line layout.
*   **Labeling**: Both plates feature prominent tags: `[synthetic QA placeholder - local QA fixture]`.

### Tables
*   **Table 1**: Summary of traits (margin, shape, color) mapped from the fixture.
*   **Table 2**: Measurement statistics (mean length, mean width, mean petiole length) per group.
*   **Annex Table A1**: Evidence inventory and review status.
*   **Annex Table A2**: Raw replicate measurements (n=3 per group).
*   **Design**: Alternate rows shaded cleanly; borders formatted without clashing text.

### References & Citations
*   **Citations**: In-text keys `[Ref: Botany Guide, 2024]` and `[Ref: Flora Kampus, 2025]` mapped to `[1]` and `[2]`.
*   **References**: Bibliography list populated at the end. No fake DOIs or publisher names fabricated.

---

## 3. QA Conclusion

*   **Public export gates**: LOCKED. Verification shows `Unduh PDF/DOCX` is not exposed in public UI, and Playwright code is kept strictly server-side.
*   **Branding check**: No traces of JWC/E-Palli assets.
*   **QA Verdict**: **PASS** (GO for local founder/admin QA; LOCKED for public export).
