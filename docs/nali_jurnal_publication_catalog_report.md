# Jurnal Publication Catalog Report (specific-publication model)

Date: 2026-06-13

## Model correction

`/jurnal` no longer catalogs generic journal homepages (ZooKeys, PLOS ONE, etc.). It now
catalogs SPECIFIC publications: real papers/reports/documents/datasets with a direct,
official, downloadable PDF. Each record is one specific item with a real title, authors,
DOI, journal/collection, and a VERIFIED official open-access PDF URL.

Model: `RawPublication` in `lib/types.ts` (publicationType now: journal_article, report,
book, monograph, proceeding, dataset, archive_record, museum_record,
institutional_document; added `journalOrCollection`; `download.primaryKind` =
official_pdf | official_document | official_dataset | external_source_only).

## How the data was gathered (truthful, verifiable)

`scripts/fetch-openalex-pubs.mjs` queries the OpenAlex API for Indonesia-focused topics,
filters to open-access works with a DOI, and keeps only records whose official OA PDF URL
actually resolves to a real PDF (Range request + `%PDF` magic-byte / content-type check).
`scripts/load-publications.mjs` + the generated `content/jurnal/publications/batch-1.ts`
hold the records. No invented titles/DOIs/PDFs; no mirrors, Sci-Hub, or LibGen; PDFs come
from the publisher / repository / institution (Nature, Cambridge/Oryx, Zootaxa, Biodiversitas
/Smujo, Pachyderm, university repositories, diamond-OA journals, etc.).

## Batch 1 status

- Specific publication records: 24 (all journal_article)
- Distinct publishers/institutions: 18
- With DOI: 24/24
- With a verified official PDF: 24/24
- Primary download is the real PDF ("Download PDF"): 24/24
- NaLI metadata TXT: secondary only ("Unduh metadata NaLI"), never the primary action
- Generic journal-name titles: 0
- Invalid self-authored notes: 0
- Em dash: none

Indonesia topics covered: Anak Krakatau 2018 tsunami, Kelud lahar, Komodo morphometry,
tarsier habitat, coelacanth contaminants, Javan rhino population, mangrove blue carbon,
Jakarta subsidence, proboscis monkey, Javan gibbon, Sulawesi macaque, Pari seagrass carbon,
reef fish, a new Sulawesi nudibranch, Java sea-level rise, Rafflesia ex situ, orchids,
butterflies, Gede-Pangrango restoration, marine-protected-area participation, mud-crab
fisheries, Cimanuk water quality, agroforestry, bamboo.

## UI

- Listing card: specific title, journal/collection + year, "PDF tersedia" badge, access
  status, synopsis, and a "Download PDF" button.
- Detail: primary "Download PDF" (real publisher/repository PDF), then "Buka sumber asli",
  then "DOI", then a small secondary "Unduh metadata NaLI". Shows authors, year, DOI, source
  URL, synopsis, why-it-matters, limitations.

## Covers (Path 1)

Covers are de-prioritised this round. All 24 render as bibliographic source-cards (real
title + journal/publisher). Per the founder's Path 1, future cover work will only use
legally displayable visuals (open-access / public-domain / institutional); no hotlinking of
publisher images.

## Validation

`npm run check:editorial` fails on: generic journal-name title, missing sourceUrl/publisher/
type/accessType/synopsis/whyItMatters/limitations/checkedAt, primary download = metadata TXT,
official_pdf whose URL is not a PDF/document URL, leaked note slugs, duplicate slugs/synopses,
or em dashes. It reports specific-record counts, PDF/DOI coverage, and primary-download kind.

## Toward 500

Batch 1 = 24 of 500 specific publications. Future batches add more verified OA papers plus
official institution documents/datasets (IUCN assessments, BHL/Internet Archive PD books,
World Bank / FAO reports, GBIF datasets) that have direct official downloads.
