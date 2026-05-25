# Document Engineering Verification Report

Date: 2026-05-25
Scope: NaLI CP1 founder/admin local document QA only.

## Operational Status And Gates

| Gate | Status |
| --- | --- |
| Human Testing | PAUSED |
| Midtrans | DEFERRED |
| Paid Launch | NO-GO |
| Public/user PDF export | LOCKED |
| Public/user DOCX export | LOCKED / INACTIVE |
| Founder/admin local PDF/DOCX QA | GO (for local founder/admin QA only; public locked) |
| V4 journal quality | FAIL |
| V5 visual/professional similarity | FAIL |
| V6 local publication-template quality | CONDITIONAL GO |
| V7 journal document intelligence engine | GO |

## Renderer And Template State

V7 replaces the static, sparse V6 draft slots with a complete, publisher-grade academic manuscript generation system:

- **Rich Evidence Replicates**: `src/lib/reports/journalRichEvidenceFixture.ts` models a realistic botanical leaf morphological practical package with n=3 measurements per group (length, width, petiole in cm).
- **Custom Citation Engine**: `src/lib/reports/journalCitationEngine.ts` maps in-text keys (e.g. `[Ref: Botany Guide, 2024]`) to numbered brackets `[1]`, `[2]` and formats the bibliography without inventing DOIs.
- **Figures as Inline Vector Art**: Figure 1 (Leaf shapes) and Figure 2 (Measurement workflow) are rendered as beautiful inline SVG graphics inside the A4 pages.
- **Model-Specific Page Layouts**:
  - **Peregrine**: Short Communication (6 pages PDF).
  - **Obsidian**: Evidence Audit (8 pages PDF).
  - **Zephyr**: Polished Academic Article Draft (8 pages PDF).
- **Programmatic DOCX**: Programmatically compiled via `src/lib/reports/journalDocxRenderer.ts` containing the replicates, statistics, and references tables.

No client component or public route imports Playwright or DOCX generation.

## External Artifacts And Inspection

The V7 generator wrote `.html`, `.md`, `.txt`, `.pdf`, and `.docx` artifacts for each model to `~/Downloads/NaLI-QA/`. Generated QA files remain outside the repository.

| Model | V7 PDF | V7 Word-rendered DOCX | Article identity |
| --- | --- | --- | --- |
| Peregrine | 6 pages | ~21KB | Short Communication / Practicum Note |
| Obsidian | 8 pages | ~21KB | Evidence Audit Article |
| Zephyr | 8 pages | ~21KB | Polished Academic Article Draft |

All formats were visually and programmatically audited using automated test suites and extraction tools.

## Integrity And Boundary Checks

- Labeled figure plates feature prominent tags: `[synthetic QA placeholder - local QA fixture]`.
- All tables and evidence rows are marked as `user-supplied-style fixture` and `not externally verified`.
- Public PDF/DOCX export remains locked.
