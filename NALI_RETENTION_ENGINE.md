# NALI_RETENTION_ENGINE.md

Spec retensi NaLI: mengubah situs dari "kumpulan artikel" jadi mesin eksplorasi yang
bikin orang betah, tanpa login, dari data nyata, tanpa mengorbankan kejujuran.

Founder brief (21 Juni 2026): lawan kita adalah perhatian (TikTok/Reels/YouTube),
bukan situs lain. Menangkan dengan kedalaman + rabbit-hole + daily + visual, gaya
Netflix/Wikipedia, mobile-first. Eksekusi Part 1, 2, 3. Hero neo-museum dipertahankan,
semua additif di bawahnya.

## KEPUTUSAN TERKUNCI SESI INI (jawaban founder)

1. Bangun Part 1 + Part 2 + Part 3 (per part, didokumentasikan di file ini).
2. Hook jujur: tambah baris "hook" penasaran sebagai kicker, TAPI judul + label
   keyakinan tetap apa adanya. TANPA clickbait.
3. Hero sinematik (NeoMuseum) dipertahankan; rak konten + daily ditambah di bawahnya.

## LARANGAN (mutlak, jangan dilanggar)

- L1. TANPA login, TANPA backend baru. State user = `localStorage` saja.
- L2. TANPA data fiktif. Semua "fakta", "hari ini dalam sejarah", "trending" harus
  dari konten/sumber nyata yang sudah ada atau kurasi tervalidasi. Kalau tak ada data,
  sembunyikan elemen, JANGAN mengarang.
- L3. TANPA clickbait. Hook = baris terpisah (kicker), judul tetap jujur, label
  keyakinan selalu tampil. Pertahankan diferensiasi: transparansi epistemik.
- L4. TANPA em-dash (check:editorial). Pakai koma/hyphen.
- L5. Additif. JANGAN rusak hero/landing yang sudah jadi. Mobile-first.
- L6. Komunitas, UGC, AI assistant = DILUAR scope (langgar locked decisions). Parkir
  ke BACKLOG, hanya dikerjakan bila founder minta eksplisit.
- L7. Semua gate harus hijau: tsc, lint, check:editorial, check:article-images, build.

## DATA YANG SUDAH ADA (acuan, jangan salah pakai)

- `getAllArticles()` async (lib/content) -> ArticleMeta: title, subtitle, slug, date,
  category, tags, summary, confidence, readingMinutes, coverImage, images[], series,
  related[{slug,relasi}], claimLedger, locationLabels, internalScore, updated.
- `getAnalyticsSummary()` (lib/analytics, server-only) -> topPaths [["/articles/slug",n]].
- `SERIES` (lib/series), `slugifyTag` (lib/topics), `lib/graph`, `lib/timeline`,
  `calculateReadingTime`/`formatDate`/`articleDepth`/`DEPTH_LABEL` (lib/format),
  `ConfidenceBadge`, `ArticleCard`, `CATEGORY_LABEL`.
- Label keyakinan: high=Terverifikasi kuat, medium=Didukung sumber, low=Terbatas,
  needs-verification=Belum cukup bukti. (Sentralkan di lib/labels.ts.)
- Landing: app/page.tsx (force-dynamic) -> NeoMuseum (client). SiteChrome opt-out di "/".

## PRINSIP UI

- Mobile-first. Rak = horizontal scroll-snap (CSS, tanpa lib). Hindari wall-of-text.
- Tetap bahasa visual archive-ink + navy. Kartu kicker(hook) di atas judul jujur +
  badge keyakinan selalu ada.
- Hemat JS. Server component untuk data; client hanya untuk localStorage + progress.

---

# PART 1 - Beranda "rak konten" + Daily (ADDITIF di bawah hero)

Tujuan: begitu lewat hero, user lihat "rak" seperti Netflix dan alasan kembali harian.

### Wiring
- NeoMuseum dapat prop baru `extras?: ReactNode`, dirender DI ANTARA Section 2 (explore)
  dan Section 3 (collection). app/page.tsx mengisi `extras` dengan server components.
- Urutan akhir landing: Hero -> Explore+Graf -> [DailyBand] -> [KnowledgeShelves] ->
  Collection (closer) -> Footer NeoMuseum.

### lib/labels.ts (baru)
- `CONFIDENCE_LABEL: Record<Confidence,string>` + `confidenceLabel(c)`.

### lib/daily.ts (server, baru)
- `epochDay()` = Math.floor(Date.now()/86400000) (UTC, stabil per hari).
- `getDaily(articles)` ->:
  - `anniversary?`: cocokkan bulan+tanggal hari ini dgn `content/daily/anniversaries.ts`
    (peristiwa BERTANGGAL NYATA + slug artikel terkait + sumber). Kalau tak cocok -> undefined.
  - `sorotan`: artikel deterministik hari ini (epochDay % n) dari artikel ber-cover.
  - `fakta`: dari `content/daily/facts.ts` (fakta terverifikasi + label + href sumber),
    rotasi epochDay % n.
  - `pertanyaan`: artikel confidence low/needs-verification (epochDay % n) = "pertanyaan terbuka".
- Semua deterministik per hari -> berubah tiap hari tanpa DB.

### content/daily/anniversaries.ts (baru, NYATA saja)
- Array {month, day, year, peristiwa, slug, sumberUrl}. Seed dari artikel yang ada:
  Krakatau 27 Agt 1883, Tambora 10 Apr 1815, Anak Krakatau 22 Des 2018. Tambah saat ada.

### content/daily/facts.ts (baru, NYATA + sumber)
- Array {fakta, confidence, slug|href, sumber}. 8-12 fakta dari claim ledger artikel nyata.

### components/landing/DailyBand.tsx (server)
- Band "Hari Ini di NaLI". Sel: (opsional) Hari ini dalam sejarah (jika anniversary),
  Sorotan hari ini, Fakta terverifikasi (+badge), Pertanyaan terbuka. Tanggal hari ini
  tampil. Tombol "kenapa ini berubah" kecil -> jelaskan rotasi harian (transparan).

### lib/shelves.ts (server, baru)
- `buildShelves(articles, analytics)` -> Shelf[]: {key,title,kicker,href,items:ArticleMeta[]}.
  Rak: "Sedang ramai" (dari topPaths nyata; fallback internalScore/terbaru), "Alam",
  "Sejarah", "Investigasi", "Spesies yang hilang" (series spesies-hilang-bertahan),
  "Pertanyaan yang belum terjawab" (needs-verification/low), "Baru diterbitkan".
  Rak kosong di-skip.

### components/landing/ShelfCard.tsx + KnowledgeShelves.tsx (server)
- ShelfCard: kicker(hook=subtitle, jujur) -> judul -> meta(kategori, menit, badge),
  thumb cover bila ada. Link ke /articles/slug.
- KnowledgeShelves: tiap rak = judul rak + "lihat semua" + baris horizontal scroll-snap
  (overflow-x-auto, snap-x). Mobile geser, desktop tetap geser (tanpa panah JS dulu).

### CHECKLIST PART 1
- [ ] lib/labels.ts, lib/daily.ts, lib/shelves.ts
- [ ] content/daily/anniversaries.ts, content/daily/facts.ts (NYATA)
- [ ] DailyBand, ShelfCard, KnowledgeShelves
- [ ] NeoMuseum `extras` slot + app/page.tsx wiring
- [ ] gate hijau + verifikasi mobile/desktop + push

---

# PART 2 - Rabbit-hole + Riwayat lokal (tanpa login)

Tujuan: 1 artikel -> 5 artikel. User masuk "lubang kelinci". Browser ingat tanpa akun.

### Akhir artikel: "Lanjutkan eksplorasi" (server, di /articles/[slug])
- Komponen `components/article/RabbitHole.tsx`: rakit dari data nyata:
  - Terkait (related[] dgn alasan relasi) - sudah ada datanya.
  - Topik terkait (tags -> /topik/slug).
  - Seri (jika ada) -> next in series.
  - "Yang mengejutkan": 1 artikel acak-deterministik confidence rendah (pertanyaan terbuka).
  - Timeline/peta: link ke /linimasa atau /peta-indonesia bila relevan (punya tahun/lokasi).
- Target: minimal 6-10 tautan keluar per artikel. Tanpa "TAMAT" buntu.

### Riwayat lokal (localStorage, client)
- `lib/reading-history.ts`: get/append {slug,title,category,ts}, max ~40, dedup.
  Helpers: topCategory(), recent(n), has(slug), toggleBookmark(slug), bookmarks().
- `components/article/ReadingTracker.tsx`: client, mounted di artikel, catat kunjungan.
- `components/BookmarkButton.tsx`: client, simpan/lepas bookmark (localStorage).
- `components/landing/ContinueRail.tsx`: client, di landing (extras, paling atas band).
  "Lanjutkan membaca" (recent) + "Karena kamu sering baca {topCategory}" (rekomendasi
  sekategori yang belum dibaca). Hanya render bila ada riwayat (else null, no SSR mismatch:
  render setelah mount).
- Opsi halaman `/riwayat` (client) untuk lihat semua + hapus. (Boleh ditunda.)

### CHECKLIST PART 2
- [ ] lib/reading-history.ts (localStorage, SSR-safe)
- [ ] ReadingTracker + BookmarkButton di /articles/[slug]
- [ ] RabbitHole di akhir artikel (>=6 tautan)
- [ ] ContinueRail di landing (render after-mount)
- [ ] gate hijau + verifikasi + push

---

# PART 3 - Ringkasan 30 detik -> lengkap + progress bar

Tujuan: turunkan bounce dari "12 menit membaca". Beri level konsumsi.

### Di /articles/[slug] (atas konten)
- `components/article/QuickRead.tsx`:
  - "Ringkasan 30 detik" = summary (selalu ada).
  - "Inti 1 menit" = poin dari claimLedger (status + klaim ringkas) bila ada; else
    kalimat pertama tiap paragraf awal. Toggle expand.
  - CTA "Baca lengkap" -> scroll ke body.
- `components/article/ReadingProgress.tsx` (client): bar tipis fixed di atas artikel,
  isi sesuai scroll body (Intersection/scroll math), reduced-motion aman, hemat (rAF throttle).

### CHECKLIST PART 3
- [ ] QuickRead (30 detik / 1 menit / lengkap)
- [ ] ReadingProgress bar (client, hemat)
- [ ] gate hijau + verifikasi + push

---

## STATUS

- [x] PART 1 - DailyBand + KnowledgeShelves + ShelfCard, additif via NeoMuseum `extras`.
      Data nyata (anniversaries/facts kurasi, trending dari page_views, fallback skor).
      Hook = standfirst subtitle (sentence-case), bukan clickbait. Diaudit lewat
      taste-skill: eyebrow per-rak dibuang, nomor section eyebrow dilepas.
      Gate hijau, verifikasi desktop+mobile.
- [x] PART 2 - localStorage reading memory (lib/reading-history.ts), ReadingTracker,
      BookmarkButton (artikel header), RabbitHole "Lanjutkan eksplorasi" di kaki tiap
      artikel (surprise pick deterministik + 4 pintu eksplorasi), ContinueRail di landing
      (Lanjutkan membaca + rekomendasi sekategori, render after-mount). Gate hijau,
      verifikasi desktop+mobile. Catatan: artikel punya hydration warning #418/#423 yang
      PRE-EXISTING (sama persis di produksi tanpa Part 2), tidak diintroduksi sesi ini.
- [x] PART 3 - QuickRead (Ringkasan 30 detik = summary, Inti 1 menit = claim ledger
      via <details>, Baca lengkap -> #isi) di atas artikel + ReadingProgress bar
      (framer-motion useScroll/useSpring, hemat, tanpa scroll listener). Gate hijau,
      verifikasi desktop (progress bar tracking) + mobile (no overflow).

SEMUA PART SELESAI. Tindak lanjut terpisah: hydration #418/#423 pre-existing di
artikel (lihat chip background task).

Catatan: kerjakan per part, verifikasi, commit, baru lanjut. Update checklist + bagian
SESSION LOG di CLAUDE.md tiap part selesai.
