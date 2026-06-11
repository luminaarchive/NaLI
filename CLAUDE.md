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

### 11 Juni 2026 — Gallery landing, Supabase newsletter, Vercel deploy (founder-directed, full-access)

- **Landing rebuilt** as a baroque "archive hall" scrollytelling scene (original SVG, not a copy of the reference image the founder shared). `components/GalleryHall.tsx`: marble arcade, gold archivolts/keystones, scallop niches, sea horizon through arches, red perspective floor, NaLI-engraved pedestals. Scroll drives 3 acts (Alam/Sejarah/Investigasi) that crossfade light + sea + a featured article on a gold-trim placard. Replaces the old `Hero.tsx` (deleted). Verified desktop + mobile.
- **Newsletter** (`components/NewsletterSignup.tsx` + `lib/supabaseClient.ts`): new Supabase project `nali-field-journal` (`xxwzufdezpyabqkwrcbz`), `subscribers` table, RLS insert-only (list private). Schema at `supabase/migrations/0001_create_subscribers.sql`. Verified end-to-end incl. real browser submit.
- **Deploy:** Vercel project `nali-by-native`, linked to GitHub, env vars set, `vercel.json` pins `framework: nextjs`. Production verified rendering. **Bumped `next-mdx-remote` 5→6** (Vercel security gate). See [[live-deployment]] in memory.
- **Open item:** Vercel Deployment Protection (Vercel Authentication) is ON → site 401s for the public. Founder is disabling it in the dashboard (Settings → Deployment Protection). Not changeable via code/CLI.
- **Note:** Founder explicitly overrode the "no database" locked decision for the newsletter ("sambungkan ke supabase, buatlah project baru"). User instruction > CLAUDE.md.

### 11 Juni 2026 (lanjutan) — Site public, gallery v2 (Bibiena-grade), free domain

- **Deployment Protection OFF** (founder toggled di dashboard) → site publik, semua route 200.
- **Gallery v2** (`components/GalleryHall.tsx` rebuild): coffered gilded vault + rosettes + transverse ribs, figured gold relief frieze, dentil cornice, gilt-framed sepia paintings di outer bays (shell pediments), multi-ring archivolts + cartouche keystones, spandrel rosettes, pier panels berukir N·A·L·I (NATURE/ARCHIVE/LORE/INVESTIGATION), pedestal bermedali laurel ("NaLI by NatIve", EST/MMXXVI), floor sheen. Acts: alam +awan/pulau/camar, sejarah +siluet pinisi. Verified desktop+mobile, 3 acts.
- **Free domain:** claimed `nalibynative.vercel.app` + `nalijournal.vercel.app` sebagai **project domains** (auto-assign tiap prod deploy). `SITE.url` → `https://nalibynative.vercel.app` (sitemap/canonical kini valid). Bare `nali-by-native.vercel.app` & `nali.native.id` adalah placeholder mati — jangan dipakai.
- **Custom domain (belum dibeli, founder decision):** tersedia `nali.media` $7.99/yr, `nalibynative.com` $11.25/yr, dll. **Email bisnis profesional butuh domain sendiri** — rekomendasi setelah beli: Zoho Mail Free (5 mailbox) atau Cloudflare Email Routing → Gmail. Email `halo@nali.native.id` di `/kontak` masih placeholder mati.

### 11 Juni 2026 (lanjutan 2) — Gallery v3: arcade asli + video laut (founder-directed)

- Founder menolak look vektor/SVG → **gallery v3 composite**: arcade klasik asli (Pixabay cutout `790331`, arch transparan) di-grade hangat via CSS filter + lantai oxblood (multiply gradient), dengan **footage laut sungguhan** crossfade per act di belakang arch (semua Pixabay Content License, bebas komersial, tanpa atribusi):
  - alam: `video 202929` laut toska + headland berkabut (small, 13.1MB)
  - sejarah: `video 175101` god-rays emas + burung (medium, 7.9MB)
  - investigasi: `video 343390` laut malam berbintang + bioluminescence (large 4K, 10.9MB)
- Aset di `public/videos/{alam,sejarah,investigasi}.mp4` + `public/textures/arcade.png` (committed, ~33MB). Ken-Burns di arcade, video act aktif play / lain pause, reduced-motion safe, nav dots hidden di mobile.
- SVG Scene dihapus dari `GalleryHall.tsx`. Verified: 3 acts desktop + mobile + **live production**.
- **Optimization backlog:** alam.mp4 masih 13MB (960p) — bisa di-compress/host via CDN nanti; semua video preload="auto" (berat di mobile data).

### 11 Juni 2026 (lanjutan 3) — Landing v4: gaya SaaS modern (founder-directed)

- Founder share template berbayar 21st.dev "AgentFlow Pro" ($49) → **tidak boleh copy kode/copy-nya**; struktur & gaya layout-nya dibangun ulang dari nol (`app/page.tsx` rewrite penuh, semua copy original NaLI):
  - **Nav pill gelap mengambang** (restyle `Nav.tsx` site-wide, drawer mobile gelap, CTA putih "Mulai membaca")
  - **Hero**: arcade.png (cutout berlisensi, tetap dipakai) di frame rounded di atas gradien laut teal; headline sans raksasa berakhiran *italic* abu; `NewsletterSignup` varian `light` di hero
  - **Proof strip**: tipe sumber (JURNAL/ARSIP/BUKU/MEDIA/LAPORAN) menggantikan logo korporat
  - **Bento**: kartu besar + browser mockup screenshot asli `/articles` (`public/images/articles-preview.jpg`), kartu confidence badges, arsip terbuka, terminal log riset (mono hijau), diagram orbit pilar, feed artikel terbaru (data asli dari `lib/content`)
  - **Standar editorial**: 3 baris + stempel SVG NaLI; **Tiga pilar** bergaya tier-cards (Sejarah gelap di tengah); **FAQ** accordion `<details>`
  - Shell: kolom tengah ber-border + gutter hatch diagonal (`.hatch`), divider band hatch antar section
- **Gallery v3 dihapus dari tree**: `GalleryHall.tsx` + 3 video (~32MB) — recoverable dari git history (`5e2f245`); `arcade.png` dipertahankan untuk hero.
- Verified: build/lint/typecheck clean, semua section live di production, mobile OK.

### 11 Juni 2026 (lanjutan 4) — Hero: wave dithering shader 21st.dev (founder-directed)

- Founder share komponen komunitas 21st.dev `aliimam/wave-1` (kode ditempel langsung) → diintegrasikan sebagai home hero:
  - **Struktur shadcn ditambahkan**: `components/ui/` + `lib/utils.ts` (`cn` via `clsx`+`tailwind-merge`, keduanya di-install).
  - `components/ui/dithering-shader.tsx` — WebGL2 Bayer-dithering shader (sesuai kode yang diberikan; 1 perbaikan: render satu frame saat `speed=0` agar reduced-motion tetap menampilkan wave statis).
  - `components/WaveHero.tsx` — tema NaLI: wave `#2DD4A7` di atas ink `#03100d`, `shape="wave" type="8x8" pxSize=3 speed=0.6`, headline putih dengan akhiran *italic teal*, kicker NATURE·ARCHIVE·LORE·INVESTIGATION, NewsletterSignup (dark) di atas wave, scrim radial untuk legibilitas, reduced-motion aware.
  - **Gotcha komponen**: inline `style position:relative` bawaannya menang dari class Tailwind `absolute` — posisikan via `style` prop, bukan className.
  - Hero arcade berbingkai diganti (arcade.png kini tak terpakai di landing, file tetap di repo); terminal-log card di-reaccent teal agar match.
- Verified: build/lint/typecheck clean, hero+overlay render benar desktop & mobile, live production (canvas + semua section PASS).

### 11 Juni 2026 (lanjutan 5) — Archive-ink: design system satu warna seluruh situs (founder-directed)

- Founder minta seluruh situs mengikuti bahasa visual situs riset bergaya arsip monokrom (referensi dipelajari via browser: beranda, releases, blog) → **design system "archive-ink"** versi NaLI:
  - **Palet**: kertas putih `#FFFFFF` + satu tinta teal `ink #0E8268` / `ink-deep #085E4B` / `ink-wash #E9F6F1` (token Tailwind baru; `paper`→putih, `rule`→`#9ECDBF`, `gray`→`#33373D`). Warna ink diturunkan dari teal shader supaya hero & halaman menyatu.
  - **Tipografi**: body global → IBM Plex Mono (gaya mesin-tik); judul/nav → Fraunces caps (gaya NaLI sendiri, bukan font pixel referensi); prosa artikel tetap sans agar nyaman dibaca.
  - **Bahasa visual**: garis putus-putus (`.hairline` kini dashed) sebagai pemisah utama; kartu kotak ber-border dashed tanpa shadow/rounded; tabel arsip ber-border penuh + header `ink-wash` (di `/arsip-sumber`); metadata indeks arsip ("No. 001", "LEMPENG 001 — GELOMBANG"); `.duotone-ink` filter untuk foto; tombol kotak mono uppercase.
  - **Nav** restyle: serif caps di tengah, putih, dashed rule di bawah (pill gelap dihapus). **Footer** flat putih dashed. **WaveHero shader TIDAK disentuh** — hanya dibingkai dashed sebagai "lempeng arsip" dengan caption mono.
  - 19 file diubah (semua page + komponen); `PillarCard.tsx` dihapus (tak terpakai). Badge confidence tetap 4 warna semantik (bentuk kotak dashed).
- **Verified halaman demi halaman** (perintah founder): home (3 bagian), articles, artikel detail, arsip-sumber, catatan-lapangan, manifesto, tentang, kontak, alam, mobile — semua blend; 13 route 200 di production.

---

*Last updated: 11 Juni 2026 — gallery v3 (real arcade + sea footage) live di nalibynative.vercel.app*
