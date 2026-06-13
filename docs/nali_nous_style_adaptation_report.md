# NaLI x Nous Research Style Adaptation Report

**Date**: 2026-06-13  
**Sprint Name**: NaLI Nous Style Adaptation Sprint  
**Target Branch**: `nali-nous-style-adaptation`  

---

## 1. What was Studied on Nous Research
We audited the interaction design and visual layout of [Nous Research](https://nousresearch.com/), identifying key mechanisms that elevate their research lab aesthetic:
- **Terminal Metadata Framing**: Surrounding page components and hero layouts with server-like data indicators (e.g., SEED, MODE, MODE CHECKPOINT).
- **Divider and Grid Discipline**: Separation of content with subtle dividers, using absolute border containment rather than floating cards.
- **Card-level Header/Body Separation**: Segmenting card units into explicit metadata headers and description bodies using dashed lines.
- **Arrow Interaction Cues**: Simple translation-based hover effects on arrows (`→`, `↗`) indicating interactive folder navigation.

---

## 2. Style Principles Adopted & Rejected

### Style Principles Copied/Adapted:
- **Modular Data-Dense Header Strips**: Applied to article cards, pillar blocks, and page segments. Translates Nous's model statistics into NaLI's bilingually labeled metadata registries (e.g., `BASIS BUKTI // EVIDENCE REGISTER`, `REF NO.`).
- **Interactive Link Arrow Motion**: Created standard opt-in `.interactive-link` and `.link-arrow` / `.link-arrow-diagonal` states to provide organic movement on hover.
- **Counter Tags**: Prefixed list items in sections (Claim Ledger, Limitations, Catatan Riset, Prosedur Metode) with clean serial tags (`#01`, `#02`, etc.) inside dashed border badges.

### Style Principles Rejected (As Unsafe):
- **Neon Colors & Gradients**: Excluded as they clash with NaLI's forensic off-white paper and teal/black ink archetype.
- **AI-generated Cover Artwork**: Rejected. Only real license-validated images and diagrams or clean card representations are allowed.
- **Heavy Javascript Motion Libraries**: Banned to protect performance and avoid layout shifts.

---

## 3. NaLI Translation & Vocabulary Applied
- AI lab jargon (`TRAINING`, `NODES`, `SEED`) was strictly avoided.
- Custom archival vocabulary was integrated:
  - `BASIS BUKTI` (Evidence Basis)
  - `SARINGAN` (Filter)
  - `JEJAK SUMBER` (Source Ledger/References)
  - `REGISTRASI LOKASI` (Location Registry)
  - `PROSEDUR METODE` (Methodology steps)
  - `CATATAN DATA` (Research Notes)

---

## 4. Implementations Detailed

### A. Article Cards (`components/ArticleCard.tsx`)
- Segmented each card into a top metadata header and body layout.
- Added a `REF NO. NL-XXXXXXXX` prefix (based on the slug) to denote a ledger entry.
- Added a bottom metadata strip containing publication date, reading time, source count, and a confidence badge.
- Added a clear footer CTA: `Periksa Data →` responding with arrow slide animation on hover.

### B. Homepage (`app/page.tsx`)
- **WaveHero protected**: Intact. Framed the canvas header with a dither/scaling configuration strip to fit the computational plate aesthetic.
- **Section Labels upgraded**: Replaced plain tags with bilingual monospace badges like `INDEKS BUKTI TERBUKA // CATATAN TERBARU`.
- **Link polish**: Integrated arrow animations into all landing route actions and buttons.

### C. Article Page Modules (`app/articles/[slug]/page.tsx` & `components/SourceList.tsx`)
- **Basis Tulisan Banner**: Restructured into a dual-grid ledger box showing `Metode Analisis` and `Verifikasi Lapangan` columns.
- **Claim Ledger & Limitations**: Transformed into structured dashed card decks.
- **Source List**: Upgraded the simple reference list into modular cards with `#01` counters and diagonal hover links.
- **Credits & Deviations**: Upgraded the image credits, external visual pointers, and deviation notes to use bilingual monospace headers.

### D. Archive, Series, & Info Pages
- **Source Archive table & cards** (`components/SourceArchive.tsx` & `app/arsip-sumber/[slug]/page.tsx`): Rendered visual publisher chips (`JURNAL`, `ARSIP`, etc.) alongside geography, year, and reliability badges.
- **Series page** (`app/seri/page.tsx`): Polished the loop into structured dossier records with `REF NO. SER-...` indicators.
- **Methodology registry** (`app/metodologi/page.tsx`): Transformed the raw list into a grid of procedural steps.
- **Info Pages** (`app/tentang/page.tsx` & `app/kontak/page.tsx`): Re-aligned the text into clean card containers with typewriter headers.

---

## 5. Scope Protection Checklist

- **Files Changed**:
  - `app/robots.ts`
  - `components/SourceArchive.tsx`
  - `app/arsip-sumber/[slug]/page.tsx`
  - `app/articles/[slug]/page.tsx`
  - `components/ArticleCard.tsx`
  - `components/SourceList.tsx`
  - `components/PageHeader.tsx`
  - `components/ArticleList.tsx`
  - `app/page.tsx`
  - `app/metodologi/page.tsx`
  - `app/seri/page.tsx`
  - `app/tentang/page.tsx`
  - `app/kontak/page.tsx`
  - `app/catatan-lapangan/page.tsx`
  - `app/peta-eksplorasi/page.tsx`
  - `app/globals.css`
- **Homepage Touched**: Yes (restricted to safe, additive metadata labels and hover polish below the hero section).
- **Hero Touched**: No (the WaveHero component, hero copy, layout, and top metadata framing are completely untouched).
- **Jurnal Touched**: No (zero files in `app/jurnal/*`, `content/jurnal/*`, or `lib/jurnal*` were modified).
- **Conflict Risk with Claude Code**: Zero. The `/jurnal` boundaries were fully respected.
- **No Em Dash**: Verified. No em-dash characters (unicode \u2014) exist in the edited files.
- **Honest Copy**: Preserved. No fake fieldwork claims were added.

---

## 6. QA & Build Status

- **Linter**: `npm run lint` compiles cleanly.
- **Typecheck**: Fails in `content/jurnal/_pub.ts` and `publications/batch-1.ts` due to missing `RawPublication` types left by the separate Jurnal task.
- **Editorial check**: All editorial checks passed.
- **Build status**: Unsuccessful due to the Jurnal compile error.
- **Merge readiness**: **No**. The branch is blocked by the incomplete Jurnal rebuild on the main line.

---

## 7. Merge Recommendations
Keep this branch parked. Once Claude Code finishes the Jurnal catalog rebuild and `main` compiles successfully, rebase `nali-nous-style-adaptation` on the latest `main`, run the local dev server to execute route/image checks, and complete the merge.
