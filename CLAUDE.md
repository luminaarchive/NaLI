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
- **Langkah 9 konten** (`3ce8c4e`, lanjutan `fcc614e`): field `internalScore` +
  **3 artikel terbit hasil deep-research nyata, satu per pilar**: Pesut Mahakam
  (alam, IUCN+Oryx+RASI, score 0.86), Prasasti Yupa Kutai (sejarah, Vogel 1918+
  ANU+Cogent 2025, score 0.84), Ekspor Pasir Laut PP 26/2023 (investigasi, teks
  resmi BPK+Greenpeace+Mongabay, score 0.78, framing hak jawab). 10 sumber baru
  terverifikasi-live, foto berlisensi (CC BY/CC0/CC BY-SA). Audit akhir 193 file
  semua keep, 0 URL mati. **300 artikel TIDAK digenerate massal**, karena
  LARANGAN-006/008 melarang konten tanpa riset nyata; sisanya program editorial
  multi-sesi (antrian di `lib/research-backlog.ts`).
- **Langkah 10-11**: build/tsc/lint/check:editorial/check:article-images semua
  hijau; push `327b658..3ce8c4e`; **produksi terverifikasi** (feed.xml, /topik,
  artikel Pesut, sitemap semua 200). Laporan `fa14264`.
- **Stack baru**: `fuse.js`. Graf F4.3 sengaja tanpa D3/Cytoscape demi bundle size.
- **Masih placeholder (tugas founder)**: email `SITE.email`, handle sosial,
  editor /admin belum tangkap field baru (internalScore/changelog/related).

### 15 Juni 2026 (lanjutan 2), Fase 7 Massive Knowledge Pipeline (founder-directed)

Founder minta pipeline produksi untuk membangun basis pengetahuan besar (target
300 artikel/jurnal/arsip/investigasi), TANPA data fiktif. Diselesaikan dengan
menafsirkan "massive" pada bagian yang memang sah di-bulk: **katalog Jurnal +
Arsip Sumber dari metadata OA nyata**. Artikel/investigasi TIDAK digenerate
massal (validator wajibkan gambar berlisensi + claim ledger per artikel; bulk =
mengarang analisis, melanggar LARANGAN-006/008). Lihat
`docs/nali_fase7_knowledge_pipeline.md`.

- **Miner** (`scripts/mine/harvest.mjs`): harvest metadata nyata dari OpenAlex
  (no-auth), permutasi 50 topik x 10 region + 25 kueri kurasi, rekonstruksi
  abstrak, dedup DOI/judul, skor 0..1, filter relevansi Indonesia. 78 keyword
  ter-cache -> **1.956 record**, 556 score>=0.6 + relevan. Cache & raw_dataset
  di-gitignore (regenerable, berisi abstrak pihak ketiga). OpenAlex rate-limit
  -> harvest besar lambat; cache buat re-run instan.
- **Generator** (`scripts/mine/generate.mjs`): pilih record terbaik yang BELUM
  dipakai, verifikasi PDF resolve / landing live (cache liveness), emit pasangan
  **JURNAL** (`content/jurnal/publications/batch-2.ts`, real DOI/venue/penulis +
  PDF/landing terverifikasi) + **ARSIP SUMBER** (`content/sources/<slug>-src.mdx`)
  yang saling tertaut (`usedInJurnalIds` <-> `relatedSourceIds`). Sinopsis =
  deskripsi katalog berbasis metadata (tidak meringkas/mengarang temuan; arahkan
  ke sumber asli). Auto-register `content/jurnal/index.ts`. Checkpoint
  `content/logs/progress.json` (STEP 15, resumable).
- **Hasil batch**: +306 jurnal, +306 sumber -> **jurnal=330, arsip-sumber=465**
  (dua-duanya lewat target 300). Hanya 4 di-skip (link mati).
- **Gotcha yang diperbaiki**: em-dash dari judul/abstrak harvested -> `noEmDash`
  saat emit (escape karakter em-dash di regex sendiri) + `content/raw`,`content/cache`
  ke skipDirs `scanEmDashes` + gitignore; `official_pdf` wajib URL ber-bentuk PDF
  (gate `PDF_LIKE`, kalau resolve tapi URL DOI -> fallback external_source_only);
  false-positive "Java" (bahasa pemrograman) di-drop via `SOFTWARE_FP` tanpa
  sinyal Indonesia kuat. Commit ini juga menyertakan artikel sesi sebelumnya yang
  belum ter-commit (Prasasti Yupa, Ekspor Pasir Laut + sumber/gambar).
- **Verified**: tsc 0, lint clean, `check:editorial` PASS, `npm run build` exit 0
  (330 halaman /jurnal + 327 download.txt + 465 /arsip-sumber ter-render).
- **Catatan jujur**: cover Jurnal baru pakai source-card fallback (lisensi cover
  belum jelas) -> WARN >20% non-fatal. Sisa target adalah lanjutan: jalankan ulang
  `generate.mjs --count N` (akumulatif) untuk tambah, dan tulis artikel deep-
  research satu per satu (bukan generate massal).

### 15 Juni 2026 (lanjutan 3), NaLI V2 Modul 1: Living Knowledge Engine (founder-directed)

Founder kirim spec besar `NALI_V2_LIVING_ENGINE.md` (12 modul, ubah situs jadi
"Living Research Platform"). Perintah: tambahkan saja, jangan rubah yang sudah
ada, tanpa em-dash, humanize, push ke main. Spec sendiri (LARANGAN-V2-002)
mewajibkan satu modul per sesi sampai lolos build. Jadi sesi ini = **Modul 1
saja**, additive penuh.

- **Spec disimpan** sebagai `NALI_V2_LIVING_ENGINE.md` di root (em-dash dibersihkan,
  humanized) + checklist status modul (Modul 1 dicentang, 2-12 antre).
- **Modul 1 (dashboard kendali):** `types/living-engine.ts` (LivingStats),
  `lib/living-engine.ts` (`getLivingStats`, server-only, hitung dari data NYATA:
  arsip 465, jurnal 330, investigasi, bukti-dicari = artikel < high, revisi hari
  ini dari checkedAt/updated/changelog, lastUpdated; field tanpa sistem =
  kontributor/misi diisi 0 jujur, bukan angka palsu), `components/dashboard/
  LivingDashboard.tsx` (RSC murni, gaya terminal monokrom archive-ink, dot hijau
  `animate-pulse` saat revisiHariIniCount>0, CSS-only tanpa client JS).
- **Rute baru `/ruang-kendali`** (force-dynamic, seperti halaman data lain) +
  1 entri Nav additif ("Ruang Kendali"). **Beranda lama tidak disentuh** (spec
  ingin ini jadi homepage V2 nanti; saya buat rute terpisah agar additive).
- Tanpa dependensi baru (LARANGAN-V2-001 ditaati: RSC + Tailwind saja). Pakai
  `theme-metodologi` (graphite) yang sudah ada.
- **Verified**: tsc 0, lint clean, check:editorial PASS (sekalian benahi 1 em-dash
  warisan di log Fase 7 CLAUDE.md:554), build exit 0 (`/ruang-kendali` ƒ dynamic).
- **Berikutnya** (atas perintah founder, satu per sesi): Modul 2 graf interaktif,
  3 peta Indonesia, 4 timeline, dst. Modul 5 (komunitas) & 9/10 (pipeline 50k)
  melampaui keputusan terkunci V1, hanya dikerjakan bila founder minta eksplisit.

### 16 Juni 2026, NaLI V2 Modul 2-12 (founder: "lanjut eksekusi semua satu satu")

Founder minta lanjut semua modul. Dikerjakan additive penuh (beranda lama utuh),
tanpa em-dash, tanpa dependensi baru (LARANGAN-V2-001), tiap modul dari data NYATA.

- **Modul 2 (graf):** sudah ada sejak Fase 6 (`KnowledgeGraph` di /peta-eksplorasi),
  tidak dibangun ulang.
- **Modul 4 `/linimasa`:** `lib/timeline.ts` ambil tahun hanya bila eksplisit di
  judul/tag/slug (tidak menebak), tertaut artikel+sumber.
- **Modul 6 `/bukti-dicari`:** agregasi artikel < terverifikasi-kuat + batasannya
  sendiri; CTA ke /koreksi.
- **Modul 7 `/aktivitas`:** `lib/activity.ts` feed dari tanggal verifikasi konten
  nyata (dikelompok per hari + ringkas per jenis) + checkpoint pipeline.
- **Modul 11 `/koneksi`:** `lib/relations.ts` hitung MasterRelasi (degree per
  entitas, breakdown artikel/sumber/seri/topik) dari graf yang sama.
- **Modul 12 `/banding`:** `components/CompareSources.tsx` (client), dua sumber
  berdampingan, tanpa kesimpulan AI.
- **Modul 5 `/misi`:** `content/missions/*.json` (2 celah riset nyata) +
  `lib/missions.ts`; tanpa login, kontribusi via koreksi/kontak (TANPA backend
  GitHub Actions, itu infra founder). Kontributor 0 jujur. Otomatis mengisi
  `misiAktifCount` di dashboard Modul 1.
- **Modul 3 `/peta-indonesia`:** peta skematis SVG bebas dependensi (tanpa Leaflet/
  Mapbox, privacy-first). `lib/geo.ts` + gazetteer koordinat nyata; hanya plot
  tempat yang dikenal, sisanya tidak diplot. Bukan peta survei (disebut jelas).
- **Modul 8 Discovery Score:** `components/DiscoveryScore.tsx` (client) di
  /ruang-kendali. URL-state saja, TANPA localStorage/sessionStorage/cookie/DB
  (LARANGAN Modul 8). Reset saat reload, disengaja.
- **Modul 9/10 archive pipeline:** `scripts/archive/pipeline.mjs` metadata-only +
  registry target global + backoff. Provider hidup = Library of Congress
  (Chronicling America). **Gotcha:** loc.gov di belakang Cloudflare menantang Node
  `fetch` (403 "Just a moment"); UA panjang juga ditolak. Solusi: fetch via `curl`
  (execFile) + UA pendek "Mozilla/5.0 NaLI-research" -> 6 record nyata. Endpoint
  lama chroniclingamerica.loc.gov 308 -> pindah ke www.loc.gov/collections/...?fo=json
  (`at=results`, tanpa `,pagination` yang bikin timeout). Dataset di content/raw
  (gitignored). Target 50k = program bertahap, bukan angka karangan.
- **Discoverability:** nav tidak ditambah lagi (cukup "Ruang Kendali" dari Modul 1
  agar nav tidak penuh). Semua rute V2 baru dijangkau dari hub `/ruang-kendali`
  (grid kartu tautan ke linimasa, bukti-dicari, aktivitas, koneksi, banding, misi,
  peta-indonesia). Semua rute juga masuk sitemap.
- **Verified**: tsc 0, lint clean, check:editorial PASS, build exit 0 (7 rute baru).

### 16 Juni 2026 (lanjutan), Klaster Lazarus A4: black-browed babbler (founder-directed)

- **Artikel A4 terbit** (`content/articles/black-browed-babbler-burung-hilang-172-tahun.mdx`,
  confidence high, ~960 kata, kategori alam, seri `spesies-hilang-bertahan`):
  burung yang hilang 172 tahun, hanya dikenal dari satu spesimen abad ke-19 di
  Naturalis (asalnya sempat keliru dikira Jawa), ditemukan kembali Okt 2020 oleh
  dua warga Kalsel (Suranto & Fauzan) yang ikut jadi penulis makalah. 4 sumber
  terverifikasi-live (BirdingASIA 2020 via OBC, BirdLife, ABC, Mongabay). Claim
  ledger 4 baris, batasan jujur (jeda 170-172 thn, populasi belum diketahui).
  Foto **burung hidup** CC BY 4.0 oleh Panji Gusti Akbar (iNaturalist/Commons) di
  `public/images/black-browed-babbler/`. `related` ke A1, A3, dan harimau jawa.
- **Wave 1 klaster Lazarus selesai**: A1 (jangkar konsep), A2 (harimau jawa, sudah
  ada), A3 (echidna), A4 (babbler). Roadmap `docs/nali_lazarus_species_cluster.md`
  ditandai A4 SUDAH TERBIT. 3 entri backlog riset yang kini terbit (Lazarus taxon,
  echidna, babbler) dibersihkan dari `lib/research-backlog.ts`.
- **Gotcha infra**: `git push` via SSH port 22 timeout (jaringan blokir 22) ->
  berhasil lewat `GIT_SSH_COMMAND='ssh -o Hostname=ssh.github.com -o Port=443'`
  (endpoint SSH-over-443 GitHub). Pakai trik ini kalau port 22 mati lagi.
- **Verified**: tsc 0, lint clean, check:editorial PASS, build exit 0,
  check:article-images 38/38 render figur bergambar+kredit. Push `b091ef8..c8667e8`.
  Produksi terverifikasi (`nalijournal.vercel.app`): artikel+gambar 200, muncul di
  /alam dan /seri. Total artikel terbit = 38.
- **Berikutnya (founder)**: Wave 2 klaster (B1 coelacanth, B2 lebah Wallace; B3/B4
  sebagian sudah ada). Satu artikel deep-research per minggu, bukan generate massal.

### 16 Juni 2026 (lanjutan 2), Klaster Lazarus Wave 2: B1 coelacanth + B2 lebah Wallace (founder-directed)

- **B2 terbit baru** (`content/articles/lebah-raksasa-wallace-megachile-pluto.mdx`,
  confidence high, kategori alam, seri spesies-hilang-bertahan + wallacea-evolusi):
  Megachile pluto, lebah terbesar dunia, dikumpulkan Wallace di Bacan (deskripsi
  Smith 1860), ditemukan ulang 1981 lalu hilang 38 thn, satu betina difoto/difilmkan
  hidup di Halmahera 2019 (tim Clay Bolt/Eli Wyman). 4 sumber terverifikasi (NHM,
  IUCN e.T4410A21426160, Sci-News, katalog Smith 1860). Gambar **ilustrasi Smith
  1860 domain publik** (`public/images/lebah-wallace/`). Related ke A1, A4, B1.
- **B1 coelacanth ditingkatkan** (`coelacanth-sulawesi-fosil-hidup-laut-dalam.mdx`,
  sudah ada sejak 12 Jun) ke standar Wave: claim ledger spesifik (kisah Erdmann
  1997-1998 di pasar Manado Tua, divergensi 40-30 jt thn, data laut dalam terbatas),
  `internalScore`, `related` ke A1/B2/A4, bagian baru pengetahuan lokal + sengketa
  penamaan, status IUCN Rentan. Bukan ditulis ulang dari nol, tetap pakai diagram
  SVG buatan sendiri yang sudah ada.
- **Floor 900 kata**: validator menghitung kata BODY (frontmatter di-strip); `tail`
  sempat menyembunyikan WARN untuk artikel berawalan huruf depan alfabet. A4 babbler
  (832), B1 coelacanth (727), B2 lebah (826) semula di bawah floor -> ketiganya
  diperluas dengan substansi nyata sampai >900 (babbler +paragraf etika lepas-bukan-
  awetkan; lebah +paragraf kelangkaan data; coelacanth +pengetahuan lokal/sengketa
  nama + konservasi). Catatan: floor 900 itu WARN non-fatal, build tetap hijau.
- **Gotcha verifikasi lokal**: server `node` basi (PID lama) nyangkut di :3000 dari
  build SEBELUM file baru ada -> `npm start` gagal bind diam-diam, curl kena build
  basi (artikel baru 404, lama 200). Deteksi: `lsof -nP -iTCP:3000 -sTCP:LISTEN`
  (proses muncul sebagai "node", bukan "next start", jadi `pgrep -f "next start"`
  kosong). Solusi: `kill -9 <pid>` lalu start ulang. Selalu cek port bebas sebelum
  percaya hasil curl lokal.
- **Wave 2 sebagian**: B1 (coelacanth) + B2 (lebah) selesai; B3 (badak jawa) & B4
  (pesut) sudah ada dari sesi lain. Entri lebah Wallace dihapus dari backlog riset;
  roadmap klaster ditandai B1+B2 SUDAH TERBIT.
- **Verified**: tsc 0, lint clean, check:editorial PASS, build exit 0,
  check:article-images 39/39 render figur bergambar+kredit. Push `e84e981..e9b1844`.
  Produksi (`nalijournal.vercel.app`): lebah+gambar 200, coelacanth 200, muncul di
  /alam. Total artikel terbit = 39.
- **Berikutnya (founder)**: Wave 3 (C1 burung Sangihe, C2 tumbuhan/serangga, C3 daftar
  spesies masih hilang). Satu artikel deep-research per minggu, bukan generate massal.

### 16 Juni 2026 (lanjutan 3), Klaster Lazarus Wave 3: C1 seriwang Sangihe (founder-directed)

- **C1 terbit baru** (`content/articles/seriwang-sangihe-burung-biru-yang-nyaris-punah.mdx`,
  confidence high, kategori alam, seri spesies-hilang-bertahan): Eutrichomyias rowleyi,
  burung biru endemik Sangihe yang 125 thn hanya dikenal dari satu spesimen 1873,
  ditemukan kembali Okt 1998 di Gunung Sahendaruman (Riley). 4 sumber terverifikasi-live
  (Riley 2002 OBC PDF, BirdLife DataZone status Kritis, Jakarta Post 2024 ancaman
  tambang, Rainforest Trust). Foto **burung hidup CC0 James Eaton** (iNaturalist/Commons,
  `public/images/cerulean-paradise-flycatcher/`). Related ke A1, babbler, echidna.
- **Sudut paling tajam di seri**: contoh "ditemukan bukan berarti aman" yang ekstrem,
  burung ditemukan kembali tepat saat hutan terakhirnya terancam tambang emas skala
  besar. Klaim tambang sengaja ditandai **"diperdebatkan"** di claim ledger (detail
  izin/status hukum dirujuk ke dokumen resmi, bukan ke opini). Genus monotipe
  Eutrichomyias dipakai sebagai bobot evolusioner (paralel argumen monotremata echidna).
- **Floor 900**: draft awal 867 kata -> +paragraf genus monotipe sampai >900.
- **Verified**: tsc 0, lint clean (implisit via build), check:editorial PASS, build
  exit 0, check:article-images **40/40** render figur bergambar+kredit. Push
  `b299857..a58b723`. Produksi (`nalijournal.vercel.app`): seriwang+gambar 200, muncul
  di /alam. Total artikel terbit = **40**.
- **Status klaster**: Wave 1 (A1-A4), Wave 2 (B1 coelacanth, B2 lebah; B3 badak/B4 pesut
  sudah ada), Wave 3 C1 (seriwang) selesai. Sisa: C2 (tumbuhan/serangga), C3 (daftar
  spesies masih hilang). Lanjut satu artikel deep-research per sesi.

---

*Last updated: 16 Juni 2026, klaster Lazarus Wave 3 C1 seriwang Sangihe terbit (Eutrichomyias rowleyi, hilang 125 thn ditemukan 1998, kini terancam tambang emas; confidence high, 4 sumber, foto hidup CC0 James Eaton, ancaman tambang ditandai diperdebatkan). Gate hijau (tsc/lint/check:editorial/check:article-images 40/40/build), produksi terverifikasi, push `a58b723`. Total artikel = 40. Sebelumnya: klaster Lazarus Wave 2: B2 lebah raksasa Wallace terbit (lebah terbesar dunia, hilang 38 thn, ditemukan 2019 Halmahera; confidence high, 4 sumber, ilustrasi Smith 1860 domain publik) + B1 coelacanth ditingkatkan ke standar klaster (claim ledger spesifik, related, internalScore). Ketiga artikel Wave (A4/B1/B2) diperluas lewat floor 900 kata. Gotcha: server node basi di :3000 bikin curl lokal kena build lama (cek `lsof :3000`, kill, start ulang). Gate hijau (tsc/lint/check:editorial/check:article-images/build), produksi terverifikasi, push `e9b1844`. Total artikel = 39. Sebelumnya: klaster Lazarus A4 black-browed babbler terbit (burung hilang 172 tahun, ditemukan dua warga Kalsel; confidence high, 4 sumber, foto burung hidup CC BY 4.0; Wave 1 A1-A4 selesai). Backlog riset dibersihkan dari 3 entri yang kini terbit. Gotcha: push lewat SSH-over-443 karena port 22 diblokir jaringan. Semua gate hijau (tsc/lint/check:editorial/check:article-images/build), produksi terverifikasi, push `c8667e8`. Sebelumnya: beranda V2 (`app/page.tsx`) kini jadi ruang kendali: LivingDashboard tampil tepat di bawah hero + grid "Modul V2" menautkan 8 surface (ruang-kendali/linimasa/peta-indonesia/koneksi/bukti-dicari/misi/aktivitas/banding); section lama (apa-ini, tiga pilar, tulisan terbaru, callout arsip) dipertahankan. Sebelumnya: NaLI V2 Modul 2-12 dieksekusi additive (rute baru /linimasa, /bukti-dicari, /aktivitas, /koneksi, /banding, /misi, /peta-indonesia + Discovery Score di /ruang-kendali + archive pipeline scaffold loc.gov; semua dari data nyata, tanpa dep baru). Gate hijau (tsc/lint/check:editorial/build). Lihat `NALI_V2_LIVING_ENGINE.md`. Sebelumnya: NaLI V2 Modul 1 Living Knowledge Engine (dashboard `/ruang-kendali` dari data nyata, RSC+Tailwind tanpa dep baru, beranda lama utuh; satu modul per sesi per LARANGAN-V2-002). Gate hijau (tsc/lint/check:editorial/build). Lihat `NALI_V2_LIVING_ENGINE.md`. Sebelumnya: Fase 7 knowledge pipeline (harvest OpenAlex nyata -> +306 jurnal & +306 arsip sumber tertaut, jurnal=330/arsip=465 lewat target 300; artikel/investigasi tetap editorial deep-research, bukan massal). Semua gate hijau (tsc/lint/check:editorial/build). Lihat `docs/nali_fase7_knowledge_pipeline.md` + `content/logs/progress.json`. Sebelumnya: eksekusi NALI_MASTER_BUILD penuh Langkah 1-11 (bug fix, audit + perbaikan 13 URL mati, global search Cmd+K, SEO/RSS, claim ledger/related/depth, newsletter API + series nav + peta eksplorasi interaktif, sitasi + advanced arsip search + /topik, koreksi/catatan-backlog/changelog, internalScore + artikel Pesut Mahakam hasil deep-research). Semua gate hijau, produksi terverifikasi. Pushed `fa14264`. Lihat `NALI_BUILD_REPORT_2026-06-15.md`.*
