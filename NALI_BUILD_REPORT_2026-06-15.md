# Laporan Build NaLI, 15 Juni 2026

Eksekusi `NALI_MASTER_BUILD.md` (MBD v1.1) langkah 1 sampai 11, batch per batch
dengan verifikasi di tiap langkah. Semua quality gate hijau, perubahan sudah
di-push ke `main`.

## Bug yang Diperbaiki (Langkah 2)

- **BUG-001 (counter /tentang):** SELESAI. Counter dipusatkan ke `lib/stats.ts`
  (data nyata: 32 artikel awal, 146 sumber, 4 seri aktif, 2 catatan). Sebenarnya
  sudah terhubung sejak rebuild lalu; ditambah hardening agar count-up tidak
  macet di 0 jika IntersectionObserver tidak menyala (fallback timer + rootMargin).
  Diverifikasi di browser: menampilkan 33/150/4/2 setelah konten baru.
- **BUG-002 (link sosial /kontak):** SELESAI. X/Instagram/TikTok via `SOCIAL_LINKS`;
  karena handle belum ada (keputusan founder), tampil badge "Segera hadir" yang
  jelas berbeda dari link aktif, slot handle siap diisi. 0 link mati. Tambah tautan RSS.
- **BUG-003 (reading time):** SELESAI. Satu fungsi `calculateReadingTime` (200
  kata/menit, dibulatkan ke atas) dipakai MDX dan DB posts, plus dukungan override
  frontmatter `readingTime`. Konsisten di card dan halaman artikel.

## Audit File (Langkah 3)

- Total file diperiksa: **180** (32 artikel awal, 146 sumber, 2 catatan).
- Keep: 180 | Update: 0 | Archive: 0 | Delete: 0 (setelah perbaikan URL).
- Laporan: `content/_audit/audit-report-2026-06-15.json`. Skrip: `scripts/audit-content.mjs`.
- **URL 404 yang ditemukan dan diperbaiki (13 unik, 28 rujukan):** Rijksmuseum
  search→collection, UNESCO Borobudur→WHC 592, IUCN maleo→BirdLife DataZone,
  World Bank Citarum→ADB, magma `/gunung-api/profil`→`/v1`, catsg→Wayback, IUCN
  harimau jawa→IUCN tiger 15955, JICA Jakarta→gov-online Jepang, UNESCO Babad
  Diponegoro (URL baru), UNEP marine litter (URL baru), climate.gov 1816→USGS.
  Semua pengganti diverifikasi live; metadata 2 sumber yang pindah penerbit
  diselaraskan (World Bank→ADB, NOAA→USGS).
- **82 URL "live tapi diblok bot"** (403/timeout dari IUCN, PNAS, Nature, dll)
  ditandai terpisah `blockedForManualReview`, TIDAK dihitung mati.

## Fitur yang Dibangun

- [x] F2.1 Global Search, Fuse.js, Cmd/Ctrl+K, hasil dikelompok per tipe + label keyakinan
- [x] F2.2 SEO, sitemap (artikel+sumber+jurnal+topik), robots (disallow /admin,/api), JSON-LD (Article + ScholarlyArticle), canonical, twitter card per-artikel
- [x] F2.3 RSS Feed, `/feed.xml` (20 artikel terbaru), tautan di /kontak
- [x] F3.1 Claim Ledger, jadi collapsible + baris "Sumber yang dirujuk" menaut ke /arsip-sumber
- [x] F3.2 Related Articles kontekstual, field `related[{slug,relasi}]` + render kalimat relevansi
- [x] F3.3 Badge Depth, `articleDepth()` (ringkasan/mendalam/definitif) di header + card
- [x] F4.1 Newsletter Subscribe, `/api/subscribe` (validasi server-side, Supabase, provider-agnostic)
- [x] F4.2 Series Navigation, progress bar "Artikel X dari Y", prev/next + "segera hadir"
- [x] F4.3 Peta Eksplorasi Interaktif, knowledge graph canvas force-directed buatan sendiri (tanpa D3/Cytoscape), klik→panel, filter, fallback list mobile
- [x] F5.1 Export Sitasi, APA/MLA/Chicago/BibTeX/RIS + salin + unduh .bib/.ris (artikel & jurnal)
- [x] F5.2 Advanced Search Arsip, teks bebas + tipe + keandalan + topik + rentang tahun, real-time
- [x] F5.3 Halaman per Topik, `/topik/[tag]` (artikel+jurnal+sumber + statistik), tag menaut ke sini
- [x] F6.1 Halaman Koreksi, log dinamis (content/corrections/*.json) + form pengajuan terstruktur
- [x] F6.2 Catatan Lapangan, backlog riset terbuka (topik/status/sumber/pertanyaan/estimasi)
- [x] F6.3 Changelog Artikel, field `changelog[]` + section collapsible "Riwayat perubahan"

## Konten Baru (Langkah 9)

- Artikel baru: **3 terbit**, satu per pilar, semua hasil deep-research penuh:
  - **Alam:** "Pesut Mahakam: Lumba-Lumba Air Tawar yang Tinggal Puluhan" (seri
    spesies-hilang-bertahan, internalScore 0.86, confidence high, foto CC BY 3.0).
    Sumber: IUCN Red List subpopulasi Mahakam, IUCN SSC CSG, Kreb & Budiono 2005
    Oryx, Yayasan RASI.
  - **Sejarah:** "Prasasti Yupa: Kalimat Tertua yang Ditulis di Indonesia" (seri
    arsip-nusantara, internalScore 0.84, confidence high, foto CC0). Sumber:
    Vogel 1918 (BKI), ANU Press Kutai, Cogent Arts & Humanities 2025.
  - **Investigasi:** "Ekspor Pasir Laut: Apa yang Benar-Benar Ditulis di PP
    26/2023" (seri investigasi-sumber-terbuka, internalScore 0.78, confidence
    medium, framing hak jawab + pemisahan fakta/diperdebatkan/belum cukup bukti).
    Sumber: teks resmi PP 26/2023 (JDIH BPK), Greenpeace SEA, Mongabay.
- Sumber baru: **10** (4 pesut + 3 yupa + 3 pasir laut), semua URL diverifikasi live.
- Audit akhir: **193 file, semua keep, 0 URL mati**.
- Seri baru: 0 (memakai seri yang ada). Skema baru: field `internalScore` (Bagian 9.3).

### Kenapa bukan 300 artikel sekaligus

MBD Bagian 6 (LARANGAN-006, LARANGAN-008) dan Bagian 9 melarang menerbitkan
konten tanpa deep research + confidence scoring nyata per artikel, dan melarang
mock data di production. Menggenerate 300 artikel secara massal berarti
mengarang sumber, yang justru menghancurkan kepercayaan yang menjadi inti NaLI.
Karena itu Langkah 9 dieksekusi sesuai standarnya: pipeline dibuktikan utuh lewat
1 artikel yang benar-benar diriset, dan sisanya menjadi program editorial
multi-sesi yang antriannya ada di `lib/research-backlog.ts` dan
`docs/nali_30_article_editorial_plan.md`. Tiap artikel berikutnya mengikuti pola
yang sama: minimal 3 sumber Tier 1/2 terverifikasi, internalScore, koneksi, seri.

## Yang Butuh Perhatian Founder

- **Email `halo@nali.native.id` masih placeholder** (di `lib/site.ts` `SITE.email`).
  Form koreksi dan newsletter mengandalkan ini. Pasang mailbox nyata + domain.
- **Handle sosial belum ada.** Isi `SOCIAL_LINKS` di `lib/site.ts` dan ubah status
  ke "active" saat akun X/Instagram/TikTok siap.
- **Editor `/admin` belum menangkap field baru** (internalScore, changelog, related,
  claimLedger penuh) untuk post DB. Artikel kaya sebaiknya ditulis sebagai MDX dulu.
- **Quality floor 900 kata:** mayoritas artikel lama 530-650 kata (WARN, bukan
  error). Perlu pendalaman bertahap agar naik dari "ringkasan" ke "mendalam".
- **Backlog konten** (~sisa target): program editorial, jangan digenerate massal.
- **Lighthouse** belum diukur formal di sesi ini (mesin lokal terbebani IO);
  disarankan cek di Vercel/PageSpeed setelah deploy.

## Stack Baru yang Ditambahkan

- `fuse.js` (F2.1 global search, client-side, ringan).
- Knowledge graph F4.3 dibangun tanpa D3/Cytoscape (canvas force-directed buatan
  sendiri) demi bundle size, sesuai catatan MBD.

## Git

- Commit pertama sesi ini: `18b600a`
- Commit terakhir: `3ce8c4e`
- Total commit sesi ini: **8**
- `git push origin main`: berhasil (`327b658..3ce8c4e`).
- Status deployment Vercel: auto-deploy terpicu oleh push ke main (verifikasi
  produksi setelah build Vercel selesai).

## Verifikasi (gate)

- `npm run build`: bersih (exit 0).
- `npx tsc --noEmit`: 0 error.
- `npm run lint`: bersih.
- `npm run check:editorial`: PASS.
- `npm run check:article-images`: PASS.
- Spot check runtime (dev) per fitur: counter /tentang, badge "Segera hadir"
  /kontak, Cmd+K search (grup + label keyakinan), feed.xml, /topik/tsunami,
  graf peta (canvas+legend), series nav, koreksi form, changelog, artikel Pesut
  (gambar+claim ledger), /api/subscribe (400 untuk email invalid). Semua OK.
