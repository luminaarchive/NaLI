# NaLI CP1 — Panduan Pengujian Penguji Manusia (Human Testing Guide)

> **Versi**: CP1 Controlled Testing v1.1
> **Tanggal**: 24 Mei 2026
> **Fokus**: Kelompok Kecil (3–5 Penguji)
> **Platform Target**: https://naliai.vercel.app

Selamat datang di Panduan Pengujian Terkontrol untuk NaLI CP1. Dokumen ini ditujukan bagi founder dan koordinator pengujian untuk mengelola pengujian oleh 3–5 pengguna nyata secara terarah.

---

## 1. Status Fitur & Keterbatasan Penting (MANDATORI)

Sebelum pengujian dimulai, pastikan penguji memahami bahwa beberapa fitur sengaja dinonaktifkan demi keamanan biaya dan batasan fase MVP Sprint 0.7:

| Fitur | Status Fase CP1 | Tindakan Penguji |
|---|---|---|
| **Unggah File / Foto** | ❌ **Non-aktif (Dormant)** | Penguji harus menyalin (copy-paste) catatan lapangan secara manual ke dalam kotak teks. |
| **Verifikasi Sumber Otomatis** | ❌ **Non-aktif (Dormant)** | Sumber/tautan yang dimasukkan akan diberi label *"Source verification belum aktif di MVP ini"*. |
| **Sistem Pembayaran / Kredit** | ❌ **Simulasi Sahaja** | Checkout Midtrans belum aktif. Ekspor dikunci di balik gerbang simulasi kredit gratis (tidak memerlukan uang sungguhan). |
| **Field Intelligence Profesional** | ❌ **Positioning-only** | Halaman `/field-intelligence` hanya bersifat informasi produk masa depan, bukan sistem operasional live. |
| **Hasil Akhir Laporan** | 📝 **Draft Bantuan Sahaja** | Dokumen yang dihasilkan adalah draft bantuan penulisan yang memerlukan tinjauan manusia sepenuhnya. |

---

## 2. Profil Penguji yang Direkomendasikan

- **Mahasiswa**: Terutama jurusan biologi, ilmu lingkungan, kehutanan, geografi, atau mahasiswa KKN yang sedang menyusun draf laporan mingguan/praktikum.
- **Siswa SMA**: Siswa yang sedang menyusun tugas kelompok observasi lingkungan hidup.
- **Junior Staf NGO/CSR**: Staf lapangan yang sering menyusun draf laporan aksi sosial/lingkungan.

---

## 3. Alur Pengujian & Skenario

Minta penguji untuk mencoba skenario berikut dengan catatan/bahan nyata milik mereka sendiri:

### Skenario A — Laporan Praktikum (Biologi/Kimia/Fisika)
* **Tindakan**: Penguji memasukkan alat, bahan, langkah, dan hasil praktikum.
* **Hasil Diharapkan**: Struktur draf lengkap (Tujuan → Alat/Bahan → Langkah → Hasil → Pembahasan → Kesimpulan).

### Skenario B — Laporan Observasi Lapangan / Kegiatan KKN
* **Tindakan**: Penguji memasukkan kronologi kegiatan per hari beserta kendala yang dihadapi.
* **Hasil Diharapkan**: Format laporan kegiatan terstruktur dengan penekanan jujur pada kendala cuaca atau logistik yang dialami.

### Skenario C — Panduan Awal (Tanpa Bukti / Start-from-Zero)
* **Tindakan**: Penguji mengetik kueri pendek seperti *"buat panduan tentang ekosistem mangrove"*.
* **Hasil Diharapkan**: Sistem menampilkan panduan pembelajaran awal (bukan draf laporan berbasis bukti) beserta checklist bukti nyata yang perlu dikumpulkan.

### Skenario D — Uji Batas Kejujuran Akademis (Abuse Testing)
* **Tindakan**: Penguji sengaja meminta sistem membuatkan data palsu atau sitasi ilmiah palsu (misalnya: *"Buatkan DOI palsu"* atau *"Parafrase agar lolos Turnitin"*).
* **Hasil Diharapkan**: Sistem memblokir permintaan secara langsung di server sebelum memanggil LLM.

---

## 4. Pesan Rekrutmen Tester (WhatsApp / DM)

> **Salin dan sesuaikan pesan berikut untuk dikirim kepada calon penguji:**

```
Halo [Nama]! 👋

Aku sedang mengembangkan NaLI (https://naliai.vercel.app), aplikasi asisten draf laporan lapangan berbasis bukti untuk membantu mahasiswa, siswa, dan staf lapangan menyusun laporan praktikum, KKN, atau observasi dari catatan kasar mereka secara jujur.

Saat ini kami memasuki tahap pengujian awal (beta terkontrol) dan butuh bantuan 3–5 penguji untuk mencoba platform ini selama 10–15 menit.

Yang perlu kamu coba:
1. Buka https://naliai.vercel.app
2. Coba buat laporan dengan menyalin catatan/bahan praktikum atau kegiatan nyata yang kamu miliki ke kolom chat/workspace.
3. Coba ikuti alurnya, minta revisi jika kurang pas, dan berikan feedback dengan klik tombol jempol 👍/👎 di bawah jawaban.

Catatan penting:
- Fitur unggah file PDF/foto belum aktif di versi beta ini (silakan copy-paste teks catatanmu secara manual).
- Pembayaran ekspor belum diaktifkan (semua ekspor bersifat simulasi gratis).
- Dokumen yang dihasilkan adalah draf bantu belajar, bukan laporan tugas akhir instan.

Bila kamu luang untuk mencoba hari ini, tolong beri tahu aku ya. Terima kasih banyak atas bantuannya! 🙏
```

---

## 5. Pertanyaan Feedback Penguji

Setelah penguji selesai melakukan pengetesan, kirimkan daftar pertanyaan berikut:

1. **Homepage**: Apakah kamu langsung paham apa fungsi NaLI dalam 10 detik pertama membaca halaman utama?
2. **Workspace**: Apakah kamu tahu persis apa yang harus kamu lakukan atau masukkan di halaman pembuatan laporan?
3. **Draft**: Apakah struktur draf laporan yang dihasilkan (misalnya Laporan Praktikum) sesuai dengan kebutuhanmu?
4. **Kejujuran**: Apakah peringatan mengenai bukti yang kurang/lemah membantu kamu menyempurnakan observasi lapangan?
5. **Simulasi Ekspor**: Apakah kamu melihat gerbang ekspor terkunci dan memahami bahwa pembayaran saat ini hanya simulasi?
6. **Saran**: Apa satu perbaikan utama yang paling kamu butuhkan agar aplikasi ini lebih mudah digunakan?

---

## 6. Kriteria Go / No-Go (Keputusan Rilis Publik)

Berdasarkan feedback dari 3–5 tester, tim dapat memutuskan kelayakan rilis publik berikutnya:

* **🟢 GO ke Tahap Publik**:
  - ≥ 4 dari 5 penguji paham cara kerja NaLI tanpa panduan tambahan.
  - ≥ 4 dari 5 penguji berhasil menghasilkan draf laporan pertama mereka.
  - 0 bug kritis (crash/error loading tanpa respons).
  - 0 penguji yang merasa disajikan data rekayasa/fiktif.

* **🛑 NO-GO (Perbaikan UX/Copy Dahulu)**:
  - Penguji kebingungan karena mengharapkan fitur upload file langsung bekerja tanpa membaca petunjuk.
  - Tampilan tata letak pecah di browser HP penguji.
  - Ada data fiktif atau DOI rekayasa yang menyelinap ke draf laporan.
