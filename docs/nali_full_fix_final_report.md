# NaLI Full Fix Sprint, Final Report

Date: 2026-06-12
Branch: `mandatory-visible-images-all-articles`

This report is honest about what is done and what is not. The 500-entry Jurnal bar and the
250-plus source bar are NOT met yet, so this sprint is NOT claimed as "done".

## What changed

### Articles (quality)

- Removed a "spun" templated tail from 31 of 32 articles. Each article had ended with the
  same generic meta sections ("Detail yang menentukan pembacaan", "Lapisan lokasi dan waktu",
  "Membaca rujukan tanpa kehilangan dunia nyata") whose skeleton was identical across
  articles and only swapped in topic nouns. This is exactly the "filler sections that could
  fit any article" pattern the contract forbids.
- After removal, every article keeps its genuine, topic-specific structure (opening,
  context, mechanism, public misconception, evidence, why-it-matters, uncertainty) and ends
  on a real closing section.
- Body length note: the validator counts body prose only. After filler removal, genuine
  bodies run roughly 460 to 550 words (the templated tail had been padding length toward the
  900 floor). Per the founder's no-filler rule, the filler was not re-added. Articles are now
  shorter but genuinely human and topic-focused. Re-deepening bodies with real, sourced
  content toward the 900-word floor is follow-up work. The validator emits these as WARNINGS,
  not failures.

### Articles (images)

- All 32 published articles render at least one visible image figure (licensed photo and/or
  a non-AI internal explanatory diagram), each with caption and credit. Verified by the
  rendered-route checker, not only by metadata. Coverage: 32/32.

### Em dash

- 0 em dash characters anywhere in app, components, content, lib, scripts, docs, public,
  README, and package metadata. Verified by grep and by the validator, which fails the build
  on any em dash in scanned text files. A stray soft hyphen introduced during authoring was
  also found and removed.

### Jurnal (new section)

- New `/jurnal` section with a nav link beside "Artikel", listing page with count, search,
  and filters, and SSG detail pages. 26 genuine, source-backed entries this run.
- See `docs/nali_jurnal_500_entries_report.md` for the full Jurnal account.

### Validation

- `scripts/validate-editorial-content.mjs` extended to:
  - validate every Jurnal entry (title, slug, body, dek, keyTakeaway, category, confidence,
    checkedAt as ISO date, limitations, topics, geography);
  - require Jurnal `sourceIds` to resolve to real source files;
  - reject first-person fieldwork, banned phrases, demo terms, duplicate slugs, and duplicate
    bodies in Jurnal; warn on word count outside 250 to 600;
  - accept `usedInJurnalIds` on sources (resolving to real Jurnal slugs) as an alternative to
    `usedInArticleIds`;
  - print a summary: sources checked, published articles, article image coverage, jurnal
    entries, and em dash status.
- `scripts/check-article-images.mjs` (pre-existing) crawls every published article route and
  fails unless a visible `<img>` figure with credit is rendered.
- `scripts/check-public-routes.mjs` (new) smoke-tests core pages plus sampled article, jurnal,
  and source routes, confirms `/admin` is gated, and confirms a bogus route returns 404.
- `scripts/load-jurnal.mjs` (new) lets the Node validators read the TypeScript Jurnal data
  (transpile in-memory, import via data URL) so TS stays the single source of truth.

## Routes added

- `/jurnal` (listing)
- `/jurnal/[slug]` (26 SSG entry pages)

## Counts

- Source count before: 146
- Source count after: 146 (the deep source-archive expansion to 250-plus was NOT done this
  run; it remains outstanding, see "Not done")
- Jurnal entries before: 0
- Jurnal entries after: 26
- Articles checked: 32
- Articles with visible images: 32

## QA results (all run locally)

- `npm run lint`: clean (no warnings or errors)
- `npm run typecheck`: clean
- `npm run check:editorial`: pass (warnings only: article and jurnal length)
- `npm run build`: success (all routes built, /jurnal static, /jurnal/[slug] SSG)
- `npm run check:article-images`: pass (32/32 render visible image figures with credit)
- `npm run check:routes`: pass (50/50 sampled routes behave as expected)
- Rendered spot checks: no em dash and no banned phrases on home, /articles, /jurnal,
  a jurnal detail, and the Anak Krakatau article; jurnal detail shows body, sources,
  key takeaway, and limitations; nav shows Artikel then Jurnal.

## Visual design preservation

- No redesign. Palette, typography, spacing, dashed-border card language, nav style, and
  footer were preserved. The Jurnal pages reuse `PageHeader`, the archive filter pattern,
  `ConfidenceBadge`, and the existing card styling.

## Not done (honest)

1. Jurnal is at 26 of 500 entries. Not done.
2. Source archive is still 146; the expansion to 250-plus verified entries was not performed
   this run. Not done.
3. Article bodies are now genuinely human but concise (about 460 to 550 words); deepening
   toward the 900-word floor with real sourced content is outstanding.
4. Jurnal entries run 156 to 201 words; standardizing toward 250 to 600 is outstanding.

## Production deployment status

- Not pushed to main. Because the 500-entry and source-expansion bars are not met, this work
  is committed to the feature branch only and is NOT claimed as done. Production
  (https://nalijournal.vercel.app) still reflects the previous main commit until the founder
  decides to ship the partial progress or the remaining work is completed.

## Continuation instructions

- Add Jurnal entries in new files under `content/jurnal/clusters/`, export an array, and
  register it in `content/jurnal/index.ts`. Cite existing sources, or add new verified
  sources to `content/sources/` with `usedInJurnalIds` linking back to the entry slugs.
- Run `npm run check:editorial`, then `npm run build`, then start the server and run
  `npm run check:article-images` and `npm run check:routes` before any push.
- Do not claim 500 until 500 genuine entries exist.
