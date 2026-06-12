import Image from "next/image";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { WaveHero } from "@/components/WaveHero";
import { getAllArticles, getAllSources } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABEL, SOURCE_TYPE_LABEL, type Confidence } from "@/lib/types";

/* ============================== shared bits ============================== */

const CARD = "border border-dashed border-ink/70 bg-paper";

function DashRule() {
  return <div className="hairline" aria-hidden />;
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stamp({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20 shrink-0 text-ink" aria-hidden>
      <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" />
      <circle cx="48" cy="48" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
      <text x="48" y="44" textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor" fontFamily="var(--font-display)">
        NaLI
      </text>
      <text x="48" y="60" textAnchor="middle" fontSize="8.5" letterSpacing="1.5" fill="currentColor" fontFamily="var(--font-mono)">
        {label}
      </text>
      <path d="M 20 70 Q 48 84 76 70" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* mono metadata line, archive-index style */
function Meta({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink/80">{children}</p>;
}

/* ============================== the page ============================== */

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getAllArticles();
  const latest = articles.slice(0, 4);
  const sourceCount = getAllSources().length;
  const confidences: Confidence[] = ["high", "medium", "low", "needs-verification"];

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* ================= HERO — the wave shader as archival plate ================= */}
        <section className="pt-6">
          <div className="flex items-center justify-between pb-2">
            <Meta>Lempeng 001 — Gelombang</Meta>
            <Meta>Arsip: NaLI · MMXXVI</Meta>
          </div>
          <div className="overflow-hidden border border-dashed border-ink/70">
            <WaveHero />
          </div>
        </section>

        {/* proof strip */}
        <section className="py-10">
          <p className="font-mono text-[0.8rem] text-gray">Setiap tulisan dirujuk ke sumber bertipe</p>
          <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            {Object.values(SOURCE_TYPE_LABEL).map((t) => (
              <li key={t} className="font-display text-lg font-semibold uppercase tracking-[0.08em] text-ink">
                {t}
              </li>
            ))}
          </ul>
        </section>

        <DashRule />

        {/* ================= FEATURES ================= */}
        <section className="py-14 sm:py-16">
          <p className="mx-auto max-w-xl text-center font-mono text-[0.9rem] leading-relaxed text-gray">
            Bukan feed konten viral — sebuah sistem riset terbuka yang jujur
            soal apa yang sudah ia tahu, dan apa yang belum.
          </p>

          {/* big card: journal + browser mockup */}
          <div className={`${CARD} mt-12 grid items-center gap-8 overflow-hidden md:grid-cols-[1fr_1.2fr]`}>
            <div className="p-8 sm:p-10">
              <Meta>Indeks 01</Meta>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-[0.02em] text-ink">
                Jurnal lapangan, bukan linimasa
              </h2>
              <p className="mt-3 font-mono text-[0.85rem] leading-relaxed text-gray">
                Artikel tersusun rapi dengan filter kategori dan tag, waktu baca,
                serta daftar sumber di bagian bawah setiap tulisan.
              </p>
              <p className="mt-3 font-mono text-[0.78rem] text-gray-light">
                Tanpa login. Tanpa paywall. Tanpa iklan mengejar.
              </p>
            </div>
            <div className="px-6 pb-0 sm:px-0">
              <div className="translate-y-3 overflow-hidden border border-dashed border-ink/60 border-b-0 bg-paper sm:translate-y-6">
                <div className="flex items-center gap-2 border-b border-dashed border-ink/40 bg-ink-wash px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-ink/50" />
                  <span className="h-2.5 w-2.5 rounded-full border border-ink/50" />
                  <span className="h-2.5 w-2.5 rounded-full border border-ink/50" />
                  <span className="ml-3 bg-paper px-3 py-1 font-mono text-[0.65rem] text-ink/70">
                    nalibynative.vercel.app/articles
                  </span>
                </div>
                <Image
                  src="/images/articles-preview.jpg"
                  alt="Tampilan halaman artikel NaLI"
                  width={760}
                  height={480}
                  className="duotone-ink w-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* two-up */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className={`${CARD} p-8 sm:p-10`}>
              <Meta>Indeks 02</Meta>
              <h3 className="mt-3 font-display text-xl font-bold uppercase text-ink">
                Label tingkat keyakinan
              </h3>
              <p className="mt-3 font-mono text-[0.85rem] leading-relaxed text-gray">
                Tidak semua temuan setara. Empat label jujur menandai seberapa
                kuat dasar sebuah klaim — terlihat sebelum kamu membaca.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {confidences.map((c) => (
                  <ConfidenceBadge key={c} confidence={c} size="sm" />
                ))}
              </div>
            </div>
            <div className={`${CARD} p-8 sm:p-10`}>
              <Meta>Indeks 03</Meta>
              <h3 className="mt-3 font-display text-xl font-bold uppercase text-ink">
                Arsip sumber terbuka
              </h3>
              <p className="mt-3 font-mono text-[0.85rem] leading-relaxed text-gray">
                {sourceCount} entri sumber — jurnal, arsip, buku, media, laporan —
                terbuka untuk diperiksa siapa pun, kapan pun.
              </p>
              <Link href="/arsip-sumber" className="link-teal mt-5 inline-flex items-center gap-2 font-mono text-[0.85rem] font-semibold">
                Buka arsip sumber <span aria-hidden>→</span>
              </Link>
            </div>
          </div>

          {/* three-up */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {/* research log */}
            <div className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="flex-1 bg-ink-wash p-6 font-mono text-[0.78rem] leading-relaxed text-ink-deep">
                <p>✔ Mengumpulkan sumber primer (5)</p>
                <p>✔ Memeriksa silang antar rujukan</p>
                <p>✔ Memisahkan fakta vs klaim retoris</p>
                <p>✔ Menetapkan label keyakinan</p>
                <p>✔ Menyusun daftar sumber</p>
                <p className="mt-2 text-ink">ℹ Draft siap: api-biru-kawah-ijen</p>
                <p className="text-ink">— kategori: alam</p>
                <p className="text-ink">— label: terverifikasi</p>
                <p className="mt-2 text-gray">Artikel terbit dengan 4 rujukan.</p>
              </div>
              <div className="border-t border-dashed border-ink/50 p-6">
                <h3 className="font-display text-lg font-bold uppercase text-ink">Alur riset transparan</h3>
                <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
                  AI menelusuri, manusia memutuskan. Prosesnya bisa kamu lihat,
                  bukan kotak hitam.
                </p>
              </div>
            </div>

            {/* orbit */}
            <div className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="relative flex-1 p-6">
                <svg viewBox="0 0 280 220" className="mx-auto h-full max-h-[220px] w-full" aria-hidden>
                  <circle cx="140" cy="110" r="86" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="3 5" />
                  <circle cx="140" cy="110" r="46" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="3 5" />
                  <circle cx="140" cy="110" r="24" className="fill-ink" />
                  <text x="140" y="116" textAnchor="middle" fontSize="13" fontWeight="700" className="fill-paper" fontFamily="var(--font-display)">NaLI</text>
                  <g>
                    <circle cx="140" cy="24" r="15" className="fill-ink-wash" stroke="currentColor" />
                    <text x="140" y="29" textAnchor="middle" fontSize="12">🌿</text>
                    <circle cx="62" cy="160" r="15" className="fill-ink-wash" stroke="currentColor" />
                    <text x="62" y="165" textAnchor="middle" fontSize="12">🏛️</text>
                    <circle cx="218" cy="160" r="15" className="fill-ink-wash" stroke="currentColor" />
                    <text x="218" y="165" textAnchor="middle" fontSize="12">🔎</text>
                  </g>
                </svg>
              </div>
              <div className="border-t border-dashed border-ink/50 p-6">
                <h3 className="font-display text-lg font-bold uppercase text-ink">Tiga pilar, satu metode</h3>
                <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
                  Alam, Sejarah, dan Investigasi digarap dengan disiplin sumber
                  yang sama.
                </p>
              </div>
            </div>

            {/* latest feed */}
            <div className={`${CARD} flex flex-col overflow-hidden`}>
              <div className="flex-1 space-y-2.5 p-6">
                {latest.map((a, i) => (
                  <Link
                    key={a.slug}
                    href={`/articles/${a.slug}`}
                    className="block border border-dashed border-ink/50 bg-paper px-4 py-3 transition-colors hover:bg-ink-wash"
                  >
                    <p className="flex items-center justify-between gap-3">
                      <span className="truncate font-mono text-[0.78rem] font-semibold text-ink-deep">{a.title}</span>
                      <span className="shrink-0 font-mono text-[0.62rem] text-ink/60">{a.readingMinutes} mnt</span>
                    </p>
                    <p className="mt-0.5 font-mono text-[0.68rem] uppercase tracking-wider text-ink/60">
                      No. {String(i + 1).padStart(3, "0")} · {CATEGORY_LABEL[a.category]} · {formatDate(a.date)}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="border-t border-dashed border-ink/50 p-6">
                <h3 className="font-display text-lg font-bold uppercase text-ink">Terbit terus</h3>
                <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
                  Publikasi harian, pelan tapi konsisten — langsung dari lapangan
                  dan arsip.
                </p>
              </div>
            </div>
          </div>
        </section>

        <DashRule />

        {/* ================= EDITORIAL STANDARDS ================= */}
        <section className="grid gap-10 py-14 sm:py-16 md:grid-cols-[1fr_1.3fr]">
          <div>
            <Meta>Standar editorial</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
              Aturan main yang tidak bisa ditawar
            </h2>
            <p className="mt-4 max-w-sm font-mono text-[0.85rem] leading-relaxed text-gray">
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
              <div key={row.t} className={`${CARD} flex items-center justify-between gap-6 p-6 sm:p-7`}>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase text-ink">{row.t}</h3>
                  <p className="mt-2 max-w-md font-mono text-[0.8rem] leading-relaxed text-gray">{row.d}</p>
                </div>
                <div className="hidden sm:block">
                  <Stamp label={row.s} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <DashRule />

        {/* ================= THREE PILLARS ================= */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <Meta>Tiga pilar</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Pilih pintu masukmu
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                idx: "01 — Nature",
                title: "Alam",
                desc: "Ekologi, satwa, dan fenomena lanskap Indonesia.",
                items: [
                  "Fenomena alam yang jarang dijelaskan tuntas",
                  "Satwa endemik dan status konservasinya",
                  "Catatan lapangan dari lokasi sebenarnya",
                  "Rujukan jurnal di tiap klaim",
                ],
                href: "/alam",
                cta: "Masuk ke Alam",
                featured: false,
              },
              {
                idx: "02 — Archive · Lore",
                title: "Sejarah",
                desc: "Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang.",
                items: [
                  "Sejarah kota yang dibaca ulang dari sumber",
                  "Arsip dan dokumen yang jarang dibuka",
                  "Pemisahan tegas fakta vs folklor",
                  "Minimal lima rujukan per tulisan",
                ],
                href: "/sejarah",
                cta: "Masuk ke Sejarah",
                featured: true,
              },
              {
                idx: "03 — Investigation",
                title: "Investigasi",
                desc: "Penelusuran berbasis sumber publik, tanpa kepastian palsu.",
                items: [
                  "Klaim viral dibedah sampai ke sumbernya",
                  "Pemeriksaan dokumen dan regulasi publik",
                  "Label jelas untuk hal yang belum terbukti",
                  "Jejak penelusuran yang bisa diulang",
                ],
                href: "/investigasi",
                cta: "Masuk ke Investigasi",
                featured: false,
              },
            ].map((p) => (
              <div
                key={p.title}
                className={`flex flex-col p-8 ${
                  p.featured
                    ? "border-2 border-ink bg-ink-wash"
                    : "border border-dashed border-ink/70 bg-paper"
                }`}
              >
                <Meta>{p.idx}</Meta>
                <h3 className="mt-2 font-display text-2xl font-bold uppercase text-ink">{p.title}</h3>
                <p className="mt-2 font-mono text-[0.8rem] leading-relaxed text-gray">{p.desc}</p>
                <p className="mt-6 font-mono text-[0.8rem] font-semibold text-ink-deep">Yang kamu temukan:</p>
                <ul className="mt-3 flex-1 space-y-2.5 font-mono text-[0.8rem] text-gray">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2.5">
                      <Check />
                      {it}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`mt-7 py-3 text-center font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    p.featured
                      ? "bg-ink text-paper hover:bg-ink-deep"
                      : "border border-ink/70 text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center font-mono text-[0.8rem] text-gray">
            Semua tulisan gratis dibaca • Tanpa login • Tanpa paywall
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[0.8rem] text-gray">
            <span className="flex items-center gap-2"><Check />Terbit harian</span>
            <span className="flex items-center gap-2"><Check />Sumber terbuka</span>
            <span className="flex items-center gap-2"><Check />Label keyakinan</span>
          </div>
        </section>

        <DashRule />

        {/* ================= FAQ ================= */}
        <section className="grid gap-10 py-14 sm:py-16 md:grid-cols-[1fr_1.4fr]">
          <div>
            <Meta>FAQ</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Masih penasaran?
            </h2>
            <p className="mt-4 max-w-sm font-mono text-[0.85rem] leading-relaxed text-gray">
              Pertanyaan yang paling sering muncul soal cara kerja NaLI.
              Selebihnya ada di halaman tentang dan manifesto.
            </p>
            <Link
              href="/tentang"
              className="mt-6 inline-block border border-ink/70 px-6 py-3 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
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
                <summary className="flex items-center justify-between gap-4 font-mono text-[0.85rem] font-semibold text-ink-deep">
                  {item.q}
                  <svg viewBox="0 0 16 16" className="lp-chevron h-4 w-4 shrink-0 text-ink/60" aria-hidden>
                    <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="mt-3 font-mono text-[0.8rem] leading-relaxed text-gray">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
