# NaLI Fase 7, Knowledge Population Pipeline

Local-first pipeline that grows the **Jurnal** catalog and the **Arsip Sumber**
from REAL open-access scholarly metadata. Nothing is invented: every title,
author, DOI, venue, year, and abstract is copied verbatim from the provider
(OpenAlex), and every record is kept only if its DOI plus a live PDF or landing
page resolve. Better fewer valid entries than more fabricated ones.

## What it produces

- `content/jurnal/publications/batch-N.ts`, real external publications with real
  DOI / venue / authors and a verified OA PDF or live landing page. Auto-registered
  in `content/jurnal/index.ts`.
- `content/sources/<slug>-src.mdx`, one Arsip Sumber entry per publication,
  cross-linked to the jurnal record via `usedInJurnalIds` (and the jurnal record
  links back via `relatedSourceIds`). Satisfies the editorial validator.

Articles and Investigasi are **not** mass-generated. The editorial validator
requires a displayed licensed image, a per-claim Claim Ledger, and honest
limitations on every published article, so those stay deep-research editorial
work (see `lib/research-backlog.ts`). Mass-generating article prose would mean
fabricating analysis, which the trust rules forbid.

## Files

| File | Step | Role |
|---|---|---|
| `scripts/mine/harvest.mjs` | 2-8 | Harvest, normalize, dedupe, score 0..1 |
| `scripts/mine/generate.mjs` | 9-13, 15 | Verify liveness, emit jurnal + linked sources, checkpoint |
| `content/raw/raw_dataset.json` | 4-5 | Normalized deduped dataset (gitignored, local) |
| `content/cache/openalex/*.json` | - | Per-keyword raw cache, makes harvest resumable (gitignored) |
| `content/logs/progress.json` | 15 | Checkpoint: batches, totals vs target |

`content/raw` and `content/cache` are gitignored: they are bulky, regenerable,
and contain raw third-party abstracts (some with characters the editorial gate
bans in published text). Generated jurnal/source files and `progress.json` are
committed.

## How to run (resume any time)

```bash
# 1. Harvest metadata into the local dataset (idempotent; caches per keyword).
#    OpenAlex rate-limits, so large runs are slow; the cache makes re-runs instant.
node scripts/mine/harvest.mjs --per-page 50            # full keyword set
node scripts/mine/harvest.mjs --max-keywords 80        # or a capped run

# 2. Convert the best UNUSED records into a new batch (skips DOIs already used).
node scripts/mine/generate.mjs --count 50              # writes batch-N + sources
node scripts/mine/generate.mjs --count 50 --dry        # preview selection only

# 3. Verify and commit.
npx tsc --noEmit && npm run check:editorial && npm run build
git add -A && git commit -m "content: knowledge pipeline batch N"
```

Run step 2 repeatedly; each run accumulates toward the 300 target. `progress.json`
records totals after every batch so you always know how far along you are.

## Scoring rubric (0..1, drop below 0.6)

abstract present (+0.22) · DOI (+0.16) · OA with PDF (+0.16) · named venue (+0.10)
· authors (+0.10) · license (+0.08) · recent year (+0.08) · >=3 concepts (+0.05)
· Indonesia-relevant (+0.05).

## Guarantees

- No invented DOI, URL, author, institution, venue, year, or abstract.
- Indonesian synopsis is a factual metadata-grounded catalog description; it does
  not paraphrase findings and always points readers to the original.
- Selection requires a resolving PDF or a live landing page (HEAD/GET, with
  bot-block tolerance).
- Duplicate DOIs / titles / slugs are skipped against existing content.
