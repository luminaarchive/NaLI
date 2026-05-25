# NaLI CP1 Journal V6 Design Specification

Date: 2026-05-25
Status: founder-requested implementation specification
Surface: founder/admin local QA PDF and DOCX artifacts only.

## Purpose And Boundary

V6 must read as an original NaLI publication-style journal draft inspired by the structural quality of the supplied article, without copying publisher identity or assets. It must not activate public PDF/DOCX export, upload, source verification, payment, or paid launch. It must not fabricate citations, DOI, ISSN, species identity, photographs, coordinates, or evidence.

Selected rendering approach remains local HTML/CSS print layout rendered through Playwright. The V6 improvement is editorial design and content depth, not a public product route or new production rendering service.

## Cover Page

The cover is a full A4 composition with a living visual hierarchy:

- Primary title: `NaLI Nature & Evidence Journal`.
- Original SVG/CSS nature field: layered contour/map shapes, leaf canopy silhouettes, horizon bands, and abstract bird/leaf forms. These are decorative journal artwork, not evidence photography or species claims.
- High-contrast volume/issue block: `Volume 1 / Issue 1 / 2026`.
- Article title placed as a subordinate cover line, not the only visual subject.
- `CP1 Founder/Admin QA Edition` appears once as a small editorial-edition line.
- Strong lower band: `Prepared by NaLI — Native Field Intelligence Services`.
- Truth note is small and quiet: `Draft only; source verification inactive; public export locked.`

The cover must not display copied publisher marks, invented identifiers, repeated internal QA language, or large empty uncomposed areas.

## Article Opener

Page two follows a journal article-first-page pattern:

- Compact journal masthead with journal title, volume/issue, year, and article category.
- Centered title plus author line `Generated draft from user-provided materials`.
- Affiliation line kept neutral: `NaLI Nature & Evidence Journal / CP1 editorial draft`.
- Left article-information panel containing category, material basis, article status, and editorial handling note.
- Right abstract and keywords treatment with publication-like density.
- A small truth strip at the page base only: `Draft only; source verification inactive; public export locked.`

DOI and ISSN absence are not displayed as front-matter furniture. No absent identifier is fabricated or implied.

## Body Pages

The main article uses A4 print layout with readable high-density two-column typography:

- Running label: short journal title plus article category/model label.
- Professional footer page numbering through the local PDF renderer.
- Tight serif body rhythm with controlled headings, paragraph widows/orphans, and deliberate column gap.
- Required sections: `INTRODUCTION`, `LITERATURE REVIEW`, `MATERIALS AND METHODS`, `RESULTS AND DISCUSSION`, `CONCLUSIONS`, `ANNEXURE`, `REFERENCES`.
- Supporting sections may include `EVIDENCE DOCUMENTATION`, `LIMITATIONS`, and `FUTURE WORK`, where they strengthen honesty and usability.

The page should look editorial rather than administrative: no repeated internal-QA blocks, no oversized warning cards, and no raw markdown.

## Figures And Tables

The evidence figure is a composed journal plate:

- Border-framed figure with a reserved image window and restrained botanical line treatment.
- Small centered label inside the empty window: `Photo not provided`.
- Journal caption below: `Figure 1. Reserved visual documentation plate for labelled user evidence.`
- Caption may clarify that no image was supplied, without making the whole figure a warning card.

Results and annexure tables use:

- Dark canopy header fill, thin rules, compact cell padding, and controlled column widths.
- Serif/sans separation appropriate to scholarly tables.
- No raw markdown and no awkward overflow.

## Content Contract And Article Categories

All variants must have an abstract of 180-250 words, 4-6 introduction paragraphs, 4-6 literature-review paragraphs, 5-8 method paragraphs/subsections, 8-12 combined results/discussion paragraphs, structured evidence and limitation treatment, 2-4 conclusion paragraphs, annexure table/checklist, and a truthful no-supplied-references statement.

Visible category distinctions:

| Profile | Article category | Editorial identity |
| --- | --- | --- |
| Peregrine | `Short Communication / Practicum Note` | Accessible, concise, learning-oriented, complete. |
| Obsidian | `Evidence Audit Article` | Strictest methods, data sufficiency analysis, strongest cannot-conclude boundary. |
| Zephyr | `Polished Academic Article Draft` | Smoothest narrative transitions and most publication-style discussion. |

Each profile includes a compact editorial note on the opener and category-specific content emphasis; differentiation must not rely on model name alone.

## DOCX Translation

DOCX mirrors the V6 hierarchy with an `editorial_cover`-style first section adapted to A4 NaLI journal presentation:

- Cover-like opening section with volume/issue and publisher band.
- Compact opener with category, title, author/affiliation, article metadata, abstract, and keywords.
- Styled body headings, prose, results table, figure placeholder, annexure table, references statement, and small truth note.
- Explicit fixed-width DXA table geometry and editable Word paragraphs/tables.

The DOCX remains an editable QA artifact; the controlled PDF is the primary visual comparison output.

## Acceptance Gate

V6 may receive no better than `CONDITIONAL GO` unless direct rendered-page inspection confirms a material improvement over V5. It must fail if it exposes copied branding, invented evidence or identifiers, dominant QA/status language, broken table/figure geometry, public export activation, or artifacts committed to the repository.
