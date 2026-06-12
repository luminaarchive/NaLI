# NaLI Full Fix Sprint, Start Report

Date: 2026-06-12

## Branch

Work continued on the existing feature branch `mandatory-visible-images-all-articles`
rather than creating a fresh `full-article-humanize-images-jurnal-500` branch, because
the visible-image layer for all articles was already in progress (uncommitted) on this
branch. Starting a new branch would have orphaned that work. The branch name deviation
is noted here for traceability.

## Commit baseline

- Local main commit at start: d54513af187bd53b79a604a8afd3ecc95954ed05
- origin/main at start:       d54513af187bd53b79a604a8afd3ecc95954ed05
- These match the founder-reported pre-sprint commit, so there was no production mismatch
  at the git level. Production verification is tracked in the final report.

## Content counts at start

- Published articles: 32
- Source archive entries: 146
- Jurnal entries: 0 (the Jurnal section did not exist yet)

## Problem summary at start (founder report)

1. Articles still read like generic template notes in places.
2. Articles did not visibly display images for the founder.
3. Em dash characters needed to be removed everywhere.
4. The archive needed deeper research.
5. A new Jurnal section was required beside Artikel, targeting 500 natural-knowledge entries.

## What the audit found already done on this branch (uncommitted)

- All 32 published articles carry a renderable visual (`images[].src` or `diagrams[].src`),
  and the article renderer ships them as visible figures with caption and credit.
- 0 em dash characters across app, components, content, lib, scripts, docs, README, public.
- 0 banned template phrases in article bodies.
- Article bodies were humanized in the prior commit (d54513a).

## What this sprint added

See `docs/nali_full_fix_final_report.md` for the full account.
