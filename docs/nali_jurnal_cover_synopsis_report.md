# Jurnal Cover and Synopsis Report

Date: 2026-06-12

## Coverage

- Total Jurnal entries: 26
- Entries with a visible cover: 26
- Entries without a visible cover: 0
- Entries with a synopsis: 26
- Entries without a synopsis: 0

Every entry has both a mandatory visible cover and a human-written synopsis,
rendered on the `/jurnal` listing cards and on each `/jurnal/[slug]` detail page.

## Cover type breakdown (updated 2026-06-13)

The covers were REPLACED. They are no longer internally generated NaLI diagrams.
Every cover is now a real, license-verified source visual from Wikimedia Commons or a
public archive, tied to a cited source. See
`docs/nali_jurnal_real_cover_replacement_report.md` for the full per-entry table.

- public_domain_visual: 17
- archive_thumbnail: 4 (historical natural-history plates, lithographs, stamps, maps)
- official_source_preview: 3 (NASA / ASTER satellite imagery, public domain)
- museum_thumbnail: 2 (museum specimens)
- source_card_fallback: 0

26 of 26 entries use a real source cover; 0 fallbacks. Each cover image is unique
(no reused template), license-checked (public domain / CC0 / CC BY / CC BY-SA only),
downloaded to `public/images/jurnal-covers/<slug>.<ext>`, and recorded as a cited
source (`content/sources/commons-<slug>.mdx`).

## Cover metadata (per entry)

Built by `content/jurnal/_helper.ts`:

- id: `cover-<slug>`
- src: `/images/jurnal-covers/<slug>.svg` (visibly rendered, not metadata-only)
- type: map | diagram | timeline
- title, alt, caption (authored per entry)
- creator: "NaLI by NatIve"
- license: "Internal explanatory visual for NaLI Jurnal"
- attribution: "Visual internal NaLI by NatIve, non-AI"
- sourceUrl: the Arsip Sumber record of the entry's first source (the source used)
- checkedAt: entry checkedAt date
- relatedJurnalIds: [slug]
- caption always contains "Visual penjelas, bukan foto lapangan."

## Synopsis rules enforced

Each synopsis is 35 to 80 words, Indonesian, concrete, explains why the entry
matters, avoids generic template sentences, and contains no em dash. The validator
rejects synopses outside 35 to 80 words, banned generic phrases, em dashes, and any
duplicate synopsis across entries.

## Sample rendered route checks

Verified against a local production server:

- `/jurnal`: 26 distinct cover SVGs present in the listing HTML.
- `/jurnal/maleo-burung-pengubur-telur`: cover figure (data-jurnal-cover),
  synopsis block (data-jurnal-synopsis), and cover image all present.
- Route smoke samples 12 detail pages and asserts cover + synopsis + download link
  render: 12/12 pass.

## Validation result

- `npm run check:editorial`: pass. Summary reports jurnal with cover 26/26,
  jurnal with synopsis 26/26.
- `npm run check:routes`: pass (62/62 sampled routes, including jurnal cover and
  synopsis assertions).

## Known limitations

- Covers are explanatory schematics, not licensed photographs. When a safe-license
  real photo, archival image, or open-access map becomes available for a subject, it
  can replace the internal cover (the data model supports type photo / archive_image /
  map with full license metadata).
- Jurnal bodies currently run about 156 to 201 words, below the 250 to 600
  recommended range (length WARNING, not a failure). Enriching bodies is follow-up.
