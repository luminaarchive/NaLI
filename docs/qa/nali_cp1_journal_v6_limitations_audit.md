# NaLI CP1 Journal V6 Limitations Audit

This document presents a brutal, honest audit of the V6 reference journal artifacts (`nali-*-journal-reference-v6.*`) generated in `~/Downloads/NaLI-QA/` against the expectations of serious international journal article drafts.

## Audit Matrix

| Metric | Status | Evaluation & Context |
| :--- | :--- | :--- |
| **1. International journal visual resemblance** | **PARTIAL** | The HTML/CSS styles mimic a template structure (Abstract, Intro, Methods), but the actual body is sparse, lacks depth, and looks like a basic markdown export rather than an editorial-grade journal. |
| **2. Cover page production quality** | **PARTIAL** | The cover page features a green gradient and SVG wave, but is relatively simple and dominated by warning messages. It lacks the professional layout of top-tier academic publications. |
| **3. Article opener quality** | **PARTIAL** | Has a basic author/affiliation block and metadata box, but the metadata fields are sparse and lacks a professional layout like a graphical abstract slot. |
| **4. Figure/photo presentation** | **FAIL** | There is only an empty SVG graphic placeholder saying "Photo not provided" with a static caption. There is no support for local sample images, diagram panels, or complex figure layouts. |
| **5. Measurement table depth** | **FAIL** | The result table only lists static attributes (`shape`, `margin`, `color`) without any real physical measurements (leaf length, leaf width, petiole length, replicates) or statistics. |
| **6. References/citation handling** | **FAIL** | It hardcodes "No references were supplied. NaLI did not generate artificial references" and does not parse or support user-supplied references or format in-text citations. |
| **7. Evidence richness** | **FAIL** | Only contains static text assertions ("Daun A is lonjong") instead of a rich observation package with replicate data, observation contexts, and raw data inventory. |
| **8. Methods reproducibility** | **PARTIAL** | The methods section is structured, but since there is no detailed protocol or measurement data, it is not actually reproducible. |
| **9. Results depth** | **FAIL** | Extremely brief, reflecting only the three basic traits with no statistical analysis or comparative detail. |
| **10. Discussion depth** | **PARTIAL** | The prose is clean and cautious, but since it is commenting on virtually non-existent data, the discussion is shallow and generic. |
| **11. Model differentiation** | **PARTIAL** | While different models (Peregrine, Obsidian, Zephyr) have different static strings for sections, the core evidence/data/tables are identical, so they do not feel like distinct editorial products. |
| **12. PDF polish** | **PARTIAL** | The PDF page breaks are clean, but page flow is sub-optimal because the slots (figures, tables, references) are empty or basic. |
| **13. DOCX polish** | **PARTIAL** | The DOCX uses the `docx` library and styles tables, but looks very basic with plain layouts and lacks editable elements for figure slots or structured reference sections. |
| **14. Real-world founder usability** | **FAIL** | A founder/admin reviewing this would see "conditional go" at best. It cannot serve as a high-fidelity showcase of NaLI's document generation capability for real journal-grade outputs. |

## Expected Conclusion
- **V6 is CONDITIONAL GO only.** It is a solid foundation but cannot become a full **GO** because it lacks a richer evidence fixture, real measurement tables, replicated observation rows, user-supplied reference citation handling, annexures with raw inventory, and model-specific editorial layout behaviors.
- The next build (V7) must install and utilize heavier document tooling (such as additional libraries, citation utilities, or custom layout modules) to drastically improve visual and structural output quality.
