import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { AuroraHero } from "@/components/AuroraHero";
import { getAllArticles, getAllSources } from "@/lib/content";

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

const WHY = [
  {
    title: "Tiap klaim ada sumbernya",
    desc: "Tidak ada yang kami minta kamu percaya begitu saja. Setiap poin bisa kamu lacak sampai ke jurnal, arsip, atau dokumen aslinya.",
  },
  {
    title: "Kami bilang seberapa yakin",
    desc: "Tiap tulisan punya label keyakinan, dari terverifikasi kuat sampai belum cukup bukti. Yang masih diperdebatkan, kami tandai diperdebatkan.",
  },
  {
    title: "Tulisan yang hidup",
    desc: "Saat bukti baru datang, tulisan diperbarui dan perubahannya dicatat terbuka. Bukan terbit lalu dilupakan.",
  },
];

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

export const metadata: Metadata = {
  // Canonical "/" so session-state variants like ?eksplor= are not indexed as duplicates.
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1, 7);
  const sourceCount = getAllSources().length;

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* ================= HERO, direct value proposition ================= */}
        <section className="pt-10 sm:pt-14">
          <Meta>Jurnal riset terbuka, Indonesia</Meta>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Tahu yang sebenarnya soal Indonesia, sampai ke buktinya
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray">
            NaLI menelusuri alam, sejarah, dan investigasi Indonesia dari sumber yang
            bisa diperiksa, lalu menuliskannya jujur. Bukan yang paling viral, yang
            paling bisa dipertanggungjawabkan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-mono text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
            >
              Baca artikel
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Link>
            <Link
              href="/tentang"
              className="inline-flex items-center gap-2 border border-dashed border-ink/70 px-6 py-3.5 font-mono text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
            >
              Apa itu NaLI?
            </Link>
          </div>
          <div className="mt-10 overflow-hidden border border-dashed border-ink/70">
            <AuroraHero />
          </div>
        </section>

        <DashRule />

        {/* ================= TULISAN, lead with content ================= */}
        <section className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Meta>Mulai baca</Meta>
              <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
                Tulisan terbaru
              </h2>
            </div>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 border border-dashed border-ink/70 px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
            >
              Semua artikel
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
            </Link>
          </div>

          {!featured ? (
            <p className={`${CARD} mt-8 p-8 text-center font-mono text-[0.85rem] text-gray`}>
              Belum ada tulisan terbit. Tulisan pertama akan muncul di sini.
            </p>
          ) : (
            <>
              {/* featured: the single most recent piece, given room */}
              <Link
                href={`/articles/${featured.slug}`}
                className={`${CARD} group mt-8 block p-7 transition-colors hover:bg-ink-wash sm:p-9`}
              >
                <Meta>Tulisan pilihan</Meta>
                <h3 className="mt-3 max-w-3xl font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
                  {featured.title}
                </h3>
                {featured.summary && (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray">
                    {featured.summary}
                  </p>
                )}
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink-deep group-hover:gap-3">
                  Baca selengkapnya
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                </span>
              </Link>

              {rest.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((a, i) => (
                    <ArticleCard key={a.slug} article={a} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <DashRule />

        {/* ================= KENAPA NALI, the differentiator ================= */}
        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-xl text-center">
            <Meta>Kenapa NaLI</Meta>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase text-ink sm:text-4xl">
              Saat kamu ingin yakin, bukan sekadar tahu
            </h2>
            <p className="mt-3 text-base leading-relaxed text-gray">
              Banyak situs memberi jawaban. NaLI memberi jawaban sekaligus seberapa
              kuat dasarnya, jadi kamu bisa menilai sendiri.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WHY.map((w) => (
              <div key={w.title} className={`${CARD} flex flex-col p-7`}>
                <h3 className="font-display text-xl font-bold uppercase text-ink">{w.title}</h3>
                <p className="mt-3 flex-1 font-mono text-[0.85rem] leading-relaxed text-ink-charcoal">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <DashRule />

        {/* ================= TIGA PILAR, wayfinding ================= */}
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
                <span className="h-3 w-3" style={{ backgroundColor: p.dot }} aria-hidden />
                <h3 className="mt-4 font-display text-2xl font-bold uppercase text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 font-mono text-[0.85rem] leading-relaxed text-ink-charcoal">
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

        {/* ================= ARSIP, reference layer (demoted) ================= */}
        <section className="py-14 sm:py-16">
          <div className={`${CARD} flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10`}>
            <div>
              <Meta>Untuk yang ingin menggali</Meta>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase text-ink sm:text-3xl">
                {sourceCount} sumber, bisa diperiksa siapa pun
              </h2>
              <p className="mt-3 max-w-xl font-mono text-[0.88rem] leading-relaxed text-ink-charcoal">
                Jurnal, arsip, buku, dan laporan di balik tiap tulisan, terbuka untuk
                kamu telusuri sendiri. Atau lihat denyut riset kami di Ruang Kendali.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/arsip-sumber"
                className="inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
              >
                Buka arsip
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
              </Link>
              <Link
                href="/ruang-kendali"
                className="inline-flex items-center gap-2 border border-dashed border-ink/70 px-6 py-3.5 font-mono text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
              >
                Ruang Kendali
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center font-mono text-[0.78rem] uppercase tracking-[0.14em] text-gray">
            Gratis dibaca · Tanpa login · Tanpa paywall
          </p>
        </section>
      </div>
    </div>
  );
}
