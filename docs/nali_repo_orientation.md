# NaLI — Repository Orientation (Phase 0)

_Internal engineering note. Not rendered publicly._
_Generated: 2026-06-12 · branch `editorial-trust-source-archive-30-articles`_

## Framework & tooling

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS.
- **Content:** MDX/Markdown files parsed with `gray-matter` + `next-mdx-remote/rsc` (rendered as plain Markdown, `format: "md"`). `reading-time` for read estimates.
- **Data layer:** MDX seed files **merged with** Supabase `posts` table (same slug → DB wins). Field notes & sources are MDX-only (SSG). Articles/home/category/peta/sitemap are `force-dynamic` so DB posts publish instantly.
- **Package manager:** npm. Scripts: `dev`, `build`, `start`, `lint` (`next lint`), `typecheck` (`tsc --noEmit`). **No `test` script.**
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
| `/arsip-sumber/[slug]` | `app/arsip-sumber/[slug]/page.tsx` | SSG (25 pages) |
| `/peta-eksplorasi` | `app/peta-eksplorasi/page.tsx` | dynamic |
| `/manifesto` `/tentang` `/kontak` | static |
| `/admin/*` | gated by `middleware.ts` (Supabase Auth) |
| `/sitemap.xml` `/robots.txt` | `app/sitemap.ts` `app/robots.ts` |

## Content file map

- `content/articles/*.mdx` — 6 articles. **5 are seed/example** (api-biru, batavia, burung-maleo, citarum, mangrove) carrying `> _Artikel contoh (seed)…_` disclaimers. **1 is real** (harimau-jawa-lazarus-species) — already source-backed, honest labels, no first-party claim.
- `content/field-notes/*.mdx` — 2 notes (subuh-di-kawah-ijen, menunggu-maleo). **Both written in first-person field voice** implying fieldwork the founder did NOT do, plus `> _Catatan lapangan contoh (seed). Bersifat ilustratif._` disclaimers. **Trust risk — must reframe.**
- `content/sources/*.mdx` — 25 source entries, mostly real & traceable (Oryx, IUCN, GVP, UNESCO, ANRI, BPS, GFW…). Schema is light (no structured limitations/reliability-level/checked-date).
- `content/drafts/.gitkeep` — empty.

## Data models (`lib/types.ts`)

- `Article` — title, subtitle, slug, date, category (`alam|sejarah|investigasi|catatan-lapangan`), tags, summary, confidence (`high|medium|low|needs-verification`), status, sources (`{title,url?,type}`), content, readingMinutes, coverImage?, origin?.
- `SourceEntry` — title, slug, type (`jurnal|arsip|buku|media|laporan|lainnya`), author?, year?, url?, reliability? (free text), related_topic?, content?.
- `FieldNote` — title, slug, location_label, date, tags, summary, status, content.
- Confidence labels currently: `high→Terverifikasi`, `medium→Perlu konteks`, `low→Hipotesis kerja`, `needs-verification→Belum diverifikasi`.

## Components

Nav (centered serif caps, mobile drawer, theme toggle), Footer, WaveHero (WebGL dithering shader), ConfidenceBadge (4-color dashed box), CategoryBadge, ArticleCard, ArticleList (client filter), CategoryView, PageHeader, MdxBody (Markdown), SourceList, ThemeToggle, SiteChrome (hides nav/footer on /admin), PageViewTracker, NewsletterSignup, admin/*.

## Navigation source of truth

`lib/site.ts` → `NAV_LINKS`, `SITE` (url `https://nalibynative.vercel.app`), `PILLARS`. Footer `SECONDARY` links are hard-coded in `components/Footer.tsx`.

## Risks / gotchas

1. **Trust risk:** seed disclaimers + first-person field notes are public and misleading → top priority to reframe.
2. Article/source schema is light vs. the sprint target (no claim ledger, evidence basis, structured source reliability/limitations/checked-date, image attribution).
3. `MdxBody` renders as Markdown (`format:"md"`) — safe for user content; tables via `remark-gfm` work.
4. `getAllSources()` sorts by year desc — entries without year sink. Source detail is SSG via `generateStaticParams`.
5. Contact email `halo@nali.native.id` is a **dead placeholder** (`app/kontak/page.tsx`). Founder real email exists but publishing it is a founder decision.
6. Adding source files automatically grows the SSG `/arsip-sumber/[slug]` set — build cost scales with count.
7. Confidence enum (`high|medium|low|needs-verification`) ≠ the sprint's 5-label scheme (`Terverifikasi kuat … Belum cukup bukti`). Decision: **map the sprint labels onto the existing enum** rather than break the badge system (see baseline doc).

## Commands available

```
npm run dev | build | start | lint | typecheck
# no test script
```

## Baseline status

lint ✓ · typecheck ✓ · build ✓ (45 routes, 25 SSG source pages). See `nali_editorial_trust_baseline.md`.
