# NaLI CP1 Journal V6 Quality Report

Date: 2026-05-25
Decision: **CONDITIONAL GO** for founder/admin local PDF/DOCX QA only.

## V5 Failure Summary

V5 is recorded as **FAIL** for visual similarity and founder-approved professional quality. Rendered inspection showed a text-led cover, conspicuous founder/admin and identifier-not-assigned furniture, an empty-looking figure slot, and article pages that remained too close to internal output. It was partial in structure only.

## V6 Improvement

V6 continues the local HTML/CSS plus Playwright pipeline but replaces the visible design and content contract:

- A full-page NaLI green cover uses original inline SVG/CSS landscape and leaf forms, a volume/issue block, article category, and publisher-style band.
- The article opener uses compact neutral article information, abstract, keywords, and two-column introduction; missing DOI/ISSN labels are not displayed as design content.
- Body pages use dense two-column typography, styled result and annexure tables, restrained running furniture, and a deliberately designed reserved figure plate.
- Truth handling is reduced to a quiet status note and an integrity endnote; it is not repeated as page-dominating operational copy.
- Article variants are visible in category, editorial note, language, methods framing, limits, and discussion.
- DOCX mirrors the structured article with a cover page, metadata table, editable headings/tables, reserved figure plate, annexure, and references statement.

## Rendered Inspection

The reference article, V5 PDFs, and generated V6 PDFs were rasterized and compared visually using macOS PDFKit. V6 DOCX files were exported to temporary PDFs through installed Microsoft Word and inspected as rendered pages. This checks the actual page appearance, not only extracted text or source HTML.

| Check | Result | V6 observation |
| --- | --- | --- |
| Full visual cover composition | PASS | Original nature-led green field, strong hierarchy, volume/issue block, clean publisher band. |
| Article opener | PASS | Header, category, title/byline, metadata panel, abstract/keywords, and introduction compose as a journal first page. |
| Dense journal body | PASS | Readable two-column PDF pages with controlled headings and page furniture. |
| Table and annexure layout | PASS | Styled tables remain intact; annexure begins cleanly rather than stranding a header at a page break. |
| Figure/caption treatment | PASS WITH LIMIT | Designed figure plate and caption are intentional; it correctly states that no photo was supplied. |
| CP1 truth restraint | PASS | Status is subtle; no repeated internal-QA language or visible absent DOI/ISSN furniture. |
| Model differentiation | PASS | Categories and substantive emphasis differ across the three artifacts. |
| DOCX visual parity with PDF | PARTIAL | Clean/editable and professional, but the Word cover is simpler than the richer PDF composition. |
| Final publication readiness | NOT CLAIMED | No photo, measurements, references, or source verification were supplied. |

## Generated Files

Output directory: `~/Downloads/NaLI-QA/`. These are external QA artifacts and are not committed.

| Model | Generated artifacts |
| --- | --- |
| Peregrine | `nali-peregrine-journal-reference-v6.html`, `.md`, `.txt`, `.pdf`, `.docx` |
| Obsidian | `nali-obsidian-journal-reference-v6.html`, `.md`, `.txt`, `.pdf`, `.docx` |
| Zephyr | `nali-zephyr-journal-reference-v6.html`, `.md`, `.txt`, `.pdf`, `.docx` |

## Per-Model Quality

| Variant | PDF rendered inspection | DOCX Word-rendered inspection | Verdict |
| --- | --- | --- | --- |
| Peregrine - Short Communication / Practicum Note | 5 pages / 1,982 extracted words; clear learning-oriented article identity and complete structure. | 7 pages / 2,027 extracted words; clean editable hierarchy and tables. | CONDITIONAL GO |
| Obsidian - Evidence Audit Article | 5 pages / 1,963 extracted words; strongest evidence limits and cannot-conclude treatment. | 7 pages / 2,011 extracted words; methodology and audit presentation remain readable. | CONDITIONAL GO |
| Zephyr - Polished Academic Article Draft | 5 pages / 1,938 extracted words; strongest publication-like narrative flow. | 7 pages / 1,984 extracted words; polished opener and complete editable article. | CONDITIONAL GO |

All PDFs omit the rejected `Founder/Admin Draft Series` and `Internal QA` furniture and do not display `DOI: not assigned` or `ISSN: not applicable`. No fake reference, photograph, species identification, or verification claim was introduced.

## Remaining Limitations

- The supplied fixture contains only two descriptive observations, a general location, and a general time; it supplies no photographs, measurements, replicate observations, or references.
- The figure plate and references statement must remain deliberately unfilled until real user material is provided.
- V6 is an original NaLI publication-style QA template inspired only by benchmark structure; it is not a copy of the reference publisher design.
- PDF is the stronger controlled visual artifact; DOCX prioritizes editable structure and therefore remains visually simpler.
- This conditional gate does not activate public export, payment, upload, source verification, or human testing.
