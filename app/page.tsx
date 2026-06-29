import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/content";
import { getMissions } from "@/lib/missions";
import { buildReadingPaths } from "@/lib/reading-paths";
import { ArticleCard } from "@/components/ArticleCard";
import { ReadingPaths } from "@/components/ReadingPaths";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const LAUNCH_SLUG = "nali-intelligence-platform-jurnal-yang-hidup";

/* -------------------------------------------------------------------------- */
/*  Homepage: a clear "front door" that showcases what NaLI is and what a       */
/*  visitor can do here within the first few seconds. Sections, top to bottom:  */
/*  hero -> feature highlights -> featured launch piece -> active missions ->    */
/*  reading paths -> latest writing. Uses the shared Nav/Footer chrome.         */
/* -------------------------------------------------------------------------- */

const FEATURES = [
  {
    icon: "🤖",
    title: "Tanya NaLI",
    blurb:
      "Tutor AI yang menjawab dari arsip kami, bukan halusinasi. Buka satu artikel, klik tombol Tanya NaLI di kanan bawah.",
    href: `/articles/harimau-jawa-lazarus-species`,
    cta: "Coba di sebuah artikel",
  },
  {
    icon: "🧬",
    title: "Knowledge Genome",
    blurb:
      "Label gizi epistemik di atas tiap tulisan: tingkat keyakinan, komposisi klaim, basis bukti, dan batasannya, sekali pandang.",
    href: `/articles/${LAUNCH_SLUG}`,
    cta: "Lihat contohnya",
  },
  {
    icon: "🧭",
    title: "Jalur Baca",
    blurb:
      "Rute baca terkurasi yang menautkan tulisan terkait dalam urutan yang masuk akal, lewat peta pengetahuan kami.",
    href: "/peta-eksplorasi",
    cta: "Telusuri peta",
  },
  {
    icon: "🔬",
    title: "Sains Warga",
    blurb:
      "Bantu kami melacak biodiversitas Indonesia di lapangan. Kirim temuan; tiap laporan ditinjau manual sebelum dipakai.",
    href: "/misi",
    cta: "Lihat misi aktif",
  },
];

export default async function HomePage() {
  const [articles, missions] = await Promise.all([getAllArticles(), getMissions()]);
  const latest = articles.slice(0, 6);
  const paths = buildReadingPaths(articles).slice(0, 3);
  const activeMissions = missions.filter((m) => m.status === "aktif").slice(0, 2);
  const launch = articles.find((a) => a.slug === LAUNCH_SLUG);

  return (
    <div className="bg-paper">
      {/* ===== A. HERO ===== */}
      <section className="border-b border-dashed border-ink/30">
        <div className="container-editorial py-16 sm:py-24">
          <p className="label text-ink-deep">NaLI Intelligence Platform</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-[1.08] text-ink-black sm:text-5xl lg:text-6xl">
            Jurnal biodiversitas yang{" "}
            <span className="italic text-ink-deep">hidup dan jujur</span>
          </h1>
          <p className="mt-5 max-w-2xl font-mono text-[0.92rem] leading-relaxed text-gray sm:text-base">
            {articles.length} artikel hasil riset mendalam, AI Tutor yang menjawab dari
            arsip, sains warga, dan lab intelijen internal. Setiap klaim membawa sumber,
            tingkat keyakinan, dan batasannya.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/peta-eksplorasi"
              className="border border-ink bg-ink px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
            >
              Mulai jelajah
            </Link>
            <Link
              href="/misi"
              className="border border-dashed border-ink/60 px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
            >
              Lihat misi warga
            </Link>
            <Link
              href="/tentang"
              className="px-3 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-ink/70 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Tentang kami
            </Link>
          </div>
        </div>
      </section>

      {/* ===== B. FEATURE HIGHLIGHTS ===== */}
      <section className="container-editorial py-14 sm:py-16" aria-labelledby="fitur">
        <h2 id="fitur" className="font-display text-2xl text-ink-black sm:text-3xl">
          Fitur unggulan NaLI
        </h2>
        <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
          Empat cara baru membaca dan ikut serta. Inilah yang membedakan NaLI dari sekadar
          kumpulan artikel.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="group flex flex-col border border-dashed border-ink/60 bg-paper p-6 transition-colors hover:bg-ink-wash"
            >
              <span className="text-3xl" aria-hidden>
                {f.icon}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink">
                {f.title}
              </h3>
              <p className="mt-2 flex-1 font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
                {f.blurb}
              </p>
              <span className="mt-4 font-mono text-[0.74rem] font-semibold text-ink-deep group-hover:underline group-hover:underline-offset-4">
                {f.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== C. FEATURED LAUNCH ARTICLE ===== */}
      {launch && (
        <section className="border-y border-dashed border-ink/30 bg-ink-wash/40">
          <div className="container-editorial py-14 sm:py-16">
            <div className="flex flex-col gap-6 border border-dashed border-ink/60 bg-paper p-7 sm:p-9 lg:flex-row lg:items-center lg:gap-10">
              <div className="lg:flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border border-ink bg-ink px-2 py-0.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-paper">
                    Baru
                  </span>
                  <span className="label text-ink/60">Artikel peluncuran</span>
                  <ConfidenceBadge confidence={launch.confidence} size="sm" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-black leading-tight text-ink-black sm:text-3xl">
                  {launch.title}
                </h2>
                <p className="mt-3 max-w-2xl font-mono text-[0.84rem] leading-relaxed text-ink-charcoal">
                  {launch.summary || launch.subtitle}
                </p>
                <Link
                  href={`/articles/${launch.slug}`}
                  className="mt-6 inline-block border border-ink bg-ink px-5 py-2.5 font-mono text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
                >
                  Baca pengumuman →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== D. ACTIVE MISSIONS ===== */}
      {activeMissions.length > 0 && (
        <section className="container-editorial py-14 sm:py-16" aria-labelledby="misi-preview">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="misi-preview" className="font-display text-2xl text-ink-black sm:text-3xl">
                Misi sains warga yang aktif
              </h2>
              <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
                Celah riset nyata yang sedang kami kerjakan. Tanpa akun, kontribusi ditinjau
                manual.
              </p>
            </div>
            <Link
              href="/misi"
              className="font-mono text-[0.76rem] font-semibold uppercase tracking-wider text-ink-deep underline-offset-4 hover:underline"
            >
              Semua misi →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {activeMissions.map((m) => (
              <article key={m.id} className="flex flex-col border border-dashed border-ink/60 bg-paper p-6">
                <div className="flex items-center gap-2">
                  <span className="label text-ink/60">Aktif</span>
                  {m.source === "lab" && (
                    <span className="border border-dashed border-ink/40 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-ink/55">
                      Dari Lab
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">
                  {m.judul}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 font-mono text-[0.78rem] leading-relaxed text-gray">
                  {m.deskripsi}
                </p>
                <div className="mt-4">
                  <div className="flex items-center justify-between font-mono text-[0.68rem] text-ink/70">
                    <span>Progres (estimasi jujur)</span>
                    <span className="tabular-nums">{m.progressPercentage}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full border border-ink/40 bg-paper">
                    <div
                      className="h-full bg-ink/70"
                      style={{ width: `${Math.min(100, Math.max(0, m.progressPercentage))}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={`/misi#misi-${m.id}`}
                  className="mt-4 inline-block font-mono text-[0.74rem] font-semibold text-ink-deep underline-offset-4 hover:underline"
                >
                  Ikut serta →
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ===== E. READING PATHS ===== */}
      {paths.length > 0 && (
        <section className="border-t border-dashed border-ink/30 bg-ink-wash/40">
          <div className="container-editorial py-14 sm:py-16">
            <ReadingPaths paths={paths} />
            <Link
              href="/peta-eksplorasi"
              className="mt-6 inline-block font-mono text-[0.76rem] font-semibold uppercase tracking-wider text-ink-deep underline-offset-4 hover:underline"
            >
              Lihat semua jalur dan peta pengetahuan →
            </Link>
          </div>
        </section>
      )}

      {/* ===== F. LATEST WRITING ===== */}
      <section className="container-editorial py-14 sm:py-16" aria-labelledby="terbaru">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="terbaru" className="font-display text-2xl text-ink-black sm:text-3xl">
            Tulisan terbaru
          </h2>
          <Link
            href="/articles"
            className="font-mono text-[0.76rem] font-semibold uppercase tracking-wider text-ink-deep underline-offset-4 hover:underline"
          >
            Semua artikel →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a, i) => (
            <ArticleCard key={a.slug} article={a} index={i} />
          ))}
        </div>

        <div className="mt-10 border-t border-dashed border-ink/30 pt-8">
          <p className="label text-ink-deep">Dapat kabar tiap ada tulisan baru</p>
          <div className="mt-3 max-w-md">
            <NewsletterSignup variant="light" />
          </div>
        </div>
      </section>
    </div>
  );
}
