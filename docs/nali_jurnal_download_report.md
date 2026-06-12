# Jurnal Public Download Report

Date: 2026-06-12

## Coverage

- Total Jurnal entries: 26
- Entries with a working public download: 26
- Entries without a working download: 0

## Download format

- Format: `.txt` (text/plain; charset=utf-8)
- Route: `/jurnal/[slug]/download.txt` (Next.js route handler, statically generated,
  one file per entry)
- Public, no login, no admin, no payment, no tracking gate.
- The detail page renders a visible "Unduh catatan (TXT)" button near the top, with a
  `download` attribute suggesting filename `nali-jurnal-<slug>.txt`.

## Download content

Each file is human-readable and includes:

- source URL of the entry on the site
- title, dek, synopsis
- category, topics, geography
- confidence label
- key takeaway (INTI)
- full body (ISI)
- limitations (BATASAN)
- source list with source titles and resolvable URLs (SUMBER)
- cover metadata (title, caption, attribution, license, source) (COVER)
- checkedAt (DICEK)
- a license / usage note

## Sample download URLs checked

- /jurnal/maleo-burung-pengubur-telur/download.txt
- /jurnal/komodo-lima-pulau/download.txt
- /jurnal/tambora-1815-tahun-tanpa-musim-panas/download.txt
- plus 9 more sampled by the route checker (12 total)

## Content type and validation

The route checker (`scripts/check-public-routes.mjs`) verifies, for each sampled
download:

- HTTP 200
- content-type is text/plain or text/markdown
- body includes the title
- body includes SINOPSIS, SUMBER, BATASAN, DICEK
- body contains no em dash
- body contains no banned template phrase

Result: 12/12 sampled downloads pass. Manual check of headers confirms
`content-type: text/plain; charset=utf-8` and a content-disposition filename.

## Sitemap and robots

Download routes are intentionally NOT added to the sitemap (the sitemap focuses on
human-readable pages). Downloads are public and not blocked in robots.

## Known limitations

- Only `.txt` is provided in this run. `.md` and `.json` are feasible follow-ups using
  the same data; they were not added to keep the surface small and dependency-free.
- No PDF generation (the repo has no safe PDF path; heavy dependencies were avoided).
