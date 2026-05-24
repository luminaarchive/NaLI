# NaLI CP1 — Rencana Pengujian AI-First E2E (AI-First E2E Test Plan)

Dokumen ini mendefinisikan 8 persona manusia sintetis (synthetic AI personas) beserta skenario alur interaksi ujung-ke-ujung (E2E flows) untuk memvalidasi fungsi pembayaran, kredit, dan gerbang ekspor secara aman sebelum pengujian manusia nyata dimulai.

---

## 1. Persona 1: Free Preview Student
*   **Profil**: Mahasiswa yang ingin menguji pembuatan draf laporan praktikum menggunakan batas kredit gratis bawaan sistem.
*   **Goal**: Menghasilkan draf laporan biologi dan melihat preview hasilnya di browser tanpa membayar.
*   **Starting State**: Pengguna baru (guest session baru), saldo kredit 50 (bawaan sistem jika Supabase siap).
*   **Actions**:
    1. Mengakses `/create-report`.
    2. Memasukkan catatan kasar praktikum biologi (etiolasi kacang hijau) + mengaktifkan checkbox persetujuan integritas.
    3. Mengirim permintaan pembuatan laporan (`POST /api/reports/generate`).
*   **Expected System Behavior**:
    - Memotong kredit gratis sebesar 20 (karena model draft).
    - Menyimpan laporan di Supabase dengan status `export_ready`.
    - Mengembalikan respons JSON berisi draf laporan dan kunci akses (`report_access_key`).
*   **API Endpoints**: `POST /api/reports/generate`
*   **UI State**: Hasil draf laporan tampil di layar, tombol "Ekspor PDF" dan "Ekspor Markdown" terkunci/dinonaktifkan (disertai simbol gembok), sisa saldo kredit tampil sebesar 30.
*   **Payment/Export/Credit State**: Saldo: 30 kredit, Status ekspor: `export_locked`.
*   **Abuse/Security Checks**: Memastikan request menyertakan checkbox persetujuan integritas dan input materi riil (tidak kosong).
*   **Pass/Fail Criteria**:
    - *Pass*: Draf laporan terbuat, kredit terpotong 20, ekspor terkunci.
    - *Fail*: Laporan tidak terbuat atau tombol ekspor langsung aktif secara gratis.

---

## 2. Persona 2: Paid Export Intent Student
*   **Profil**: Mahasiswa yang telah menyusun draf laporan biologi lewat preview gratis dan bersedia membeli ekspor premium sekali bayar (single export).
*   **Goal**: Membuka kunci ekspor PDF/Markdown premium untuk satu laporan tertentu.
*   **Starting State**: Memiliki draf laporan yang sudah tersimpan (`report_id` valid, `report_access_key` valid), status ekspor saat ini terkunci.
*   **Actions**:
    1. Klik tombol "Unlock Export" di halaman laporan.
    2. Sistem membuat pembayaran baru (`POST /api/payments/create` dengan `export_type = markdown` atau `pdf`).
    3. Menerima URL SNAP Midtrans Sandbox, dialihkan ke simulator Snap, menyelesaikan pembayaran simulator.
    4. Midtrans mengirimkan webhook pemberitahuan sukses (`POST /api/payments/midtrans-webhook` dengan status `settlement`).
    5. Pengguna diarahkan kembali ke `/report/[id]` dan mencoba mengunduh file ekspor (`GET /api/reports/[id]/export`).
*   **Expected System Behavior**:
    - Membuat record pembayaran baru dengan status `pending` di tabel `payments`.
    - Webhook memverifikasi tanda tangan SHA-512, mengupdate status pembayaran menjadi `paid`.
    - Rute ekspor memverifikasi status pembayaran di tabel `payments` dan menyajikan data Markdown/PDF premium.
*   **API Endpoints**: `POST /api/payments/create`, `POST /api/payments/midtrans-webhook`, `GET /api/reports/[id]/export`
*   **UI State**: Setelah kembali dari SNAP, tombol ekspor premium berubah menjadi aktif (gembok terbuka). Pengguna dapat mengeklik untuk mengunduh.
*   **Payment/Export/Credit State**: Saldo kredit tetap (tidak berkurang untuk aksi ekspor karena bayar langsung), status pembayaran: `paid`, status ekspor: `export_ready`.
*   **Abuse/Security Checks**: Memastikan signature webhook dari Midtrans divalidasi dengan server key, mencegah bypass pembayaran.
*   **Pass/Fail Criteria**:
    - *Pass*: Transaksi Snap terbuat, status berubah menjadi `paid` setelah webhook sukses, file ekspor premium berhasil diunduh.
    - *Fail*: Webhook gagal memverifikasi signature, status pembayaran tetap `pending`, atau ekspor terbuka tanpa webhook sukses.

---

## 3. NGO/CSR Paid Report User
*   **Profil**: Staf lapangan NGO junior yang sering menyusun draf laporan penanaman mangrove dan memutuskan membeli paket kredit Starter (300 kredit) agar dapat membuat laporan berkali-kali.
*   **Goal**: Membeli paket kredit Starter (49.000 IDR), memastikan kredit masuk ke saldo akun, dan menyusun laporan-laporan berikutnya.
*   **Starting State**: Pengguna baru (guest session baru), saldo awal 50 kredit.
*   **Actions**:
    1. Mengakses `/pricing`, memilih paket Starter, dan mengklik "Beli Paket" (`POST /api/payments/create` dengan `plan_id = starter`).
    2. Menyelesaikan pembayaran di simulator Snap Midtrans.
    3. Webhook Midtrans terpanggil dan memverifikasi status transaksi (`POST /api/payments/midtrans-webhook`).
    4. Mengakses workspace, mengecek saldo, dan membuat laporan baru (`POST /api/reports/generate`).
*   **Expected System Behavior**:
    - Menghasilkan transaksi Midtrans dengan metadata tepercaya (`credits_to_grant = 300`, `product_type = plan`).
    - Webhook mencatat penambahan 300 kredit ke tabel `energy_ledger` menggunakan ID idempotent.
    - Mengurangi 20 kredit setelah pembuatan laporan baru.
*   **API Endpoints**: `POST /api/payments/create`, `POST /api/payments/midtrans-webhook`, `POST /api/reports/generate`
*   **UI State**: Dasbor menampilkan saldo kredit 350 setelah pembayaran sukses (50 awal + 300 beli), lalu menjadi 330 setelah satu laporan terbuat.
*   **Payment/Export/Credit State**: Status pembayaran: `paid`, Saldo: 330 kredit.
*   **Abuse/Security Checks**: Menghindari double-grant kredit jika webhook terkirim dua kali untuk transaksi yang sama.
*   **Pass/Fail Criteria**:
    - *Pass*: Pembelian plan berhasil meningkatkan saldo kredit, pembuatan laporan memotong kredit, saldo ter-update dengan benar.
    - *Fail*: Kredit tidak bertambah setelah bayar, atau terjadi double-grant kredit pada webhook duplikat.

---

## 4. User with Insufficient Credits
*   **Profil**: Pengguna yang kehabisan kredit gratis dan mencoba memaksa membuat laporan baru tanpa membeli kredit.
*   **Goal**: Mencoba memicu endpoint laporan meskipun kredit habis.
*   **Starting State**: Guest session aktif, saldo kredit 5 (di bawah biaya minimum 10 untuk start-from-zero atau 20 untuk draft-from-materials).
*   **Actions**:
    1. Mengisi form pengerjaan laporan di `/create-report`.
    2. Mengklik "Mulai Susun Laporan" (`POST /api/reports/generate`).
*   **Expected System Behavior**:
    - Sistem memeriksa saldo kredit di server sebelum memanggil LLM/OpenRouter.
    - Menolak pemrosesan dengan mengembalikan HTTP status `402 Payment Required` dan JSON error `insufficient_credits`.
*   **API Endpoints**: `POST /api/reports/generate`, `POST /api/reports/chat`
*   **UI State**: Form berhenti memuat, menampilkan pesan dialog error berwarna merah: "Kredit tidak cukup untuk melakukan aksi ini..." dan mengarahkan pengguna ke halaman pricing.
*   **Payment/Export/Credit State**: Saldo tetap 5 kredit, status ekspor: `export_locked`.
*   **Abuse/Security Checks**: Verifikasi saldo wajib dilakukan di sisi server, bukan hanya di UI browser.
*   **Pass/Fail Criteria**:
    - *Pass*: Permintaan ditolak dengan status 402 di server, LLM tidak dipanggil, saldo tetap 5.
    - *Fail*: LLM terpanggil secara gratis sehingga saldo kredit menjadi negatif atau bypass pembatasan.

---

## 5. User after Successful Credit Purchase
*   **Profil**: Pengguna yang berhasil melakukan pembelian paket top-up (Mini: 100 kredit) dan memverifikasi integrasi ledger.
*   **Goal**: Membeli top-up Mini (15.000 IDR) dan memastikan saldo bertambah tepat 100 kredit.
*   **Starting State**: Guest session aktif dengan saldo 10 kredit.
*   **Actions**:
    1. Mengakses `/pricing`, memilih Top-up Mini, mengklik "Beli Paket" (`POST /api/payments/create` dengan `pack_id = mini`).
    2. Simulator pembayaran diselesaikan.
    3. Webhook sukses memicu penulisan ledger (`POST /api/payments/midtrans-webhook`).
*   **Expected System Behavior**:
    - Webhook memvalidasi signature dan mencocokkan `gross_amount` (15.000) dengan nominal pembayaran yang tersimpan di DB.
    - Menambahkan tepat 100 kredit ke `energy_ledger`.
*   **API Endpoints**: `POST /api/payments/create`, `POST /api/payments/midtrans-webhook`
*   **UI State**: Dasbor saldo ter-update menjadi 110 kredit (10 awal + 100 beli).
*   **Payment/Export/Credit State**: Saldo: 110 kredit, status pembayaran: `paid`.
*   **Abuse/Security Checks**: Pencocokan gross amount tepercaya server-side mencegah eksploitasi manipulasi harga di sisi client.
*   **Pass/Fail Criteria**:
    - *Pass*: Saldo bertambah 100 secara akurat setelah webhook settlement diterima.
    - *Fail*: Uang didebet tetapi kredit tidak masuk, nominal kredit salah, atau nominal pembayaran tidak cocok tetapi tetap diloloskan.

---

## 6. User with Failed/Cancelled Payment
*   **Profil**: Pengguna yang berubah pikiran atau kehabisan waktu bayar saat melakukan transaksi ekspor/kredit.
*   **Goal**: Membatalkan pesanan di dasbor Midtrans atau membiarkannya kedaluwarsa.
*   **Starting State**: Melakukan checkout ekspor premium, pesanan tersimpan di DB dengan status `pending`.
*   **Actions**:
    1. Mengklik batalkan di halaman instruksi pembayaran Midtrans Snap.
    2. Midtrans mengirimkan webhook pembatalan (`POST /api/payments/midtrans-webhook` dengan status `cancel` atau `expire`).
    3. Mencoba mengakses unduhan ekspor premium (`GET /api/reports/[id]/export`).
*   **Expected System Behavior**:
    - Webhook mengupdate status di tabel `payments` dari `pending` menjadi `cancelled` atau `expired`.
    - Rute ekspor menolak permintaan unduhan karena status pembayaran tidak valid (`paid`/`success`).
*   **API Endpoints**: `POST /api/payments/midtrans-webhook`, `GET /api/reports/[id]/export`
*   **UI State**: Status pesanan ekspor berubah menjadi gagal/expired. Tombol ekspor premium tetap terkunci dengan ikon gembok.
*   **Payment/Export/Credit State**: Status pembayaran: `cancelled` atau `expired`, status ekspor: `export_locked`.
*   **Abuse/Security Checks**: Memastikan status pembayaran non-sukses (cancel, deny, expire, pending) tidak pernah meloloskan gate ekspor.
*   **Pass/Fail Criteria**:
    - *Pass*: Ekspor tetap terkunci, status ter-update menjadi gagal/expired di database.
    - *Fail*: Transaksi yang dibatalkan/expired meloloskan unduhan ekspor.

---

## 7. Returning User Accessing Report with Access Key
*   **Profil**: Pengguna lama yang ingin memuat kembali draf laporan yang telah mereka susun sebelumnya menggunakan tautan akses unik.
*   **Goal**: Membuka `/report/[id]?token=report_access_key` dan memverifikasi laporan termuat secara utuh.
*   **Starting State**: Laporan terbuat sebelumnya (`report_id` dan `report_access_key` tersimpan di localStorage browser).
*   **Actions**:
    1. Membuka URL laporan dengan query param token (`GET /report/[id]?token=report_access_key`).
    2. Mencoba mengakses api data laporan (`GET /api/reports/[id]?token=report_access_key`).
*   **Expected System Behavior**:
    - Server menghitung hash SHA-256 dari token query param.
    - Mencari di tabel `reports` kolom `report_access_token_hash`.
    - Mengembalikan data laporan jika hash cocok secara tepat.
*   **API Endpoints**: `GET /api/reports/[id]`
*   **UI State**: Halaman laporan memuat draf laporan secara utuh dengan tata letak konsisten, riwayat chat dengan asisten AI juga tampil.
*   **Payment/Export/Credit State**: Status ekspor sesuai status pembayaran awal (unlocked jika sudah dibayar, locked jika belum).
*   **Abuse/Security Checks**: Mengakses laporan tanpa menyertakan token atau dengan token salah wajib ditolak dengan HTTP 401/404.
*   **Pass/Fail Criteria**:
    - *Pass*: Memuat laporan berhasil jika token benar, ditolak dengan aman jika token salah atau kosong.
    - *Fail*: Laporan bisa diakses secara bebas hanya dengan mengetahui UUID `report_id` tanpa token.

---

## 8. Abuse User Trying Fake Paid Unlock (Client Bypass)
*   **Profil**: Pengguna jahat yang mencoba melakukan eksploitasi request (hacking/spofing) dengan memodifikasi parameter lokal agar bisa mengunduh laporan tanpa membayar.
*   **Goal**: Mengunduh file ekspor premium tanpa transaksi bernominal valid atau memalsukan pembayaran sukses di sisi client.
*   **Starting State**: Memiliki draf laporan yang masih terkunci ekspornya.
*   **Actions**:
    1. Mengirim permintaan langsung ke rute ekspor (`GET /api/reports/[id]/export?token=xxx&format=pdf`) tanpa pernah membayar.
    2. Mencoba mengirimkan fake ID pembayaran sukses buatan sendiri ke server.
*   **Expected System Behavior**:
    - Server memvalidasi status riil transaksi di tabel `payments` menggunakan query join terpercaya.
    - Menolak permintaan ekspor dengan status `402 Payment Required` (atau `401 Unauthorized` jika token salah).
*   **API Endpoints**: `GET /api/reports/[id]/export`
*   **UI State**: Browser menampilkan error JSON: `{"error": "Unlock Export diperlukan sebelum mengunduh file premium."}`.
*   **Payment/Export/Credit State**: Status ekspor tetap `export_locked`.
*   **Abuse/Security Checks**: Melakukan sanitasi input dan validasi kebenaran mutlak transaksi di server-side, mengabaikan segala bendera status/payment_id yang dioperasikan client.
*   **Pass/Fail Criteria**:
    - *Pass*: Upaya eksploitasi diblokir di tingkat server, file premium gagal diunduh.
    - *Fail*: Ekspor premium berhasil diunduh tanpa catatan transaksi bernilai sukses di tabel `payments` database.
