# NaLI, Penjelasan Lengkap

Dokumen ini menjelaskan apa itu NaLI secara menyeluruh: identitas, misi, isi, fitur,
arsitektur teknis, aturan editorial, dan cara kerjanya. Ditulis sebagai rujukan tunggal
untuk siapa pun yang ingin paham proyek ini dari nol, baik founder, kontributor, maupun
pembaca yang penasaran.

Terakhir diperbarui: 22 Juni 2026.

---

## 1. Ringkasan Satu Paragraf

NaLI adalah jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia. Setiap
klaim dibawa dengan sumbernya, label keyakinan, dan batasannya. NaLI bukan situs berita,
bukan blog opini, dan bukan media clickbait. Ia adalah arsip bukti yang jujur: kalau sebuah
hal belum bisa dipastikan, NaLI mengatakannya secara terbuka, bukan menyembunyikannya. Di
atas itu, NaLI kini juga membuka Pustaka Terbuka, sebuah pintu menuju ratusan ribu hingga
sejuta karya ilmiah akses terbuka, demi satu keyakinan dasar: pendidikan adalah hak semua
orang.

---

## 2. Identitas

- **Nama produk:** NaLI (kapital I pada NatIve adalah warisan branding lama; sejak rebrand
  21 Juni 2026 nama resmi cukup ditulis **NaLI**, dengan arti **Nature Life Intelligence**).
- **Founder:** Ansyahri Darma Tri Jati.
- **Tagline:** "Jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia.
  Setiap klaim membawa sumber, label keyakinan, dan batasan."
- **Tahap:** v0.1 yang terus tumbuh (dibangun ulang dari nol pada 11 Juni 2026; kode lama
  aplikasi satwa liar sudah dimatikan total).
- **Mode kerja:** solo founder, static-first, publikasi harian, hindari membangun ulang.
- **Logo:** gunungan/kayon (siluet wayang) monokrom, warna navy.
- **Domain hidup:** `nalibynative.vercel.app` dan `nalijournal.vercel.app`.

---

## 3. Misi dan Posisi

### 3.1 Posisi editorial
NaLI memposisikan diri sebagai **jurnal bukti open-source (open-source evidence journal)**.
Founder belum bisa melakukan kerja lapangan langsung (peralatan dan anggaran belum lengkap),
jadi semua bukti berasal dari sumber pihak ketiga yang dapat ditelusuri: jurnal, laporan
lembaga, arsip, dataset, buku, dan media. NaLI tidak pernah berpura-pura melakukan observasi
lapangan sendiri. Kejujuran soal asal bukti adalah inti merek ini.

### 3.2 Misi pendidikan
NaLI memegang **Pasal 26 Deklarasi Universal Hak Asasi Manusia: setiap orang berhak atas
pendidikan**. Karena itu NaLI berusaha membuka akses sebanyak mungkin ke pengetahuan nyata.
Wujud konkretnya adalah Pustaka Terbuka (lihat Bagian 8).

### 3.3 Batas yang tidak dilanggar
Demi misi itu bertahan, NaLI menjaga satu garis tegas: **NaLI tidak pernah mengunggah ulang,
menyimpan, atau menyajikan ulang naskah berhak cipta.** NaLI hanya mengatalogkan metadata
(yang berlisensi bebas) dan menautkan ke teks lengkap yang sudah dihosting secara legal.
Membajak naskah akan memicu DMCA, situs dicabut, dan founder terkena tuntutan hukum; artinya
misi mati justru saat ia tampak berhasil. Jalan legal adalah satu-satunya jalan yang lestari.

---

## 4. Keyakinan dan Transparansi (Ciri Khas NaLI)

Pembeda utama NaLI adalah **transparansi epistemik yang radikal**. Alatnya:

### 4.1 Label keyakinan
Setiap artikel membawa label keyakinan yang jujur:

| Label | Arti |
|---|---|
| Terverifikasi kuat (high) | Sumber kuat dan konsisten |
| Didukung sumber (medium) | Didukung, tetapi butuh konteks |
| Terbatas (low) | Hipotesis kerja |
| Belum cukup bukti (needs-verification) | Belum bisa diterbitkan sebagai fakta |

Klaim yang masih ramai diperdebatkan ditandai khusus "diperdebatkan" pada level per-klaim.

### 4.2 Claim Ledger
Tiap artikel panjang memuat **buku besar klaim (claim ledger)**: daftar klaim utama, lengkap
dengan status masing-masing (yang sudah mapan dipisahkan tegas dari yang masih diperdebatkan),
dan tautan ke sumber yang menopangnya.

### 4.3 Batasan (limitations)
Setiap artikel menyatakan secara eksplisit apa yang belum diketahui, apa yang tidak bisa
disimpulkan dari bukti yang ada, dan di mana ketidakpastiannya.

### 4.4 Basis tulisan
Banner "Basis tulisan" menjelaskan dari mana bukti artikel berasal, dan menegaskan bahwa
tidak ada kerja lapangan tangan pertama.

---

## 5. Jenis Konten

NaLI punya beberapa jenis isi yang berbeda peran:

1. **Artikel** (`/articles`, plus kategori `/alam`, `/sejarah`, `/investigasi`): tulisan
   naratif mendalam berbasis riset, satu per satu, dengan claim ledger, batasan, sumber, dan
   gambar berlisensi. Ditulis dengan standar editorial penuh (Bagian 7). Per 22 Juni 2026 ada
   sekitar 43 artikel terbit.

2. **Seri** (`/seri`): kumpulan artikel yang saling terkait dalam satu tema besar. Contoh:
   "Spesies Hilang yang Bertahan" (klaster Lazarus: harimau jawa, coelacanth, lebah Wallace,
   seriwang Sangihe, dll.), "Misteri Nusantara" (Homo floresiensis, seni gua, Sundaland),
   "Wallacea dan Evolusi".

3. **Jurnal** (`/jurnal`): katalog publikasi eksternal nyata (jurnal, laporan, dataset,
   arsip). Bukan tulisan NaLI, melainkan rujukan terverifikasi dengan DOI, penerbit, dan
   tautan ke naskah resmi. Sekitar 550 entri.

4. **Arsip Sumber** (`/arsip-sumber`): basis data sumber terverifikasi yang menopang artikel.
   Tiap entri membawa metadata, catatan keandalan, klaim yang bisa didukung, dan batasannya.
   Sekitar 716 entri, bisa disaring per tipe, topik, dan tingkat keandalan.

5. **Catatan Riset** (`/catatan-lapangan`): catatan dan antrean riset, bukan observasi
   lapangan pribadi.

6. **Pustaka Terbuka** (`/pustaka`): katalog skala besar karya ilmiah akses terbuka (lihat
   Bagian 8). Inilah mesin pendidikan NaLI.

---

## 6. Peta Halaman

### Halaman utama
| Halaman | Isi |
|---|---|
| `/` | Beranda neo-museum: hero, ruang kendali (LivingDashboard), modul V2, tulisan terbaru, tiga pilar, arsip |
| `/articles` | Semua artikel terbit, bisa disaring per kategori dan tag |
| `/articles/[slug]` | Artikel penuh: judul, label keyakinan, claim ledger, batasan, sumber, gambar, terkait |
| `/alam`, `/sejarah`, `/investigasi` | Artikel per pilar |
| `/seri`, `/seri/[slug]` | Daftar seri dan navigasi antar bagian seri |
| `/jurnal`, `/jurnal/[slug]` | Katalog publikasi eksternal |
| `/pustaka`, `/pustaka/[slug]` | Pustaka Terbuka akses-terbuka, paginasi dan pencarian |
| `/arsip-sumber`, `/arsip-sumber/[slug]` | Arsip sumber, filter dan detail |
| `/catatan-lapangan` | Catatan dan antrean riset |
| `/topik/[tag]` | Semua isi untuk satu topik |

### Halaman "Mesin Hidup" (NaLI V2)
| Halaman | Isi |
|---|---|
| `/ruang-kendali` | Dashboard statistik nyata + hub menuju modul V2 |
| `/linimasa` | Garis waktu peristiwa (hanya tahun yang eksplisit) |
| `/peta-indonesia` | Peta skematis SVG tempat yang dikenal (bukan peta survei) |
| `/peta-eksplorasi` | Graf pengetahuan force-directed (canvas buatan sendiri) |
| `/koneksi` | Hitungan relasi antar entitas |
| `/bukti-dicari` | Klaim yang masih kurang bukti + ajakan koreksi |
| `/aktivitas` | Feed aktivitas dari tanggal verifikasi konten |
| `/banding` | Bandingkan dua sumber berdampingan |
| `/misi` | Celah riset yang mengundang kontribusi |

### Halaman kepercayaan dan tentang
| Halaman | Isi |
|---|---|
| `/metodologi` | Cara kerja dan standar riset NaLI |
| `/pedoman-sumber` | Pedoman pemilihan dan penilaian sumber |
| `/koreksi` | Log koreksi terbuka + formulir koreksi |
| `/lisensi-foto` | Kredit dan lisensi gambar |
| `/manifesto` | Manifesto editorial |
| `/tentang` | Tentang founder dan proyek (gaya "About Us") |
| `/kontak` | Kontak dan tautan |

### Sistem
`/sitemap.xml`, `/robots.txt`, `/feed.xml` (RSS), `/admin/*` (dashboard privat), 404.

---

## 7. Standar Penulisan (10 Aturan Wajib)

Setiap artikel dan seri wajib mengikuti pedoman ini agar terasa hidup, bukan "AI slop" atau
terjemahan mesin:

1. **Jeda visual, ramah skimming:** paragraf pendek (maksimal 3-4 baris), sub-judul jelas,
   bold/italic/bullet secara taktis.
2. **Intro lurus dan substantif:** langsung ke inti, judul menjawab pertanyaan utama.
3. **Gaya bahasa hidup:** hindari kalimat kaku, jelaskan jargon dengan analogi, variasikan
   ritme kalimat, masukkan storytelling.
4. **Padat dan menjawab "so what":** hindari pengulangan demi jumlah kata, beri insight nyata.
5. **Kurangi kalimat pasif:** gunakan kalimat aktif.
6. **Visual kaya dan berlisensi:** minimal 4-5 foto per artikel panjang, selalu dengan kredit
   dan sumber.
7. **Tata bahasa baku (EYD V):** jangan mulai kalimat dengan konjungsi (Tapi/Dan/Karena);
   bedakan kata depan (di balik) dengan imbuhan pasif (dikubur); "ia/dia" hanya untuk makhluk
   hidup, bukan benda atau situs; gunakan sintaksis SPOK alami; pilih kolokasi yang tepat
   (relief ditimbun, bukan dikubur); lokalkan metafora barat.
8. **Penutup reflektif (hantaman gong):** gunakan circular ending, jawab "so what", atau
   kontras emosional. Haram membuka penutup dengan "Kesimpulannya" atau "Akhir kata".
9. **Panjang:** target 1.200-1.400 kata substantif untuk artikel naratif (lantai minimum
   praktis 900 kata).
10. **Tanpa em-dash di seluruh repo:** validator `check:editorial` gagal bila menemukan
    karakter em-dash; gunakan koma atau hyphen.

Catatan: aturan-aturan ini disimpan juga di memori proyek dan ditegakkan oleh validator
otomatis.

---

## 8. Pustaka Terbuka (Mesin Pendidikan)

### 8.1 Apa ini
`/pustaka` adalah katalog skala besar karya ilmiah **akses terbuka (open access)** yang
relevan dengan Indonesia, dengan target jangka panjang sekitar 1.000.000 entri. Tiap entri
membawa metadata (judul, abstrak, penulis, tahun, venue, DOI) dan **menautkan ke teks lengkap
yang sudah dihosting legal** oleh penerbit atau repositori.

### 8.2 Garis tegas yang dijaga
- Hanya karya **akses terbuka** yang masuk. Dijaga dua kali: penyaring `is_oa:true` saat
  harvest, dan constraint database `CHECK (is_oa = true)`.
- Metadata berasal dari OpenAlex yang berlisensi CC0 (bebas dipakai).
- **NaLI tidak menyimpan atau menyajikan ulang naskah berhak cipta.** Kita hanya menunjuk ke
  salinan legal yang sudah ada.

### 8.3 Kenapa pakai database, bukan file
Satu juta entri sebagai file statis akan menghancurkan proses build. Maka Pustaka memakai
**Supabase Postgres**: satu juta baris itu sepele, dengan paginasi, pencarian full-text, dan
halaman detail dinamis per entri.

### 8.4 Cara mengisinya menuju skala besar
- Skrip `scripts/mine/harvest-oa-to-supabase.mjs` (`npm run harvest:pustaka`) menjelajah
  metadata akses-terbuka dari OpenAlex memakai cursor paging, tahan-resume
  (`content/logs/pustaka-progress.json`), berjalan tahun demi tahun.
- Pengisian skala penuh butuh `SUPABASE_SERVICE_ROLE_KEY` (kunci service-role; ini infra
  founder, ada di dashboard Supabase, tidak disimpan di repo).
- OpenAlex punya kuota harian gratis; jika habis, ia reset tengah malam UTC.

---

## 9. Fitur Retensi (Tanpa Login)

NaLI membangun "Living Knowledge Engine" agar pembaca betah dan menemukan lebih banyak, tanpa
memaksa login. Semua state pembaca disimpan lokal di peramban (localStorage), bukan di server.

- **Rak ala Netflix di beranda:** baris bertema yang bisa di-scroll, kartu sampul berwarna
  dengan efek blur lembut.
- **Konten harian ("Hari Ini di NaLI"):** sorotan, fakta, dan pertanyaan; peringatan tanggal
  (misalnya 27 Agustus untuk Krakatau 1883).
- **Rabbit hole:** tiap artikel menawarkan "pilihan kejutan" dan empat tujuan lanjutan.
- **Tautan biru ala Wikipedia:** kata kunci di dalam isi (misalnya "Sungai Mahakam") otomatis
  jadi tautan biru yang bisa diklik menuju penjelasannya.
- **Ringkasan 30 detik:** mode baca cepat (ringkasan singkat / claim ledger 1 menit / baca
  lengkap) dengan indikator progres baca.
- **Lanjutkan membaca:** riwayat baca lokal menampilkan "karena kamu sering membaca [kategori]".
- **Pencarian global (Cmd+K):** indeks Fuse.js seluruh isi situs.
- **Graf pengetahuan:** peta force-directed buatan sendiri yang menautkan artikel, seri, dan
  topik, dioptimalkan untuk 60fps.

---

## 10. Arsitektur Teknis

### 10.1 Tumpukan terkunci
```
Framework:   Next.js 14 (App Router)
Bahasa:      TypeScript
Styling:     Tailwind CSS 3
Konten:      MDX (next-mdx-remote/rsc) + gray-matter frontmatter
Gambar:      next/image
Deploy:      Vercel
Paket:       npm
```

### 10.2 Data
- **MDX/TS** untuk artikel, seri, jurnal, arsip sumber (berbasis file, di-commit ke git).
- **Supabase** untuk: newsletter (`subscribers`), post dari dashboard admin (`posts`),
  analitik kunjungan (`page_views`), dan Pustaka Terbuka (`publications`).
- Lapisan konten menggabungkan seed MDX dengan post database (slug sama, database menang).
- Banyak route memakai `force-dynamic` agar konten baru tampil seketika.

### 10.3 Dashboard admin
`/admin/*` dijaga middleware (sesi Supabase Auth). Berisi overview statistik, editor post
(semua field, sumber, unggah gambar, draft/terbit), dan analitik. Akun admin dibuat lewat
dashboard Supabase (tugas founder, bukan agent).

### 10.4 Newsletter dan analitik
Newsletter masuk ke Supabase via API server-side. Analitik kunjungan direkam lewat
`/api/track` dan ditampilkan di dashboard, plus Vercel Web Analytics.

---

## 11. Sistem Desain

- **Bahasa visual "archive-ink":** estetika arsip monokrom, garis putus-putus sebagai
  pemisah, kartu kotak tanpa shadow, tipografi mesin-tik.
- **Tipografi:** Fraunces (judul/nav, kapital), IBM Plex Mono (label dan body bergaya mesin),
  sans untuk prosa artikel agar nyaman dibaca.
- **Warna:** sejak rebrand 21 Juni 2026, satu tinta **navy** (`#0E3A5C` / `#082338`)
  menggantikan teal sebelumnya. Badge keyakinan tetap empat warna semantik.
- **Light/dark mode:** satu switch mengubah semua halaman; preferensi disimpan di localStorage.
- **Identitas per halaman:** tiap halaman nav punya aksen warna dan background animasi sendiri
  (smoke, warp, partikel, wave) yang redup di mode terang dan hilang saat reduced-motion.
- **Beranda:** gaya "neo-museum" dengan hero video dan transisi.

---

## 12. Gerbang Mutu (Quality Gates)

Sebelum sesuatu dianggap selesai, semua harus hijau:

- `npm run build` (build Next.js tanpa error)
- `npm run lint` (ESLint bersih)
- `npx tsc --noEmit` (TypeScript tanpa error)
- `npm run check:editorial` (validator editorial: larang em-dash, larang klaim lapangan
  tangan pertama, wajibkan claim ledger/batasan/basis bukti per artikel, metadata per sumber,
  kredit per gambar)
- `npm run check:article-images` (tiap artikel bergambar punya kredit)

Validator tambahan: `check:routes`, `check:metadata`, `check:covers`, `check:a11y`,
`check:links`.

---

## 13. Keputusan Terkunci

1. Framework Next.js 14 App Router + TypeScript + Tailwind.
2. Konten utama MDX (database hanya untuk fitur yang founder izinkan: newsletter, admin,
   analitik, Pustaka).
3. Deploy ke Vercel.
4. Saluran distribusi (X, Instagram, TikTok) tidak dibangun ke dalam situs.
5. Kode lama (aplikasi satwa liar) mati total, tanpa carry-over.
6. Aturan keras: bangun sekali, terbitkan harian, jangan bangun ulang.

Catatan: beberapa keputusan "no database / no login / no dashboard" sudah ditimpa secara
eksplisit oleh founder untuk newsletter, admin, dan Pustaka. Instruksi founder mengalahkan
keputusan terkunci.

---

## 14. Cara Menambah Konten

- **Artikel:** buat file `content/articles/*.mdx` dengan frontmatter lengkap (judul, slug,
  tanggal, kategori, label keyakinan, sumber, claim ledger, batasan, gambar berlisensi).
  Ikuti 10 aturan penulisan. Satu artikel deep-research per sesi, bukan generate massal.
- **Jurnal dan arsip sumber:** dihasilkan oleh pipeline miner dari metadata OpenAlex nyata
  (`scripts/mine/harvest.mjs` lalu `generate.mjs`). Tidak ada data yang dikarang.
- **Pustaka:** jalankan harvester ke Supabase (Bagian 8.4).
- **Lewat dashboard:** login `/admin`, tulis atau unggah, simpan untuk menerbitkan.

---

## 15. Prinsip yang Tidak Pernah Ditawar

1. Tidak ada data fiktif. Tiap klaim, sumber, DOI, dan gambar harus nyata dan dapat
   ditelusuri.
2. Jujur soal ketidakpastian. Kalau belum bisa dipastikan, katakan.
3. Tidak ada kerja lapangan tangan pertama yang dipalsukan.
4. Tidak membajak naskah berhak cipta. Pendidikan dibuka lewat jalan legal yang lestari.
5. Artikel ditulis satu per satu dengan standar penuh, bukan diproduksi massal demi angka.

---

*NaLI, Nature Life Intelligence. Jurnal riset terbuka Indonesia. Setiap klaim membawa sumber,
label keyakinan, dan batasan.*
