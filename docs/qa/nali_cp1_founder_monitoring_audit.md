# NaLI CP1 — Audit Sumber Data Pemantauan Pendiri (Founder Monitoring Audit)

Dokumen ini memetakan ketersediaan data operasional dan skema database di NaLI CP1 untuk membangun antarmuka pemantauan internal (Founder Admin Monitoring) secara aman dan kokoh.

---

## 1. Sumber Data Tersedia (Available Data Sources)

### A. Tabel `public.reports`
- **Fungsi**: Menyimpan draf laporan dan panduan belajar.
- **Kolom Utama**:
  - `id` (UUID) - ID Laporan.
  - `status` (TEXT) - `pending_upload`, `verifying`, `pending_payment`, `processing`, `export_ready`, `failed`.
  - `mode` (TEXT) - `draft_from_materials` atau `start_from_zero`.
  - `input` (JSONB) - Promp/bahan pengguna.
  - `output` (JSONB) - Struktur draf hasil LLM.
  - `failure_reason` / `failure_stage` (TEXT) - Deteksi error pembuatan.
  - `created_at` (TIMESTAMPTZ) - Waktu pembuatan.
- **Keamanan**: Kolom `guest_session_id_hash` dan `report_access_token_hash` **wajib disembunyikan** dari respons publik/admin untuk mencegah pembajakan sesi.

### B. Tabel `public.report_feedback`
- **Fungsi**: Umpan balik langsung dari pengguna simulator/sintetis.
- **Kolom Utama**:
  - `id` (UUID), `report_id` (UUID).
  - `rating` (TEXT) - `'helpful'` atau `'not_helpful'`.
  - `comment` (TEXT) - Komentar teks opsional dari pengguna.
  - `created_at` (TIMESTAMPTZ).
- **Keamanan**: Sembunyikan tautan `guest_session_id_hash`.

### C. Tabel `public.report_events`
- **Fungsi**: Histori siklus hidup laporan.
- **Kolom Utama**:
  - `id` (UUID), `report_id` (UUID).
  - `event_type` (TEXT) - `REPORT_CREATED`, `PREVIEW_GENERATED`, `PAYMENT_CREATED`, `PAYMENT_CONFIRMED`, `EXPORT_ATTEMPTED`, `EXPORT_UNLOCKED`, `FEEDBACK_SUBMITTED`.
  - `status` (TEXT), `metadata` (JSONB).

### D. Tabel `public.api_usage_logs`
- **Fungsi**: Log token dan estimasi biaya pemanggilan OpenRouter.
- **Kolom Utama**:
  - `id` (UUID), `report_id` (UUID), `operation` (TEXT).
  - `provider_alias` (TEXT), `model_alias` (TEXT).
  - `estimated_input_tokens` (INTEGER), `estimated_output_tokens` (INTEGER).
  - `estimated_cost` (NUMERIC(12,6)).
  - `status` (TEXT) - `success`, `failed`, `skipped`.

### E. Tabel `public.usage_events`
- **Fungsi**: Estimasi pemakaian energi dan biaya per jenis aksi di tingkat guest.
- **Kolom Utama**:
  - `action_type` (TEXT), `processing_class` (TEXT), `estimated_energy` (INTEGER), `estimated_cost_idr` (NUMERIC).

### F. Tabel `public.payments`
- **Fungsi**: Ringkasan transaksi (Midtrans), hanya untuk agregasi status internal (DEFERRED).
- **Kolom Utama**:
  - `amount` (NUMERIC), `status` (TEXT) - `pending`, `paid`, `failed`, `expired`, `cancelled`, `denied`.

### G. Tabel `public.rate_limits`
- **Fungsi**: Memantau pembatasan akses.
- **Kolom Utama**:
  - `key_hash` (TEXT), `attempts` (INTEGER), `locked_until` (TIMESTAMPTZ).

---

## 2. Parameter Batasan & Privasi (Privacy Boundaries)

### Yang Boleh Diekspos Secara Internal (Aman bagi Founder)
1. **Agregasi Metrik**: Jumlah total laporan, rasio sukses/gagal, rata-rata token, total feedback positif/negatif.
2. **Komentar Feedback**: Isi kolom `comment` dan `rating` untuk menganalisis kebingungan pengguna (misal: mencari kata kunci "error", "bayar", "tombong", "HP").
3. **Status Kesiapan**: Indikator boolean status integrasi server (Readiness Endpoint).
4. **Log Error**: Kolom `failure_reason` dan `failure_stage` pada pembuatan laporan.

### Yang Haram Diekspos (Strict Confidentiality)
1. **Token/Kredensial Sesi**: `guest_session_id_hash`, `report_access_token_hash`, dan `key_hash` rate limit.
2. **Kunci Enkripsi/API Keys**: Kredensial Vercel / OpenRouter / Supabase.
3. **Data Pribadi Pengguna**: Jika ada URL/promp sensitif, hanya founder terautentikasi melalui token pengaman yang berhak mengakses, dan data tersebut tidak boleh terekspos di API endpoint publik tanpa proteksi.

---

## 3. Celah Analisis & Rekomendasi (Gaps & Recommendations)
- **Celah Keamanan**: Antarmuka system readiness `/system` saat ini tidak dilindungi token admin di tingkat per-route (siapapun bisa melihat booleans status server). Namun, ia tidak membocorkan string rahasia.
- **Rekomendasi Solusi**: 
  1. Buat rute halaman `/founder` (Founder Console) yang dilindungi secara ketat oleh token admin lingkungan server: `NALI_FOUNDER_ADMIN_TOKEN`.
  2. Implementasikan API Endpoint `/api/founder/summary` yang mengembalikan statistik agregasi dari seluruh tabel operasional (readiness, reports, feedback, cost, events) hanya jika token yang dikirim via query `?token=...` atau header `x-founder-token` cocok dengan env server.
  3. Degradasikan secara aman (tampilkan kosong/unavailable) jika database Supabase atau token admin belum dikonfigurasi.
