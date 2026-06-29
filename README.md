# NaLI by NatIve

Jurnal riset terbuka tentang **alam, sejarah, dan investigasi Indonesia**. NaLI menyusun artikel dari jurnal, arsip, laporan lembaga, dataset, dokumentasi pihak ketiga, dan visual berlisensi.

Built dengan Next.js 14 (App Router) + TypeScript + Tailwind CSS. Konten inti ditulis sebagai file MDX; fitur platform (newsletter, admin, misi, laporan warga, Intelligence Lab) didukung Supabase. Live di **https://nalibynative.com**.

Sejak v1.0, NaLI bukan lagi sekadar kumpulan artikel statis, melainkan sebuah **Intelligence Platform**: jurnal yang hidup dengan tutor per-artikel, kartu transparansi epistemik, jalur baca, misi sains warga, dan sebuah lab riset internal yang hanya boleh melahirkan pertanyaan, bukan klaim.

---

## NaLI Intelligence Platform (v1.0)

Platform ini dibangun dalam tiga lapisan (bucket), semuanya menjaga satu prinsip: **klaim selalu membawa sumber, dan spekulasi tidak pernah menyamar jadi fakta.**

**Untuk pembaca (yang terlihat di situs publik):**

- **Knowledge Genome**, kartu "label gizi epistemik" di atas tiap artikel (label keyakinan, komposisi claim ledger, basis bukti, jumlah sumber). Lihat `components/article/KnowledgeGenome.tsx`.
- **Tanya NaLI**, tutor RAG per-artikel yang menjawab hanya dari arsip NaLI dan berkata jujur saat sesuatu belum terindeks. Lihat `components/article/ArticleTutor.tsx` + `app/api/chat`.
- **Jalur Baca**, rangkaian terkurasi dari seri aktif di `/peta-eksplorasi` (`lib/reading-paths.ts`).
- **Misi Sains Warga**, pembaca mengirim laporan di `/misi`; laporan **privat sampai ditinjau editor** (`app/api/report`, `/admin/reports`).
- **Contradiction Engine** + **Living Articles**, klaim antar artikel yang berbenturan ditandai untuk ditinjau manusia, dan tiap artikel punya status kekinian yang dinyatakan penulis.

**Untuk pengelola (internal, di balik autentikasi):**

- **Intelligence Lab** (`/lab`, `/lab/signals`), memanen data terbuka (GBIF, iNaturalist, IUCN, Xeno-canto, YouTube), memberi **Skor Lazarus** dan skor sinyal yang transparan (heuristik prioritas, **bukan** probabilitas), lalu menampilkannya di dasbor privat.

### Model isolasi: Lab → Gerbang Manusia → Misi Publik

Inti etis platform adalah kontrak satu arah. Apa pun yang lahir di Lab tidak pernah langsung publik; ia harus lewat seorang editor, dan satu-satunya artefak yang menyeberang ke situs publik adalah sebuah **misi berupa pertanyaan**.

```
            RUANG INTERNAL (privat, belum terverifikasi)
  ┌───────────────────────────────────────────────────────────┐
  │  1. PANEN DATA        2. SKOR               3. DASBOR PRIVAT │
  │  GBIF · iNaturalist   Skor Lazarus          /lab             │
  │  IUCN · Xeno-canto ─▶ (heuristik, bukan ─▶  /lab/signals     │
  │  YouTube              probabilitas)         (admin, noindex) │
  └───────────────────────────────────────────────┬─────────────┘
                                                   │
                                   4. GERBANG MANUSIA (editor menilai)
                                      promosi 1-klik, keputusan manusia
                                                   │
                                            (satu arah)
                                                   ▼
            SITUS PUBLIK
  ┌───────────────────────────────────────────────────────────┐
  │  5. MISI = sebuah PERTANYAAN  ("adakah bukti terkini?")     │
  │     bukan klaim, bukan kesimpulan                            │
  │            │                                                 │
  │            ▼                                                 │
  │  6. /misi ─▶ laporan warga (privat sampai ditinjau)          │
  │            │                                                 │
  │            ▼                                                 │
  │  7. Bukti cukup ─▶ baru menjadi artikel bersumber            │
  └───────────────────────────────────────────────────────────┘
```

Tiga lapis penjaga menegakkan kontrak ini:

1. **RLS khusus admin** pada tabel Lab (`lab_leads`, `ghost_signals`); anon tidak punya policy baca.
2. **`npm run check:lab-isolation`**, build gagal bila kode publik (`lib`/`components`/`app` non-lab) mengimpor modul `@/(lib|components|app)/lab`.
3. **Kontrak promosi satu arah** di `app/api/lab/promote`, satu-satunya jalur Lab → publik, dan ia hanya menghasilkan pertanyaan.

Semua kunci data langsung (service-role, IUCN, Xeno-canto, YouTube, Gemini) bersifat **opsional**: tiap sumber punya fallback snapshot/kurasi yang ditandai jelas sebagai contoh, sehingga platform tetap berjalan dan bisa diverifikasi tanpa kredensial. Detail di `docs/lab-architecture.md`.

---

## Menjalankan secara lokal

```bash
npm install
npm run dev      # http://localhost:3000
```

Perintah lain:

```bash
npm run build      # build produksi
npm run start      # jalankan hasil build
npm run lint       # ESLint
npm run typecheck  # TypeScript (tsc --noEmit)
```

---

## Dashboard Admin, `/admin` (custom, milik sendiri)

Dashboard admin terpasang langsung di situs: **https://nalibynative.vercel.app/admin**.
Tulis artikel, upload foto, dan lihat statistik, semua di satu tempat. Konten
tersimpan di **Supabase** (Postgres + Storage); artikel terbit **seketika**
(tanpa nunggu deploy).

**Buat akun admin (sekali, ±1 menit):**
1. Buka **supabase.com** → project `nali-field-journal` → **Authentication → Users**
2. **Add user** → **Create new user** → isi email + password (centang
   *Auto Confirm User*)
3. Buka **/admin** di situs → login dengan email + password itu

**Yang bisa dilakukan:**
- ✍️ Tulis/edit artikel, form lengkap (kategori, label keyakinan, tag,
  ringkasan, daftar sumber), badan tulisan Markdown
- 🖼️ **Upload foto**, gambar sampul + sisipkan foto di dalam artikel
  (tersimpan di Supabase Storage, tampil otomatis di situs)
- 📝 **Draft** (tak tampil publik) atau **Terbitkan**
- 📊 **Statistik pengunjung** di `/admin/analytics`, total kunjungan,
  grafik 14 hari, halaman terpopuler (dihitung sendiri, tanpa cookie)
- 🗑️ Hapus tulisan

Artikel contoh bawaan (file MDX di `content/articles/`) tetap tampil; tulisan
baru dari dashboard digabung otomatis. Slug yang sama → versi dashboard menang.

Keamanan: `/admin` dijaga middleware (wajib login Supabase Auth); database
dilindungi row-level security (publik hanya baca artikel terbit; tulis/upload
hanya admin login).

### Variabel lingkungan
```
NEXT_PUBLIC_SUPABASE_URL=...        # project nali-field-journal
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # publishable key
```
Keduanya sudah diset di Vercel. Keterangan di `.env.example`.

## Struktur konten

```
content/
  articles/      ← artikel utama (.mdx)
  field-notes/   ← catatan riset (.mdx)
  sources/       ← entri arsip sumber (.mdx)
  drafts/        ← draft (TIDAK dirender publik)
```

Nama file menjadi `slug` default (mis. `api-biru-kawah-ijen.mdx` → `/articles/api-biru-kawah-ijen`).

### Tambah artikel baru

Buat file di `content/articles/<slug>.mdx`:

```yaml
---
title: "Judul artikel"
subtitle: "Subjudul satu kalimat"
slug: "judul-artikel"            # opsional; default dari nama file
date: "2026-06-11"               # YYYY-MM-DD
category: "alam"                 # alam | sejarah | investigasi | catatan-lapangan
tags: ["tag-a", "tag-b"]
summary: "Ringkasan untuk kartu & SEO."
confidence: "high"               # high | medium | low | needs-verification
status: "published"              # published | draft (hanya 'published' yang tampil)
sources:
  - title: "Judul sumber"
    url: "https://..."           # opsional
    type: "jurnal"               # jurnal | arsip | buku | media | laporan | lainnya
---

Isi artikel dalam **MDX**. Reading time dihitung otomatis.
```

Standar editorial: artikel pendek minimal 3 sumber; investigasi/sejarah minimal 5. Beri label `needs-verification` untuk klaim yang belum kuat. Jangan menyimpulkan lebih dari bukti.

### Tambah catatan riset

`content/field-notes/<slug>.mdx`:

```yaml
---
title: "Judul catatan"
location_label: "Lokasi, Daerah"
date: "2026-06-11"
tags: ["tag"]
summary: "Ringkasan singkat."
status: "published"
---

Isi catatan (MDX). Tampil di /catatan-lapangan.
```

### Tambah entri sumber

`content/sources/<slug>.mdx`:

```yaml
---
title: "Judul sumber"
type: "jurnal"                   # jurnal | arsip | buku | media | laporan | lainnya
author: "Penulis"                # opsional
year: 2018                       # opsional
url: "https://..."               # opsional
reliability: "Catatan keandalan" # opsional
related_topic: "Topik terkait"   # opsional
---
```

Tampil di tabel `/arsip-sumber`.

---

## Confidence label

| Label | Arti |
|---|---|
| `high` | Sumber kuat dan konsisten (teal) |
| `medium` | Didukung tapi butuh konteks (kuning) |
| `low` | Hipotesis kerja, bukti terbatas (oranye) |
| `needs-verification` | Belum boleh dipakai sebagai klaim final (merah) |

---

## Aset yang perlu kamu isi

- **`public/videos/hero.mp4`**, video loop hero homepage. Belum ada; tanpa file ini hero memakai fallback gelap-teal yang sudah didesain (tidak terlihat rusak). Sumber footage bebas-lisensi: Pexels, Mixkit, Coverr.
- **`public/logo.png`**, logo NaLI (sudah terisi dari aset brand).

## Placeholder yang perlu diganti sebelum live

- Domain di `lib/site.ts` (`SITE.url`), saat ini `https://nali.native.id`.
- Email kontak di `app/kontak/page.tsx`, saat ini `halo@nali.native.id`.
- 5 artikel + 10 sumber di `content/` adalah **seed/sample** (ditandai jelas di tiap tulisan). Verifikasi atau ganti sebelum mengandalkannya.

---

## Deploy ke Vercel

1. Push ke GitHub.
2. Import repo di [vercel.com](https://vercel.com), framework Next.js terdeteksi otomatis.
3. Set environment variables (untuk form langganan newsletter):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   Keduanya publik dan aman dikirim ke browser; tabel `subscribers` dilindungi
   row-level security (anon hanya bisa _insert_, tidak bisa membaca daftar).
   Tanpa env ini, situs tetap jalan, form langganan saja yang nonaktif.
4. Deploy. Sitemap tersedia di `/sitemap.xml`.

> Newsletter pakai Supabase (project `nali-field-journal`). Skema ada di
> `supabase/migrations/`. Kelola/ekspor pelanggan dari dashboard Supabase.

---

_Build once. Publish daily. Jangan terus rebuild._
