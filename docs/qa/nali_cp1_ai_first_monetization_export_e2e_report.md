# NaLI CP1 — Laporan Kesiapan Monetisasi & Ekspor AI-First (AI-First Monetization & Export E2E Readiness Report)

> **Versi**: CP1 AI-First E2E v1.0  
> **Tanggal**: 24 Mei 2026  
> **Hasil Pengujian**: **GO (AI/Synthetic)** / **NO-GO (Live Paid Launch)**  

---

## 1. Keputusan Akhir (Final Decisions)
- **Pengujian Manusia (Human Testing)**: **PAUSED (TANGGUH)**. Dokumentasi petunjuk dan dispatch telah disiapkan secara terpisah, namun **JANGAN mengirimkan undangan atau mengizinkan tester luar masuk** sampai pengujian AI-first ini dikonsolidasikan secara penuh.
- **Pengujian AI/Sintetis (AI Synthetic Testing)**: **GO**. Sistem simulasi alur persona buatan telah diverifikasi sepenuhnya melalui suite pengujian otomatis (`payment-export-e2e.test.cjs`) dengan tingkat kelulusan 100%.
- **Peluncuran Berbayar (Paid Launch)**: **NO-GO**. Rilis komersial publik tetap ditangguhkan sampai tersedianya kredensial riil Midtrans Sandbox/Production dan pengujian E2E uang riil diverifikasi aman di environment produksi.

---

## 2. Cakupan Pengujian AI (What AI Tested)
Pengujian otomatis mensimulasikan interaksi 8 persona manusia sintetis untuk memverifikasi fungsionalitas ujung-ke-ujung (E2E):
1.  **Readiness Truth**: Memastikan endpoint status sistem `/api/system/readiness` secara jujur melaporkan kesiapan environment tanpa membocorkan rahasia atau kunci API.
2.  **Payment Creation**: Memvalidasi penolakan input kosong dan fallback pembayaran manual terarah saat kunci Midtrans absen dari server.
3.  **Webhook Signature Security**: Menolak panggilan tiruan webhook dari pihak luar yang tidak memiliki SHA-512 signature key dari server key Midtrans.
4.  **Credit Grant & Idempotency**: Memastikan penambahan saldo energi (NaLI Energy) ke `energy_ledger` terjadi secara akurat dan tidak terjadi pengisian ganda (double-grant) untuk transaksi yang sama.
5.  **Credit Debit**: Memotong kredit secara otomatis (10/20) saat persistensi preview laporan berhasil tersimpan ke database.
6.  **Export Gate**: Menolak ekspor PDF/Markdown premium untuk laporan yang belum terbayar lunas.
7.  **Client Bypass Resistance**: Memverifikasi bahwa server mengabaikan bendera/status pembayaran palsu yang dikirim oleh sisi client dan selalu merujuk pada kebenaran transaksi di database.

---

## 3. Tabel Hasil Pengujian (Test Results Table)

| Pengujian | Ekspektasi Sistem | Hasil Riil (Actual) | Status | Catatan |
| :--- | :--- | :--- | :---: | :--- |
| **Readiness Env Check** | Melaporkan `midtransConfigured = false` dan `exportGateStatus = "prepared_locked"` saat kunci env kosong. | Sesuai ekspektasi, boolean terlaporkan dengan jujur. | **Pass** | Membantu mencegah klaim pembayaran aktif palsu. |
| **Payment Create (Invalid)**| Menolak permintaan checkout kosong dengan HTTP 400. | Respons HTTP 400 dengan error "Laporan dan access key diperlukan...". | **Pass** | Mencegah pembentukan transaksi sampah. |
| **Payment Create (Fallback)**| Menghasilkan status `manual_payment_pending` dan HTTP 200 saat Midtrans belum terkonfigurasi. | Respons HTTP 200, jenis `manual`, mencatat transaksi pending di database. | **Pass** | Menyediakan jalur transisi yang aman bagi pengguna awal. |
| **Webhook Signature (Bad)** | Menolak webhook dengan signature palsu dengan HTTP 401. | Respons HTTP 401 Unauthorized secara instan. | **Pass** | Mencegah upaya bypass pembayaran gratis. |
| **Webhook Settlement (Good)**| Mengupdate status pembayaran menjadi `paid` dan memberikan kredit energi sesuai metadata. | Respons HTTP 200, status pembayaran diperbarui, kredit Starter (+300) tercatat di ledger. | **Pass** | Mengaktifkan otomatisasi pengisian saldo kredit. |
| **Export Gate (Unpaid)** | Memblokir unduhan PDF/Markdown dengan HTTP 402. | Respons HTTP 402 dengan pesan "Unlock Export diperlukan...". | **Pass** | Gerbang ekspor berfungsi dengan aman. |
| **Export Gate (Paid)** | Menghasilkan berkas Markdown/PDF premium dengan HTTP 200 jika status lunas. | Respons HTTP 200 berisi struktur berkas laporan lengkap beserta disclaimer. | **Pass** | Jalur pengunduhan premium terbuka otomatis setelah lunas. |
| **Client Bypass Resistance**| Server memeriksa keabsahan transaksi langsung di DB, mengabaikan manipulasi client. | Validasi status pembayaran riil berhasil menangkal bypass data client. | **Pass** | Melindungi integritas monetisasi NaLI. |

---

## 4. Daftar Hambatan (Blockers Classifications)

-   **P0 (Risiko Keamanan & Keuangan)**: **Tidak ada**. Seluruh gerbang ekspor dan webhook dikunci rapat di server-side.
-   **P1 (Hambatan Testing Sandbox/Monetisasi)**: **Missing Midtrans Sandbox Credentials**. Pengujian simulasi otomatis berhasil lulus, tetapi pengujian E2E Snap checkout riil di browser tetap terhambat karena absennya kredensial Midtrans Sandbox di server.
-   **P2 (UX / Copywriting / Edge Case)**: **Tidak ada**. Teks penafian dan batas kredit non-unlimited telah terintegrasi konsisten.
-   **P3 (Polish / Dokumentasi)**: **Tidak ada**. Seluruh panduan pengujian internal telah didokumentasikan lengkap.

---

## 5. Kebutuhan Konfigurasi Eksternal (Required External Setup)

Untuk melakukan pengujian E2E riil menggunakan antarmuka Snap Midtrans di browser lokal maupun Vercel, founder harus memasukkan environment variables berikut ke dalam dasbor Vercel:

```env
MIDTRANS_MERCHANT_ID=your_merchant_id_from_midtrans_sandbox
MIDTRANS_SERVER_KEY=your_server_key_from_midtrans_sandbox
MIDTRANS_CLIENT_KEY=your_client_key_from_midtrans_sandbox
MIDTRANS_IS_PRODUCTION=false
```

*Tinggalkan `MIDTRANS_IS_PRODUCTION` dalam nilai `false` selama masa testing sandbox.*

---

## 6. Rekomendasi Tindak Lanjut Terarah (Next Recommended Action)

1.  **Dapatkan Kredensial Sandbox**: Founder mendaftarkan akun di Midtrans Sandbox (jika belum) untuk menyalin Merchant ID, Server Key, dan Client Key.
2.  **Konfigurasi Environment Vercel**: Masukkan ketiga kunci tersebut ke dasbor Vercel (Production/Preview) dan pastikan `MIDTRANS_IS_PRODUCTION` di-set `false`.
3.  **Smoke Test Checkout**: Lakukan satu kali uji transaksi Snap menggunakan simulator pembayaran Midtrans untuk memastikan endpoint callback terhubung sempurna ke `/api/payments/midtrans-webhook`.
