# Wrong Jurnal Model Audit and Correction

Date: 2026-06-13

## What was wrong

The previous `/jurnal` implementation contained 49 NaLI-authored knowledge notes
(short explainers such as "Komodo dan sebaran pulaunya", "Gajah Sumatra, perawat
hutan yang kehilangan ruang", "Maleo tidak mengerami telurnya..."). That was a
misinterpretation of the founder's intent. `/jurnal` must be a catalog of REAL
external journals and publications found online, each shown with its real
cover/visual, title, and an Indonesian synopsis written by NaLI. It is a publication
catalog, not a NaLI-written encyclopedia.

## How many self-authored entries existed

49 NaLI-authored note entries.

## What was removed or moved

- The 4 note cluster files were MOVED (not deleted) to
  `content/_jurnal-notes-backlog/clusters/` for possible future use as a separate
  "Catatan Pengetahuan" section. They are excluded from the build (tsconfig) and no
  longer imported or rendered under `/jurnal`.
- The note cover manifest (`covers.json`), the note helper (`_helper.ts`), and the
  NaLI-fetched note cover images were removed from the live tree.
- 49 `commons-*.mdx` cover-source records plus the `iucn-red-list` and `gbif-species`
  umbrella sources created for the notes were removed (their `usedInJurnalIds`
  pointed to removed notes). Arsip Sumber returns to 146 verified article sources.

## What was preserved

- The 49 note bodies (in the backlog folder, not lost).
- All 32 articles and their images, Arsip Sumber (146), and trust pages.

## What replaced them

`/jurnal` is rebuilt as **Jurnal NaLI, Katalog Jurnal dan Publikasi Ilmiah Terbuka**:
a catalog of real external publications. Batch 1 has 24 real records (19 journals,
3 institutional pages, 1 dataset, 1 archive), each with a traceable URL, real
publisher/institution, publication type, access type, an Indonesian synopsis (a
summary OF the work, clearly not the work itself), a "why it matters" note,
limitations, a cover (real licensed visual where available, else a bibliographic
source-card), and a public metadata download.

The old note-era reports (`nali_jurnal_500_entries_report.md`,
`nali_jurnal_cover_synopsis_report.md`, `nali_jurnal_download_report.md`,
`nali_jurnal_real_cover_replacement_report.md`) describe the superseded note model
and are kept only as history. The current model is described in
`nali_jurnal_publication_catalog_report.md`.
