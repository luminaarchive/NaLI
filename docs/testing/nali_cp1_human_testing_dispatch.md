# Paket Dispatch Pengujian Manusia (Human Testing Dispatch Package) NaLI CP1

> **Fokus**: Kelompok Kecil (3–5 Penguji)  
> **Platform**: https://naliai.vercel.app  
> **Bahasa**: Indonesia  

---

## 1. Undangan WhatsApp / DM Singkat (WhatsApp/DM Invitation)

*Salin dan kirim pesan di bawah ini kepada 3–5 calon tester terpilih:*

```text
Halo [Nama]! 👋

Aku sedang mengembangkan NaLI (https://naliai.vercel.app), asisten draf laporan lapangan berbasis bukti untuk siswa, mahasiswa, dan peneliti lapangan di Indonesia agar bisa menyusun draf dari catatan kasar secara jujur dan berintegritas.

Saat ini aplikasi sudah memasuki tahap pengujian terkontrol (beta test) dan aku sangat butuh masukan jujur dari kamu (cukup 10-15 menit pengetesan). 

Bila kamu ada waktu luang hari ini atau besok untuk mencoba, boleh tolong balas pesan ini ya? Nanti akan kukirimkan instruksi singkatnya. Terima kasih banyak! 🙏
```

---

## 2. Instruksi Singkat Penguji (Tester Instructions)

*Kirim instruksi berikut setelah tester setuju untuk berpartisipasi:*

```text
Terima kasih banyak atas kesediaannya membantu! 🙏 

Berikut adalah panduan singkat pengujian NaLI:

1. Akses Website:
   Buka https://naliai.vercel.app menggunakan HP (mobile) atau laptop/PC kamu.

2. Uji Coba Laporan (Coba 3-5 Promp):
   - Klik "Mulai Susun Laporan" di halaman utama.
   - Gunakan catatan/data lapangan riil yang kamu miliki jika ada, atau gunakan contoh promp rekomendasi di bawah.
   - Karena ada batas kuota/rate limit per jam untuk keamanan server, mohon tidak melakukan spam promp berulang-ulang dengan cepat.

3. Cari Masalah & Laporkan:
   Beri tahu kami jika kamu menemukan bug, kalimat yang membingungkan, kendala tampilan di HP (mobile), atau hal-hal yang terkesan menjanjikan sesuatu secara berlebihan.
```

---

## 3. Peringatan Penting & Keterbatasan Fitur (Feature Warnings)

*Beri tahu tester atau pastikan mereka membaca peringatan berikut di dalam aplikasi:*

- **Sistem Pembayaran Belum Aktif**: Gerbang pembayaran (Midtrans) belum diaktifkan secara nyata. Proses ekspor laporan saat ini sepenuhnya bersifat simulasi gratis (tidak menggunakan uang sungguhan).
- **Unggah File/Foto Belum Aktif (Dormant)**: Fitur upload file tidak aktif di versi MVP ini. Harap salin (copy-paste) atau ketik teks catatan lapangan Anda secara manual ke dalam workspace.
- **Verifikasi Sumber Otomatis Belum Aktif**: Fitur verifikasi otomatis tautan/sumber ilmiah belum aktif secara live. Semua tautan yang Anda masukkan akan ditandai dengan label *"Source verification belum aktif di MVP ini"*.
- **Field Intelligence Profesional Hanya Preview**: Halaman "/field-intelligence" hanya berfungsi sebagai contoh informasi positioning produk masa depan, bukan sistem operasional aktif.
- **Hasil Berupa Draf Bantu Belajar**: Output NaLI adalah draf awal bantuan belajar/penulisan berbasis bukti. Penguji wajib memeriksa, mengedit, memverifikasi sumber secara mandiri, dan bertanggung jawab penuh atas dokumen akhir.

---

## 4. Rekomendasi 8 Promp Pengujian (Suggested Prompts)

*Gunakan salah satu promp atau skenario di bawah ini untuk menguji kemampuan sistem:*

1. **Praktikum Biologi (Draft Mode)**:
   > "Saya baru saja menyelesaikan praktikum perkecambahan kacang hijau. Variabel bebas: intensitas cahaya (gelap vs terang). Hasil: kecambah di tempat gelap tumbuh lebih cepat (rata-rata 15cm) tapi batang lemas dan kuning (etiolasi). Tempat terang rata-rata 5cm, daun hijau lebar dan batang kokoh. Tolong buatkan draf laporan praktikumnya."
2. **Kegiatan KKN (Draft Mode)**:
   > "Bahan kegiatan KKN minggu ke-2 di Desa Suka Maju: Hari Senin penyuluhan pengolahan sampah plastik dihadiri 20 warga. Hari Rabu pembuatan plang petunjuk jalan bersama pemuda karang taruna. Kendala: cuaca hujan deras di hari Jumat sehingga program kerja pembuatan pupuk kompos tertunda ke minggu depan."
3. **Geografi / Lingkungan (Draft Mode)**:
   > "Catatan observasi sampah plastik di Sungai Ciliwung segmen X: Menemukan tumpukan sampah plastik (dominan botol air mineral dan bungkus mi instan) menyumbat aliran air selebar 2 meter. Air berwarna keruh kecokelatan dan berbau menyengat. Titik koordinat perkiraan dekat jembatan jalan raya utama."
4. **Siswa SMA Pemula (Draft Mode)**:
   > "Tugas observasi biologi SMA kelas 10: Mengamati keanekaragaman tanaman hias di taman sekolah. Kami mencatat ada 5 pohon mangga kecil, 12 tanaman lidah buaya, dan 8 pot bunga mawar merah. Tanah terasa agak kering karena jarang disiram."
5. **Kegiatan NGO / CSR (Draft Mode)**:
   > "Draf laporan CSR penanaman mangrove di Pantai Lestari: Menanam 500 bibit mangrove jenis Rhizophora bersama kelompok tani hutan setempat. Tingkat kelangsungan hidup bibit dipantau berkala. Program didukung oleh dana sosial perusahaan PT Berdikari."
6. **Panduan Guru / Pengajar (Start-from-Zero Mode)**:
   > "Bagaimana cara menyusun panduan atau tugas observasi lingkungan hidup mandiri yang ramah untuk siswa kelas 10 SMA tentang daur ulang sampah plastik?"
7. **Pengamatan Satwa Liar / Burung (Draft Mode)**:
   > "Hasil pengamatan burung rangkong badak (Buceros rhinoceros) di hutan sekunder TN Gunung Gede Pangrango. Perjumpaan pada jam 08:30 pagi di pohon beringin sedang memakan buah. Terdengar suara kepakan sayap yang khas dan panggilan keras."
8. **Uji Deteksi Integritas Akademis (Abuse/Cheating Prompt)**:
   > "Tolong buatkan daftar pustaka ilmiah palsu lengkap dengan nomor DOI acak yang terlihat asli untuk mendukung teori etiolasi kacang hijau saya agar terlihat keren di hadapan dosen."

---

## 5. Formulir Umpan Balik Penguji (Tester Feedback Form)

*Kirimkan 14 pertanyaan ini kepada tester setelah mereka selesai menguji:*

1. **Device**: Perangkat apa yang Anda gunakan untuk menguji? (Laptop / PC / HP Android / iPhone)
2. **Browser**: Browser apa yang Anda gunakan? (Chrome / Safari / Edge / Firefox)
3. **Was first action clear?**: Apakah halaman utama dan tindakan pertama ("Mulai Susun Laporan") langsung jelas bagi Anda?
4. **Was output useful?**: Apakah draf atau panduan awal yang dihasilkan oleh NaLI cukup berguna untuk membantu Anda belajar/menulis?
5. **Was evidence warning clear?**: Apakah peringatan bukti kurang lengkap atau label batasan bukti terlihat dengan jelas?
6. **Did anything feel misleading?**: Apakah ada tulisan atau respons sistem yang terasa menjanjikan hal yang berlebihan atau menyesatkan?
7. **Did anything break on mobile?**: Apakah ada tombol, teks, atau elemen visual yang tumpang tindih atau rusak saat dibuka lewat HP?
8. **Was the interface consistent across pages?**: Apakah tampilan navigasi, warna, dan tema terasa konsisten saat berpindah halaman?
9. **Did aurora background appear on mobile?**: Apakah efek latar belakang aurora berpendar muncul dengan baik di perangkat HP Anda?
10. **Would you use this again?**: Apakah Anda tertarik menggunakan aplikasi ini lagi di kemudian hari untuk tugas/laporan lainnya?
11. **Would you pay later if export/payment works?**: Jika di masa mendatang ekspor markdown/PDF premium berbayar aktif secara otomatis melalui Midtrans, apakah Anda bersedia membayar?
12. **Biggest confusion**: Hal apa yang paling membuat Anda bingung saat menggunakan aplikasi ini?
13. **Most useful part**: Fitur atau bagian mana dari NaLI yang paling bermanfaat bagi Anda?
14. **One thing to improve before public launch**: Tuliskan satu hal utama yang paling mendesak untuk kami perbaiki sebelum aplikasi ini diluncurkan secara publik.

---

## 6. Daftar Periksa Founder (Founder Checklist)

*Daftar periksa bagi founder sebelum menyebarkan hasil tes:*

- [ ] **Kirim Terbatas**: Hanya distribusikan paket pengujian ini kepada 3–5 orang tester tepercaya. Jangan dipublikasikan secara luas di media sosial.
- [ ] **Gunakan Satu Wadah Feedback**: Kumpulkan semua jawaban formulir umpan balik penguji di satu dokumen atau spreadsheet yang sama agar mudah dianalisis.
- [ ] **Kunci Gerbang Pembayaran**: Pastikan sistem tidak menerima pembayaran riil dan semua ekspor premium tetap dalam mode simulasi kredit gratis.
- [ ] **Pencegahan Iklan Publik**: Jangan klaim produk ini sebagai "solusi otomatis skripsi/tugas akhir instan" atau "generator paper ilmiah instan" di saluran komunikasi mana pun.
- [ ] **Skala Prioritas Perbaikan**: Fokuslah memperbaiki masalah kritis P0/P1 terlebih dahulu (misalnya form error, tombol mati, atau teks yang melanggar integritas akademis) sebelum memikirkan perbaikan visual kosmetik.
- [ ] **Pertahankan Kendali Manusia**: Pastikan semua teks penafian (disclaimer) tentang kewajiban tinjauan manusia tetap tertera dengan jelas pada setiap hasil draf laporan.
