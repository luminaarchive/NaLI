import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxBody } from "@/components/MdxBody";
import { getSourceBySlug, getSourceSlugs } from "@/lib/content";
import { SOURCE_TYPE_LABEL } from "@/lib/types";

type Params = { slug: string };

export function generateStaticParams() {
  return getSourceSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const source = getSourceBySlug(params.slug);
  if (!source) return { title: "Sumber tidak ditemukan" };
  const description =
    source.content?.slice(0, 160) ||
    `Entri arsip sumber NaLI: ${source.title}.`;
  return {
    title: source.title,
    description,
    alternates: { canonical: `/arsip-sumber/${source.slug}` },
    openGraph: {
      title: `${source.title} | Arsip Sumber — NaLI by NatIve`,
      description,
      type: "article",
    },
  };
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-dashed border-ink/30 py-3 last:border-0 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="label text-ink/70">{label}</dt>
      <dd className="mt-1 font-mono text-[0.85rem] text-ink-charcoal sm:mt-0">{value}</dd>
    </div>
  );
}

export default function SourceDetailPage({ params }: { params: Params }) {
  const source = getSourceBySlug(params.slug);
  if (!source) notFound();

  return (
    <article className="bg-paper">
      <div className="container-read py-12 sm:py-16">
        <Link
          href="/arsip-sumber"
          className="label text-gray transition-colors hover:text-ink-deep"
        >
          ← Arsip sumber
        </Link>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink">
            {SOURCE_TYPE_LABEL[source.type]}
          </span>
          {source.year && (
            <span className="font-mono text-[0.72rem] uppercase tracking-wider text-ink/70">
              {source.year}
            </span>
          )}
        </div>

        <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-ink-black sm:text-4xl">
          {source.title}
        </h1>

        {/* description body */}
        {source.content && (
          <div className="mt-8">
            <MdxBody source={source.content} />
          </div>
        )}

        {/* metadata card */}
        <dl className="mt-10 border border-dashed border-ink/60 bg-ink-wash/40 px-6 py-3">
          <Field label="Tipe" value={SOURCE_TYPE_LABEL[source.type]} />
          {source.author && <Field label="Penulis" value={source.author} />}
          {source.year && <Field label="Tahun" value={String(source.year)} />}
          {source.related_topic && (
            <Field label="Topik terkait" value={source.related_topic} />
          )}
          {source.reliability && (
            <Field label="Catatan keandalan" value={source.reliability} />
          )}
          {source.url && (
            <Field
              label="Tautan asli"
              value={
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-teal break-all"
                >
                  {source.url}
                </a>
              }
            />
          )}
        </dl>

        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep"
          >
            Buka sumber asli <span aria-hidden>↗</span>
          </a>
        )}

        <p className="mt-10 border-t border-dashed border-ink/40 pt-6 font-mono text-[0.72rem] leading-relaxed text-gray">
          Entri ini bagian dari arsip sumber terbuka NaLI by NatIve. Setiap klaim
          dalam artikel kami dapat ditelusuri kembali ke rujukannya.
        </p>
      </div>
    </article>
  );
}
