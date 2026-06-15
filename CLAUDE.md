# CLAUDE.md, NaLI by NatIve
# Auto-loaded by Claude Code every session. Read this fully before doing anything.

## WHO YOU ARE IN THIS PROJECT

You are the senior engineer building NaLI by NatIve v0.1. You have full context of this project. You do not ask questions that are already answered here. You execute, then report what you did.

---

## PROJECT IDENTITY

- **Product:** NaLI by NatIve, jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia
- **Founder:** Ansyahri Darma Tri Jati
- **Stage:** v0.1 fresh build
- **Mode:** Solo founder, vibe coding, static-first, no backend complexity
- **Hard rule:** Build once. Publish daily. Do not rebuild.

---

## LOCKED DECISIONS, DO NOT OVERRIDE

These are final. Do not suggest alternatives. Do not ask to revisit.

1. **Framework:** Next.js 14 App Router + TypeScript + Tailwind CSS
2. **Content:** MDX files only. No database. No CMS.
3. **Deploy target:** Vercel
4. **No login, no payment, no AI wrapper, no community, no dashboard** at v0.1, ever
5. **Old NaLI codebase (wildlife app) is dead.** Zero carry-over.
6. **Distribution channels:** X, Instagram, TikTok, locked, not to be built into the site
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
// public/videos/hero.mp4, founder provides this file
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
> *"Jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia. Setiap klaim membawa sumber, label keyakinan, dan batasan."*

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

## SEO, EVERY PAGE

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

Links in order: **Artikel · Seri · Arsip Sumber · Metodologi · Tentang · Kontak**

Mobile: hamburger menu. Desktop: horizontal nav.

---

## QUALITY GATES, ALL MUST PASS BEFORE BUILD IS DONE

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
### [Date], [What was done]
- Completed: ...
- Decisions made: ...
- Next task: ...
```

### 11 Juni 2026, v0.1 fresh build from scratch

- **Completed:** Wiped the previous codebase entirely (hard reset, incl. git history, on founder's explicit double-confirmed instruction) and built NaLI by NatIve v0.1 from scratch per the master doc.
  - Next.js 14 (App Router) + TypeScript + Tailwind CSS + MDX (`next-mdx-remote/rsc` + `gray-matter`), no database/CMS.
  - All 12 routes built: `/`, `/articles`, `/articles/[slug]`, `/alam`, `/sejarah`, `/investigasi`, `/catatan-lapangan`, `/arsip-sumber`, `/peta-eksplorasi`, `/manifesto`, `/tentang`, `/kontak`. Plus `sitemap.xml`, `robots.txt`, 404.
  - Components: Nav (mobile hamburger), Footer, Hero (video + designed fallback), ConfidenceBadge, CategoryBadge, ArticleCard, ArticleList (client filter by category+tag), CategoryView, PillarCard, PageHeader, MdxBody, SourceList.
  - Seed content: 5 articles (marked sample, honest confidence labels, ≥3 sources each), 2 field notes, 10 source entries.
  - Design: editorial/forensic field-journal, Fraunces (display) + IBM Plex Mono (labels) + system sans (body); teal accent; confidence badge as signature element.
- **Quality gates, ALL PASS:** `npm run build` clean, `npm run lint` clean, `tsc --noEmit` clean, all routes 200 / bogus 404, MDX body + confidence badge + sources render, mobile responsive @375px, zero lorem ipsum, sitemap generates.
- **Decisions made:** Added a distinctive display serif (Fraunces) for editorial gravitas while keeping system stack for body (honors the brand token + performance-first rule). Hero has a designed dark-teal/topographic fallback so it looks finished before the founder drops `public/videos/hero.mp4`.
- **Placeholders to replace before live:** `SITE.url` in `lib/site.ts` (`https://nali.native.id`), contact email in `app/kontak/page.tsx` (`halo@nali.native.id`), and the seed content/sources (verify or swap).
- **Next task:** Founder drops `public/videos/hero.mp4`, sets the real domain/email, then begins daily publishing. Feature freeze: 14 days.

### 11 Juni 2026, Gallery landing, Supabase newsletter, Vercel deploy (founder-directed, full-access)

- **Landing rebuilt** as a baroque "archive hall" scrollytelling scene (original SVG, not a copy of the reference image the founder shared). `components/GalleryHall.tsx`: marble arcade, gold archivolts/keystones, scallop niches, sea horizon through arches, red perspective floor, NaLI-engraved pedestals. Scroll drives 3 acts (Alam/Sejarah/Investigasi) that crossfade light + sea + a featured article on a gold-trim placard. Replaces the old `Hero.tsx` (deleted). Verified desktop + mobile.
- **Newsletter** (`components/NewsletterSignup.tsx` + `lib/supabaseClient.ts`): new Supabase project `nali-field-journal` (`xxwzufdezpyabqkwrcbz`), `subscribers` table, RLS insert-only (list private). Schema at `supabase/migrations/0001_create_subscribers.sql`. Verified end-to-end incl. real browser submit.
- **Deploy:** Vercel project `nali-by-native`, linked to GitHub, env vars set, `vercel.json` pins `framework: nextjs`. Production verified rendering. **Bumped `next-mdx-remote` 5→6** (Vercel security gate). See [[live-deployment]] in memory.
- **Open item:** Vercel Deployment Protection (Vercel Authentication) is ON → site 401s for the public. Founder is disabling it in the dashboard (Settings → Deployment Protection). Not changeable via code/CLI.
- **Note:** Founder explicitly overrode the "no database" locked decision for the newsletter ("sambungkan ke supabase, buatlah project baru"). User instruction > CLAUDE.md.

### 11 Juni 2026 (lanjutan), Site public, gallery v2 (Bibiena-grade), free domain

- **Deployment Protection OFF** (founder toggled di dashboard) → site publik, semua route 200.
- **Gallery v2** (`components/GalleryHall.tsx` rebuild): coffered gilded vault + rosettes + transverse ribs, figured gold relief frieze, dentil cornice, gilt-framed sepia paintings di outer bays (shell pediments), multi-ring archivolts + cartouche keystones, spandrel rosettes, pier panels berukir N·A·L·I (NATURE/ARCHIVE/LORE/INVESTIGATION), pedestal bermedali laurel ("NaLI by NatIve", EST/MMXXVI), floor sheen. Acts: alam +awan/pulau/camar, sejarah +siluet pinisi. Verified desktop+mobile, 3 acts.
- **Free domain:** claimed `nalibynative.vercel.app` + `nalijournal.vercel.app` sebagai **project domains** (auto-assign tiap prod deploy). `SITE.url` → `https://nalibynative.vercel.app` (sitemap/canonical kini valid). Bare `nali-by-native.vercel.app` & `nali.native.id` adalah placeholder mati, jangan dipakai.
- **Custom domain (belum dibeli, founder decision):** tersedia `nali.media` $7.99/yr, `nalibynative.com` $11.25/yr, dll. **Email bisnis profesional butuh domain sendiri**, rekomendasi setelah beli: Zoho Mail Free (5 mailbox) atau Cloudflare Email Routing → Gmail. Email `halo@nali.native.id` di `/kontak` masih placeholder mati.

### 11 Juni 2026 (lanjutan 2), Gallery v3: arcade asli + video laut (founder-directed)

- Founder menolak look vektor/SVG → **gallery v3 composite**: arcade klasik asli (Pixabay cutout `790331`, arch transparan) di-grade hangat via CSS filter + lantai oxblood (multiply gradient), dengan **footage laut sungguhan** crossfade per act di belakang arch (semua Pixabay Content License, bebas komersial, tanpa atribusi):
  - alam: `video 202929` laut toska + headland berkabut (small, 13.1MB)
  - sejarah: `video 175101` god-rays emas + burung (medium, 7.9MB)
  - investigasi: `video 343390` laut malam berbintang + bioluminescence (large 4K, 10.9MB)
- Aset di `public/videos/{alam,sejarah,investigasi}.mp4` + `public/textures/arcade.png` (committed, ~33MB). Ken-Burns di arcade, video act aktif play / lain pause, reduced-motion safe, nav dots hidden di mobile.
- SVG Scene dihapus dari `GalleryHall.tsx`. Verified: 3 acts desktop + mobile + **live production**.
- **Optimization backlog:** alam.mp4 masih 13MB (960p), bisa di-compress/host via CDN nanti; semua video preload="auto" (berat di mobile data).

### 11 Juni 2026 (lanjutan 3), Landing v4: gaya SaaS modern (founder-directed)

- Founder share template berbayar 21st.dev "AgentFlow Pro" ($49) → **tidak boleh copy kode/copy-nya**; struktur & gaya layout-nya dibangun ulang dari nol (`app/page.tsx` rewrite penuh, semua copy original NaLI):
  - **Nav pill gelap mengambang** (restyle `Nav.tsx` site-wide, drawer mobile gelap, CTA putih "Mulai membaca")
  - **Hero**: arcade.png (cutout berlisensi, tetap dipakai) di frame rounded di atas gradien laut teal; headline sans raksasa berakhiran *italic* abu; `NewsletterSignup` varian `light` di hero
  - **Proof strip**: tipe sumber (JURNAL/ARSIP/BUKU/MEDIA/LAPORAN) menggantikan logo korporat
  - **Bento**: kartu besar + browser mockup screenshot asli `/articles` (`public/images/articles-preview.jpg`), kartu confidence badges, arsip terbuka, terminal log riset (mono hijau), diagram orbit pilar, feed artikel terbaru (data asli dari `lib/content`)
  - **Standar editorial**: 3 baris + stempel SVG NaLI; **Tiga pilar** bergaya tier-cards (Sejarah gelap di tengah); **FAQ** accordion `<details>`
  - Shell: kolom tengah ber-border + gutter hatch diagonal (`.hatch`), divider band hatch antar section
- **Gallery v3 dihapus dari tree**: `GalleryHall.tsx` + 3 video (~32MB), recoverable dari git history (`5e2f245`); `arcade.png` dipertahankan untuk hero.
- Verified: build/lint/typecheck clean, semua section live di production, mobile OK.

### 11 Juni 2026 (lanjutan 4), Hero: wave dithering shader 21st.dev (founder-directed)

- Founder share komponen komunitas 21st.dev `aliimam/wave-1` (kode ditempel langsung) → diintegrasikan sebagai home hero:
  - **Struktur shadcn ditambahkan**: `components/ui/` + `lib/utils.ts` (`cn` via `clsx`+`tailwind-merge`, keduanya di-install).
  - `components/ui/dithering-shader.tsx`, WebGL2 Bayer-dithering shader (sesuai kode yang diberikan; 1 perbaikan: render satu frame saat `speed=0` agar reduced-motion tetap menampilkan wave statis).
  - `components/WaveHero.tsx`, tema NaLI: wave `#2DD4A7` di atas ink `#03100d`, `shape="wave" type="8x8" pxSize=3 speed=0.6`, headline putih dengan akhiran *italic teal*, kicker NATURE·ARCHIVE·LORE·INVESTIGATION, NewsletterSignup (dark) di atas wave, scrim radial untuk legibilitas, reduced-motion aware.
  - **Gotcha komponen**: inline `style position:relative` bawaannya menang dari class Tailwind `absolute`, posisikan via `style` prop, bukan className.
  - Hero arcade berbingkai diganti (arcade.png kini tak terpakai di landing, file tetap di repo); terminal-log card di-reaccent teal agar match.
- Verified: build/lint/typecheck clean, hero+overlay render benar desktop & mobile, live production (canvas + semua section PASS).

### 11 Juni 2026 (lanjutan 5), Archive-ink: design system satu warna seluruh situs (founder-directed)

- Founder minta seluruh situs mengikuti bahasa visual situs riset bergaya arsip monokrom (referensi dipelajari via browser: beranda, releases, blog) → **design system "archive-ink"** versi NaLI:
  - **Palet**: kertas putih `#FFFFFF` + satu tinta teal `ink #0E8268` / `ink-deep #085E4B` / `ink-wash #E9F6F1` (token Tailwind baru; `paper`→putih, `rule`→`#9ECDBF`, `gray`→`#33373D`). Warna ink diturunkan dari teal shader supaya hero & halaman menyatu.
  - **Tipografi**: body global → IBM Plex Mono (gaya mesin-tik); judul/nav → Fraunces caps (gaya NaLI sendiri, bukan font pixel referensi); prosa artikel tetap sans agar nyaman dibaca.
  - **Bahasa visual**: garis putus-putus (`.hairline` kini dashed) sebagai pemisah utama; kartu kotak ber-border dashed tanpa shadow/rounded; tabel arsip ber-border penuh + header `ink-wash` (di `/arsip-sumber`); metadata indeks arsip ("No. 001", "LEMPENG 001, GELOMBANG"); `.duotone-ink` filter untuk foto; tombol kotak mono uppercase.
  - **Nav** restyle: serif caps di tengah, putih, dashed rule di bawah (pill gelap dihapus). **Footer** flat putih dashed. **WaveHero shader TIDAK disentuh**, hanya dibingkai dashed sebagai "lempeng arsip" dengan caption mono.
  - 19 file diubah (semua page + komponen); `PillarCard.tsx` dihapus (tak terpakai). Badge confidence tetap 4 warna semantik (bentuk kotak dashed).
- **Verified halaman demi halaman** (perintah founder): home (3 bagian), articles, artikel detail, arsip-sumber, catatan-lapangan, manifesto, tentang, kontak, alam, mobile, semua blend; 13 route 200 di production.

### 11 Juni 2026 (lanjutan 6), Light/dark mode + pixel toggle (founder-directed)

- **Arsitektur tema**: semua token archive-ink di `tailwind.config.ts` kini `rgb(var(--c-*) / <alpha-value>)`; nilai light/dark di `globals.css` (`:root` / `.dark`). Dark = kertas tinta `#0A1411` (turunan warna shader) + ink teal terang `#46CFA8`; satu switch mengubah SEMUA halaman, termasuk modifier opacity (`border-ink/60` dll).
- **`components/ThemeToggle.tsx`**: tombol pixel sesuai foto referensi founder, matahari pixel "☼ LIGHT" / bulan separuh "◑ DARK", border kotak, mono uppercase. Dipasang di Nav (desktop kanan + mobile sebelah hamburger; dua instance → selector test pakai `:visible`).
- **Persistensi**: localStorage `nali-theme` + script pre-paint di awal `<body>` (fallback `prefers-color-scheme`), `suppressHydrationWarning` di `<html>`; toggle render label setelah mount (hindari hydration mismatch).
- **Sweep warna hardcoded**: SVG Stamp/Check/orbit → `currentColor`/`fill-ink`/`fill-paper`; tombol `bg-ink text-white` → `text-paper` (di dark: teks gelap di atas teal terang); badge confidence dapat varian `dark:text-*`; `.duotone-ink` diredupkan di dark; chip filter aktif `text-paper`.
- **Tested per perintah founder**: SEMUA halaman dark (home top+bottom, articles, artikel detail mid, arsip tabel, catatan, manifesto bottom+footer, tentang bottom, kontak, peta) + light spot + mobile (toggle di mobile nav) + persistensi antar navigasi. Production verified: script, toggle, ikon pixel, CSS vars `.dark` semua tershipping.

### 11 Juni 2026 (lanjutan 7), Dashboard admin (Pages CMS) + Web Analytics (founder-directed)

- Founder minta dashboard admin (edit/posting/upload gambar) + statistik pengunjung. **Daftar fitur OJS** (submissions/reviewer/roles/issues/DOI) ditolak dengan alasan: NaLI publikasi solo → diparkir ke `BACKLOG.md`. Solusi tanpa melanggar arsitektur (no DB, no login di situs):
  - **Pages CMS** (git-based): `.pages.yml` memetakan ketiga koleksi persis sesuai skema frontmatter (articles incl. `sources` object-list + select confidence/category/status draft-terbit; field-notes; sources). Body `rich-text`; upload gambar → `public/images/uploads/` (output `/images/uploads`). Login: app.pagescms.org → GitHub (hanya akun dengan write access repo). Simpan = commit → auto-deploy.
  - **`@vercel/analytics`** `<Analytics/>` di `layout.tsx`. **Web Analytics ternyata auto-enabled** di project, diverifikasi live via browser: script tersuntik, `window.va` aktif, `/_vercel/insights/script.js` 200. Data muncul di tab Analytics dashboard Vercel.
  - Catatan verifikasi: komponen Analytics menyuntik script **client-side**, tidak terlihat di HTML SSG (grep HTML = false negative; verifikasi harus via browser).
- Panduan founder ditambahkan di README (login dashboard + lihat statistik).

### 12 Juni 2026, Artikel pertama + admin custom Supabase (founder-directed)

- **Artikel asli pertama**: `content/articles/harimau-jawa-lazarus-species.mdx` (status **draft**). Topik Lazarus species; riset terverifikasi web (studi Oryx 2024 kemiripan DNA 97,8% + studi tandingan numt/QC) → klaim "masih hidup" label **needs-verification**, 5 sumber nyata. Founder ubah ke `published` untuk terbit.
- **Pages CMS gagal dipakai founder** (upload foto + analitik) → diminta build **admin custom**. Pilihan arsitektur (AskUserQuestion) = **Supabase-backed**. Menimpa 3 locked decision (no login, no dashboard, MDX-only), diotorisasi eksplisit.
  - **Supabase** (`nali-field-journal` / `xxwzufdezpyabqkwrcbz`): tabel `posts` (cermin skema artikel, RLS: publik baca published, authenticated tulis) + `page_views` (RLS: anon insert, admin baca) + bucket Storage `post-images` (publik). Advisor di-hardening (search_path, listing). **Akun admin = TUGAS FOUNDER** (Supabase dashboard → Auth → Add user; classifier blokir pembuatan kredensial oleh agent, benar).
  - **Lapisan konten** (`lib/content.ts` + `lib/posts.ts`): artikel = MDX seed **+** DB posts digabung (slug sama → DB menang). Fungsi artikel jadi async; route artikel/home/kategori/peta/sitemap `force-dynamic` → terbit seketika. Field-notes/sources tetap MDX/SSG. `next.config` `outputFileTracingIncludes: content/**` agar MDX kebaca saat runtime; `images.remotePatterns` untuk Supabase Storage. `MdxBody` `format:"md"` (aman untuk konten user).
  - **`/admin`**: middleware (`middleware.ts`) jaga semua `/admin/*` (Supabase Auth session via `@supabase/ssr`). Login (`/admin/login`), dashboard list, editor (`PostEditor`, semua field + sumber + upload sampul & inline ke Storage + draft/terbit), hapus, analitik (`/admin/analytics` dari `page_views`: total, grafik 14 hari, top paths). `SiteChrome` sembunyikan Nav/Footer publik di `/admin`. `PageViewTracker` + `/api/track` rekam kunjungan (skip /admin). `.pages.yml` dihapus.
  - **Verified** (tanpa kredensial, sesuai batas): insert post DB → tampil di /articles + detail (markdown+sumber render) + merge MDX OK; /admin → 307 /admin/login; /api/track rekam 1 row; build/lint/types clean; live production semua PASS. **Belum** dites E2E authed (butuh akun yang dibuat founder).

### 12 Juni 2026 (lanjutan), Rapikan: landing, dashboard, arsip; Harimau Jawa terbit (founder-directed)

- **Landing (`app/page.tsx`) lead-with-content:** persis di bawah hero kini ada bagian **"Tulisan terbaru"**, grid `ArticleCard` (6 terbaru) yang **otomatis update** tiap ada posting baru (route tetap `force-dynamic`), plus **legenda label keyakinan**. Bento marketing yang membingungkan (browser mockup `articles-preview.jpg`, orbit SVG, terminal log, mini-feed) **dihapus**. Urutan baru: hero → proof strip → Tulisan terbaru → Tiga pilar → Standar editorial → callout Arsip sumber → FAQ.
- **Dashboard admin (`/admin`) jadi overview nyata** (bukan cuma daftar posting): kartu statistik (total/terbit/draft tulisan, total & 7-hari kunjungan, jumlah arsip sumber + catatan riset), **grafik 14 hari**, **halaman terpopuler**, tombol aksi cepat, di atas tabel kelola tulisan. `lib/analytics.ts` (server-only) baru jadi sumber agregasi bersama untuk `/admin` **dan** `/admin/analytics`. `AdminHeader` label "Tulisan" → **"Dashboard"** (`active: "dashboard"`).
- **Arsip sumber kini bisa diklik:** tiap entri punya halaman sendiri `app/arsip-sumber/[slug]/page.tsx` (deskripsi penuh via `MdxBody` + metadata + tombol "Buka sumber asli"). `SourceEntry` membawa `content`; `getSourceBySlug`/`getSourceSlugs` ditambah (SSG, 25 halaman). Baris tabel listing me-link ke detail (bukan lagi langsung ke URL eksternal). **10 sumber placeholder ditulis ulang jadi nyata** + **15 sumber baru terverifikasi** (Oryx harimau Jawa studi+bantahan, IUCN, Hoogerwerf, coelacanth, Nagarakretagama, Babad Diponegoro, Arsip VOC/ANRI, UNESCO Borobudur/Ujung Kulon/Komodo, GVP Krakatau/Tambora, Global Forest Watch, BPS).
- **Artikel Harimau Jawa diperdalam + TERBIT:** body diperluas (apa itu Lazarus taxon, kronologi kepunahan, sampel rambut 2019, studi *Oryx* 2024 + bantahan *numt*, tabel pemisahan klaim, syarat verifikasi), **3 foto domain publik** (sampul foto Hoogerwerf 1938 + peta sebaran + foto penangkaran F.W. Bond) di `public/images/harimau-jawa/`. Parser MDX kini baca `coverImage` di frontmatter; `prose-nali` dapat styling `img` + caption. `status: published`, label tetap **needs-verification** (jujur).
- **Verified live (production):** semua route 200, `/admin*` 307→login, artikel tampil dengan sampul+gambar+tabel, "Tulisan terbaru" di home, baris arsip me-link ke detail. build/lint/typecheck clean. Push `main` → auto-deploy.
- **Masih berlaku:** akun admin = tugas founder (Supabase → Auth → Add user); alur authed (login→editor→upload→terbit) belum dites E2E.

### 12 Juni 2026 (lanjutan 2), Editorial trust + arsip sumber + sprint 30 artikel (founder-directed)

Mengeksekusi prompt `nali_editorial_trust_source_archive_30_articles_prompt.md` penuh.
Reposisi NaLI dari framing lama yang mengesankan observasi lapangan pribadi menjadi
**jurnal riset terbuka (open-source evidence journal)**, founder belum bisa kerja
lapangan langsung (gear/budget belum lengkap), jadi semua bukti dari sumber pihak ketiga.

- **Trust/positioning (prioritas 1):** semua disclaimer "contoh (seed)" dihapus dari 5
  artikel; 2 catatan riset lama ditulis ulang jadi **catatan riset** pihak
  ketiga; mangrove (yang bergaya on-site) di-reframe + recategorize ke `alam`. Hero,
  FAQ, nav, footer, tentang, manifesto, peta→"Indeks Eksplorasi", layout meta semuanya
  di-reframe. Label keyakinan → kosakata sprint (Terverifikasi kuat / Didukung sumber /
  Terbatas / Belum cukup bukti; "Diperdebatkan" per-klaim).
- **Skema (lib/types.ts):** Article + evidenceBasis, firstPartyFieldwork(false), series,
  claimLedger, limitations, images. SourceEntry + reliabilityLevel, topics, doi,
  archiveUrl, institution, keyClaims, limitations, checkedAt. FieldNote + evidenceType.
  Artikel detail render banner "Basis tulisan", **Claim Ledger**, batasan, kredit gambar,
  chip seri, JSON-LD.
- **Trust pages baru:** `/metodologi`, `/koreksi`, `/seri`, `/pedoman-sumber`,
  `/lisensi-foto`. Nav diramping. `lib/series.ts` (7 seri).
- **Arsip Sumber:** 25→**38 sumber** (13 baru terverifikasi web: IUCN badak Jawa/Komodo/
  orangutan Tapanuli/coelacanth, GVP Toba/Merapi, PNAS Samalas 1257, Anak Krakatau 2018,
  Jakarta subsidence, peat-fire ACP/PNAS, UNESCO Sumatra, Banda 1621). 25 lama di-backfill
  metadata terstruktur via `scripts/backfill-sources.mjs`. Listing jadi **filter
  client** (tipe/topik/keandalan); detail render keyClaims+limitations+DOI+checkedAt.
- **Artikel:** 6 lama di-rebuild ke standar baru + **3 baru** (Badak Jawa, Tambora 1815,
  Jakarta Tenggelam) → **9 terbit** dari 30. Sisanya direncanakan di
  `docs/nali_30_article_editorial_plan.md` (TIDAK dipaksa 30 demi angka).
- **Validator:** `npm run check:editorial` (`scripts/validate-editorial-content.mjs`), larang demo-terms + first-person fieldwork; wajib claimLedger/limitations/evidenceBasis
  per artikel, metadata+limitations per sumber, kredit lengkap per gambar.
- **Docs:** orientation, baseline, public-copy audit, research backlog, rejected sources,
  30-article plan, image register, **final report** (`docs/nali_editorial_trust_source_archive_sprint_report.md`).
- **QA:** lint/typecheck/check:editorial/build clean; 63 route; runtime curl 23 route 200,
  bogus 404, /admin 307. **Belum push** (menunggu keputusan founder).
- **Masih placeholder:** email `halo@nali.native.id` (di `SITE.email`), mailbox nyata =
  tugas founder. Editor `/admin` belum tangkap claimLedger/evidenceBasis untuk post DB.

### 14 Juni 2026, Benchmark Nous Research → identitas per-halaman + background animasi (founder-directed)

Sesi UI panjang membandingkan situs ke nousresearch.com lalu mengeksekusi.
- **Benchmark + motion audit** (docs: `nali_jurnal_nous_benchmark_ui_ux_report.md`,
  `nali_nous_forensic_ui_ux_audit.md`, `nali_nous_motion_interaction_audit.md`,
  `nous_full_navbar_style_animation_catalog.md`). Mengadopsi disiplin Nous "satu skeleton,
  warna beda tiap halaman" + device kecil (link-underline, PulseDot, SegmentedBar, Callout,
  Glyph, CopyLinkButton, TerminalLog, PillarMotif). `/jurnal` & `/arsip-sumber` dirombak
  (overflow fix, tabel/kartu toggle, instrument panel). Admin: header → `AdminShell` sidebar
  ikon kiri (`AdminHeader.tsx` dihapus).
- **Tema identitas per-halaman** (CSS-var override di wrapper, light+dark, di `globals.css`):
  pilar `theme-alam`(hijau)/`sejarah`(bronze)/`investigasi`(slate-biru)/`catatan`(olive) +
  nav `theme-jurnal`(indigo)/`seri`(plum)/`arsip`(slate)/`metodologi`(graphite)/
  `tentang`(clay)/`kontak`(royal). Beranda+Artikel tetap teal (jangkar netral). Semua
  aksen ≥4.5:1 (AA). **Gotcha:** halaman pilar TIDAK ada di nav → founder kira "tak berubah";
  makanya nav pages diberi warna sendiri.
- **Background animasi per nav page** (commit `d0ef77a`): `components/PageBackdrop.tsx`
  (fixed -z-10, pointer-events-none, redup di light, hilang saat reduced-motion → fallback
  ke tekstur tema statis) membungkus 5 komponen di `components/ui/`: smoke WebGL2 (jurnal,
  indigo), Warp `@paper-design/shaders-react` (seri, plum), fluid particles canvas (arsip,
  slate light/dark-aware), turbulent-flow three.js+gsap (metodologi, **diwarnai ulang ke
  graphite**, bukan rainbow), wave canvas (tentang clay / kontak royal). Konten padat duduk
  di permukaan `bg-paper/NN backdrop-blur` agar terbaca; hero menampilkan motion.
  **Dep berat:** `three`+`@types/three`+`gsap` (metodologi 277kB) & `@paper-design/shaders-react`
  (seri 132kB); 3 background lain vanilla canvas/WebGL (ringan). Komponen aslinya diperbaiki
  untuk TS strict + diadaptasi dari hero fullscreen → background.
- **Verified:** tsc/lint/build clean; 6 halaman light+dark (Playwright), color-synced,
  terbaca; live production. **Pre-existing gate merah:** `check:editorial` menandai em-dash
  di `docs/nous_full_navbar_style_animation_catalog.md` (docs, tak terkait, tak blok deploy).
- **Optimasi 60fps + warna nav (commit `1c3337d`):** 6 background ke **60fps** (diukur in-browser).
  Lever: buang `backdrop-blur` di content sheet (re-blur konten gerak = biaya terbesar → ganti
  `bg-paper/88-92` solid); smoke+turbulent render resolusi turun (DPR 1 / 60% buffer, CSS upscale);
  turbulent oktaf noise dikurangi; Warp `maxPixelCount` cap + `swirlIterations` 4; wave buffer
  kecil tetap (CSS upscale, tanpa blit per-frame) + lookup sin/cos branchless `(v*IDX)&1023`;
  particles 600. **Warna nav "belang" diperbaiki:** `SiteChrome` cascade tema route ke wrapper
  `display:contents` (Nav+main+footer) → nav/hairline/footer ikut aksen halaman, tanpa box tekstur
  kedua / tanpa ubah layout. Verified light+dark, nav match tiap halaman.

### 15 Juni 2026, Beranda lebih simpel + Tentang gaya "About Us" + bersih em-dash (founder-directed)

- **Beranda dirombak lebih tenang & direct** (`app/page.tsx`): hero shader full-bleed
  (WaveHero/DitheringShader, kini tak dipakai tapi disimpan untuk revert) diganti hero
  editorial tenang di kertas (judul Fraunces "Cerita Indonesia, dibangun dari bukti" +
  CTA "Baca artikel"/"Cara kerja kami" + newsletter light). 7 section dipadatkan jadi 5
  (hero, apa-ini, tiga pilar dgn dot warna pilar, tulisan terbaru, callout arsip). Warna
  ditenangkan (tanpa fill berat/silau), copy di-humanize. Verified light+dark.
- **Tentang jadi section gaya "About Us"** (komponen 21st.dev) dibangun ulang di gaya NaLI
  (`components/TentangSection.tsx`): background clay wave + theme + PageHeader TIDAK diubah
  (perintah founder); prosa diganti 6 item "cara kami bekerja" (ikon `lucide-react`)
  mengelilingi plat emblem NaLI + 4 stat count-up dari data nyata (32 artikel / 146 sumber /
  7 seri / 2 catatan) + CTA clay tenang. TANPA framer-motion (motion pakai pola ringan situs +
  IntersectionObserver count-up). Dep baru: `lucide-react`.
- **Em-dash dibasmi total:** 186 em-dash (docs, komentar CSS/kode, 1 string Jurnal) diganti
  koma/hyphen via perl UTF-8 sweep, **0 em-dash di repo**. `.playwright-mcp` ditambah ke
  skipDirs `scanEmDashes` agar `check:editorial` tak menandai artefak tool. Lihat
  [[no-em-dashes]]. Gate hijau.
- **Verified:** tsc/lint/check:editorial/build clean; beranda+tentang light+dark (Playwright);
  live production. **WaveHero/DitheringShader kini dead code** (recoverable, founder bisa minta balik).

### 15 Juni 2026 (lanjutan), Eksekusi NALI_MASTER_BUILD penuh (Langkah 1-11)

Menjalankan `NALI_MASTER_BUILD.md` (MBD v1.1) langkah 1-11 berurutan, batch per
batch dengan verifikasi tiap langkah. Founder (AskUserQuestion) memilih: ikuti
urutan penuh 1-11; handle sosial "Segera hadir"; newsletter tetap Supabase;
theme toggle tetap pakai localStorage (tidak kenalkan localStorage baru).
Laporan lengkap: `NALI_BUILD_REPORT_2026-06-15.md`.

- **Langkah 2 bug fix** (`18b600a`): BUG-001 counter /tentang dipusatkan ke
  `lib/stats.ts` (seri aktif) + hardening count-up; BUG-002 /kontak via
  `SOCIAL_LINKS` (badge "Segera hadir", slot handle siap) + tautan RSS; BUG-003
  `calculateReadingTime` tunggal (200 wpm ceil) untuk MDX+DB.
- **Langkah 3 audit** (`4ade1d7`): `scripts/audit-content.mjs` (skor 0-1, bedakan
  404 mati vs 403/timeout diblok-bot), `content/_audit/audit-report-2026-06-15.json`
  (180 file keep, 0 mati, 82 diblok-bot). Perbaiki 13 URL mati ke kanonik live.
- **Langkah 4 discovery** (`2b8b176`): Global Search Fuse.js Cmd+K
  (`/api/search-index` + `components/search/GlobalSearch.tsx`); SEO (twitter card
  artikel, robots disallow /admin+/api); RSS `/feed.xml`.
- **Langkah 5 depth** (`b985d00`): Claim Ledger collapsible + tautan sourceIds ke
  /arsip-sumber; related kontekstual (`related[{slug,relasi}]`); badge depth
  (`articleDepth`).
- **Langkah 6 retention** (`63f673a`): `/api/subscribe` (Supabase, server-side);
  SeriesNavigation (progress + prev/next); **Peta Eksplorasi interaktif** =
  `lib/graph.ts` + `components/graph/KnowledgeGraph.tsx` (canvas force-directed
  buatan sendiri, tanpa D3/Cytoscape, fallback list mobile).
- **Langkah 7 library** (`5ef1c91`): `lib/citation.ts` + CitationModal
  (APA/MLA/Chicago/BibTeX/RIS, salin+unduh); arsip advanced search (teks bebas +
  rentang tahun digabung filter); `/topik/[tag]` + tag menaut ke sini.
- **Langkah 8 transparansi** (`0701c98`): /koreksi log (`content/corrections/`) +
  CorrectionForm; /catatan-lapangan backlog riset (`lib/research-backlog.ts`);
  changelog artikel (`changelog[]`).
- **Langkah 9 konten** (`3ce8c4e`): field `internalScore` + **1 artikel terbit
  hasil deep-research nyata** (Pesut Mahakam, 4 sumber Tier1/2 terverifikasi-live,
  internalScore 0.86, claimLedger, foto CC BY 3.0). **300 artikel TIDAK
  digenerate massal**, karena LARANGAN-006/008 melarang konten tanpa riset nyata;
  sisanya program editorial multi-sesi (antrian di `lib/research-backlog.ts`).
- **Langkah 10-11**: build/tsc/lint/check:editorial/check:article-images semua
  hijau; push `327b658..3ce8c4e`; **produksi terverifikasi** (feed.xml, /topik,
  artikel Pesut, sitemap semua 200). Laporan `fa14264`.
- **Stack baru**: `fuse.js`. Graf F4.3 sengaja tanpa D3/Cytoscape demi bundle size.
- **Masih placeholder (tugas founder)**: email `SITE.email`, handle sosial,
  editor /admin belum tangkap field baru (internalScore/changelog/related).

---

*Last updated: 15 Juni 2026, eksekusi NALI_MASTER_BUILD penuh Langkah 1-11 (bug fix, audit + perbaikan 13 URL mati, global search Cmd+K, SEO/RSS, claim ledger/related/depth, newsletter API + series nav + peta eksplorasi interaktif, sitasi + advanced arsip search + /topik, koreksi/catatan-backlog/changelog, internalScore + artikel Pesut Mahakam hasil deep-research). Semua gate hijau, produksi terverifikasi. Pushed `fa14264`. Lihat `NALI_BUILD_REPORT_2026-06-15.md`.*
