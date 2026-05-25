# NaLI CP1 Journal V5 Quality Report

Date: 2026-05-25
Decision: **CONDITIONAL GO** for founder/admin local PDF/DOCX QA only.

## Why V4 Failed

V4 used a low-level `pdf-lib` drawing path and produced three thin pages per profile: a sparse cover, report-like metadata treatment, shallow article content, and an unusable-looking DOCX first-page preview. It did retain the necessary integrity restraint around references and identifiers, but it did not satisfy a professional journal visual standard. The separate v4 audit records an overall **FAIL**.

## Renderer Replacement

V5 uses a complete HTML/CSS print template and local Playwright Chromium PDF rendering. The selected pipeline supports A4 page rules, print backgrounds, designed cover composition, journal front matter, two-column article flow, figure/evidence layout, styled tables, and running page furniture. `playwright@^1.60.0` is a development dependency only; the renderer is used by the local QA generator and is not imported into public UI.

DOCX generation was separately rebuilt as a structured editable Word document with a cover-like first page, metadata table, full section hierarchy, styled results and annex tables, evidence placeholder, and references statement.

## Generated Files

All files are external QA artifacts in `~/Downloads/NaLI-QA/`; none are intended for git.

| Model | Files |
| --- | --- |
| Peregrine | `nali-peregrine-journal-reference-v5.html`, `.md`, `.txt`, `.pdf`, `.docx` |
| Obsidian | `nali-obsidian-journal-reference-v5.html`, `.md`, `.txt`, `.pdf`, `.docx` |
| Zephyr | `nali-zephyr-journal-reference-v5.html`, `.md`, `.txt`, `.pdf`, `.docx` |

## Visual Quality Checklist

| Check | Result | Evidence |
| --- | --- | --- |
| Original cover identity | PASS | Deep-green NaLI cover and CSS-derived nature motif; no copied publisher artwork or identity. |
| Article first page | PASS | Journal header, article title, author/affiliation, metadata card, abstract, and keywords. |
| Academic body layout | PASS | Five-page PDFs with readable two-column main flow and controlled headings. |
| Table layout | PASS | Styled HTML and DOCX result tables with readable cell boundaries and no raw markdown. |
| Figure/evidence layout | PASS | Composed figure placeholder stating that no photo was provided. |
| Annexure and references | PASS | Evidence inventory/review material and explicit no-supplied-references statement. |
| Truth/disclaimer restraint | PASS | Limitations are present without turning each page into operational QA copy. |
| Identifier/source integrity | PASS | No fake DOI, ISSN, citation, photograph, species ID, or source-verification claim. |
| Publishability | NOT CLAIMED | Supplied evidence is too limited for a published or verified article. |

## Per-Model Quality

| Model | PDF observation | DOCX observation | Verdict |
| --- | --- | --- | --- |
| Peregrine | 5 pages / 1,732 extracted words; concise practicum-oriented treatment. | Word-rendered temporary PDF is 6 pages; cover, result table, and article text are clean. | CONDITIONAL GO |
| Obsidian | 5 pages / 1,907 extracted words; strongest evidence and cannot-conclude framing. | Word-rendered temporary PDF is 7 pages; extended limitation/evidence page remains readable. | CONDITIONAL GO |
| Zephyr | 5 pages / 1,877 extracted words; most continuous academic narrative. | Word-rendered temporary PDF is 7 pages; complete clean flow through references. | CONDITIONAL GO |

PDF pages were visually inspected after direct Playwright generation. DOCX documents were exported to temporary PDFs through the locally installed Microsoft Word application and inspected page-by-page because the repository's bundled DOCX rendering path requires unavailable LibreOffice tooling.

## Remaining Limitations

- The supplied prompt includes only two descriptive observations, a general location, and a general time. It supplies no photographs, measurements, replicates, or references.
- The visual documentation panel must therefore remain intentionally empty, and the references section must remain a no-supplied-references statement.
- Output quality is suitable for continuing founder/admin local renderer QA, not for activating public export or presenting the document as a published or source-verified article.
