import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { getTopicData } from "@/lib/topics";

type Params = { tag: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await getTopicData(decodeURIComponent(params.tag));
  if (!data) return { title: "Topik tidak ditemukan" };
  const title = `Topik: ${data.label}`;
  const description = `Semua artikel, jurnal, dan sumber NaLI tentang ${data.label}. ${data.total} entri.`;
  return {
    title,
    description,
    alternates: { canonical: `/topik/${data.tag}` },
    openGraph: { title: `${title} | NaLI by NatIve`, description, type: "website" },
  };
}

export default async function TopicPage({ params }: { params: Params }) {
  const data = await getTopicData(decodeURIComponent(params.tag));
  if (!data) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Topik"
        title={data.label}
        description={`Semua tulisan, jurnal, dan sumber yang menyentuh topik ini, dikumpulkan dari seluruh arsip NaLI.`}
      />

      <div className="container-editorial py-12">
        {/* stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { v: data.total, l: "Total entri" },
            { v: data.articles.length, l: "Artikel" },
            { v: data.jurnal.length, l: "Jurnal" },
            { v: data.sources.length, l: "Sumber" },
          ].map((s) => (
            <div key={s.l} className="border border-dashed border-ink/60 bg-paper p-4 text-center">
              <p className="font-display text-3xl font-black text-ink">{s.v}</p>
              <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-gray">
                {s.l}
              </p>
            </div>
          ))}
        </div>
        {data.yearRange && (
          <p className="mt-4 font-mono text-[0.74rem] text-gray">
            Rentang tahun sumber: {data.yearRange[0]}
            {data.yearRange[1] !== data.yearRange[0] ? `–${data.yearRange[1]}` : ""}
          </p>
        )}

        {/* articles */}
        {data.articles.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold uppercase text-ink">Artikel</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.articles.map((a, i) => (
                <ArticleCard key={a.slug} article={a} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* jurnal */}
        {data.jurnal.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold uppercase text-ink">Jurnal</h2>
            <ul className="mt-6 space-y-3">
              {data.jurnal.map((j) => (
                <li key={j.slug} className="border border-dashed border-ink/50 bg-paper p-4">
                  <Link
                    href={`/jurnal/${j.slug}`}
                    className="font-display text-base font-bold uppercase leading-snug text-ink transition-colors hover:text-ink-deep"
                  >
                    {j.title}
                  </Link>
                  <p className="mt-1 font-mono text-[0.72rem] text-gray">
                    {j.publisherOrInstitution}
                    {j.year ? ` · ${j.year}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* sources */}
        {data.sources.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold uppercase text-ink">Sumber arsip</h2>
            <ul className="mt-6 space-y-2">
              {data.sources.map((s) => (
                <li key={s.slug} className="border-b border-dashed border-ink/30 pb-2">
                  <Link
                    href={`/arsip-sumber/${s.slug}`}
                    className="font-mono text-[0.82rem] text-ink transition-colors hover:text-ink-deep"
                  >
                    {s.title}
                  </Link>
                  <span className="ml-2 font-mono text-[0.68rem] text-gray-light">
                    {s.institution ?? s.author ?? ""}
                    {s.year ? ` · ${s.year}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-14 font-mono text-[0.74rem] text-gray">
          <Link href="/arsip-sumber" className="text-ink underline decoration-ink/40 hover:decoration-ink-deep">
            ← Kembali ke arsip sumber
          </Link>
        </p>
      </div>
    </>
  );
}
