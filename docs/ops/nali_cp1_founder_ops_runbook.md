# NaLI CP1 — Panduan Operasional Pendiri (Founder Operations Runbook)

Dokumen ini ditulis sebagai panduan operasional praktis bagi pendiri solo (solo founder) untuk mengelola pemeriksaan kesiapan operasional harian, pemantauan status produksi, dan penanganan keluhan bug sebelum sistem siap menerima kelompok penguji manusia eksternal.

---

## 1. Status Sistem Saat Ini (Current Status)
- **Pengujian Manusia (Human Testing)**: **TANGGUH / PAUSED**. Seluruh undangan eksternal ditangguhkan sampai pengetesan internal sistem oleh agen AI selesai sepenuhnya.
- **Rilis Berbayar (Paid Launch)**: **NO-GO**. Transaksi nyata belum dibuka untuk umum.
- **Integrasi Midtrans**: **DEFERRED / DITANGGUHKAN**. Gerbang pembayaran ekspor ditangguhkan sampai founder siap memasukkan credentials Sandbox.
- **Rute Laporan CP1**: **AKTIF**. Pengguna dapat melakukan preview draf laporan atau panduan menggunakan kredit gratis.
- **Fitur Upload & Verifikasi Sumber**: **DORMANT / NON-AKTIF**.
- **Field Intelligence Profesional**: **POSITIONING-ONLY** di rute `/field-intelligence`.

---

## 2. Pemeriksaan Harian Sebelum Rilis Terkontrol (Daily Checks)
Lakukan 8 langkah verifikasi mandiri ini setiap hari di lingkungan production untuk menjaga stabilitas layanan:

1.  **Cek Status Deploy Vercel**: Buka dasbor Vercel dan pastikan status deploy terakhir sukses (Production status is *Ready*).
2.  **Akses Endpoint Readiness**: Buka https://naliai.vercel.app/api/system/readiness. Pastikan JSON yang dikembalikan menampilkan:
    -   `supabaseConfigured: true`
    -   `midtransConfigured: false` (selama deferred)
    -   `exportGateStatus: "prepared_locked"`
3.  **Pantau Error Logs di Vercel**: Periksa tab *Logs* di dasbor Vercel untuk mendeteksi tumpukan error (error stack) yang berulang dari pengguna.
4.  **Pantau Catatan Usage/Cost Logs**: Periksa tabel `api_usage_logs` di database Supabase untuk memantau volume pemanggilan OpenRouter/LLM agar biaya operasional tetap aman.
5.  **Periksa Umpan Balik Pengguna (Feedback Entries)**: Buka tabel `report_feedback` di dasbor Supabase untuk membaca penilaian tombol 👍/👎 dan catatan komentar dari pengguna simulator.
6.  **Periksa Kegagalan Pembuatan Laporan (Generation Failures)**: Filter tabel `report_events` kolom `event_type = 'PREVIEW_GENERATED'` dengan status `failed` untuk mendeteksi kueri pengguna yang memicu kegagalan LLM.
7.  **Pantau Keluhan Batas Kuota (Rate Limits)**: Amati logs untuk memverifikasi apakah ada pengguna yang sering menemui respons `429 Too Many Requests`.
8.  **Evaluasi Kebingungan Pengguna (Misleading Claims)**: Tinjau masukan feedback apakah ada pengguna yang merasa kebingungan atau kecewa karena mengira fitur upload file/verifikasi sumber sudah aktif secara live.

---

## 3. Protokol Penanganan Bug & Laporan Pengguna (User Bug Report Protocol)
Bila pengguna simulator atau Anda sendiri menemukan anomali, kumpulkan 8 poin informasi penting ini sebelum melakukan perbaikan:

1.  **URL Lengkap**: Ambil tautan unik laporan yang bermasalah (termasuk query param token, contoh: `/report/uuid?token=xxx`).
2.  **Perangkat & Layar**: Jenis perangkat yang dipakai (HP Android, iPhone, Laptop, PC) dan resolusi layar perkiraan.
3.  **Browser**: Versi browser (Chrome mobile, Safari iOS, Edge, dll.).
4.  **Promp / Teks Input**: Salinan teks catatan lapangan atau kueri eksak yang dimasukkan pengguna ke kolom composer.
5.  **Screenshot / Rekaman Video**: Tangkapan layar visual layout yang rusak atau rekaman alur kesalahan.
6.  **Waktu Kejadian**: Catatan waktu kejadian untuk mencocokkan logs di dasbor Vercel.
7.  **Pesan Kesalahan (Error Message)**: Salinan teks error yang muncul di layar (misal: "Kredit tidak cukup...", "Timeout...", dll.).
8.  **Sesi Akses (Akses Penguji)**: Apakah error terjadi sebagai pengguna baru (guest session) atau saat memuat kembali laporan lama.

---

## 4. Klasifikasi Tingkat Keparahan (Severity Classifications)
Gunakan pembagian ini untuk merencanakan perbaikan bug:

*   **P0 — Kritis (Perbaiki Segera)**:
    -   Aplikasi mengalami crash total (blank screen) di halaman utama/workspace.
    -   Gerbang ekspor premium bocor (pengguna bisa mengunduh PDF premium secara gratis tanpa record pembayaran sukses di database).
    -   Aplikasi secara salah mengklaim "pembayaran aktif" atau "upload file aktif".
*   **P1 — Tinggi (Selesaikan Sebelum Mengundang Tester Manusia)**:
    -   LLM mengabaikan kebijakan integritas akademis (mau membuat DOI palsu atau Turnitin bypass).
    -   Alur kelanjutan obrolan (follow-up chat) kehilangan konteks draf laporan awal.
    -   Batas kredit (energy ledger) gagal terpotong setelah draf laporan sukses digenerasikan.
*   **P2 — Sedang (Perbaiki Secara Berkala / Batch Fix)**:
    -   Visual aurora latar belakang menutupi kotak teks di HP lebar 360px.
    -   Pesan kesalahan rate limit tidak informatif.
    -   Tombol "Hubungi Admin" atau pratinjau kartu laporan agak terpotong di mobile view.
*   **P3 — Rendah (Selesaikan Saat Waktu Senggang)**:
    -   Salah ketik copywriting minor di halaman penafian.
    -   Penataan spasi atau margin visual minor yang tidak mengganggu keterbacaan teks.

---

## 5. Larangan Operasional (Operational Constraints - What NOT to Do)
Untuk menjaga keamanan data dan kejujuran promosi, pendiri solo **dilarang keras** melakukan tindakan berikut:

-   **Dilarang Melakukan Fulfill Pembayaran Manual Sebagai Alur Utama**: Fulfill manual via rute `/api/manual-fulfillment` hanya diperuntukkan sebagai cadangan review offline. Jangan buat pengguna terbiasa dengan metode fulfillment manual untuk fitur ekspor otomatis.
-   **Jangan Klaim Fitur Unggah Aktif**: Jangan pasang tombol "Upload File" tiruan yang memberikan kesan fitur tersebut sudah bekerja secara fungsional.
-   **Jangan Modifikasi RRLS database Secara Ceroboh**: Seluruh perubahan tabel Supabase wajib didefinisikan lewat berkas migrasi SQL resmi di folder `supabase/migrations/`.
-   **Jangan Mengumpulkan Data Sensitif Pengguna**: NaLI CP1 dirancang untuk beroperasi di bawah Guest Mode tanpa memerlukan pengisian alamat rumah, data keuangan pribadi, atau detail identitas privat pengguna yang berlebihan.

---

## 6. Daftar Fitur yang Ditangguhkan (Deferred Roadmap)
Berikut adalah daftar modul yang secara sengaja ditangguhkan pengembangannya dan tidak boleh diutak-atik pada sprint CP1 ini:
1.  Integrasi Live Midtrans Snap Checkout.
2.  Ekspor Markdown/PDF Premium Terbuka Secara Berbayar Nyata.
3.  Unggah berkas PDF lapangan/Foto observasi.
4.  Pemeriksaan sitasi ilmiah otomatis (Crossref/NCBI live verification).
5.  Dasbor manajemen patroli satwa liar (Professional Field Intelligence Dashboard).
6.  Pengetesan eksternal oleh kelompok penguji manusia (Human Testing).

---

## 7. Kriteria Memulai Kembali Pengujian Manusia (Future Human Testing Exit Criteria)
Pengujian eksternal oleh 3–5 manusia nyata hanya boleh dimulai kembali apabila founder telah memenuhi kriteria kesiapan berikut:

-   [ ] Seluruh 5 pengujian otomatis dalam suite `cp1-friction-regression.test.cjs` lulus dengan sukses (100% Pass).
-   [ ] Masalah visual z-index latar belakang aurora di perangkat mobile terselesaikan penuh.
-   [ ] Dasbor monitoring logs dan database Supabase dipastikan siap melacak data input dan feedback secara real-time.
-   [ ] Seluruh temuan P0/P1 yang diperoleh dari simulasi AI diselesaikan secara tuntas.
-   [ ] Dokumen checklist master rekrutmen tester telah disinkronkan dengan kebutuhan testing terarah.
