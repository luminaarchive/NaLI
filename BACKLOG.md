# Backlog

Ide di luar scope v0.1 yang **tidak dieksekusi** tanpa instruksi eksplisit founder.
Feature freeze minimal 14 hari setelah launch.

---

### Search sederhana
- Why it appeared: Section 6 menandainya "Wajib jika mudah". Belum diimplementasi agar build pertama tetap ringan.
- Does it help publish today? no
- Scope creep risk: low
- Earliest review date: setelah 14 hari freeze
- Decision: later, client-side filter sudah ada untuk artikel; full-text search menyusul.

### RSS feed
- Why it appeared: Section 6 "Bagus jika mudah".
- Does it help publish today? no
- Scope creep risk: low
- Earliest review date: setelah 14 hari freeze
- Decision: later, mudah ditambah via route handler `app/feed.xml`.

### Hero video footage
- Why it appeared: Spec hero butuh `public/videos/hero.mp4`; saat ini fallback desain.
- Does it help publish today? no (fallback sudah layak tayang)
- Scope creep risk: low
- Earliest review date: kapan saja founder punya footage
- Decision: park, drop file, tidak perlu kode.

### OG image per artikel (dinamis)
- Why it appeared: Open Graph kini pakai default; gambar share dinamis akan menaikkan CTR sosial.
- Does it help publish today? no
- Scope creep risk: medium
- Earliest review date: setelah Proof-of-Pull Sprint
- Decision: later, pertimbangkan `next/og` jika distribusi sosial terbukti menarik traffic.

### Sistem redaksi multi-pengguna ala OJS (submissions, reviewer, roles, issues, DOI/ISSN)
- Why it appeared: founder mengeksplorasi fitur dashboard jurnal akademik (11 Jun 2026).
- Does it help publish today? no, NaLI publikasi solo: tidak ada naskah masuk, tidak ada mitra bestari, tidak ada terbitan bervolume.
- Scope creep risk: high (auth multi-role + database + workflow engine).
- Earliest review date: jika suatu hari NaLI menerima kontributor eksternal.
- Decision: park. Kebutuhan nyata v0.1 (posting/edit/upload + statistik) sudah dipenuhi Pages CMS + Vercel Analytics tanpa database.

---

## Proof-of-Pull Sprint, 5 masukan audit pengunjung (16 Juni 2026)

Dari laporan UX jujur pasca-audit. Tujuan: ubah dari "banyak rangka, sedikit
daging, nol distribusi" menjadi situs yang menahan pengunjung. **Disepakati
founder untuk dieksekusi nanti**, satu per satu.

### 1. Beranda dipimpin CERITA, bukan statistik
- Why: dashboard (795 bukti dll) itu inward-facing; pengunjung baru butuh alasan membaca.
- Aksi: beranda pimpin dengan 1 artikel terbaik + tulisan terbaru; LivingDashboard turun ke `/ruang-kendali`.
- Risk: low. Sudah punya komponennya. Reversible.

### 2. Sedikit tapi dalam (konten editorial)
- Why: ~35 artikel, sebagian besar 500-650 kata; hanya ~6 deep-research yang menghidupkan.
- Aksi: jalur utama = 1 artikel deep-research per minggu sekelas Pesut/Harimau Jawa; perdalam artikel pendek lama.
- Risk: low (proses), high (waktu). Ini pekerjaan editorial, bukan kode.

### 3. Turunkan derajat katalog + buang boilerplate sinopsis
- Why: `/jurnal` ulang frasa "berbasis metadata" 600+ kali, terasa spam; katalog itu lapisan referensi, bukan tujuan pembaca.
- Aksi: hapus boilerplate dari PREVIEW kartu (cukup di halaman detail); posisikan /jurnal & /arsip sebagai lapisan peneliti.
- Risk: low. Perubahan presentasi, bukan data.

### 4. Email asli + satu saluran distribusi
- Why: `SITE.email` mati; newsletter Supabase tak tersambung ke email apa pun; handle sosial kosong = nol distribusi.
- Aksi: pasang mailbox nyata (tugas founder) + pilih SATU kanal (X/IG) dengan ritme tetap (1 thread/carousel per artikel).
- Risk: low teknis; butuh keputusan + akun founder.

### 5. Rampingkan navigasi sampai konten menyusul fitur
- Why: belasan permukaan (V2) untuk 35 artikel; pengunjung tersesat di menu.
- Aksi: nav inti tetap ramping; surface V2 tetap dijangkau dari hub /ruang-kendali sampai volume konten mengejar.
- Risk: low.

---

> Aturan: ide baru masuk sini dulu. Tidak ada SaaS baru, game, marketplace, login, payment, atau AI wrapper di v0.1.
