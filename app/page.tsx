import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { WaveHero } from "@/components/WaveHero";
import { getAllArticles, getAllSources } from "@/lib/content";
import { CONFIDENCE_LABEL, SOURCE_TYPE_LABEL, type Confidence } from "@/lib/types";

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
  const latest = articles.slice(0, 6);
  const sourceCount = getAllSources().length;
  const confidences: Confidence[] = ["high", "medium", "low", "needs-verification"];

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* ================= HERO, the wave shader as archival plate ================= */}
        <section className="pt-6">
          <div className="flex items-center justify-between pb-2">
            <Meta>Lempeng 001, Gelombang</Meta>
            <Meta>Arsip: NaLI · MMXXVI</Meta>
          </div>
          <div className="overflow-hidden border border-dashed border-ink/70">
            <WaveHero />
          </div>
        </section>

        {/* proof strip */}
        <section className="py-8">
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

        {/* ================= TULISAN TERBARU, content first, right under the hero ================= */}
        <section className="py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70">
                <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5">INDEKS BUKTI TERBUKA</span>
                <span>{"//"}</span>
                <span>CATATAN TERBARU</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-[0.01em] text-ink sm:text-4xl">
                Tulisan terbaru
              </h2>
              <p className="mt-3 max-w-lg font-mono text-[0.85rem] leading-relaxed text-gray">
                Artikel dan catatan riset terbaru, setiap tulisan baru otomatis
                muncul di sini begitu terbit.
              </p>
            </div>
            <Link
              href="/articles"
              className="border border-ink/70 px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper interactive-link"
            >
              Semua artikel <span className="link-arrow">→</span>
            </Link>
          </div>

          {latest.length === 0 ? (
            <p className={`${CARD} mt-8 p-8 text-center font-mono text-[0.85rem] text-gray`}>
              Belum ada tulisan terbit. Tulisan pertama akan muncul di sini.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          )}

          {/* confidence legend, explains the badge on each card */}
          <div className="mt-10 border border-dashed border-ink/60 bg-ink-wash/40 p-6">
            <Meta>Cara membaca label</Meta>
            <p className="mt-2 font-mono text-[0.8rem] leading-relaxed text-gray">
              Tiap kartu menandai seberapa kuat dasar sebuah klaim. Empat label, dari
              yang paling kuat ke paling hati-hati:
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {confidences.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <ConfidenceBadge confidence={c} size="sm" />
                  <span className="font-mono text-[0.72rem] text-gray">{CONFIDENCE_LABEL[c]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DashRule />

        {/* ================= THREE PILLARS, clear entry points ================= */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 justify-center">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5">STRUKTUR UTAMA</span>
              <span>{"//"}</span>
              <span>KATEGORI RISET</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Pilih pintu masukmu
            </h2>
            <p className="mt-3 font-mono text-[0.85rem] leading-relaxed text-gray">
              Satu metode riset, tiga jenis cerita. Mulai dari yang paling membuatmu penasaran.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                idx: "01 // NATURE",
                title: "Alam",
                desc: "Ekologi, satwa, dan fenomena lanskap Indonesia.",
                items: [
                  "Fenomena alam yang jarang dijelaskan tuntas",
                  "Satwa endemik and status konservasinya",
                  "Catatan riset dari laporan dan observasi pihak ketiga",
                  "Rujukan jurnal di tiap klaim",
                ],
                href: "/alam",
                cta: "Masuk ke Alam",
                featured: false,
              },
              {
                idx: "02 // ARCHIVE · LORE",
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
                idx: "03 // INVESTIGATION",
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
                  className={`mt-7 py-3 text-center font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] transition-colors interactive-link ${
                    p.featured
                      ? "bg-ink text-paper hover:bg-ink-deep"
                      : "border border-ink/70 text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {p.cta} <span className="link-arrow">→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <DashRule />

        {/* ================= EDITORIAL STANDARDS ================= */}
        <section className="grid gap-10 py-14 sm:py-16 md:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5">PEDOMAN UTAMA</span>
              <span>{"//"}</span>
              <span>STANDAR AKURASI</span>
            </div>
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
                d: "Investigasi berbasis sumber publik. Klaim yang belum kuat diberi label belum diverifikasi, bukan dilempar sebagai fakta.",
                s: "ADIL",
              },
              {
                t: "Sumber selalu ditampilkan",
                d: "Daftar rujukan menempel di tiap artikel dan terkumpul di arsip terbuka. Kamu boleh tidak setuju, dan selalu bisa memeriksa.",
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

        {/* ================= ARSIP SUMBER CALLOUT ================= */}
        <section className="py-14 sm:py-16">
          <div className={`${CARD} flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10`}>
            <div>
              <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70">
                <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5">JEJAK SUMBER</span>
                <span>{"//"}</span>
                <span>REKAM BUKTI</span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase text-ink sm:text-3xl">
                {sourceCount} entri sumber, bisa diperiksa siapa pun
              </h2>
              <p className="mt-3 max-w-xl font-mono text-[0.85rem] leading-relaxed text-gray">
                Jurnal, arsip, buku, media, dan laporan, masing-masing punya halaman
                keterangannya sendiri. Klaim kami bisa kamu lacak sampai ke sumbernya.
              </p>
            </div>
            <Link
              href="/arsip-sumber"
              className="shrink-0 bg-ink px-6 py-3 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep interactive-link"
            >
              Buka arsip sumber <span className="link-arrow">→</span>
            </Link>
          </div>

          <div className="mt-8 text-center font-mono text-[0.8rem] text-gray">
            Semua tulisan gratis dibaca • Tanpa login • Tanpa paywall
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[0.8rem] text-gray">
            <span className="flex items-center gap-2"><Check />Setiap klaim bersumber</span>
            <span className="flex items-center gap-2"><Check />Sumber terbuka</span>
            <span className="flex items-center gap-2"><Check />Label keyakinan</span>
          </div>
        </section>

        <DashRule />

        {/* ================= FAQ ================= */}
        <section className="grid gap-10 py-14 sm:py-16 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70">
              <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5">INFORMASI KLAIM</span>
              <span>{"//"}</span>
              <span>PERTANYAAN UMUM</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Masih penasaran?
            </h2>
            <p className="mt-4 max-w-sm font-mono text-[0.85rem] leading-relaxed text-gray">
              Pertanyaan yang paling sering muncul soal cara kerja NaLI.
              Selebihnya ada di halaman tentang dan manifesto.
            </p>
            <Link
              href="/tentang"
              className="mt-6 inline-block border border-ink/70 px-6 py-3 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper interactive-link"
            >
              Tentang NaLI <span className="link-arrow">→</span>
            </Link>
          </div>
          <div className="lp-faq space-y-3">
            {[
              {
                q: "Apa itu NaLI by NatIve?",
                a: "Jurnal riset terbuka (open-source evidence journal) tentang alam, sejarah, dan investigasi Indonesia. NaLI singkatan dari Nature, Archive, Lore, Investigation; “by NatIve” menegaskan sudut pandang lokal. Kami membaca jurnal, arsip, laporan lembaga, dataset, dan dokumentasi pihak ketiga, bukan klaim ekspedisi pribadi.",
              },
              {
                q: "Apakah NaLI turun langsung ke lapangan?",
                a: "Belum. Untuk saat ini NaLI bekerja dari sumber terbuka: jurnal, arsip, laporan lembaga, observasi peneliti, dan foto berlisensi. Kami tidak mengklaim observasi lapangan pribadi kecuali bukti lapangan pertama tersedia dan ditampilkan jelas.",
              },
              {
                q: "Apakah artikelnya ditulis AI?",
                a: "AI membantu menelusuri, merangkum, dan menyusun. Tapi keputusan editorial, apa yang layak terbit, dengan label keyakinan apa, tetap di tangan manusia. Prosesnya dijelaskan terbuka di halaman Metodologi.",
              },
              {
                q: "Apa maksud label keyakinan?",
                a: "Setiap tulisan diberi satu label: terverifikasi kuat, didukung sumber, terbatas, atau belum cukup bukti. Klaim yang masih diperdebatkan ditandai per-klaim di Claim Ledger. Tujuannya supaya kamu tahu seberapa kuat dasar sebuah klaim sebelum mempercayainya.",
              },
              {
                q: "Seberapa sering tulisan baru terbit?",
                a: "Menuju publikasi rutin. Target editorial kami satu catatan riset per hari, tapi kualitas dan ketertelusuran sumber selalu didahulukan ketimbang mengejar jumlah. Daftar email di hero halaman ini kalau mau dikabari.",
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
