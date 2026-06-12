# NaLI, Repository Orientation (Phase 0)

_Internal engineering note. Not rendered publicly._
_Updated: 2026-06-12 · branch `deep-archive-article-expansion`_

## Framework & tooling

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **Content:** MDX/Markdown files parsed with `gray-matter` + `next-mdx-remote/rsc` (rendered as plain Markdown, `format: "md"`). `reading-time` for read estimates.
- **Data layer:** Source-backed MDX article files **merged with** Supabase `posts` table (same slug -> DB wins). Field notes & sources are MDX-only. Articles/home/category/peta/sitemap are `force-dynamic` so DB posts publish instantly.
- **Package manager:** npm. Scripts: `dev`, `build`, `start`, `lint` (`next lint`), `typecheck` (`tsc --noEmit`), `check:editorial` (trust validator). **No `test` script.**
- **Deploy:** Vercel (`nali-by-native`), `force-dynamic` routes + Supabase. Analytics via `@vercel/analytics`.

## Route map

| Route | File | Render |
|---|---|---|
| `/` | `app/page.tsx` | dynamic |
| `/articles` | `app/articles/page.tsx` | dynamic (client filter) |
| `/articles/[slug]` | `app/articles/[slug]/page.tsx` | dynamic |
| `/alam` `/sejarah` `/investigasi` | `app/{cat}/page.tsx` | dynamic |
| `/catatan-lapangan` | `app/catatan-lapangan/page.tsx` | static (MDX field notes) |
| `/arsip-sumber` | `app/arsip-sumber/page.tsx` | static (table) |
| `/arsip-sumber/[slug]` | `app/arsip-sumber/[slug]/page.tsx` | SSG (146 pages after deep archive sprint) |
| `/peta-eksplorasi` | `app/peta-eksplorasi/page.tsx` | dynamic |
| `/manifesto` `/tentang` `/kontak` | static |
| `/admin/*` | gated by `middleware.ts` (Supabase Auth) |
| `/sitemap.xml` `/robots.txt` | `app/sitemap.ts` `app/robots.ts` |

## Content file map

- `content/articles/*.mdx`, 32 published articles after the deep archive sprint. Every article has `sourceIds`, rendered sources, `evidenceBasis`, `firstPartyFieldwork: false`, limitations, and Claim Ledger.
- `content/field-notes/*.mdx`, research-note style content only; no first-person fieldwork claim is allowed without proof.
- `content/sources/*.mdx`, 146 source entries with IDs, source type, URL/DOI/archive reference, language, geography, topics, reliability level/note, key claims, limitations, usage, and checked date.
- `content/drafts/.gitkeep`, empty.

## Data models (`lib/types.ts`)

- `Article`, title, subtitle, slug, date, category (`alam|sejarah|investigasi|catatan-lapangan`), tags, summary, confidence (`high|medium|low|needs-verification`), status, `sourceIds`, sources (`{title,url?,type}`), content, readingMinutes, coverImage?, origin?, series?, evidenceBasis?, firstPartyFieldwork?, limitations?, claimLedger?, images?, externalVisuals?, visualEvidenceNote?.
- `SourceEntry`, id, title, slug, type/sourceType (`jurnal|arsip|buku|media|laporan|lainnya`), author/institution?, year/publishedAt?, url/doi/archiveUrl?, reliability/reliabilityLevel, language, geography, topics, keyClaims/keyClaimsSupported, limitations, usedInArticles/usedInArticleIds, checkedAt, content.
- `FieldNote`, title, slug, location_label, date, tags, summary, status, content.
- Confidence labels map the sprint vocabulary onto the existing badge enum: `high -> Terverifikasi kuat`, `medium -> Didukung sumber`, `low -> Terbatas`, `needs-verification -> Belum cukup bukti`.

## Components

Nav (centered serif caps, mobile drawer, theme toggle), Footer, WaveHero (WebGL dithering shader), ConfidenceBadge (4-color dashed box), CategoryBadge, ArticleCard, ArticleList (client filter), CategoryView, PageHeader, MdxBody (Markdown), SourceList, ThemeToggle, SiteChrome (hides nav/footer on /admin), PageViewTracker, NewsletterSignup, admin/*.

## Navigation source of truth

`lib/site.ts` → `NAV_LINKS`, `SITE` (url `https://nalibynative.vercel.app`), `PILLARS`. Footer `SECONDARY` links are hard-coded in `components/Footer.tsx`.

## Risks / gotchas

1. **Trust guardrail:** keep `scripts/validate-editorial-content.mjs` active. It is the gate for source IDs, Claim Ledger, limitations, first-party fieldwork, source metadata, image licensing, and external visual evidence.
2. **No fake fieldwork:** article/page copy must stay framed as source-backed research unless first-party evidence is actually documented.
3. `MdxBody` renders as Markdown (`format:"md"`), safe for user content; tables via `remark-gfm` work.
4. `getAllSources()` sorts by year desc, entries without year sink. Source detail is SSG via `generateStaticParams`.
5. Contact email `halo@nali.native.id` is centralized in `lib/site.ts`; verify mailbox ownership before treating it as operational.
6. Adding source files automatically grows the SSG `/arsip-sumber/[slug]` set, build cost scales with count.
7. Visual evidence rules are strict: unclear-license photos/maps are external links only, never displayed assets.

## Commands available

```
npm run dev | build | start | lint | typecheck | check:editorial
# no test script
```

## Baseline status

As of the deep archive sprint: 32 published articles, 146 source entries. Run lint, typecheck, check:editorial, build, and `npm test --if-present` before merging or pushing.
