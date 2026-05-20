# API Environment Setup

NaLI must run safely when optional providers are unconfigured. Missing optional keys return `unconfigured` status and must not crash the app.

## Required Core Env

| Env var | Purpose | Client exposed? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser auth/data key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged DB/storage tasks | No |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL/SEO | Yes |
| `CRON_SECRET` | Internal maintenance/cron bearer secret | No |
| `MAINTENANCE_SECRET` | Internal maintenance header secret fallback | No |
| `NALI_DAILY_ENERGY_LIMIT` | Optional daily NaLI Energy threshold for cost protection | No |

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code.
Keep `CRON_SECRET=` and `MAINTENANCE_SECRET=` empty until the cleanup route is intentionally activated.
Keep `NALI_DAILY_ENERGY_LIMIT=` empty until usage logging is intentionally configured.

### Supabase URL Formatting Rules

> [!IMPORTANT]
> The environment variables `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL` must point to the **base URL only**. Do not append any sub-path such as `/rest/v1`.
> * **Correct:** `https://wvpplfjrbndzxlgpuicn.supabase.co`
> * **Wrong:** `https://wvpplfjrbndzxlgpuicn.supabase.co/rest/v1`
> * **Security Warning:** Never write, document, or commit raw keys (e.g., anon keys, service role keys, or API tokens) in the documentation or code files. Always configure them as Vercel environment variables or local `.env.local` variables.

## Optional Provider Env

| Env var | Source | Signup/docs URL | Free/paid status | Scope needed | Safe fallback |
| --- | --- | --- | --- | --- | --- |
| `IUCN_API_KEY` | IUCN Red List API | https://api.iucnredlist.org/ | Free registration/API token | Read species assessments, threats, habitats, measures | Golden-set/cache status |
| `EBIRD_API_KEY` | eBird API 2.0 | https://documenter.getpostman.com/view/664302/S1ENwy59 | Free key | Bird taxonomy/observations | Disable bird occurrence context |
| `NASA_FIRMS_API_KEY` | NASA FIRMS MAP_KEY | https://firms.modaps.eosdis.nasa.gov/api/ | Free MAP_KEY | Area fire hotspot API | No threat layer/import |
| `GFW_API_KEY` | Global Forest Watch | https://vizzuality.github.io/gfw-doc-api/ | Dataset/API terms vary | Deforestation alert API/datasets | No deforestation layer |
| `ANTHROPIC_API_KEY` | Anthropic Claude | https://docs.anthropic.com/ | Paid API | Optional parser/planner assistance | Deterministic fallback |
| `BIRDNET_API_KEY` | BirdNET adapter if hosted | https://github.com/birdnet-team/BirdNET-Analyzer | Depends on deployment | Remote audio inference if implemented | Manual audio notes |

## Live

- GBIF public reads are available without a NaLI key.
- iNaturalist/EOL/Catalogue of Life bridge modules can perform public lookup when network access is available.
- Demo works from local golden-set data.

## Scaffolded

- FIRMS/GFW fetchers.
- BirdNET remote adapter.
- Claude-assisted patrol planning/parser.
- Supabase Realtime alerts require live DB publication validation.

## Unproven

- Live provider rate limits and production cache behavior.
- Scheduled imports.
- Any legal use of evidence hash.

## Must Not Be Claimed

Configured env vars do not prove a live integration is active. Claim a provider as live only after a successful request is verified and logged.
