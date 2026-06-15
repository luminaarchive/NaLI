import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { AuroraHero } from "@/components/AuroraHero";
import { LivingDashboard } from "@/components/dashboard/LivingDashboard";
import { getAllArticles, getAllSources } from "@/lib/content";
import { getLivingStats } from "@/lib/living-engine";

const V2_SURFACES = [
  { href: "/ruang-kendali", title: "Ruang Kendali", blurb: "Panel lengkap kondisi basis bukti." },
  { href: "/linimasa", title: "Linimasa", blurb: "Garis waktu peristiwa bertahun pasti." },
  { href: "/peta-indonesia", title: "Peta Indonesia", blurb: "Lokasi liputan, ringan dan privasi dulu." },
  { href: "/koneksi", title: "Koneksi", blurb: "Entitas paling terhubung. Everything connects." },
  { href: "/bukti-dicari", title: "Bukti Dicari", blurb: "Yang buktinya masih perlu diperkuat." },
  { href: "/misi", title: "Misi Riset", blurb: "Celah riset terbuka, tanpa akun." },
  { href: "/aktivitas", title: "Aktivitas", blurb: "Apa yang bergerak tiap hari." },
  { href: "/banding", title: "Banding Sumber", blurb: "Sandingkan dua sumber, nilai sendiri." },
];

/* ============================== shared bits ============================== */

const CARD = "border border-dashed border-ink/70 bg-paper";

function DashRule() {
  return <div className="hairline" aria-hidden />;
}

function Meta({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink/70">
      {children}
    </p>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden>
      <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const PILLARS = [
  {
    title: "Alam",
    dot: "#267A4F",
    desc: "Ekologi, satwa endemik, dan fenomena lanskap Indonesia, dibaca ulang dari jurnal dan laporan.",
    href: "/alam",
  },
  {
    title: "Sejarah",
    dot: "#926230",
    desc: "Kota tua, arsip kolonial, dan ingatan yang nyaris hilang, dengan fakta dipisahkan tegas dari folklor.",
    href: "/sejarah",
  },
  {
    title: "Investigasi",
    dot: "#33547A",
    desc: "Klaim viral dan dokumen publik dibedah sampai ke sumbernya, tanpa kepastian palsu.",
    href: "/investigasi",
  },
];

/* ============================== the page ============================== */

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getAllArticles();
  const latest = articles.slice(0, 6);
  const sourceCount = getAllSources().length;
  const stats = await getLivingStats();

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* ================= HERO, aurora ================= */}
        <section className="pt-8">
          <div className="flex items-center justify-between pb-3">
            <Meta>Beranda</Meta>
            <Meta>Arsip NaLI · MMXXVI</Meta>
          </div>
          <div className="overflow-hidden border border-dashed border-ink/70">
            <AuroraHero />
          </div>
        </section>

        <DashRule />

        {/* ================= RUANG KENDALI, live ================= */}
        <section className="py-14 sm:py-16">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Meta>Ruang kendali</Meta>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
                Mesin riset yang hidup
              </h2>
            </div>
            <Link
              href="/ruang-kendali"
              className="inline-flex items-center gap-2 border border-dashed border-ink/70 px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Panel lengkap
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Link>
          </div>
          <LivingDashboard stats={stats} />
        </section>

        <DashRule />

        {/* ================= APA INI, direct ================= */}
        <section className="grid gap-8 py-14 sm:py-16 md:grid-cols-[1fr_1.2fr]">
          <div>
            <Meta>Apa ini</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-tight text-ink sm:text-4xl">
              Riset terbuka, ditulis jujur
            </h2>
          </div>
          <div>
            <p className="max-w-xl text-base leading-relaxed text-gray">
              Singkatnya: kami menelusuri sumber publik yang bisa diperiksa, lalu
              menuliskannya dengan jujur soal seberapa kuat buktinya. Bukan dump data,
              bukan juga opini tanpa dasar.
            </p>
            <ul className="mt-6 space-y-3 font-mono text-[0.85rem] text-gray">
              <li className="flex gap-3"><Check />Tiap klaim punya sumber yang bisa kamu lacak.</li>
              <li className="flex gap-3"><Check />Label keyakinan di tiap tulisan, dari terverifikasi kuat sampai belum cukup bukti.</li>
              <li className="flex gap-3"><Check />Gratis dibaca, tanpa login, tanpa paywall.</li>
            </ul>
          </div>
        </section>

        <DashRule />

        {/* ================= TIGA PILAR, calm wayfinding ================= */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <Meta>Tiga pilar</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Pilih pintu masukmu
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray">
              Satu metode riset, tiga jenis cerita. Mulai dari yang paling membuatmu
              penasaran.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className={`${CARD} group flex flex-col p-7 transition-colors hover:bg-ink-wash`}
              >
                <span
                  className="h-3 w-3"
                  style={{ backgroundColor: p.dot }}
                  aria-hidden
                />
                <h3 className="mt-4 font-display text-2xl font-bold uppercase text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 font-mono text-[0.82rem] leading-relaxed text-gray">
                  {p.desc}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-deep group-hover:gap-3">
                  Masuk ke {p.title}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <DashRule />

        {/* ================= TULISAN TERBARU ================= */}
        <section className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Meta>Indeks, terbaru</Meta>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
                Tulisan terbaru
              </h2>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 border border-dashed border-ink/70 px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Semua artikel
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
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
        </section>

        <DashRule />

        {/* ================= MODUL V2, ways to explore ================= */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <Meta>Cara menjelajah</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Satu bukti, banyak pintu
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray">
              Bukti yang sama bisa ditelusuri lewat waktu, tempat, koneksi, atau celah
              yang belum tertutup. Semua dari data nyata.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {V2_SURFACES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`${CARD} group flex flex-col p-6 transition-colors hover:bg-ink-wash`}
              >
                <h3 className="font-display text-lg font-bold uppercase text-ink">{s.title}</h3>
                <p className="mt-2 flex-1 font-mono text-[0.78rem] leading-relaxed text-gray">
                  {s.blurb}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-ink-deep group-hover:gap-3">
                  Buka
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <DashRule />

        {/* ================= ARSIP SUMBER, calm callout ================= */}
        <section className="py-14 sm:py-16">
          <div className={`${CARD} flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10`}>
            <div>
              <Meta>Arsip sumber terbuka</Meta>
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
              className="inline-flex shrink-0 items-center gap-2 bg-ink px-6 py-3.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
            >
              Buka arsip
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Link>
          </div>

          <p className="mt-6 text-center font-mono text-[0.78rem] uppercase tracking-[0.14em] text-gray">
            Gratis dibaca · Tanpa login · Tanpa paywall
          </p>
        </section>
      </div>
    </div>
  );
}
