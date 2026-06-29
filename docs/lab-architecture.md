# Bucket C: Internal Intelligence Lab, Architecture

Status: design approved (28 Juni 2026). Build proceeds one module at a time with
the plan -> approve -> build -> verify -> push rhythm. This document is the
reference; update it as modules land.

## The epistemic contract (the spine)

The public site is evidence-only. The Lab is where speculation lives, privately.

1. Data flows ONE direction: Lab -> manual human promotion -> public. Never the
   reverse, and never automatic.
2. The Lab never renders to the public. The only artifact it can emit toward the
   public is a mission (a question), never a claim.
3. A "Lazarus Score" is a prioritization heuristic for where to look, not a
   probability that a species still exists. Internal language is "Investigasi
   Lead" / "layak diselidiki", never "kemungkinan masih hidup X persen".

If these hold architecturally (not just by convention), Bucket C is safe.

## Confirmed decisions (v1)

1. Isolation: a `lab` Postgres schema in the SAME Supabase project, admin-only
   RLS, plus code isolation + a CI import guard. No second project for v1.
2. Crawler cadence: manual `npm run` scripts first. Add GitHub Actions cron only
   once the extraction + heuristic logic is proven.
3. Language: Node `.mjs` only. Defer Python until real raster/geospatial work
   (satellite NDVI / habitat mapping) actually requires it.
4. Lead -> mission: one-click admin promotion. An algorithm never auto-generates
   a public mission. The human gate is non-negotiable.
5. Missions: migrate from static JSON to DB-backed, so Lab-generated missions can
   be created dynamically and citizen reports can link back via `mission_id`.
6. v1 sources: GBIF + iNaturalist + IUCN first (clean, structured, directly feed
   the Lazarus Score). YouTube / Xeno-canto "Ghost Signals" are a v1.1 module.

## Pillar 1: Authentication & Isolation

Reuse the existing Supabase Auth (email+password `signInWithPassword`, session via
`@supabase/ssr`, `admins` allowlist + `private.is_admin()`).

- Extend `middleware.ts` matcher to include `/lab/:path*` (same redirect-to-login).
- A `requireAdmin()` server helper that every `/lab` page calls (session +
  `private.is_admin()` -> else `notFound()`). `/lab` opts out of public chrome via
  `SiteChrome` like `/admin`.

Three isolation layers so raw speculation cannot leak:
1. Separate data home: `lab` schema, tables with NO anon RLS policy (admin-only).
   A buggy public query is denied by the database.
2. No shared code path: Lab code under `app/lab/*`, `components/lab/*`,
   `lib/lab/*`. Public `lib/` never imports `lib/lab/`. A CI guard fails the
   build if anything outside `*/lab/*` imports `lab/*`.
3. One-directional promotion: the public data layer has no knowledge of lab
   tables. The only Lab -> public action writes normal public records
   (a mission, or a seeded draft), never a live read of lab data into a render.

## Pillar 2: Crawler Infrastructure

Node `.mjs`, matching `scripts/mine/harvest.mjs` + `scripts/archive/pipeline.mjs`.
All v1 sources (GBIF, iNaturalist, IUCN) are REST/JSON. The v1 score is arithmetic,
not ML, so no Python env yet.

- Run manually (`npm run lab:harvest:*`) first; GitHub Actions cron later.
- Raw, bulky dumps -> gitignored `/content/lab-raw/` + cache (the `/content/raw`
  precedent). Never committed, regenerable.
- Distilled leads/anomalies the UI shows -> small structured rows in the `lab`
  schema. Raw dumps stay out of Supabase (cost/size).
- Respect ToS/rate limits: GBIF/iNat generous; YouTube has a daily quota; OSINT
  via official APIs only.

## Pillar 3: The Lazarus Score (an Investigasi Lead, never a fact)

Output: a 0-100 lead score with a fully transparent, sourced breakdown, labeled
"INTERNAL, LEAD BELUM TERVERIFIKASI". Deterministic, explainable, auditable.

Inputs (all real open data, per candidate taxon):
- Temporal gap: years since last confirmed record (GBIF/iNat/IUCN). Long gap with
  no formal extinction -> "ghost" signal.
- Near-miss: recent congener (same-genus) or "needs-ID" observations in the
  historic range -> habitat still hosts relatives.
- Habitat intactness: forest cover / protected-area overlap in the range (Global
  Forest Watch / WDPA). Intact range -> survival plausible.
- Search-effort deficit: density of ANY recent observations in the area. The most
  important input: low effort means the gap may be under-sampling, not extinction.
- IUCN modifier: CR(PE) / Data Deficient weight differently than confirmed Extinct.

Method: a weighted sum of normalized sub-scores, each surfaced with its raw
evidence and source links. The admin sees WHY a taxon ranks high and can dismiss
or promote.

Guardrails: every lead shows (a) the internal-unverified label, (b) the sub-score
breakdown with sources, (c) an explicit "what would confirm vs refute this". The
score never appears on the public site; a lead becomes public only by the founder
writing a normal deep-research article with real sources.

## Pillar 4: The Feedback Loop (Lab <-> Citizen Science)

```
Lab lead / Ghost Signal
   -> founder reviews in /lab
   -> [one-click PROMOTE] -> creates a "Misi Verifikasi Lapangan" (a ResearchMission)
   -> appears publicly on /misi (with the existing ReportForm)
   -> citizens submit field reports (tagged mission_id)
   -> reports land PRIVATE in /admin/reports
   -> founder verifies -> confirm/refute the lead, or write an article
```

- The mission is phrased as an open question ("Ada catatan historis spesies X di
  wilayah Y; bantu kami cari bukti terkini"). It asks for evidence, never asserts
  existence.
- The Phase-3 seams are already in place: `/admin/reports` (outbound missions) and
  `lib/reading-paths.ts` (a future "Investigasi Lanjutan" path). `ReportForm`
  already supports `mission_id`.
- Missions move to DB-backed with a `source: lab | editorial` field.

## Build order (modules, one per session)

- 3.1 (DONE, `708a199`) Authentication & Schema Setup: middleware gate for
  `/lab/:path*`, `public.lab_leads` migration (admin-only RLS), `lib/lab/` +
  `app/lab/` boilerplate, CI import guard.
- 3.2 (DONE, `8dc01f5`) GBIF + iNaturalist + IUCN harvesters (Node, manual run,
  raw -> /content/lab-raw). Read-only; only build-leads writes the DB.
- 3.3 (DONE) Lazarus Score + `/lab` leads dashboard (transparent breakdown).
  `lib/lab/scoring.ts` (deterministic weighted heuristic, breakdown[]), curated
  IUCN fallback (`scripts/lab/seed-iucn.mjs`, provenance tagged), committed
  real-data snapshot `lib/lab/sample-leads.ts` (DB -> sample fallback, labeled
  CONTOH), client board `components/lab/LabLeadsBoard.tsx` (sort/filter/expand +
  disabled "Promosikan ke Misi" Phase-3 seam). Local-only dev bypass
  (`LAB_DEV_BYPASS`, production-impossible) for browser verification.
- 3.4 Missions -> DB + one-click lead -> "Misi Verifikasi Lapangan" promotion
  (wires the disabled promote button + the /admin/reports Phase-3 seam).
- 3.5 (v1.1) Ghost Signals: YouTube / Xeno-canto / iNat "needs-ID".

## Dependencies / notes

- Reuses the same `GOOGLE_GENERATIVE_AI_API_KEY` only if a module needs embeddings;
  the core Lazarus heuristic does not.
- Service-role key (founder infra) is needed for crawler writes to the `lab`
  schema, same pattern as `harvest-oa-to-supabase.mjs`.
- See also: reader-intelligence-roadmap (memory), CLAUDE.md session log.
