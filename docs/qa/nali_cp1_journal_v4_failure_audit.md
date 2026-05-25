# NaLI CP1 Journal V4 Failure Audit

Date: 2026-05-25
Audit status: **FAIL**
Scope: founder/admin local QA artifacts only; public PDF/DOCX export remains locked.

## Benchmark And Evidence

The supplied reference article was used only as a structural and visual benchmark. Its branding, logo, publisher identity, ISSN, DOI, and illustrations must not be copied.

Baseline artifacts were absent from `~/Downloads/NaLI-QA/` at audit start, so the existing unmodified `scratch/generate_qa_artifacts.cjs` was run once to reconstruct the v4 output for inspection. The reconstructed v4 PDFs and DOCX files remain external QA artifacts and are not repository deliverables.

| Item | Reference benchmark | V4 baseline observation |
| --- | --- | --- |
| PDF length | 8 pages; approximately 5,352 extracted words | 3 pages; Peregrine 603, Obsidian 738, Zephyr 697 extracted words |
| Cover | Full-bleed designed journal cover with strong hierarchy and visual identity | Sparse bordered panel with very large unused space and no authored visual system |
| Article first page | Journal masthead, metadata, abstract, keywords, two-column opening prose | One-column status/report sheet with conspicuous QA/export wording |
| Body | Dense but readable publication-style pages, figures and references | Brief sections followed by an almost empty final page |
| DOCX preview | Expected editable article structure | Quick Look preview collapses the title area into a narrow vertical strip; visually unusable |

PDF pages were rasterized for visual inspection using macOS PDFKit; DOCX first pages were inspected through macOS Quick Look. The bundled DOCX full-render workflow could not render all pages because `soffice` is not installed in this environment.

## Pass/Fail Matrix

| # | Criterion | Result | Finding |
| --- | --- | --- | --- |
| 1 | Cover page visual quality | FAIL | Empty framed space and plain typography do not read as a designed journal cover. |
| 2 | Journal identity design | FAIL | A title exists, but there is no mature NaLI publication identity or visual language. |
| 3 | Article metadata layout | FAIL | Metadata is an oversized operational/status strip rather than compact journal front matter. |
| 4 | Abstract/keywords block | CONDITIONAL FAIL | Block exists, but abstract is extremely short and embedded in report-like page furniture. |
| 5 | Body typography | FAIL | Single-column oversized report typography lacks journal density and rhythm. |
| 6 | Article length/depth | FAIL | 603-738 words against a substantial 8-page benchmark; content is plainly too shallow. |
| 7 | Figure/photo layout | FAIL | A generic text rectangle substitutes for a composed figure area and caption system. |
| 8 | Table quality | CONDITIONAL FAIL | PDF table is legible, but simplistic; DOCX layout failure makes overall delivery unacceptable. |
| 9 | Literature review depth | FAIL | One short paragraph primarily states that literature is absent; no useful source-acquisition framework. |
| 10 | Methods quality | FAIL | A compressed paragraph omits a credible observation protocol and recording design. |
| 11 | Results/discussion depth | FAIL | Interpretive treatment is thin; Zephyr also raises unsupported functional possibilities too casually. |
| 12 | References handling | PASS | It correctly avoids generating references when none were supplied. |
| 13 | Annexure/appendix quality | FAIL | Minimal or visually absent in PDF body; no professional supplementary presentation. |
| 14 | Model differentiation | CONDITIONAL FAIL | Wording differs, but all versions share the same thin layout and inadequate depth. |
| 15 | Professional impression | FAIL | It looks like a patched QA report, not a publication-quality journal draft. |

## Specific Quality Defects

- Page 1 of every v4 PDF spends most of its area on blank space while offering no visual storytelling or credible journal identity.
- Page 2 foregrounds `INTERNAL QA`, export-gate, verification, and upload language rather than presenting the article cleanly.
- Page 3 of Peregrine contains only conclusion and references at the top with almost an entire blank page below.
- Main content is not set as a journal article: it lacks controlled two-column text, meaningful figure composition, literature/method depth, and an intentional appendix.
- The DOCX cover/first-page thumbnail is visibly broken, with the journal title rendered character-by-character down a narrow left column.
- V4 uses `pdf-lib` as a page drawing engine for report text; the approach is too low-level for professional print layout and is no longer acceptable as the primary founder/admin journal renderer.

## Conclusion

**V4 is FAIL.** It is structurally and visually far below the supplied journal benchmark and fails the founder’s quality gate. Its one defensible behavior is that it does not invent references, DOI, or ISSN; that integrity boundary must be preserved in the replacement pipeline.
