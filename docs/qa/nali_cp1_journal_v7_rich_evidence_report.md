# NaLI CP1 Journal V7 Rich Evidence Report

This report summarizes the design, development, and QA validation of the **NaLI V7 International Journal Document Intelligence Engine**.

---

## 1. Why V6 Was Insufficient

During the CP1 audit, the V6 reference journal outputs were evaluated and found to be incomplete for editorial-grade academic drafts:
- **No measurements/replicates**: Leaves were described in plain words only.
- **Empty figure boxes**: Figure slots were text-based placeholders without visual elements or scales.
- **Fake citations/references absent**: Citations were faked or omitted entirely.
- **Tone only**: Personal variations were restricted to name and text tone, with identical table shapes and sizes.

---

## 2. V7 Rich Evidence & Tooling Design

### Custom Citation Engine
Rather than introducing heavy CSL libraries that disrupt Next.js serverless functions, we implemented a custom engine in `src/lib/reports/journalCitationEngine.ts` that:
- Numbers citations based on user-supplied reference lists.
- Replaces keys (e.g., `[Ref: Botany Guide, 2024]`) with bracketed numbers `[1]`.
- Defaults to a warning when no references are provided.

### Rich Replicate Fixture
The local QA fixture `src/lib/reports/journalRichEvidenceFixture.ts` models a realistic botanical practical note:
- **Data**: Daun A (lonjong/rata, n=3 replicates) and Daun B (menjari/bergerigi, n=3 replicates) with physical measurements in cm (length, width, petiole).
- **Figures**: Figure 1 (Leaf morphology comparisons) and Figure 2 (Measurement workflow) rendered as detailed, styled inline SVGs.
- **Labeling**: Figures, text, and tables are labeled using approved terms (e.g. `synthetic QA placeholder`, `local QA fixture`, `not externally verified`) to prevent false claims of source validation.

### Expanded Section Lengths & Formatting
To meet target lengths (Peregrine: 6-8 pages, Obsidian/Zephyr: 8-10 pages), the academic prose in `src/lib/reports/journalArticleTemplate.ts` was expanded with rich, detailed botanical and audit analyses. We introduced conditional page breaks for Obsidian and Zephyr in `src/lib/reports/journalHtmlTemplate.ts` to separate results, figure plates, and annexures cleanly.

---

## 3. Generated Files and Audits

All 15 generated artifacts are located in `~/Downloads/NaLI-QA/` and have been verified locally.

### Visual & Content Inspection

| Persona / Model | PDF Pages | DOCX Size | Verdict |
| :--- | :--- | :--- | :--- |
| **NaLI Peregrine** | 6 Pages | ~21KB | **PASS** (Clear student practical layout) |
| **NaLI Obsidian** | 8 Pages | ~21KB | **PASS** (Rigorous audit details, spaced break pages) |
| **NaLI Zephyr** | 8 Pages | ~21KB | **PASS** (Academic tone, elegant flow) |

*   **HTML/PDF Quality**: Excellent. Features a premium green cover page, article opener with metadata boxes, inline vector diagrams, statistics tables, and raw replicate annexures.
*   **DOCX Quality**: Excellent. Programmatically compiled using Word-compatible table grids and borders.
*   **Git Integrity**: All generated QA files in `~/Downloads/NaLI-QA/` are outside the repository path and will not be staged or committed.

---

## 4. Remaining Blockers
- **Public exports**: Locked. PDF and DOCX downloads remain deactivated for public users.
- **Midtrans and monetization**: Deferred. Order tracking and checkout validations are bypassed for internal QA.
