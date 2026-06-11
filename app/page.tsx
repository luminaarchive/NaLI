import Image from "next/image";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { WaveHero } from "@/components/WaveHero";
import { getAllArticles, getAllSources } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABEL, SOURCE_TYPE_LABEL, type Confidence } from "@/lib/types";

/* ============================== shared bits ============================== */

const CARD =
  "rounded-2xl border border-[#e6e2d8] bg-white shadow-[0_1px_2px_rgba(28,28,26,0.04)]";
const WASH_MINT = { background: "linear-gradient(135deg, #ffffff 0%, #f0faf5 60%, #eaf4fb 100%)" };
const WASH_SKY = { background: "linear-gradient(135deg, #ffffff 0%, #eef6fb 60%, #f0faf5 100%)" };

function HatchDivider() {
  return <div className="hatch h-9 border-y border-[#e6e2d8]" aria-hidden />;
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="#1BA882" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stamp({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20 shrink-0" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="none" stroke="#1c1c1a" strokeWidth="2.5" />
      <circle cx="48" cy="48" r="35" fill="none" stroke="#1c1c1a" strokeWidth="1" />
      <text x="48" y="44" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1c1c1a" fontFamily="var(--font-display)">
        NaLI
      </text>
      <text x="48" y="60" textAnchor="middle" fontSize="8.5" letterSpacing="1.5" fill="#1c1c1a" fontFamily="var(--font-mono)">
        {label}
      </text>
      <path d="M 20 70 Q 48 84 76 70" fill="none" stroke="#1c1c1a" strokeWidth="1.5" />
    </svg>
  );
}

/* ============================== the page ============================== */

export default function HomePage() {
  const articles = getAllArticles();
  const latest = articles.slice(0, 4);
  const sourceCount = getAllSources().length;
  const confidences: Confidence[] = ["high", "medium", "low", "needs-verification"];

  return (
    <div className="hatch -mt-[4.25rem] bg-[#f2f1ed]">
      <div className="mx-auto max-w-[1240px] border-x border-[#e6e2d8] bg-[#faf9f6]">
        {/* ================= HERO — dithering wave (21st.dev), NaLI teal ================= */}
        <WaveHero />

        {/* proof strip — rujukan, bukan logo korporat */}
        <section className="px-4 sm:px-10">
          <div className="pb-12 pt-10">
            <p className="text-sm text-gray-light">Setiap tulisan dirujuk ke sumber bertipe</p>
            <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
              {Object.values(SOURCE_TYPE_LABEL).map((t) => (
                <li key={t} className="font-mono text-lg font-semibold uppercase tracking-[0.18em] text-[#9b958a]">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <HatchDivider />

        {/* ================= FEATURES BENTO ================= */}
        <section className="px-4 py-14 sm:px-10 sm:py-20">
          <p className="mx-auto max-w-xl text-center text-lg leading-relaxed text-gray">
            Bukan feed konten viral — sebuah sistem riset terbuka yang jujur
            soal apa yang sudah ia tahu, dan apa yang belum.
          </p>

          {/* big card: journal + browser mockup */}
          <div className={`${CARD} mt-12 grid items-center gap-8 overflow-hidden md:grid-cols-[1fr_1.2fr]`} style={WASH_MINT}>
            <div className="p-8 sm:p-10">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#1c1c1a" strokeWidth="1.8" aria-hidden>
                <path d="M4 19.5V6a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 1.5Z" />
                <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20" />
              </svg>
              <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight text-[#1c1c1a]">
                Jurnal lapangan, bukan linimasa
              </h2>
              <p className="mt-3 leading-relaxed text-gray">
                Artikel tersusun rapi dengan filter kategori dan tag, waktu baca,
                serta daftar sumber di bagian bawah setiap tulisan.
              </p>
              <p className="mt-3 text-sm text-gray-light">
                Tanpa login. Tanpa paywall. Tanpa iklan mengejar.
              </p>
            </div>
            {/* browser mockup */}
            <div className="px-6 pb-0 sm:px-0 sm:pl-0">
              <div className="translate-y-3 overflow-hidden rounded-tl-xl border border-[#e6e2d8] border-b-0 bg-white shadow-[0_18px_40px_-22px_rgba(28,28,26,0.35)] sm:translate-y-6">
                <div className="flex items-center gap-2 border-b border-[#eee9df] bg-[#faf9f6] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e0dcd2]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e0dcd2]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#e0dcd2]" />
                  <span className="ml-3 rounded-full bg-white px-3 py-1 font-mono text-[0.65rem] text-gray-light">
                    nalibynative.vercel.app/articles
                  </span>
                </div>
                <Image
                  src="/images/articles-preview.jpg"
                  alt="Tampilan halaman artikel NaLI"
                  width={760}
                  height={480}
                  className="w-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* two-up cards */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className={`${CARD} p-8 sm:p-10`} style={WASH_SKY}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#1c1c1a" strokeWidth="1.8" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" />
              </svg>
              <h3 className="mt-4 font-sans text-xl font-bold tracking-tight text-[#1c1c1a]">
                Label tingkat keyakinan
              </h3>
              <p className="mt-3 leading-relaxed text-gray">
                Tidak semua temuan setara. Empat label jujur menandai seberapa
                kuat dasar sebuah klaim — terlihat sebelum kamu membaca.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {confidences.map((c) => (
                  <ConfidenceBadge key={c} confidence={c} size="sm" />
                ))}
              </div>
            </div>
            <div className={`${CARD} p-8 sm:p-10`} style={WASH_MINT}>
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#1c1c1a" strokeWidth="1.8" aria-hidden>
                <path d="M21 8v13H3V8" />
                <path d="M1 3h22v5H1z" />
                <path d="M10 12h4" />
              </svg>
              <h3 className="mt-4 font-sans text-xl font-bold tracking-tight text-[#1c1c1a]">
                Arsip sumber terbuka
              </h3>
              <p className="mt-3 leading-relaxed text-gray">
                {sourceCount} entri sumber — jurnal, arsip, buku, media, laporan —
                terbuka untuk diperiksa siapa pun, kapan pun.
              </p>
              <Link
                href="/arsip-sumber"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-dark hover:underline"
              >
                Buka arsip sumber <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* three-up cards */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* terminal / research log */}
            <div className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="flex-1 bg-[#f6fbf9] p-6 font-mono text-[0.78rem] leading-relaxed text-[#0f8f72]">
                <p>✔ Mengumpulkan sumber primer (5)</p>
                <p>✔ Memeriksa silang antar rujukan</p>
                <p>✔ Memisahkan fakta vs klaim retoris</p>
                <p>✔ Menetapkan label keyakinan</p>
                <p>✔ Menyusun daftar sumber</p>
                <p className="mt-2 text-[#1BA882]">ℹ Draft siap: api-biru-kawah-ijen</p>
                <p className="text-[#1BA882]">— kategori: alam</p>
                <p className="text-[#1BA882]">— label: terverifikasi</p>
                <p className="mt-2 text-[#6b6b6b]">Artikel terbit dengan 4 rujukan.</p>
              </div>
              <div className="border-t border-[#eee9df] p-6">
                <h3 className="font-sans text-lg font-bold tracking-tight text-[#1c1c1a]">Alur riset transparan</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray">
                  AI menelusuri, manusia memutuskan. Prosesnya bisa kamu lihat,
                  bukan kotak hitam.
                </p>
              </div>
            </div>

            {/* orbit — three pillars around the mark */}
            <div className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="relative flex-1 p-6" style={WASH_SKY}>
                <svg viewBox="0 0 280 220" className="mx-auto h-full max-h-[220px] w-full" aria-hidden>
                  <circle cx="140" cy="110" r="86" fill="none" stroke="#d8d3c7" strokeDasharray="3 5" />
                  <circle cx="140" cy="110" r="46" fill="none" stroke="#d8d3c7" strokeDasharray="3 5" />
                  <circle cx="140" cy="110" r="24" fill="#1c1c1a" />
                  <text x="140" y="116" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff" fontFamily="var(--font-display)">NaLI</text>
                  <g>
                    <circle cx="140" cy="24" r="15" fill="#EAF8F3" stroke="#2DD4A7" />
                    <text x="140" y="29" textAnchor="middle" fontSize="12">🌿</text>
                    <circle cx="62" cy="160" r="15" fill="#FBF3E2" stroke="#F59E0B" />
                    <text x="62" y="165" textAnchor="middle" fontSize="12">🏛️</text>
                    <circle cx="218" cy="160" r="15" fill="#EDF2FB" stroke="#2563ab" />
                    <text x="218" y="165" textAnchor="middle" fontSize="12">🔎</text>
                  </g>
                </svg>
              </div>
              <div className="border-t border-[#eee9df] p-6">
                <h3 className="font-sans text-lg font-bold tracking-tight text-[#1c1c1a]">Tiga pilar, satu metode</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray">
                  Alam, Sejarah, dan Investigasi digarap dengan disiplin sumber
                  yang sama.
                </p>
              </div>
            </div>

            {/* activity feed — real latest articles */}
            <div className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="flex-1 space-y-2.5 p-6" style={WASH_MINT}>
                {latest.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className="block rounded-xl border border-[#eee9df] bg-white px-4 py-3 transition-colors hover:border-teal"
                  >
                    <p className="flex items-center justify-between gap-3">
                      <span className="truncate text-[0.83rem] font-semibold text-[#1c1c1a]">{a.title}</span>
                      <span className="shrink-0 font-mono text-[0.62rem] text-gray-light">{a.readingMinutes} mnt</span>
                    </p>
                    <p className="mt-0.5 text-[0.7rem] text-gray-light">
                      {CATEGORY_LABEL[a.category]} · {formatDate(a.date)}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="border-t border-[#eee9df] p-6">
                <h3 className="font-sans text-lg font-bold tracking-tight text-[#1c1c1a]">Terbit terus</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray">
                  Publikasi harian, pelan tapi konsisten — langsung dari lapangan
                  dan arsip.
                </p>
              </div>
            </div>
          </div>
        </section>

        <HatchDivider />

        {/* ================= EDITORIAL STANDARDS ================= */}
        <section className="grid gap-10 px-4 py-14 sm:px-10 sm:py-20 md:grid-cols-[1fr_1.3fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gray-light">Standar editorial</p>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-[#1c1c1a] sm:text-4xl">
              Aturan main yang tidak bisa ditawar
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-gray">
              Kepercayaan adalah satu-satunya modal sebuah publikasi riset.
              Tiga aturan ini menjaga setiap tulisan NaLI tetap bisa
              dipertanggungjawabkan.
            </p>
            <div className="mt-6 flex gap-4">
              <Stamp label="EDITORIAL" />
              <Stamp label="MMXXVI" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                t: "Tanpa kepastian palsu",
                d: "Kami tidak menyimpulkan lebih dari yang bukti izinkan. Lebih baik menulis “belum jelas” daripada terdengar yakin tapi salah.",
                s: "JUJUR",
              },
              {
                t: "Tanpa tuduhan tanpa bukti",
                d: "Investigasi berbasis sumber publik. Klaim yang belum kuat diberi label belum diverifikasi — bukan dilempar sebagai fakta.",
                s: "ADIL",
              },
              {
                t: "Sumber selalu ditampilkan",
                d: "Daftar rujukan menempel di tiap artikel dan terkumpul di arsip terbuka. Kamu boleh tidak setuju — dan selalu bisa memeriksa.",
                s: "TERBUKA",
              },
            ].map((row) => (
              <div key={row.t} className={`${CARD} flex items-center justify-between gap-6 p-6 sm:p-7`} style={WASH_SKY}>
                <div>
                  <h3 className="font-sans text-xl font-bold tracking-tight text-[#1c1c1a]">{row.t}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-gray">{row.d}</p>
                </div>
                <div className="hidden sm:block">
                  <Stamp label={row.s} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <HatchDivider />

        {/* ================= THREE PILLARS (tier cards) ================= */}
        <section className="px-4 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gray-light">Tiga pilar</p>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-[#1c1c1a] sm:text-4xl">
              Pilih pintu masukmu
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Alam */}
            <div className={`${CARD} flex flex-col p-8`} style={WASH_MINT}>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-gray-light">01 — Nature</p>
              <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight text-[#1c1c1a]">Alam</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray">
                Ekologi, satwa, dan fenomena lanskap Indonesia.
              </p>
              <p className="mt-6 text-sm font-semibold text-[#1c1c1a]">Yang kamu temukan:</p>
              <ul className="mt-3 flex-1 space-y-2.5 text-sm text-gray">
                <li className="flex gap-2.5"><Check />Fenomena alam yang jarang dijelaskan tuntas</li>
                <li className="flex gap-2.5"><Check />Satwa endemik dan status konservasinya</li>
                <li className="flex gap-2.5"><Check />Catatan lapangan dari lokasi sebenarnya</li>
                <li className="flex gap-2.5"><Check />Rujukan jurnal di tiap klaim</li>
              </ul>
              <Link
                href="/alam"
                className="mt-7 rounded-full border border-[#d9d5cb] bg-white py-3 text-center text-sm font-semibold text-[#1c1c1a] transition-colors hover:border-teal-dark hover:text-teal-dark"
              >
                Masuk ke Alam
              </Link>
            </div>

            {/* Sejarah — the dark middle card */}
            <div className="flex flex-col rounded-2xl bg-[#1c1c1a] p-8 text-white shadow-[0_24px_50px_-24px_rgba(28,28,26,0.6)]">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">02 — Archive · Lore</p>
              <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight">Sejarah</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang.
              </p>
              <p className="mt-6 text-sm font-semibold">Yang kamu temukan:</p>
              <ul className="mt-3 flex-1 space-y-2.5 text-sm text-white/80">
                <li className="flex gap-2.5"><Check />Sejarah kota yang dibaca ulang dari sumber</li>
                <li className="flex gap-2.5"><Check />Arsip dan dokumen yang jarang dibuka</li>
                <li className="flex gap-2.5"><Check />Pemisahan tegas fakta vs folklor</li>
                <li className="flex gap-2.5"><Check />Minimal lima rujukan per tulisan</li>
              </ul>
              <Link
                href="/sejarah"
                className="mt-7 rounded-full bg-white py-3 text-center text-sm font-semibold text-[#1c1c1a] transition-transform hover:scale-[1.02]"
              >
                Masuk ke Sejarah
              </Link>
            </div>

            {/* Investigasi */}
            <div className={`${CARD} flex flex-col p-8`} style={WASH_SKY}>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-gray-light">03 — Investigation</p>
              <h3 className="mt-2 font-sans text-2xl font-bold tracking-tight text-[#1c1c1a]">Investigasi</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray">
                Penelusuran berbasis sumber publik, tanpa kepastian palsu.
              </p>
              <p className="mt-6 text-sm font-semibold text-[#1c1c1a]">Yang kamu temukan:</p>
              <ul className="mt-3 flex-1 space-y-2.5 text-sm text-gray">
                <li className="flex gap-2.5"><Check />Klaim viral dibedah sampai ke sumbernya</li>
                <li className="flex gap-2.5"><Check />Pemeriksaan dokumen dan regulasi publik</li>
                <li className="flex gap-2.5"><Check />Label jelas untuk hal yang belum terbukti</li>
                <li className="flex gap-2.5"><Check />Jejak penelusuran yang bisa diulang</li>
              </ul>
              <Link
                href="/investigasi"
                className="mt-7 rounded-full border border-[#d9d5cb] bg-white py-3 text-center text-sm font-semibold text-[#1c1c1a] transition-colors hover:border-teal-dark hover:text-teal-dark"
              >
                Masuk ke Investigasi
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center text-sm text-gray">
            Semua tulisan gratis dibaca • Tanpa login • Tanpa paywall
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray">
            <span className="flex items-center gap-2"><Check />Terbit harian</span>
            <span className="flex items-center gap-2"><Check />Sumber terbuka</span>
            <span className="flex items-center gap-2"><Check />Label keyakinan</span>
          </div>
        </section>

        <HatchDivider />

        {/* ================= FAQ ================= */}
        <section className="grid gap-10 px-4 py-14 sm:px-10 sm:py-20 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-gray-light">FAQ</p>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-[#1c1c1a] sm:text-4xl">
              Masih penasaran?
            </h2>
            <p className="mt-4 max-w-sm leading-relaxed text-gray">
              Pertanyaan yang paling sering muncul soal cara kerja NaLI.
              Selebihnya ada di halaman tentang dan manifesto.
            </p>
            <Link
              href="/tentang"
              className="mt-6 inline-block rounded-full border border-[#d9d5cb] bg-white px-6 py-3 text-sm font-semibold text-[#1c1c1a] transition-colors hover:border-teal-dark hover:text-teal-dark"
            >
              Tentang NaLI
            </Link>
          </div>
          <div className="lp-faq space-y-3">
            {[
              {
                q: "Apa itu NaLI by NatIve?",
                a: "Jurnal lapangan dan publikasi riset berbasis AI tentang alam, sejarah, dan investigasi Indonesia. NaLI singkatan dari Nature, Archive, Lore, Investigation; “by NatIve” menegaskan sudut pandang lokal.",
              },
              {
                q: "Apakah artikelnya ditulis AI?",
                a: "AI membantu menelusuri, merangkum, dan menyusun. Tapi keputusan editorial — apa yang layak terbit, dengan label keyakinan apa — tetap di tangan manusia. Prosesnya dijelaskan terbuka di tiap tulisan.",
              },
              {
                q: "Apa maksud label keyakinan?",
                a: "Setiap tulisan diberi satu dari empat label: terverifikasi (sumber kuat dan konsisten), perlu konteks, hipotesis kerja, atau belum diverifikasi. Tujuannya supaya kamu tahu seberapa kuat dasar sebuah klaim sebelum mempercayainya.",
              },
              {
                q: "Seberapa sering tulisan baru terbit?",
                a: "Target kami terbit harian — satu tulisan atau catatan lapangan per hari. Daftar email di halaman ini kalau mau dikabari tanpa harus mengecek.",
              },
            ].map((item) => (
              <details key={item.q} className={`${CARD} group px-6 py-4`}>
                <summary className="flex items-center justify-between gap-4 text-[0.95rem] font-semibold text-[#1c1c1a]">
                  {item.q}
                  <svg viewBox="0 0 16 16" className="lp-chevron h-4 w-4 shrink-0 text-gray-light" aria-hidden>
                    <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
