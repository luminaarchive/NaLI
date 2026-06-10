# CLAUDE.md — NaLI by NatIve
# Auto-loaded by Claude Code every session. Read this fully before doing anything.

## WHO YOU ARE IN THIS PROJECT

You are the senior engineer building NaLI by NatIve v0.1. You have full context of this project. You do not ask questions that are already answered here. You execute, then report what you did.

---

## PROJECT IDENTITY

- **Product:** NaLI by NatIve — field journal dan research publication berbasis AI, alam/sejarah/investigasi Indonesia
- **Founder:** Ansyahri Darma Tri Jati
- **Stage:** v0.1 fresh build
- **Mode:** Solo founder, vibe coding, static-first, no backend complexity
- **Hard rule:** Build once. Publish daily. Do not rebuild.

---

## LOCKED DECISIONS — DO NOT OVERRIDE

These are final. Do not suggest alternatives. Do not ask to revisit.

1. **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS
2. **Content:** MDX files only. No database. No CMS.
3. **Deploy target:** Vercel
4. **No login, no payment, no AI wrapper, no community, no dashboard** at v0.1 — ever
5. **Old NaLI codebase (wildlife app) is dead.** Zero carry-over.
6. **Distribution channels:** X, Instagram, TikTok — locked, not to be built into the site
7. **Feature freeze after build:** 14 days minimum after launch
8. **Monetization:** Only after threshold (see master doc). Not in v0.1.

---

## TECH STACK

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS
Content:       MDX + gray-matter frontmatter
Images:        next/image
Deploy:        Vercel
Package mgr:   npm
```

---

## BRAND TOKENS

```
--teal:        #2DD4A7   (primary)
--teal-dark:   #1BA882
--teal-bg:     #EAF8F3
--black:       #0A0A0A
--charcoal:    #1C1C1C
--gray:        #6B6B6B
--gray-light:  #B0B0B0
--rule:        #E0E0E0
--bg-light:    #F7F9F8
```

Brand name is always written: **NaLI by NatIve** (capital I in NatIve is intentional, always)

---

## FOLDER STRUCTURE

```
/
├── app/                    ← Next.js App Router pages
│   ├── page.tsx            ← Homepage
│   ├── articles/
│   │   ├── page.tsx        ← Article listing
│   │   └── [slug]/page.tsx ← Article detail
│   ├── alam/page.tsx
│   ├── sejarah/page.tsx
│   ├── investigasi/page.tsx
│   ├── catatan-lapangan/page.tsx
│   ├── arsip-sumber/page.tsx
│   ├── peta-eksplorasi/page.tsx
│   ├── manifesto/page.tsx
│   ├── tentang/page.tsx
│   └── kontak/page.tsx
├── components/             ← Shared UI components
├── content/
│   ├── articles/           ← MDX articles
│   ├── field-notes/        ← MDX field notes
│   ├── sources/            ← MDX source entries
│   └── drafts/             ← Not rendered publicly
├── lib/                    ← Utilities (MDX parser, etc)
├── public/
│   ├── videos/hero.mp4     ← Hero background video (founder drops this in)
│   └── logo.png            ← NaLI logo
├── CLAUDE.md               ← This file
├── BACKLOG.md              ← Deferred ideas (never execute without founder approval)
└── README.md               ← How to add content and deploy
```

---

## CONTENT FRONTMATTER SCHEMA

### Articles (`/content/articles/*.mdx`)
```yaml
---
title: string
subtitle: string
slug: string
date: YYYY-MM-DD
category: alam | sejarah | investigasi | catatan-lapangan
tags: [string]
summary: string
confidence: high | medium | low | needs-verification
status: published | draft
sources:
  - title: string
    url: string           # optional
    type: jurnal | arsip | buku | media | laporan | lainnya
---
```

### Field Notes (`/content/field-notes/*.mdx`)
```yaml
---
title: string
location_label: string
date: YYYY-MM-DD
tags: [string]
summary: string
status: published | draft
---
```

### Source Entries (`/content/sources/*.mdx`)
```yaml
---
title: string
type: jurnal | arsip | buku | media | laporan | lainnya
author: string            # optional
year: number              # optional
url: string               # optional
reliability: string       # optional note
related_topic: string     # optional
---
```

---

## CONFIDENCE LABEL COLORS

| Value | Badge color | Meaning |
|---|---|---|
| `high` | Teal `#2DD4A7` | Strong, consistent sources |
| `medium` | Amber `#F59E0B` | Supported but needs context |
| `low` | Orange `#F97316` | Working hypothesis |
| `needs-verification` | Red `#EF4444` | Cannot be published as fact yet |

---

## HERO SECTION SPEC

```tsx
// public/videos/hero.mp4 — founder provides this file
// Fallback bg: #0A0A0A if video fails

<section className="relative h-screen">
  <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-[#2DD4A7] opacity-20" />
  <div className="relative z-10 flex flex-col items-start justify-center h-full px-8 max-w-4xl mx-auto">
    {/* Logo, brand name, one-liner, CTA */}
  </div>
</section>
```

One-liner text:
> *"Field journal dan research publication berbasis AI untuk membongkar dan menceritakan alam, sejarah, dan fenomena tersembunyi Indonesia."*

---

## PAGES AND WHAT THEY SHOW

| Page | What it shows |
|---|---|
| `/` | Hero + one-liner + 3 pillar cards + 6 latest articles + CTA |
| `/articles` | All published articles, filterable by category + tag |
| `/articles/[slug]` | Full article: title, subtitle, date, category, confidence badge, reading time, MDX body, sources, related posts |
| `/alam` | Articles with category = alam |
| `/sejarah` | Articles with category = sejarah |
| `/investigasi` | Articles with category = investigasi |
| `/catatan-lapangan` | Field notes |
| `/arsip-sumber` | Source archive table |
| `/peta-eksplorasi` | Simple list of locations/topics (no interactive map) |
| `/manifesto` | Static editorial manifesto page |
| `/tentang` | About founder and project |
| `/kontak` | Email or simple contact info |

---

## SEO — EVERY PAGE

```tsx
export const metadata: Metadata = {
  title: 'Page Title | NaLI by NatIve',
  description: 'Page description here.',
  openGraph: {
    title: 'Page Title | NaLI by NatIve',
    description: 'Page description here.',
    type: 'website',
  },
}
```

Use Next.js Metadata API only. Never use `next/head`.

---

## NAVIGATION

Links in order: **Artikel · Alam · Sejarah · Investigasi · Catatan Lapangan · Arsip Sumber · Tentang**

Mobile: hamburger menu. Desktop: horizontal nav.

---

## QUALITY GATES — ALL MUST PASS BEFORE BUILD IS DONE

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes clean
- [ ] TypeScript zero errors
- [ ] All routes return 200 (no 404)
- [ ] Hero video loads or gracefully falls back
- [ ] Article listing filters work
- [ ] Article detail renders MDX body
- [ ] Confidence badge renders correctly
- [ ] Sources section renders on article detail
- [ ] Mobile responsive at 375px
- [ ] Zero lorem ipsum anywhere
- [ ] Zero broken nav links
- [ ] SEO metadata on homepage + article pages
- [ ] Sitemap generates at `/sitemap.xml`

---

## WHAT GOES IN BACKLOG.md (NOT EXECUTED)

Every idea that is outside locked scope goes here:
```
## Backlog

### [idea name]
- Why it appeared:
- Does it help publish today? yes/no
- Scope creep risk: low/medium/high
- Earliest review date:
- Decision: park / reject / later
```

**Never execute a backlog item without explicit founder instruction.**

---

## HOW TO CONTINUE A SESSION

Every new Claude Code session starts by reading this file. No need to re-explain context. Start where you left off. If unsure where that is, check git log or ask: "Where did we leave off?"

---

## SESSION LOG

Keep a running log at the bottom of this file after each session:

```
### [Date] — [What was done]
- Completed: ...
- Decisions made: ...
- Next task: ...
```

### 11 Juni 2026 — v0.1 fresh build from scratch

- **Completed:** Wiped the previous codebase entirely (hard reset, incl. git history, on founder's explicit double-confirmed instruction) and built NaLI by NatIve v0.1 from scratch per the master doc.
  - Next.js 14 (App Router) + TypeScript + Tailwind CSS + MDX (`next-mdx-remote/rsc` + `gray-matter`), no database/CMS.
  - All 12 routes built: `/`, `/articles`, `/articles/[slug]`, `/alam`, `/sejarah`, `/investigasi`, `/catatan-lapangan`, `/arsip-sumber`, `/peta-eksplorasi`, `/manifesto`, `/tentang`, `/kontak`. Plus `sitemap.xml`, `robots.txt`, 404.
  - Components: Nav (mobile hamburger), Footer, Hero (video + designed fallback), ConfidenceBadge, CategoryBadge, ArticleCard, ArticleList (client filter by category+tag), CategoryView, PillarCard, PageHeader, MdxBody, SourceList.
  - Seed content: 5 articles (marked sample, honest confidence labels, ≥3 sources each), 2 field notes, 10 source entries.
  - Design: editorial/forensic field-journal — Fraunces (display) + IBM Plex Mono (labels) + system sans (body); teal accent; confidence badge as signature element.
- **Quality gates — ALL PASS:** `npm run build` clean, `npm run lint` clean, `tsc --noEmit` clean, all routes 200 / bogus 404, MDX body + confidence badge + sources render, mobile responsive @375px, zero lorem ipsum, sitemap generates.
- **Decisions made:** Added a distinctive display serif (Fraunces) for editorial gravitas while keeping system stack for body (honors the brand token + performance-first rule). Hero has a designed dark-teal/topographic fallback so it looks finished before the founder drops `public/videos/hero.mp4`.
- **Placeholders to replace before live:** `SITE.url` in `lib/site.ts` (`https://nali.native.id`), contact email in `app/kontak/page.tsx` (`halo@nali.native.id`), and the seed content/sources (verify or swap).
- **Next task:** Founder drops `public/videos/hero.mp4`, sets the real domain/email, then begins daily publishing. Feature freeze: 14 days.

---

*Last updated: 11 Juni 2026 — v0.1 fresh build completed*
