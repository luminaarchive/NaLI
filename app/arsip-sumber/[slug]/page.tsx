import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxBody } from "@/components/MdxBody";
import { getSourceBySlug, getSourceSlugs } from "@/lib/content";
import { RELIABILITY_LABEL, SOURCE_TYPE_LABEL } from "@/lib/types";

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
      title: `${source.title} | Arsip Sumber, NaLI by NatIve`,
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
          className="label text-gray transition-colors hover:text-ink-deep interactive-link"
        >
          <span className="link-arrow-left">←</span> Arsip sumber
        </Link>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink bg-paper">
            {SOURCE_TYPE_LABEL[source.type]}
          </span>
          {source.reliabilityLevel && (
            <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink-deep bg-ink-wash/30">
              {RELIABILITY_LABEL[source.reliabilityLevel]}
            </span>
          )}
          {source.geography && source.geography.map((geo) => (
            <span key={geo} className="border border-dashed border-ink/35 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-gray bg-paper">
              {geo}
            </span>
          ))}
          {source.year && (
            <span className="border border-dashed border-ink/45 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink/70 bg-paper">
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
          <section className="mt-14 border-t border-dashed border-ink/40 pt-8">
            <div className="flex items-center gap-3">
              <span className="border border-dashed border-ink/60 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink bg-ink-wash/30" aria-hidden="true">
                KLAIM
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-ink">Klaim yang dapat ditopang</h2>
            </div>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Klaim utama dari literatur ini yang dinilai valid untuk dirujuk.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {source.keyClaims.map((c, i) => (
                <div key={i} className="border border-dashed border-ink/30 bg-paper p-4 flex gap-3 align-top">
                  <span className="font-mono text-[0.74rem] text-ink/40 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-mono text-[0.8rem] leading-relaxed text-ink-charcoal font-medium">
                    {c}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* limitations */}
        {source.limitations && source.limitations.length > 0 && (
          <section className="mt-14 border-t border-dashed border-ink/40 pt-8">
            <div className="flex items-center gap-3">
              <span className="border border-dashed border-ink/60 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink bg-ink-wash/30" aria-hidden="true">
                BATASAN
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-ink">Keterbatasan sumber</h2>
            </div>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Keterbatasan metodologi, bias, atau ruang lingkup data dari sumber ini.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {source.limitations.map((l, i) => (
                <div key={i} className="border border-dashed border-ink/30 bg-paper p-4 flex gap-3 align-top">
                  <span className="font-mono text-[0.74rem] text-ink/40 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-mono text-[0.78rem] leading-relaxed text-gray">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* metadata card */}
        <div className="mt-14 border border-dashed border-ink/60 bg-paper p-6">
          <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-ink/70 border-b border-dashed border-ink/20 pb-3 mb-4">
            <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">METADATA BUKTI</span>
            <span>{"//"}</span>
            <span>SOURCE METADATA LEDGER</span>
          </div>
          <dl className="space-y-1">
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
                  <a href={`https://doi.org/${source.doi}`} target="_blank" rel="noopener noreferrer" className="link-teal break-all hover:underline">
                    {source.doi}
                  </a>
                }
              />
            )}
            {source.url && (
              <Field
                label="Tautan asli"
                value={
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="link-teal break-all hover:underline">
                    {source.url}
                  </a>
                }
              />
            )}
            {source.archiveUrl && (
              <Field
                label="Arsip / cermin"
                value={
                  <a href={source.archiveUrl} target="_blank" rel="noopener noreferrer" className="link-teal break-all hover:underline">
                    {source.archiveUrl}
                  </a>
                }
              />
            )}
            {source.checkedAt && <Field label="Tanggal dicek" value={source.checkedAt} />}
          </dl>
        </div>

        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep interactive-link"
          >
            Buka sumber asli <span className="link-arrow-diagonal" aria-hidden="true">↗</span>
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
