# NaLI CP1 — Pre-Human-Testing Completion Audit

> **Versi**: CP1 Monetization & Export Audit v1.0  
> **Tanggal**: 24 Mei 2026  
> **Status Human Testing**: **PREPARED, BUT PAUSED** (Menunggu keputusan founder)  
> **Status Paid Launch**: **NO-GO** (Belum diverifikasi live E2E di production)  

---

## 1. Ringkasan Status Saat Ini (Current State Summary)

- **Human Testing**: Sistem pengetesan oleh penguji manusia (3-5 orang) telah siap secara teknis dan panduannya telah disusun. Namun, alur ini sengaja **ditangguhkan (paused)** atas permintaan founder untuk mengumpulkan seluruh masukan arsitektur monetization sebelum tester diundang dalam satu putaran konsolidasi.
- **Paid Launch**: **NO-GO**. Gerbang pembayaran premium nyata belum diaktifkan secara publik dan ekspor premium masih terkunci di bawah gerbang simulasi kredit gratis (sandbox/manual fallback).
- **Integrasi Midtrans**: Kode arsitektur telah selesai (sandbox & production ready). Belum diverifikasi live dengan data uang sungguhan di environment Vercel Production.
- **Fitur Unggah File / Verifikasi Sumber**: Tetap dalam keadaan **non-aktif (dormant)** untuk fase CP1.
- **Field Intelligence Profesional**: Tetap dalam keadaan **informasi positioning-only** di `/field-intelligence`.

---

## 2. Peta Arsitektur Monetisasi & Ekspor (Architecture Map)

| Area | Berkas / Rute Terkait | Status Saat Ini | Apa yang Berjalan | Apa yang Kurang / Hilang | Tingkat Risiko |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Midtrans Config** | `src/lib/payments/midtrans.ts` | 🟢 **Selesai & Aman** | Deteksi env (`MIDTRANS_SERVER_KEY`, `MIDTRANS_MERCHANT_ID`, dll.), verifikasi server key, deteksi sandbox vs prod. | Tidak ada (siap pakai). | Rendah |
| **Payment Creation** | `src/app/api/payments/create/route.ts` | 🟢 **Selesai & Aman** | Validasi input, rate limiting, pembagian produk (Plan, Topup, Single Export), pembuatan SNAP token. | Tidak ada. | Rendah |
| **Payment Callback/Webhook** | `src/app/api/payments/midtrans-webhook/route.ts` | 🟢 **Selesai & Aman** | Validasi signature SHA-512, pemetaan status transaksi, pemberian kredit/energy otomatis berdasarkan metadata tepercaya. | Tidak ada. | Rendah |
| **Payment Status Page/State** | `src/components/report/PricingCards.tsx` | 🟢 **Selesai** | Penanganan state pending/paid, redirection otomatis ke SNAP url, alert jika gateway tidak aktif. | Tidak ada. | Rendah |
| **Credits Balance** | `src/lib/energy/ledger.ts` | 🟢 **Selesai** | Perhitungan saldo energi dari `energy_ledger` menggunakan `SUM(amount)` tanpa tabel saldo terpisah. | Tidak ada. | Rendah |
| **Credits Purchase** | `src/app/api/payments/midtrans-webhook/route.ts` | 🟢 **Selesai** | Pembelian Plan/Topup otomatis menambahkan saldo kredit ke ledger dengan ID idempotent UUIDv5. | Tidak ada. | Rendah |
| **Credit Deduction** | `src/lib/reports/persistence.ts` | 🟢 **Selesai** | Pemotongan kredit otomatis sebesar 10/20 kredit setelah preview laporan berhasil disimpan. | Tidak ada. | Rendah |
| **Export Gate** | `src/lib/reports/exportGate.ts` | 🟢 **Selesai** | Validasi status pembayaran laporan (harus `"paid"` atau `"success"`). | Tidak ada. | Rendah |
| **Markdown Export** | `src/app/api/reports/[id]/export/route.ts` | 🟢 **Selesai** | Ekspor file `.md` berintegritas tinggi dengan disclaimer terpasang. | Tidak ada. | Rendah |
| **PDF Export** | `src/app/api/reports/[id]/export/route.ts`, `src/lib/reports/pdf.ts` | 🟢 **Selesai** | Ekspor file PDF dengan watermark draf. | Tidak ada. | Rendah |
| **Report Access/Security** | `src/lib/reports/access.ts` | 🟢 **Selesai & Aman** | Validasi access key berbasis SHA-256 hash. Kunci mentah hanya dikirim sekali ke browser pengguna. | Tidak ada. | Rendah |
| **Pricing Copy** | `src/app/pricing/page.tsx` | 🟢 **Selesai** | Teks tier Starter/Pro/Max, penafian non-unlimited, informasi Early Release. | Tidak ada. | Rendah |
| **Upgrade Modal** | `src/components/report/PricingCards.tsx` | 🟢 **Selesai** | Tombol checkout sandbox, deskripsi paket kredit, visual layout konsisten. | Tidak ada. | Rendah |
| **Production Readiness** | `src/app/api/system/readiness/route.ts` | 🟢 **Selesai** | Menampilkan status env variable, status database table count, tanpa membocorkan rahasia. | Tidak ada. | Rendah |
| **Tests** | `tests/reports/*` | 🟢 **Selesai (100% Pass)** | 67+ tes komprehensif mencakup security bypass, spoofing prevention, idempotency, rate limits, dan integrity policy. | Tidak ada. | Sangat Rendah |

---

## 3. Hambatan Rilis (Launch Blockers)

Kami mengklasifikasikan isu potensial dalam rilis ke dalam kategori P0 hingga P3:

- **P0 (Menghalangi Paid Launch / Risiko Finansial & Keamanan)**:
  - *Tidak ada isu P0 aktif*. Sistem otentikasi webhook Midtrans (SHA-512 signature check) dan pencegahan spoofing metadata checkout (deriving price from database catalog) telah diimplementasikan dengan sangat aman.
- **P1 (Menghalangi Pengujian Monetisasi Terkontrol / Sandbox)**:
  - *Tidak ada isu P1 aktif*. Environment variabel Midtrans Sandbox telah diakomodasi sepenuhnya di kode server.
- **P2 (UX Membingungkan / Edge Case Minor)**:
  - *Tidak ada isu P2 aktif*. Halaman `/pricing` dan `/create-report` telah mencantumkan label beta dan peringatan integritas akademis dengan jelas.
- **P3 (Penyempurnaan Teks & Dokumentasi)**:
  - *Audit Dokumen Pengujian*: Laporan audit ini bertindak sebagai gerbang kesiapan konsolidasi sebelum human testing dilepas.

---

## 4. Urutan Implementasi & Deployment Berikutnya (Recommended Next Steps)

Karena arsitektur monetisasi, kredit, dan ekspor di dalam kode repositori telah diimplementasikan secara penuh dan diverifikasi oleh seluruh unit test, **tidak ada perubahan kode (code change) baru yang diperlukan**. Langkah berikutnya difokuskan pada aktivasi infrastruktur:

1.  **Konfigurasi Akun Midtrans Sandbox**: Founder mendaftarkan akun di Midtrans Sandbox (jika belum) untuk mendapatkan `Server Key` dan `Client Key`.
2.  **Konfigurasi Environment Variable di Vercel Dashboard**:
    -   `MIDTRANS_MERCHANT_ID`: ID merchant dari dasbor Midtrans.
    -   `MIDTRANS_SERVER_KEY`: Server key rahasia (disimpan aman di server-only env).
    -   `MIDTRANS_CLIENT_KEY`: Client key publik.
    -   `MIDTRANS_IS_PRODUCTION`: Set ke `false` untuk testing sandbox.
3.  **Deploy / Smoke Test Sandbox**: Melakukan transaksi uji coba menggunakan kartu kredit simulator Midtrans untuk memastikan endpoint callback `/api/payments/midtrans-webhook` dapat dihubungi dari server Midtrans dan kredit berhasil bertambah.

---

## 5. Daftar Periksa Pengujian Manusia yang Ditangguhkan (Deferred Human Testing Checklist)

Berikut adalah skenario pengujian komprehensif yang akan dijalankan oleh 3–5 tester setelah founder mencabut penangguhan:

- [ ] **Alur Registrasi & Guest Session**: Membuka `/create-report` untuk pertama kali, mengisi promp, dan memverifikasi bahwa cookie/localStorage `guest_session_id` terbuat secara otomatis.
- [ ] **Validasi Batas Kredit Awal (Energy Balance)**: Memverifikasi saldo awal (biasanya 50 kredit) terlihat di halaman pengerjaan laporan.
- [ ] **Pengurangan Kredit preview**: Menyusun 1-2 draf laporan, lalu mengecek apakah saldo terpotong sesuai estimasi (10 untuk start-from-zero, 20 untuk draft-from-materials).
- [ ] **Pemblokiran Kredit Habis**: Menguji apakah sistem menolak pembuatan laporan/chat baru saat saldo kredit habis (di bawah 10/20 kredit) dengan menampilkan error *insufficient_credits*.
- [ ] **Integrasi Simulasi Pembayaran (Midtrans Sandbox)**: Mencoba membeli paket Starter/Top-up, mengikuti tautan redirect ke simulator Snap Midtrans, menyelesaikan pembayaran simulator, dan kembali ke NaLI.
- [ ] **Verifikasi Penambahan Kredit**: Memastikan saldo kredit bertambah secara instan setelah pembayaran sandbox selesai tanpa perlu memuat ulang halaman secara manual.
- [ ] **Buka Kunci Ekspor (Export Gate)**: Memverifikasi bahwa opsi ekspor (Markdown & PDF) yang tadinya terkunci menjadi aktif setelah pembayaran berhasil.
- [ ] **Keamanan Unduhan File**: Mencoba mengunduh file ekspor, lalu memverifikasi bahwa isinya tidak mencantumkan data fiktif/palsu dan memuat teks disclaimer akademis yang diwajibkan.
- [ ] **Konsistensi UI Halaman Pricing**: Memastikan tidak ada teks yang menjanjikan "unlimited generation" atau tagihan berlangganan bulanan otomatis.
- [ ] **Responsivitas HP (Mobile Aurora)**: Membuka alur checkout dan workspace dari perangkat mobile (Android/iOS) dan memverifikasi bahwa visual latar belakang aurora tetap berpendar indah tanpa tumpang tindih dengan teks atau tombol.
