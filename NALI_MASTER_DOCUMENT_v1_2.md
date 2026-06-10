# NaLI by NatIve — Master Document v1.2
**Build-First Publishing Machine Specification**

> **Cara pakai:** Ini adalah konteks strategis untuk Claude Code. Baca seluruh dokumen ini sebelum menulis satu baris kode. Semua keputusan di sini sudah dikunci. Jangan override tanpa instruksi eksplisit dari founder.

---

## Metadata

| Field | Value |
|---|---|
| Founder | Ansyahri Darma Tri Jati |
| Tanggal | 11 Juni 2026 |
| Versi | v1.2 |
| Arah | AI-assisted research, field journalism, editorial publishing — alam, sejarah, investigasi Indonesia |
| Mode | Solo founder, full vibe coding, no payment, no login, no AI wrapper di v0.1 |
| Hard Rule | **Build once. Publish daily. Jangan terus rebuild.** |

---

## Keputusan yang Sudah Dikunci (Tidak Bisa Dioverride)

1. Website editorial harus selesai sebagai build pertama sebelum publikasi dimulai.
2. Setelah website v0.1 live, fitur dibekukan minimal 14 hari.
3. Seluruh codebase NaLI lama (wildlife field intelligence app) sudah di-archive. **Tidak ada carry-over fitur apapun.**
4. Channel distribusi terkunci: **X, Instagram, TikTok.**
5. Monetisasi hanya setelah threshold minimum terpenuhi (lihat Section 19).
6. Tidak ada pivot sebelum Decision Gate Hari 30.

---

## 1. Identitas Produk

**NaLI by NatIve** adalah field journal dan research publication berbasis AI untuk membongkar dan menceritakan alam, sejarah, dan fenomena tersembunyi Indonesia.

### Nama
- **NaLI** = Nature, Archive, Lore, Investigation
- **NatIve** = identitas lokal Indonesia (huruf kapital I adalah intentional, selalu)
- **by NatIve** = local intelligence, field notes, research storytelling, AI-assisted publishing

### Bukan
- Bukan Palantir mini atau fraud forensic platform
- Bukan enterprise SaaS
- Bukan AI wrapper berbayar
- Bukan komunitas besar dari hari pertama
- Bukan app yang terus dibangun tanpa publikasi
- Bukan kelanjutan dari codebase NaLI wildlife field intelligence yang lama

---

## 2. Produk yang Dibangun: NaLI Field Journal Website

Website editorial lengkap, static-first, content-driven. Bukan SaaS. Bukan dashboard AI.

### Halaman yang Wajib Ada

| Route | Halaman |
|---|---|
| `/` | Homepage |
| `/articles` | Article listing dengan filter |
| `/articles/[slug]` | Article detail |
| `/alam` | Nature category |
| `/sejarah` | History category |
| `/investigasi` | Investigation category |
| `/catatan-lapangan` | Field notes |
| `/arsip-sumber` | Source archive |
| `/peta-eksplorasi` | Exploration list (bukan interactive map) |
| `/manifesto` | Editorial manifesto |
| `/tentang` | About |
| `/kontak` | Contact |

---

## 3. Tech Stack (Sudah Dikunci)

| Layer | Pilihan |
|---|---|
| Framework | Next.js 14 App Router, TypeScript |
| Styling | Tailwind CSS |
| Content | Markdown/MDX files (NO database, NO CMS) |
| Deployment | Vercel |
| Package manager | npm |

### Non-Negotiables
- Build harus selesai tanpa backend kompleks
- Konten ditulis sebagai file Markdown/MDX
- Deploy tanpa setup database
- SEO dasar ada sejak awal
- Performance dan readability lebih penting dari animasi

---

## 4. Brand

| Token | Value |
|---|---|
| Primary | `#2DD4A7` (teal) |
| Dark variant | `#1BA882` |
| Background teal | `#EAF8F3` |
| Black | `#0A0A0A` |
| Charcoal | `#1C1C1C` |
| Gray | `#6B6B6B` |
| Gray light | `#B0B0B0` |
| Rule | `#E0E0E0` |
| Background light | `#F7F9F8` |
| Font | System font stack |
| Brand name | **NaLI by NatIve** (kapital I selalu) |

### Hero Section
- Full-viewport landing page hero menggunakan **video loop MP4** sebagai background
- Source footage: Pexels, Mixkit, atau Coverr — classical/baroque architectural, arches, marble, ocean view
- Simpan di `public/videos/hero.mp4`
- Overlay teal `#2DD4A7` di `opacity-20`
- Text di atas video: putih, bold, high-contrast
- Mobile: video tetap play, fallback ke dark teal bg jika gagal

---

## 5. Content System

### Struktur Folder

```
/content
  /articles/       ← artikel utama published
  /field-notes/    ← catatan lapangan
  /sources/        ← arsip sumber entries
  /drafts/         ← draft (tidak dirender publik)
```

### Frontmatter Schema (Artikel)

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
    url: string (optional)
    type: jurnal | arsip | buku | media | laporan | lainnya
---
```

### Confidence Label (Wajib Tampil di Article Detail)

| Label | Warna Badge | Definisi |
|---|---|---|
| `high` | Teal | Didukung sumber kuat dan konsisten |
| `medium` | Kuning | Cukup didukung tapi butuh konteks |
| `low` | Oranye | Hipotesis kerja atau informasi terbatas |
| `needs-verification` | Merah | Belum boleh dipakai sebagai klaim final |

---

## 6. Scope v0.1 — Fitur Wajib

| Fitur | Status | Acceptance Criteria |
|---|---|---|
| Responsive layout | Wajib | Nyaman di mobile dan desktop |
| Homepage editorial | Wajib | Headline, one-liner, 3 pilar, latest posts, CTA |
| Article listing | Wajib | Filter kategori dan tag |
| Article detail | Wajib | Title, subtitle, date, category, reading time, body, sources, related posts |
| Category pages | Wajib | Alam, Sejarah, Investigasi, Catatan Lapangan |
| Source/citation section | Wajib | Sumber tampil di setiap artikel |
| Tag system | Wajib | Tag di list dan detail |
| SEO metadata | Wajib | Title, description, Open Graph |
| Sitemap | Wajib | Auto atau manual |
| Search sederhana | Wajib jika mudah | Jika berat, tunda ke v0.2 |
| RSS feed | Bagus | Jika mudah diimplementasi |

### Tidak Dibangun di v0.1

- Login / auth / akun user
- Payment, subscription, membership
- AI wrapper atau chatbot publik
- Komentar, forum, komunitas
- Admin dashboard custom
- Interactive map
- Real-time analytics custom
- Mobile app native
- Upload video/foto berat

**Jika muncul ide di luar daftar ini: masuk `BACKLOG.md`, tidak langsung dieksekusi.**

---

## 7. Homepage Requirements

- Hero section dengan video loop
- One-liner: *"Field journal dan research publication berbasis AI untuk membongkar dan menceritakan alam, sejarah, dan fenomena tersembunyi Indonesia."*
- Tiga pillar cards: Alam, Sejarah, Investigasi (masing-masing link ke category page)
- Latest posts grid (6 artikel terbaru)
- CTA ke `/articles`

---

## 8. Article Detail Requirements

- Title, subtitle
- Date, category badge, reading time (kalkulasi otomatis)
- Confidence label badge (color-coded sesuai tabel di Section 5)
- Full MDX body render
- Source list di bawah artikel
- Related posts (same category, max 3)
- Back to articles link

---

## 9. Seed Content

Buat 5 seed articles di `/content/articles/`. Tandai jelas sebagai sample content. Topik:

1. `alam` — fenomena alam lokal Indonesia
2. `sejarah` — sejarah kota tua Indonesia
3. `investigasi` — investigative brief ringan berbasis sumber publik
4. `catatan-lapangan` — field note dari eksplorasi lokal
5. `alam` — satwa atau ekologi lokal

Setiap artikel: frontmatter lengkap, minimal 400 kata body, minimal 2 source entries.

Buat juga minimal **10 seed source entries** di `/content/sources/`.

---

## 10. Standar Editorial (Untuk Seed Content)

- Artikel pendek: minimal 3 sumber
- Investigasi/sejarah: minimal 5 sumber
- Tidak ada fake certainty — jangan simpulkan lebih dari bukti
- Tidak ada tuduhan tanpa bukti kuat
- Setiap klaim yang belum pasti: beri label `needs-verification`

---

## 11. SEO Requirements

Untuk setiap halaman:
- `<title>` dan `<meta name="description">`
- Open Graph: `og:title`, `og:description`, `og:type`
- Gunakan Next.js Metadata API (bukan `next/head`)
- Canonical URL

---

## 12. Navigation

Desktop dan mobile responsive:
- Logo NaLI by NatIve
- Links: Artikel, Alam, Sejarah, Investigasi, Catatan Lapangan, Arsip Sumber, Tentang
- Mobile: hamburger menu

---

## 13. Quality Gates (Semua Harus Pass Sebelum Selesai)

- [ ] Semua routes resolve tanpa 404
- [ ] Hero video load (atau graceful fallback)
- [ ] Article listing filter by category bekerja
- [ ] Article detail render MDX body dengan benar
- [ ] Confidence badge tampil di article detail
- [ ] Source list tampil di article detail
- [ ] Mobile responsive di 375px
- [ ] Tidak ada lorem ipsum
- [ ] Tidak ada broken links di navigasi
- [ ] SEO metadata ada di homepage dan article pages
- [ ] Sitemap generate dengan benar
- [ ] `npm run build` pass tanpa error
- [ ] TypeScript tidak ada type error
- [ ] `npm run lint` pass clean

---

## 14. Anti-Scope-Creep Rules

| Rule | Implementation |
|---|---|
| Feature freeze | Setelah build selesai, tidak ada fitur besar selama 14 hari |
| Backlog parking lot | Semua ide baru masuk `BACKLOG.md`, tidak langsung dieksekusi |
| No shiny object | SaaS baru, game, marketplace tidak dibahas selama build |
| No rebuild | Tidak ada desain ulang total sebelum 30 hari data |

---

## 15. Deliverables

1. Working Next.js project deployable dengan `vercel deploy`
2. Semua halaman functional dan styled
3. 5 seed articles
4. 10 seed source entries
5. `README.md` yang menjelaskan cara:
   - Tambah artikel baru
   - Tambah field note
   - Tambah source entry
   - Deploy ke Vercel
6. `BACKLOG.md` untuk ide yang ditemukan selama build
7. `CLAUDE.md` berisi architectural decisions yang dibuat selama session ini

---

## 16. Distribution System (Konteks untuk Founder, Bukan untuk Dibangun)

Setelah launch, setiap artikel harus menghasilkan minimal 2 potongan distribusi ke channel yang sudah dikunci:

| Channel | Fungsi |
|---|---|
| X (Twitter) | Thread dan tulisan pendek. Primary untuk teks. |
| Instagram | Caption panjang, fact card visual, carousel. Primary untuk visual. |
| TikTok | Short video script 30-60 detik. Secondary. |

---

## 17. Daily Operating System (Konteks untuk Founder, Bukan untuk Dibangun)

Setelah website selesai, pekerjaan harian:

| Blok | Durasi | Output Minimum |
|---|---|---|
| Riset | 60-90 menit | 5 bullet insight + 3 sumber |
| Menulis | 90-120 menit | 700-1.200 kata atau draft lengkap |
| Publish | 30 menit | 1 post publish |
| Distribusi | 30-45 menit | 2-3 potongan konten |
| Maintenance | 15 menit | Bug/typo selesai atau dicatat |
| Log | 10 menit | 1 row metrics log |

---

## 18. Monetisasi (Konteks — Bukan untuk Dibangun Sekarang)

Tidak ada monetisasi di v0.1. Threshold minimum sebelum diuji:

| Opsi | Threshold Minimum |
|---|---|
| Newsletter premium | Min. 50 pembaca aktif baca 3+ artikel/bulan |
| E-book/report | Min. 5-10 tulisan kuat + engagement nyata |
| Sponsorship | Min. 500 unique visitors/bulan + brand fit jelas |
| Affiliate | Muncul natural dari konten, tidak dipaksakan |
| Mini tool | Dipakai sendiri minimal 30 hari sebelum dijual |

---

## 19. Roadmap

| Periode | Goal |
|---|---|
| Hari 1-10 | Build website lengkap dan seed content |
| Hari 11-24 | Proof-of-Pull Sprint: publish agresif, distribusi aktif |
| Hari 25-30 | Decision Week: pilih pilar, stop yang lemah |
| Hari 31-60 | Deepen chosen direction |
| Hari 61-90 | Monetization test pertama |

---

> **Final rule:** NaLI by NatIve v1.2 ada untuk menghentikan loop ide tanpa akhir. Build website-nya, bekukan, publish harian, distribusikan ke X/Instagram/TikTok, ukur respons nyata, dan hanya setelah itu putuskan apa yang menjadi uang.
