# Jurnal Publication Catalog Report

Date: 2026-06-13

## Model

`/jurnal` = Jurnal NaLI, Katalog Jurnal dan Publikasi Ilmiah Terbuka. Each item is a
real external publication record (`RawPublication` in `lib/types.ts`), not a
NaLI-authored note. Records live in `content/jurnal/publications/*.ts`; covers in
`content/jurnal/pub-covers.json` (built by `scripts/build-publication-covers.mjs`).

## Batch 1 status

- External publication records: 24
- By type: journal 19, institutional_page 3, dataset 1, archive_record 1
- Distinct publishers/institutions: 16 (Cambridge, Elsevier, Springer, Wiley, PLOS,
  Pensoft, Copernicus, NUS, BRIN, Smujo, IUCN, Smithsonian, NASA, UNESCO, BHL, EGU)
- Invalid self-authored notes: 0
- With public metadata download: 24/24
- Em dash: none

## Covers

- Real, license-verified covers: 5/24 (zookeys-pensoft, nature-conservation-pensoft,
  plos-one, iucn-red-list-page, nasa-earth-observatory). These come from the journal/
  institution logo or official visual on Wikidata/Wikimedia Commons, verified to be
  public domain or CC (CC BY / CC BY-SA), downloaded to
  `public/images/jurnal-covers/<slug>.png`.
- Source-card fallbacks: 19/24. These are commercial publishers (Elsevier, Springer,
  Wiley, Cambridge) and OJS journals whose cover/logo reuse license could not be
  verified as safe. Per the founder's own rule ("do not host unclear-license covers;
  use a source-card fallback"), they render as a restrained bibliographic card showing
  the real title, publisher, and "Cover asli tidak ditampilkan karena lisensi belum
  jelas." No copyrighted image is hosted; no license is invented.

### Increasing the real-cover share

The cover pipeline only accepts public domain / CC0 / CC BY / CC BY-SA visuals. To raise
the real-cover share legally, future batches should favour publications that expose a
clearly licensed visual: open-access journals with a CC logo on Wikidata (PLOS,
Frontiers, MDPI, PeerJ, eLife, Pensoft, Copernicus families), institutional sources with
public-domain imagery (NASA, NOAA, USGS, IUCN, GVP), and public-domain books/monographs
(BHL, Internet Archive). Commercial closed-access journal covers will remain source-cards
unless the publisher's terms permit display.

## Each record carries

title, publicationType, publisherOrInstitution, sourceUrl (traceable), optional DOI/PDF,
Indonesian synopsis (summary of the work), whyItMatters, topics, geography, language,
accessType, relatedSourceIds / relatedArticleIds, limitations, checkedAt, a cover, and a
public `/jurnal/[slug]/download.txt` metadata file.

## Validation

`npm run check:editorial` reports publication count, by type, distinct publishers, real
covers, source-card fallbacks, DOI/PDF counts, download coverage, invalid self-authored
notes (must be 0), and em dash status. It fails on missing sourceUrl/publisher/type/
accessType/synopsis/cover/download/limitations, note-style titles, unresolved related ids,
duplicate slugs/synopses, and em dashes. The fallback-ratio over 20% is a warning (legal
reality for commercial covers), not a hard failure.

## Toward 500

Batch 1 is 24 of a 500 target. Next batches add more real external publications, weighted
where possible toward open-access and institutional sources that have displayable covers.
