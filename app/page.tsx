import Link from "next/link";
import { GalleryHall, type GalleryAct } from "@/components/GalleryHall";
import { ArticleCard } from "@/components/ArticleCard";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { getArticlesByCategory, getLatestArticles } from "@/lib/content";
import type { Category, Confidence } from "@/lib/types";

const CONFIDENCE_ORDER: Confidence[] = ["high", "medium", "low", "needs-verification"];
const CONFIDENCE_NOTE: Record<Confidence, string> = {
  high: "Sumber kuat dan konsisten.",
  medium: "Didukung, tapi butuh konteks.",
  low: "Hipotesis kerja, bukti terbatas.",
  "needs-verification": "Belum bisa dipakai sebagai klaim.",
};

function featured(category: Category) {
  const a = getArticlesByCategory(category)[0];
  return a ? { title: a.title, slug: a.slug } : null;
}

const ACTS: GalleryAct[] = [
  {
    key: "alam",
    index: "01",
    kicker: "Nature",
    title: "Alam",
    desc: "Ekologi, satwa, dan fenomena lanskap Indonesia — diceritakan dari lapangan, dirujuk ke jurnal.",
    href: "/alam",
    cta: "Masuk ke Alam",
    featured: featured("alam"),
  },
  {
    key: "sejarah",
    index: "02",
    kicker: "Archive · Lore",
    title: "Sejarah",
    desc: "Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang — dibaca ulang dengan hati-hati.",
    href: "/sejarah",
    cta: "Masuk ke Sejarah",
    featured: featured("sejarah"),
  },
  {
    key: "investigasi",
    index: "03",
    kicker: "Investigation",
    title: "Investigasi",
    desc: "Penelusuran berbasis sumber publik. Tanpa tuduhan tanpa bukti, tanpa kepastian palsu.",
    href: "/investigasi",
    cta: "Masuk ke Investigasi",
    featured: featured("investigasi"),
  },
];

export default function HomePage() {
  const latest = getLatestArticles(6);

  return (
    <>
      {/* The gallery: scroll through Alam → Sejarah → Investigasi */}
      <GalleryHall acts={ACTS} />

      {/* the signature promise */}
      <section className="border-b border-rule bg-paper">
        <div className="container-editorial grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
          <div>
            <p className="label">Cara kerja kami</p>
            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-ink-black sm:text-4xl">
              Riset yang jujur soal apa yang ia tahu — dan apa yang belum.
            </h2>
          </div>
          <div className="max-w-xl">
            <p className="text-lg leading-relaxed text-ink-charcoal">
              NaLI by NatIve memakai AI untuk menelusuri, lalu manusia untuk
              memutuskan. Setiap tulisan diberi{" "}
              <span className="font-semibold text-ink-black">label tingkat keyakinan</span>{" "}
              — supaya kamu tahu mana yang sudah terverifikasi, mana yang masih
              hipotesis kerja.
            </p>
            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              {CONFIDENCE_ORDER.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-3 rounded-md border border-rule bg-white px-3 py-2.5"
                >
                  <ConfidenceBadge confidence={c} size="sm" />
                  <dd className="text-xs text-gray">{CONFIDENCE_NOTE[c]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* latest */}
      <section className="bg-white">
        <div className="container-editorial py-16 md:py-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="label">Terbaru</p>
              <h2 className="mt-3 font-display text-3xl text-ink-black sm:text-4xl">
                Tulisan terakhir
              </h2>
            </div>
            <Link
              href="/articles"
              className="label whitespace-nowrap text-ink-black transition-colors hover:text-teal-dark"
            >
              Semua artikel →
            </Link>
          </div>

          {latest.length === 0 ? (
            <p className="mt-12 text-gray">
              Belum ada artikel terbit. Konten pertama sedang disiapkan.
            </p>
          ) : (
            <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* newsletter + closing */}
      <section className="bg-ink-black text-white">
        <div className="container-editorial grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
          <div>
            <p className="label text-teal">Ikuti penelusuran</p>
            <h2 className="mt-3 max-w-md font-display text-3xl leading-tight sm:text-4xl">
              Indonesia punya terlalu banyak cerita yang belum ditelusuri.
            </h2>
            <p className="mt-4 max-w-md text-white/70">
              Dapat satu email tiap ada tulisan baru — alam, sejarah, atau
              investigasi. Pelan, tapi konsisten.
            </p>
          </div>
          <div>
            <NewsletterSignup />
            <Link
              href="/articles"
              className="mt-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-teal"
            >
              Atau mulai membaca sekarang <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
