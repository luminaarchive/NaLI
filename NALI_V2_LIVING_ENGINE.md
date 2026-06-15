# NaLI V2: The Living Knowledge Engine, Technical Specification

**Dokumen arsitektur eksekusi modul untuk Claude Code.**

> Versi: 2.0 | Tanggal: Juni 2026 | Ide dasar: Ansyahri (Founder, NatIve)
> Filosofi: "Everything Connects. NaLI bukan lagi media atau blog, melainkan mesin penelitian terbuka Indonesia."

## Catatan eksekusi (penting, dibaca tiap sesi)

Dokumen ini besar dan sengaja dibangun bertahap. Aturan mainnya tegas:
satu sesi mengerjakan satu modul sampai lolos build, tanpa merombak yang sudah
jalan. Status pengerjaan dicatat di bawah ini supaya sesi berikutnya tahu harus
mulai dari mana.

- [x] **Modul 1, Living Knowledge Engine (dashboard):** SELESAI. `types/living-engine.ts`,
  `lib/living-engine.ts` (statistik dari data nyata, bukan angka karangan), dan
  `components/dashboard/LivingDashboard.tsx`. Tersaji di rute baru `/ruang-kendali`
  tanpa menyentuh beranda lama. Lolos tsc, lint, check:editorial, dan build.
- [ ] Modul 2, Interactive Knowledge Graph (upgrade peta eksplorasi).
- [ ] Modul 3, Interactive Indonesia Map.
- [ ] Modul 4, Historical Timeline.
- [ ] Modul 5, Research Missions (kolaborasi komunitas).
- [ ] Modul 6, Living Reports dan Evidence Wanted.
- [ ] Modul 7, Discovery Feed dan Research Feed.
- [ ] Modul 8, Personal Intelligence Feed (Discovery Score).
- [ ] Modul 9 dan 10, Historical Archive Pipeline (target 50.000+ metadata).
- [ ] Modul 11, Knowledge Relationship Engine ("Everything Connects").
- [ ] Modul 12, Open Research Workspace dan Compare Sources.

---

## BAGIAN 0: REVOLUSI PARADIGMA PRODUK

NaLI V2 bergeser dari model platform konten pasif (membaca data) menjadi platform
riset aktif yang hidup (Living Research Platform). Pertanyaan intinya bukan lagi
"Bagaimana pengguna membaca artikel?", melainkan "Bagaimana pengguna ikut
menjelajah labirin pembuktian?"

### Perbandingan paradigma konten

| Komponen | NaLI V1 (statis sekarang) | NaLI V2 (Living Engine) |
| :--- | :--- | :--- |
| Homepage | Daftar artikel kronologis terbaru | Ruang kendali operasi riset waktu nyata |
| Arsip | Tabel referensi statis per kategori | Pipeline metadata global (target 50.000+) |
| Hubungan | Tautan artikel terkait manual | Otak graf relasi otomatis (Everything Connects) |
| Pengguna | Pembaca anonim pasif | Kontributor misi riset dan penjelajah data aktif |

---

## BAGIAN 1: STRUKTUR PUSAT KENDALI (HOMEPAGE V2)

Homepage baru bertindak sebagai Control Room dinamis. Gunakan Next.js Server
Components dengan revalidasi berkala (ISR) agar halaman tetap statis namun selalu
diperbarui otomatis. Catatan implementasi NaLI: rute `/ruang-kendali` memakai
render dinamis seperti halaman data lain di situs ini, sehingga angka selalu
segar tanpa ketergantungan build-time pada basis data.

### Skema tata letak (`app/page.tsx` di masa depan, kini `app/ruang-kendali/page.tsx`)

```
+--------------------------------------------------------------------------+
|  Navbar: Logo, Global Search (Cmd+K), Discovery Level Dashboard          |
+--------------------------------------------------------------------------+
|  GRID SYSTEM: 3 KOLOM                                                     |
|                                                                          |
| KOLOM 1 (lebar 4)      | KOLOM 2 (lebar 5)     | KOLOM 3 (lebar 3)       |
| Misi Riset Aktif       | Penemuan Hari Ini     | Living Dashboard        |
| Curiosity Engine       | Eksplorasi Untukmu    | Evidence Wanted         |
+--------------------------------------------------------------------------+
|  Footer: RSS Feed, Kontak, Changelog Sistem                              |
+--------------------------------------------------------------------------+
```

---

## BAGIAN 2: DESKRIPSI 12 MODUL STRATEGIS

### MODUL 1: Living Knowledge Engine (dashboard kendali utama)

Mengubah beranda menjadi pusat data yang dinamis.

#### 1. Tipe data (`types/living-engine.ts`)

```typescript
export interface LivingStats {
  totalSumber: number;
  totalJurnal: number;
  totalArsip: number;
  totalInvestigasi: number;
  misiAktifCount: number;
  buktiDicariCount: number;
  kontributorAktifCount: number;
  revisiHariIniCount: number;
  lastUpdated: string;
}
```

#### 2. Aturan komponen (`components/dashboard/LivingDashboard.tsx`)

- Gunakan efek visual minimalis monokromatik layaknya terminal data.
- Tampilkan indikator status berkedip hijau (`animate-pulse`) jika
  `revisiHariIniCount > 0` untuk memberi kesan situs ini sedang bernapas.

Catatan NaLI: semua angka dihitung dari data nyata (arsip sumber, jurnal,
artikel, dan tanggal verifikasi). Tidak ada angka karangan. Field yang belum
punya sistem pendukungnya (misalnya kontributor) bernilai nol secara jujur,
bukan diisi angka palsu.

---

### MODUL 2: Interactive Knowledge Graph (upgrade peta eksplorasi)

Visualisasi hubungan data yang masif dari basis data yang sudah ada.

- Pakai pustaka graf ringan, atau lanjutkan graf canvas force-directed buatan
  sendiri yang sudah ada di `components/graph/KnowledgeGraph.tsx` agar tidak
  menambah dependensi berat.
- Warna node: hijau (Alam), biru (Sejarah), oranye (Investigasi), abu-abu (Arsip).
- Klik node membuka panel laci berisi ringkasan klaim tanpa memindahkan pengguna.

---

### MODUL 3: Interactive Indonesia Map

Menghubungkan pembuktian geospasial dengan arsip sejarah lokal.

#### Tipe data konten geografis

```typescript
export interface GeoMarker {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  title: string;
  kategori: "alam" | "sejarah" | "investigasi";
  linkedArticleSlug: string;
  sourceCount: number;
}
```

- Pertimbangkan peta tanpa cookie tracker (privacy first). Pilih pustaka yang
  ringan, dan kluster marker saat zoom out demi performa di perangkat seluler.

---

### MODUL 4: Historical Timeline (garis waktu peristiwa)

Menyandingkan linimasa makro sejarah dengan bukti dokumen mikro.

```typescript
export interface TimelineEvent {
  id: string;
  tahun: number;
  bulan?: number;
  tanggal?: number;
  peristiwa: string;
  sumberId: string[]; // tautan langsung ke arsip-sumber
  kategori: string;
}
```

---

### MODUL 5: Research Missions (kolaborasi komunitas terbuka)

Mengubah pembaca menjadi kolaborator pencari kebenaran tanpa registrasi akun.

```typescript
export interface ResearchMission {
  id: string;
  judul: string;
  deskripsi: string;
  status: "aktif" | "selesai";
  progressPercentage: number;
  kebutuhanBukti: string[];
  kontributor: {
    peneliti: number;
    pembaca: number;
    penerjemah: number;
  };
  logSubmission: Array<{
    tanggal: string;
    deskripsi: string;
    status: "approved" | "review";
  }>;
}
```

- Kontribusi tanpa login: nama, email opsional, tautan bukti atau unggahan,
  diteruskan ke folder review privat lewat GitHub Actions, lalu admin memverifikasi
  manual lewat Pull Request sebelum digabung. Catatan: modul ini melampaui
  keputusan terkunci V1 (tanpa komunitas), jadi hanya dikerjakan atas perintah
  eksplisit founder.

---

### MODUL 6: Living Reports dan Evidence Wanted

Menunjukkan secara transparan bagian klaim yang jangkar buktinya masih lemah.

```typescript
export interface MissingEvidence {
  artikelSlug: string;
  itemDicari: {
    tipe: "foto" | "arsip" | "peta" | "surat-kabar";
    deskripsi: string;
    tahunTarget: string;
    status: "hilang" | "ditemukan";
  }[];
}
```

- Letakkan di bagian atas artikel jika label keyakinannya di bawah
  "terverifikasi kuat".

---

### MODUL 7: Discovery Feed dan Research Feed

Aliran pembaruan aktivitas basis data nyata yang disajikan tiap hari, dibaca dari
riwayat perubahan Git terkini atau dari berkas log JSON mingguan.

---

### MODUL 8: Personal Intelligence Feed (Discovery Score)

Pelacakan ketertarikan pembaca tanpa basis data sisi peladen.

- Jangan pakai database cloud. Jangan kenalkan localStorage atau sessionStorage
  global yang baru (theme toggle yang sudah ada tetap apa adanya).
- Gunakan penjejakan berbasis URL state atau parameter kueri ringan di sisi klien.
- Hitung Exploration Depth: jumlah artikel unik dibaca dibagi total arsip sumber
  yang dieksplorasi dalam satu sesi.

---

### MODUL 9 dan 10: Historical Archive Pipeline (target 50.000+ metadata)

Pipa otomasi yang memanen metadata arsip global yang berkaitan dengan Indonesia.
Lanjutan langsung dari pipeline Fase 7 (`scripts/mine/`).

- Aturan utama: hanya metadata (judul, deskripsi singkat, tahun, nama katalog
  lembaga, URL jangkar asli). Jangan menyalin dokumen penuh berhak cipta.
- Target repositori contoh:

```typescript
const ARCHIVE_TARGETS = {
  NL: [
    "Nationaal Archief Den Haag (API)",
    "Delpher Kranten (OAI-PMH)",
    "Leiden University Digital Collections",
    "KITLV dan Tropenmuseum Digital Index",
  ],
  UK: ["British Library Open Data", "The National Archives UK REST API"],
  AU: ["Trove API via National Library of Australia"],
  US: ["Library of Congress Chronicling America API"],
};
```

- Pakai kata kunci regional Hindia Belanda kuno (contoh: "Soerabaia",
  "Krakatau 1883", "Batavia Chroniek"), dan patuhi rate limiting dengan jeda
  eksponensial agar IP tidak diblokir lembaga tujuan.

---

### MODUL 11: Knowledge Relationship Engine ("Everything Connects")

Mesin logika yang mengikat semua entitas konten menjadi satu otak digital.

```typescript
interface MasterRelasi {
  entitasUtama: string; // contoh: "Prasasti Yupa"
  terhubungDengan: {
    jurnalCount: number;
    arsipCount: number;
    manuskripCount: number;
    lokasiCount: number;
    investigasiCount: number;
  };
}
```

Setiap berkas baru masuk, pembuat indeks (`lib/graph.ts`) memetakan relasi
berdasarkan pencocokan entitas yang sama.

---

### MODUL 12: Open Research Workspace dan Compare Sources

Ruang kerja ilmiah terbuka untuk akademisi, mahasiswa, dan peneliti independen.

- Bandingkan dua dokumen sejarah berdampingan (contoh: catatan resmi VOC vs
  narasi Babad Tanah Jawi).
- Bukan AI yang menyimpulkan. NaLI hanya menyejajarkan bukti otentik, dan mata
  pembaca yang menganalisis sendiri.

---

## BAGIAN 3: ATURAN MENYELURUH UNTUK CLAUDE CODE

```
LARANGAN-V2-001: Jangan memasang pustaka pihak ketiga skala besar secara acak.
  Utamakan React Server Components dan Tailwind CSS bawaan.
LARANGAN-V2-002: Kerjakan bertahap per modul. Satu sesi hanya menuntaskan satu
  modul sampai lolos build. Jangan menyentuh fungsi modul lain tanpa perintah.
LARANGAN-V2-003: Pertahankan integritas validasi data lokal. Jangan menghasilkan
  berkas keluaran baru tanpa lolos check:editorial dan validasi keandalan URL.
```

---

## BAGIAN 4: TAHAPAN OPERASIONAL EKSEKUSI

```bash
# Tahap 1: tipe data dasar V2 (sudah ada untuk Modul 1)
#   types/living-engine.ts

# Tahap 2: jalankan modul yang sedang dikerjakan, lalu uji
npm run lint && npx tsc --noEmit && npm run check:editorial && npm run build
```

---

**NaLI V2: The Living Knowledge Engine**
Platform riset terbuka nusantara berbasis bukti otentik, data transparan, dan
validasi historis.
