# Jurnal Library Report

Date: 2026-06-12

## Honest status

Target: 500 natural-knowledge entries.
Completed this run: 26 genuine, source-backed entries.
This is an honest partial count. The 500 target is NOT met and is NOT claimed as done.

The founder explicitly chose the approach "infra plus genuine batches, honest count":
build the complete Jurnal system now, author as many real, distinct, source-backed
entries as quality allows this run, then continue in follow-up runs until 500. No filler
entries were created to inflate the count, and no sources were invented.

## What was built (complete and verified)

- New section `/jurnal` with a nav link placed beside "Artikel"
  (order: Artikel, Jurnal, Seri, Arsip Sumber, Metodologi, Tentang, Kontak).
- Listing page `/jurnal` with live count, search, and filters by category, topic, and
  geography, using the existing NaLI card and archive visual language (no redesign).
- Detail pages `/jurnal/[slug]` (static, SSG) showing title, dek, body, key takeaway,
  source list (linked to Arsip Sumber), limitations, confidence label, and checkedAt.
- Type `JournalEntry` and category labels in `lib/types.ts`.
- Loader `lib/jurnal.ts` (de-dup by slug, reading time, category/topic/geography helpers).
- Data as type-safe TS cluster files in `content/jurnal/clusters/*.ts`, combined in
  `content/jurnal/index.ts`. This is the single source of truth.
- Sitemap now includes `/jurnal` and every entry route.
- Validation extended (see below).

## Cover, synopsis, and download coverage

- Entries with a visible cover: 26 of 26, all REAL license-verified source visuals
  (public domain / CC0 / CC BY / CC BY-SA) from Wikimedia Commons and public archives,
  tied to a cited source. 0 fallbacks. Cover kinds: public_domain_visual 17,
  archive_thumbnail 4, official_source_preview 3, museum_thumbnail 2. See
  `docs/nali_jurnal_real_cover_replacement_report.md`.
- Entries with a human synopsis (35 to 80 words): 26 of 26.
- Entries with a working public `.txt` download: 26 of 26. Route format:
  `/jurnal/[slug]/download.txt`. See `docs/nali_jurnal_download_report.md`.
- Mandatory bar for any NEW entry going forward: sourceIds, synopsis, visible cover,
  limitations, checkedAt. No cover means no publish; no synopsis means no publish.

## Entries this run: 26

Category breakdown:

- satwa: 10
- geologi: 8
- laut: 3
- hutan: 2
- pesisir: 1
- iklim: 1
- perairan: 1

Topic and geography breakdown is filterable live on `/jurnal`.

## Source coverage

- Every entry cites at least one real entry from Arsip Sumber.
- Distinct sources cited across the 26 entries: 77 of the 146 archive entries.
- The validator fails the build if any `sourceIds` does not resolve to a real source file.

## Quality checks

- Duplicate slug check: pass (no duplicates).
- Duplicate body text check: pass (no shared bodies).
- No first-person fieldwork language: pass.
- No banned template phrases: pass.
- No em dash characters: pass.
- Word count: entries currently run 156 to 201 words. The recommended range is 250 to 600,
  so each entry is flagged as a length WARNING (not a failure). These are genuine, complete,
  concise entries; enriching each toward 250 to 600 words is tracked as follow-up work.

## Performance

- 26 detail routes prerender as static HTML at build with no measurable build-time cost.
- The data lives in TS cluster files, so adding entries does not add per-file MDX parsing.
  If the corpus grows large, the listing can be paginated; the current size needs no change.

## Remaining work to reach 500

- About 474 more genuine, source-backed entries across the planned thematic clusters
  (endemic species, conservation status, volcanoes, oceans and reefs, forests and peat,
  mangroves and coast, birds and migration, Wallacea, historical natural archives, maps
  and expeditions, climate and disaster science, rivers and wetlands, plants and ecosystems,
  general natural-science explainers tied to Indonesia).
- Many future entries will require adding new verified sources to Arsip Sumber, linked via
  the new `usedInJurnalIds` field (validator already supports this).
- Standardize entry length toward the 250 to 600 word target.
