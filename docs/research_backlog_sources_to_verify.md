# Research Backlog — Sources to Verify and Add (Phase 6)

_The sprint's stretch target is 80–150 verified Arsip Sumber entries. This session
brought the archive from 25 → **38** entries, all web-verified or already-traceable.
Reaching 80+ is a continuation task. This file lists the next sources to verify and
add — NONE of these are in the public archive yet, precisely because they have not
been web-verified to a stable URL/DOI this session. **Do not publish any of these
until verified.**_

## How to clear an item

For each candidate, confirm and record:
1. Stable URL / DOI / archive / catalog page (resolves, not paywalled-only).
2. reliability tier (primary / high / medium / contextual / needs_caution).
3. What claim it supports + its limitation.
4. Which article/series uses it.
5. Any license/copyright issue.

Then write `content/sources/<slug>.mdx` with full frontmatter and run `npm run check:editorial`.

## Biodiversity & conservation (target: ~15 more)

- IUCN Red List: Pongo abelii (Sumatran orangutan), Pongo pygmaeus (Bornean),
  Bubalus depressicornis/quarlesi (Anoa), Babyrousa spp. (Babirusa), Tarsius spp.,
  Paradisaeidae (Cenderawasih), Panthera tigris sondaica (already have via article),
  Harimau Bali (Panthera tigris balica — listed Extinct). → verify each taxon/assessment ID.
- GBIF country page Indonesia (occurrence aggregator) + specific species pages.
- Biodiversity Heritage Library scans (Hoogerwerf, colonial naturalists).
- BRIN / former LIPI repositories; Indonesian university repositories (e.g. IPB, UGM).
- KLHK conservation status decrees (P.106/2018 protected species list).

## Volcanoes, geology & natural phenomena (target: ~10 more)

- GVP: Krakatau (have 1883), Tambora (have), Kelud, Dieng, Sinabung, Agung, Semeru,
  Galunggung. → each has a stable `volcano.cfm?vn=` ID.
- PVMBG / MAGMA Indonesia (magma.esdm.go.id) — official monitoring portal.
- USGS, NASA Earth Observatory specific event pages (e.g. Anak Krakatau 2018 imagery).
- Oppenheimer / Self & Rampino papers on Tambora 1815 climate impact ("Year Without a Summer").
- Delmelle & Bernard — Kawah Ijen crater-lake geochemistry (confirm exact journal/DOI).

## History & archives (target: ~12 more)

- KITLV / Leiden University Libraries digital collections.
- Nationaal Archief (NL) VOC archives; ANRI (Arsip Nasional RI) finding aids.
- Rijksmuseum / Wereldmuseum (Tropenmuseum) object pages (public-domain images).
- Treaty of Bongaya 1667 (Makassar) — scholarly edition / historiography.
- Jalur Rempah (jalurrempah.kemdikbud.go.id) — official spice-route program.
- Nagarakretagama / Babad Diponegoro critical editions (have base entries; add catalog pages).
- Borobudur restoration: UNESCO + Soekmono technical reports (have UNESCO base).

## Environment & public-interest investigation (target: ~12 more)

- peraturan.go.id / JDIH specific regulations (mining, forestry, EIA/AMDAL).
- Global Forest Watch dataset pages (have Indonesia base); Hansen et al. deforestation data.
- World Bank / ADB / UNEP / FAO Indonesia reports (river basins, mangroves, peat).
- BRGM (Badan Restorasi Gambut dan Mangrove, brgm.go.id) — peat/mangrove restoration.
- Nickel/Morowali: official EIA documents and government data (write cautiously, systemic framing).
- Citarum: official water-quality monitoring reports (have Perpres + report base).
- Mangrove: KKP / blue-carbon datasets.

## Notes

- Aggregators (GBIF, iNaturalist, ResearchGate) are discovery aids, not sole proof —
  add only with explicit license and pair with a primary source.
- For any source without a free URL, add a `limitations` note describing the access
  constraint (catalog reference) so the validator and readers know why.
