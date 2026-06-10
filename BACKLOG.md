# Backlog

Ide di luar scope v0.1 yang **tidak dieksekusi** tanpa instruksi eksplisit founder.
Feature freeze minimal 14 hari setelah launch.

---

### Search sederhana
- Why it appeared: Section 6 menandainya "Wajib jika mudah". Belum diimplementasi agar build pertama tetap ringan.
- Does it help publish today? no
- Scope creep risk: low
- Earliest review date: setelah 14 hari freeze
- Decision: later — client-side filter sudah ada untuk artikel; full-text search menyusul.

### RSS feed
- Why it appeared: Section 6 "Bagus jika mudah".
- Does it help publish today? no
- Scope creep risk: low
- Earliest review date: setelah 14 hari freeze
- Decision: later — mudah ditambah via route handler `app/feed.xml`.

### Hero video footage
- Why it appeared: Spec hero butuh `public/videos/hero.mp4`; saat ini fallback desain.
- Does it help publish today? no (fallback sudah layak tayang)
- Scope creep risk: low
- Earliest review date: kapan saja founder punya footage
- Decision: park — drop file, tidak perlu kode.

### OG image per artikel (dinamis)
- Why it appeared: Open Graph kini pakai default; gambar share dinamis akan menaikkan CTR sosial.
- Does it help publish today? no
- Scope creep risk: medium
- Earliest review date: setelah Proof-of-Pull Sprint
- Decision: later — pertimbangkan `next/og` jika distribusi sosial terbukti menarik traffic.

---

> Aturan: ide baru masuk sini dulu. Tidak ada SaaS baru, game, marketplace, login, payment, atau AI wrapper di v0.1.
