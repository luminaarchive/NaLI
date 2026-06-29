import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { getSiteStats } from "@/lib/stats";
import { getMissions } from "@/lib/missions";
import { buildReadingPaths } from "@/lib/reading-paths";
import { ArticleCard } from "@/components/ArticleCard";
import { ReadingPaths } from "@/components/ReadingPaths";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { HomeHero } from "@/components/landing/HomeHero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const LAUNCH_SLUG = "nali-intelligence-platform-jurnal-yang-hidup";

/* -------------------------------------------------------------------------- */
/*  Homepage: a clear front door in NaLI's archive-journal voice. Animated     */
/*  navy wave hero, then an annotated index of what you can do here, a         */
/*  featured piece, live missions, curated reading paths, and the latest       */
/*  writing. No per-section eyebrows, no identical emoji card grid.            */
/* -------------------------------------------------------------------------- */

const CAPABILITIES = [
  {
    name: "Tanya NaLI",
    body: "Tutor yang menjawab dari arsip kami, dan berkata jujur ketika jawabannya memang belum ada. Buka tombolnya di pojok tiap artikel.",
    href: "/articles/harimau-jawa-lazarus-species",
    cta: "Coba di sebuah artikel",
  },
  {
    name: "Knowledge Genome",
    body: "Sebelum membaca, intip dulu seberapa kuat sebuah tulisan berdiri: tingkat keyakinan, susunan klaim, bukti, dan batasannya, dalam satu kartu.",
    href: `/articles/${LAUNCH_SLUG}`,
    cta: "Lihat contohnya",
  },
  {
    name: "Jalur Baca",
    body: "Satu artikel jarang berdiri sendiri. Ikuti rute yang sudah kami rangkai supaya tulisan yang saling menyambung terbaca berurutan.",
    href: "/peta-eksplorasi",
    cta: "Telusuri peta",
  },
  {
    name: "Sains Warga",
    body: "Punya foto, catatan, atau temuan dari lapangan? Kirim ke kami. Tiap laporan diperiksa lebih dulu sebelum menjadi bagian dari riset.",
    href: "/misi",
    cta: "Lihat misi aktif",
  },
];

export default async function HomePage() {
  const [articles, stats, missions] = await Promise.all([
    getAllArticles(),
    getSiteStats(),
    getMissions(),
  ]);
  const latest = articles.slice(0, 6);
  const paths = buildReadingPaths(articles).slice(0, 3);
  const activeMissions = missions.filter((m) => m.status === "aktif").slice(0, 2);
  const launch = articles.find((a) => a.slug === LAUNCH_SLUG);

  const heroStats = [
    { value: String(stats.artikel), label: "artikel" },
    { value: String(stats.sumber), label: "sumber terverifikasi" },
    { value: String(stats.seri), label: "seri" },
  ];

  return (
    <div className="bg-paper">
      <HomeHero stats={heroStats} />

      {/* ===== What you can do here: an annotated index, not a card grid ===== */}
      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="cara">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 id="cara" className="font-display text-3xl font-black leading-tight text-ink-black sm:text-4xl">
              Bukan sekadar kumpulan artikel
            </h2>
            <p className="mt-4 max-w-md font-mono text-[0.84rem] leading-relaxed text-gray">
              NaLI dibuat untuk dibaca dengan curiga yang sehat. Empat alat ini membantumu
              menimbang bukti, bukan menelannya bulat-bulat.
            </p>
          </div>

          <dl className="divide-y divide-dashed divide-ink/30 border-t border-dashed border-ink/30">
            {CAPABILITIES.map((c) => (
              <div key={c.name} className="group py-7 first:pt-0 sm:py-8">
                <dt className="font-display text-xl font-bold text-ink sm:text-2xl">{c.name}</dt>
                <dd className="mt-2 max-w-xl font-mono text-[0.82rem] leading-relaxed text-ink-charcoal">
                  {c.body}
                </dd>
                <Link
                  href={c.href}
                  className="mt-3 inline-block font-mono text-[0.76rem] font-semibold text-ink-deep underline-offset-4 transition-colors hover:underline"
                >
                  {c.cta} →
                </Link>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ===== Featured launch piece ===== */}
      {launch && (
        <section className="border-y border-dashed border-ink/30 bg-ink-wash/40">
          <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-baseline lg:gap-10">
              <span className="inline-flex w-fit items-center gap-2 bg-ink px-2.5 py-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper">
                Baru terbit
              </span>
              <div>
                <h2 className="font-display text-2xl font-black leading-tight text-ink-black sm:text-3xl [text-wrap:balance]">
                  <Link href={`/articles/${launch.slug}`} className="hover:underline hover:underline-offset-4">
                    {launch.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-2xl font-mono text-[0.86rem] leading-relaxed text-ink-charcoal">
                  {launch.summary || launch.subtitle}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/articles/${launch.slug}`}
                    className="bg-ink px-5 py-2.5 font-mono text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
                  >
                    Baca selengkapnya →
                  </Link>
                  <ConfidenceBadge confidence={launch.confidence} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== Live missions ===== */}
      {activeMissions.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="misi">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 id="misi" className="font-display text-2xl font-black text-ink-black sm:text-3xl">
                Riset yang sedang kami kerjakan
              </h2>
              <p className="mt-3 font-mono text-[0.84rem] leading-relaxed text-gray">
                Celah bukti yang belum tertutup. Tanpa perlu akun, kamu bisa ikut menutupnya;
                tiap kiriman kami tinjau dulu.
              </p>
            </div>
            <Link
              href="/misi"
              className="font-mono text-[0.78rem] font-semibold text-ink-deep underline-offset-4 hover:underline"
            >
              Semua misi →
            </Link>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden border border-ink/30 bg-ink/30 md:grid-cols-2">
            {activeMissions.map((m) => (
              <article key={m.id} className="flex flex-col bg-paper p-7">
                <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink/60">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-deep" aria-hidden />
                  Sedang berjalan
                  {m.source === "lab" && <span className="text-ink/45">· dari Lab</span>}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink">
                  {m.judul}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 font-mono text-[0.8rem] leading-relaxed text-gray">
                  {m.deskripsi}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 bg-ink/15">
                    <div
                      className="h-full bg-ink-deep"
                      style={{ width: `${Math.min(100, Math.max(0, m.progressPercentage))}%` }}
                    />
                  </div>
                  <span className="font-mono text-[0.7rem] tabular-nums text-ink/60">
                    {m.progressPercentage}%
                  </span>
                </div>
                <Link
                  href={`/misi#misi-${m.id}`}
                  className="mt-4 inline-block font-mono text-[0.76rem] font-semibold text-ink-deep underline-offset-4 hover:underline"
                >
                  Ikut serta →
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ===== Reading paths ===== */}
      {paths.length > 0 && (
        <section className="border-t border-dashed border-ink/30 bg-ink-wash/40">
          <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20">
            <ReadingPaths paths={paths} />
            <Link
              href="/peta-eksplorasi"
              className="mt-8 inline-block font-mono text-[0.78rem] font-semibold text-ink-deep underline-offset-4 hover:underline"
            >
              Lihat semua jalur dan peta pengetahuan →
            </Link>
          </div>
        </section>
      )}

      {/* ===== Latest writing ===== */}
      <section className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8 sm:py-20" aria-labelledby="terbaru">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="terbaru" className="font-display text-2xl font-black text-ink-black sm:text-3xl">
            Tulisan terbaru
          </h2>
          <Link
            href="/articles"
            className="font-mono text-[0.78rem] font-semibold text-ink-deep underline-offset-4 hover:underline"
          >
            Semua artikel →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-dashed border-ink/30 pt-10 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="max-w-md">
            <h2 className="font-display text-xl font-bold text-ink-black">
              Dapat kabar saat ada tulisan baru
            </h2>
            <p className="mt-2 font-mono text-[0.8rem] leading-relaxed text-gray">
              Sesekali, tanpa spam. Hanya tulisan dan temuan yang layak dibaca.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <NewsletterSignup variant="light" />
          </div>
        </div>
      </section>
    </div>
  );
}
