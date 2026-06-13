# NaLI Surgical Research Module Polish Sprint Report

**Date**: 2026-06-13  
**Surgical Sprint Goal**: Apply safe, high-impact visual and technical polish inspired by the visual gap analysis.

---

## 1. Summary of Changes

A clean, non-disruptive update was performed to upgrade NaLI's metadata representation, security hardening, and trust section visual hierarchy.

### Files Changed
- [app/robots.ts](file:///Users/macintosh/Documents/NaLI/app/robots.ts)
- [components/SourceArchive.tsx](file:///Users/macintosh/Documents/NaLI/components/SourceArchive.tsx)
- [app/arsip-sumber/[slug]/page.tsx](file:///Users/macintosh/Documents/NaLI/app/arsip-sumber/[slug]/page.tsx)
- [app/articles/[slug]/page.tsx](file:///Users/macintosh/Documents/NaLI/app/articles/[slug]/page.tsx)
- [app/globals.css](file:///Users/macintosh/Documents/NaLI/app/globals.css)

---

## 2. Implementations Detailed

### Part 1: Robots Hardening
- Hardened crawler access rules in [app/robots.ts](file:///Users/macintosh/Documents/NaLI/app/robots.ts) by adding `disallow: ["/admin", "/api"]`.
- Ensured all public pages (such as `/articles`, `/arsip-sumber`, etc.) remain fully crawlable.

### Part 2: Source Archive Metadata Chips
- Refined the source archive table page and mobile list view in [components/SourceArchive.tsx](file:///Users/macintosh/Documents/NaLI/components/SourceArchive.tsx) to render visual chips for:
  - Source type (e.g. `JURNAL`, `ARSIP`, `BUKU`)
  - Geography if available (e.g. `INDONESIA`, `GLOBAL`)
  - Year of publication if available
  - Reliability level if available (e.g. `TERVERIFIKASI`, `SANGAT KUAT`)
- Updated the header of the source detail page at [app/arsip-sumber/[slug]/page.tsx](file:///Users/macintosh/Documents/NaLI/app/arsip-sumber/[slug]/page.tsx) to render the same consistent chip row.
- Ensured zero content rewrite or fabrication of metadata.

### Part 3: Claim Ledger Research Module
- Completely refactored the Claim Ledger table on the article details page [app/articles/[slug]/page.tsx](file:///Users/macintosh/Documents/NaLI/app/articles/[slug]/page.tsx) into a series of structured visual cards.
- Restructured layout to group claim number, claim text, source citation, verification status badge, and detailed notes inside separate dashed-border cards.
- Pre-allocated status color classes (dot colors and border accents) to align with NaLI's badge design guidelines.

### Part 4: Limitations Research Module
- Updated the Limitations section on the article details page [app/articles/[slug]/page.tsx](file:///Users/macintosh/Documents/NaLI/app/articles/[slug]/page.tsx) to render as modular cards using the label `Batasan Bukti` (audit check style).
- Displayed each limitation in a two-column grid on larger viewports with clean serial numbers (`01`, `02`, etc.) and dashed border separation.

### Part 5: Lightweight Link Hover Polish
- Added global classes (`interactive-link`, `link-arrow`, `link-arrow-left`, `link-arrow-diagonal`) to the end of [app/globals.css](file:///Users/macintosh/Documents/NaLI/app/globals.css).
- These classes enable opt-in transition animations that smoothly translate arrows (`←`, `→`, `↗`) on hover.
- Integrated these animations into:
  - Back navigation link on article details page (slides `←` left on hover).
  - Back navigation link on source details page (slides `←` left on hover).
  - External source original button on source details page (slides `↗` diagonally on hover).
  - Desktop row and mobile card navigation links in the source archive listing (slides `→` right on hover).

---

## 3. Scope Protection Check

- **Homepage Protected**: Yes (no edits to `app/page.tsx`, layout, copy, or hero components).
- **Hero Protected**: Yes (homepage WaveHero shader, copy, and visual overlay left untouched).
- **Jurnal Touched**: No (no edits to `app/jurnal/*`, `content/jurnal/*`, `lib/jurnal*`, or `/jurnal` routes).
- **Robots Hardened**: Yes.
- **Source Chips Added**: Yes.
- **Claim Ledger Refined**: Yes.
- **Limitations Refined**: Yes.
- **Hover Polish Added**: Yes.

---

## 4. Known Limitations & Recommendations

- **Supabase fields**: The `/admin` post editor does not support editing/saving claim ledger structures. Since this sprint is strictly visual/technical polish of existing fields, adding these variables to the Supabase form is postponed to a future database-expansion sprint.
- **No em dash usage**: Confirmed zero use of the em dash character (`\u2014`) in any modified text.
- **No fake fieldwork language**: Handled all visual upgrades while maintaining absolute editorial honesty regarding NaLI's secondary evidence-journal positioning.

---

## 5. Conflict Risk with Claude Code

- **Zero Risk**: No code overlapping with `/jurnal` routes or components was modified. 
- **Merge recommendation**: Feature branch `nali-surgical-research-module-polish` should be merged into `main` after Claude Code finishes its `/jurnal` rebuild.
