import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { getAllArticles } from "@/lib/content";
import { SERIES } from "@/lib/series";

export const metadata: Metadata = {
  title: "Seri",
  description:
    "Seri editorial NaLI, mengelompokkan tulisan menjadi alur yang punya janji dan arah, bukan posting blog yang berserakan.",
  alternates: { canonical: "/seri" },
  openGraph: {
    title: "Seri | NaLI by NatIve",
    description: "Seri editorial NaLI, alur tulisan dengan janji dan arah.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function SeriPage() {
  const articles = await getAllArticles();

  return (
    <>
      <PageHeader
        eyebrow="Editorial"
        title="Seri"
        description="Kami menyusun tulisan ke dalam seri agar terasa seperti publikasi yang punya arah, bukan kumpulan posting acak."
      />

      <div className="container-editorial py-12 sm:py-16">
        <div className="space-y-12">
          {SERIES.map((s) => {
            const inSeries = articles.filter((a) => (a.series ?? []).includes(s.slug));
            return (
              <section
                key={s.slug}
                id={s.slug}
                className="scroll-mt-24 border border-dashed border-ink/60 bg-paper p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`border border-dashed px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-label ${
                      s.status === "active"
                        ? "border-ink/60 text-ink-deep"
                        : "border-ink/40 text-gray"
                    }`}
                  >
                    {s.status === "active" ? "Aktif" : "Direncanakan"}
                  </span>
                  <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink/60">
                    {inSeries.length} tulisan
                  </span>
                </div>

                <h2 className="mt-4 font-display text-2xl font-bold uppercase leading-tight text-ink sm:text-3xl">
                  {s.title}
                </h2>
                <p className="mt-3 max-w-2xl font-mono text-[0.85rem] leading-relaxed text-gray">
                  {s.promise}
                </p>

                {inSeries.length > 0 ? (
                  <ul className="mt-6 divide-y divide-dashed divide-ink/30 border-t border-dashed border-ink/30">
                    {inSeries.map((a) => (
                      <li key={a.slug} className="py-3">
                        <Link
                          href={`/articles/${a.slug}`}
                          className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                        >
                          <span className="font-display text-lg text-ink-charcoal transition-colors group-hover:text-ink-deep">
                            {a.title}
                          </span>
                          <ConfidenceBadge confidence={a.confidence} size="sm" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 border-t border-dashed border-ink/30 pt-4 font-mono text-[0.78rem] text-gray-light">
                    Belum ada tulisan terbit di seri ini. Rencana topik ada di peta
                    editorial internal.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
