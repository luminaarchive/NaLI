import Link from "next/link";
import { Hero } from "@/components/Hero";
import { PillarCard } from "@/components/PillarCard";
import { ArticleCard } from "@/components/ArticleCard";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { getLatestArticles } from "@/lib/content";
import { PILLARS } from "@/lib/site";
import type { Confidence } from "@/lib/types";

const CONFIDENCE_ORDER: Confidence[] = [
  "high",
  "medium",
  "low",
  "needs-verification",
];

const CONFIDENCE_NOTE: Record<Confidence, string> = {
  high: "Sumber kuat dan konsisten.",
  medium: "Didukung, tapi butuh konteks.",
  low: "Hipotesis kerja, bukti terbatas.",
  "needs-verification": "Belum bisa dipakai sebagai klaim.",
};

export default function HomePage() {
  const latest = getLatestArticles(6);

  return (
    <>
      <Hero />

      {/* editorial intro + the signature promise */}
      <section className="border-b border-rule">
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

      {/* pillars */}
      <section className="container-editorial py-16 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <p className="label">Tiga pilar</p>
            <h2 className="mt-3 font-display text-3xl text-ink-black sm:text-4xl">
              Tempat kami menggali
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <PillarCard key={pillar.key} pillar={pillar} />
          ))}
        </div>
      </section>

      {/* latest */}
      <section className="border-t border-rule bg-white">
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

      {/* closing CTA */}
      <section className="bg-ink-black text-white">
        <div className="container-editorial flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
          <h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">
            Indonesia punya terlalu banyak cerita yang belum ditelusuri.
          </h2>
          <Link
            href="/articles"
            className="shrink-0 rounded-full bg-teal px-7 py-3.5 text-sm font-semibold text-ink-black transition-transform hover:scale-[1.03] hover:bg-teal-dark hover:text-white"
          >
            Mulai membaca
          </Link>
        </div>
      </section>
    </>
  );
}
