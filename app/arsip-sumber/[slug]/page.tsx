import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxBody } from "@/components/MdxBody";
import { getSourceBySlug, getSourceSlugs } from "@/lib/content";
import { RELIABILITY_LABEL, SOURCE_TYPE_LABEL } from "@/lib/types";
import { ShareButton } from "@/components/ShareButton";

const LANGUAGE_LABEL: Record<string, string> = {
  id: "Indonesia",
  en: "Inggris",
  nl: "Belanda",
  other: "Lainnya",
};

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
      title: `${source.title} | Arsip Sumber, NaLI`,
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

        {/* key claims supported */}
        {source.keyClaims && source.keyClaims.length > 0 && (
          <section className="mt-10">
            <h2 className="label text-ink/70">Klaim yang dapat ditopang</h2>
            <ul className="mt-3 space-y-2">
              {source.keyClaims.map((c) => (
                <li key={c} className="flex gap-2 font-mono text-[0.82rem] leading-relaxed text-ink-charcoal">
                  <span className="text-ink" aria-hidden>·</span>
                  {c}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* limitations */}
        {source.limitations && source.limitations.length > 0 && (
          <section className="mt-8 border-l-2 border-dashed border-ink/50 pl-4">
            <h2 className="label text-ink/70">Keterbatasan sumber</h2>
            <ul className="mt-2 space-y-1.5">
              {source.limitations.map((l) => (
                <li key={l} className="font-mono text-[0.8rem] leading-relaxed text-gray">
                  {l}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* metadata card */}
        <dl className="mt-10 border border-dashed border-ink/60 bg-ink-wash/40 px-6 py-3">
          <Field label="Tipe" value={SOURCE_TYPE_LABEL[source.type]} />
          {source.reliabilityLevel && (
            <Field label="Keandalan" value={RELIABILITY_LABEL[source.reliabilityLevel]} />
          )}
          {source.author && <Field label="Penulis" value={source.author} />}
          {source.institution && <Field label="Lembaga" value={source.institution} />}
          {source.year && <Field label="Tahun" value={String(source.year)} />}
          {source.language && (
            <Field label="Bahasa" value={LANGUAGE_LABEL[source.language] ?? source.language} />
          )}
          {source.topics && source.topics.length > 0 && (
            <Field label="Topik" value={source.topics.join(" · ")} />
          )}
          {source.geography && source.geography.length > 0 && (
            <Field label="Geografi" value={source.geography.join(" · ")} />
          )}
          {source.related_topic && !source.topics && (
            <Field label="Topik terkait" value={source.related_topic} />
          )}
          {source.reliability && (
            <Field label="Catatan keandalan" value={source.reliability} />
          )}
          {source.doi && (
            <Field
              label="DOI"
              value={
                <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noopener noreferrer" className="link-teal break-all">
                  {source.doi}
                </a>
              }
            />
          )}
          {source.url && (
            <Field
              label="Tautan asli"
              value={
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="link-teal break-all">
                  {source.url}
                </a>
              }
            />
          )}
          {source.archiveUrl && (
            <Field
              label="Arsip / cermin"
              value={
                <a href={source.archiveUrl} target="_blank" rel="noopener noreferrer" className="link-teal break-all">
                  {source.archiveUrl}
                </a>
              }
            />
          )}
          {source.checkedAt && <Field label="Tanggal dicek" value={source.checkedAt} />}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep"
            >
              Buka sumber asli <span aria-hidden>↗</span>
            </a>
          )}
          <ShareButton
            path={`/arsip-sumber/${source.slug}`}
            title={source.title}
            description={source.content ? source.content.slice(0, 180) + "..." : undefined}
            category="sumber"
          />
        </div>

        <p className="mt-10 border-t border-dashed border-ink/40 pt-6 font-mono text-[0.72rem] leading-relaxed text-gray">
          Entri ini bagian dari arsip sumber terbuka NaLI. Setiap klaim
          dalam artikel kami dapat ditelusuri kembali ke rujukannya.
        </p>
      </div>
    </article>
  );
}
