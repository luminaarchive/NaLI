# NaLI CP1 — Panduan Operasional Pemantauan Pendiri (Founder Monitoring Runbook)

Dokumen ini menjelaskan cara menggunakan antarmuka pemantauan internal (Founder Console) secara aman untuk memantau status sistem, feedback pengguna, and estimasi biaya operasional NaLI CP1.

---

## 1. Konfigurasi Lingkungan (Configuration)

Pemantauan internal ini diamankan dengan token rahasia satu arah yang didefinisikan di sisi server.
- **Kunci Rahasia**: `NALI_FOUNDER_ADMIN_TOKEN`
- **Cara Konfigurasi (Vercel)**:
  1. Masuk ke Dasbor Vercel -> Settings -> Environment Variables.
  2. Tambahkan variabel baru dengan Key: `NALI_FOUNDER_ADMIN_TOKEN`.
  3. Isi Value dengan string rahasia yang acak dan panjang (contoh: `nali_admin_3f92ba...`).
  4. Centang semua environment (Production, Preview, Development).
  5. Klik *Save*, lalu lakukan redeploy proyek agar konfigurasi baru aktif.

---

## 2. Cara Mengakses Konsol Pemantauan (How to Access)

Konsol founder berada di rute **/founder** yang tidak diindeks (`noindex`) dan tidak ditautkan di menu publik.

### A. Akses Pertama kali
Buka tautan berikut di browser:
`https://naliai.vercel.app/founder?token=ISI_TOKEN_RAHASIA_ANDA`

### B. Persistensi Sesi (Cookie)
- Ketika Anda mengakses menggunakan token yang valid di URL, server Next.js akan mendeteksi token tersebut.
- Jika Anda masuk tanpa token URL, sistem akan menampilkan form password. Ketik token Anda di kolom password untuk login.
- Sesi Anda akan disimpan menggunakan HTTP-Only cookie aman (`founder_token`) selama 1 minggu, sehingga Anda tidak perlu memasukkan token lagi pada perangkat yang sama.
- Untuk keluar dari konsol, klik tombol **Logout** di bagian kanan atas header.

---

## 3. Penjelasan Metrik Operasional (Metrics Decoded)

### A. System Readiness Status
- Menunjukkan status kelengkapan modul backend.
- Di bawah integrasi **Midtrans DEFERRED**, indikator `Midtrans Setup` harus bernilai `OFF` (atau `ON (sandbox)` bila founder sengaja menyematkan server key sandbox), sementara `Paid Checkout` and `Credit Purchase` berstatus **OFF / Inaktif**.

### B. Report Generation Health
- **Total Reports**: Total draf laporan yang pernah dibuat di database.
- **Created Today**: Volume draf yang dibuat 24 jam terakhir.
- **Generation Failures**: Jumlah kegagalan pemrosesan AI. Bila nilainya > 0, tinjau tabel `Recent Failures` di bawahnya untuk melihat `failure_stage` (tahap di mana AI gagal) dan `failure_reason` (alasan detail).

### C. Feedback Intelligence
- Menampilkan rasio penilaian positif (👍 Helpful) dan negatif (👎 Not Helpful).
- **Friction Keywords detected**: Menghitung frekuensi kata kunci keluhan dari komentar pengguna:
  - *Bug/Error*: Kata "bug", "error", "crash", "gagal", "salah".
  - *Confusing Wording*: Kata "bingung", "kurang jelas", "tidak paham".
  - *Mobile UX Issues*: Kata "mobile", "hp", "tampilan", "layar", "responsif".
  - *Evidence Unclear*: Kata "bukti", "sumber", "referensi", "sitasi".
  - *Export/Payment Gate*: Kata "bayar", "ekspor", "kredit", "harga".
  - *Rate Limit Warnings*: Kata "rate limit", "429", "terlalu banyak".
  - *Output Quality*: Kata "tidak berguna", "jelek", "bad", "useless".

### D. API Usage & Cost Analysis
- **Est. Cost (USD)**: Akumulasi biaya pemanggilan token OpenRouter berdasarkan data di tabel `api_usage_logs`.
- **Active Rate Limits**: Menunjukkan daftar hash IP/identitas pengguna yang saat ini diblokir sementara karena memicu proteksi batas akses (status 429).

---

## 4. Larangan Eksponensial (Strict Constraints)
- **Dilarang membagikan tautan konsol**: Jangan pernah mengirim URL berparameter token ke pihak ketiga.
- **Jangan meloloskan data user mentah**: Endpoint `/api/system/readiness` and `/founder` telah disterilisasi dari metadata sensitif (tidak menampilkan `guest_session_id_hash` atau kunci token akses laporan). Jaga integritas filter ini saat memodifikasi kode.
- **Reminder Penting**:
  - Human testing tetap **PAUSED**.
  - Midtrans tetap **DEFERRED**.
  - Paid launch tetap **NO-GO**.

---

## 5. Klasifikasi Tindakan Operasional (Severity Action List)
- **P0 (Kritis)**: Bila kegagalan (Generation Failures) melonjak drastis, periksa apakah API Key OpenRouter kedaluwarsa atau kehabisan saldo. Selesaikan segera.
- **P1 (Tinggi)**: Jika ada keluhan bertema *Academic Cheating* lolos dari filter NaLI Lock, segera perbaiki regex integritas di `src/lib/integrity/policy.ts`.
- **P2 (Sedang)**: Jika keluhan *Mobile UX Issues* meningkat, optimalkan style responsif pada composer form.
- **P3 (Rendah)**: Perbaikan kosmetik atau tata bahasa minor.
