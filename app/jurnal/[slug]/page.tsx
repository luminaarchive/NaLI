import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationBySlug, getPublicationSlugs } from "@/lib/jurnal";
import { getSourceBySlug } from "@/lib/content";
import { ACCESS_TYPE_LABEL, PUBLICATION_TYPE_LABEL } from "@/lib/types";
import { SITE } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams() {
  return getPublicationSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const pub = getPublicationBySlug(params.slug);
  if (!pub) return { title: "Publikasi tidak ditemukan" };
  return {
    title: pub.title,
    description: pub.synopsis.slice(0, 160),
    alternates: { canonical: `/jurnal/${pub.slug}` },
    openGraph: {
      title: `${pub.title} | Jurnal, NaLI by NatIve`,
      description: pub.synopsis.slice(0, 160),
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

export default function PublicationDetailPage({ params }: { params: Params }) {
  const pub = getPublicationBySlug(params.slug);
  if (!pub) notFound();

  const coverImage = pub.cover.localPath ?? pub.cover.imageUrl ?? null;
  const hasPdf = pub.download.primaryKind !== "external_source_only" && Boolean(pub.pdfUrl);
  const relatedSources = (pub.relatedSourceIds ?? [])
    .map((id) => getSourceBySlug(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: pub.title,
    description: pub.synopsis,
    url: pub.sourceUrl,
    ...(pub.doi ? { sameAs: `https://doi.org/${pub.doi}` } : {}),
    publisher: { "@type": "Organization", name: pub.publisherOrInstitution },
    isPartOf: { "@type": "CreativeWorkSeries", name: "Jurnal NaLI", url: `${SITE.url}/jurnal` },
  };

  return (
    <article className="bg-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-read py-12 sm:py-16">
        <Link href="/jurnal" className="label text-gray transition-colors hover:text-ink-deep">
          ← Katalog jurnal
        </Link>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-label text-ink">
            {PUBLICATION_TYPE_LABEL[pub.publicationType]}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-deep">
            {ACCESS_TYPE_LABEL[pub.accessType]}
          </span>
          {pub.year && (
            <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink/60">{pub.year}</span>
          )}
        </div>

        <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-tight text-ink-black sm:text-4xl">
          {pub.title}
        </h1>
        {pub.originalTitle && pub.originalTitle !== pub.title && (
          <p className="mt-2 font-mono text-[0.85rem] text-ink/60">{pub.originalTitle}</p>
        )}
        <p className="mt-2 font-mono text-[0.8rem] uppercase tracking-wider text-ink/60">
          {pub.publisherOrInstitution}
        </p>

        {/* cover: real publication visual, or bibliographic source-card */}
        <figure className="mt-7" data-jurnal-cover="true">
          {coverImage ? (
            <div className="flex justify-center overflow-hidden border border-dashed border-ink/55 bg-paper p-6">
              <Image
                src={coverImage}
                alt={pub.cover.alt}
                width={640}
                height={420}
                className="h-auto max-h-[360px] w-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="border border-dashed border-ink/55 bg-ink-wash/40 p-6" data-jurnal-cover-fallback="true">
              <p className="label text-ink/60">Kartu sumber</p>
              <p className="mt-2 font-display text-xl font-semibold leading-snug text-ink-black">{pub.title}</p>
              <p className="mt-1 font-mono text-[0.74rem] text-ink/60">{pub.publisherOrInstitution}</p>
              <p className="mt-3 font-mono text-[0.7rem] text-ink/50">
                Cover asli tidak ditampilkan karena lisensi belum jelas
              </p>
            </div>
          )}
          <figcaption className="mt-3" data-jurnal-cover-credit="true">
            <p className="font-mono text-[0.74rem] leading-relaxed text-ink-charcoal">{pub.cover.caption}</p>
            <p className="mt-1 font-mono text-[0.68rem] leading-relaxed text-ink/60">
              {pub.cover.creator ? `${pub.cover.creator}. ` : ""}
              {pub.cover.publisherOrInstitution}.{" "}
              <a href={pub.cover.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal" data-jurnal-cover-source="true">
                Sumber visual
              </a>
              {". "}
              {pub.cover.displayBasis}
            </p>
          </figcaption>
        </figure>

        {/* Indonesian synopsis of the external publication */}
        <section className="mt-8 border-l-2 border-dashed border-ink/50 pl-4" data-jurnal-synopsis="true">
          <h2 className="label text-ink/70">Sinopsis</h2>
          <p className="mt-2 text-[0.97rem] leading-relaxed text-ink-charcoal">{pub.synopsis}</p>
        </section>

        <section className="mt-6">
          <h2 className="label text-ink/70">Kenapa penting</h2>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-charcoal">{pub.whyItMatters}</p>
        </section>

        {/* actions: primary = Download PDF (or Buka sumber asli if no PDF), then DOI, then NaLI metadata */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          {hasPdf ? (
            <a
              href={pub.download.primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep"
              data-jurnal-download-primary="pdf"
            >
              {pub.download.label} <span aria-hidden>↓</span>
            </a>
          ) : (
            <a
              href={pub.download.primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-deep"
              data-jurnal-download-primary="source"
            >
              Buka sumber asli <span aria-hidden>↗</span>
            </a>
          )}
          <a
            href={pub.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink-wash"
          >
            Buka sumber asli <span aria-hidden>↗</span>
          </a>
          {pub.doi && (
            <a
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-dashed border-ink px-4 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink-wash"
            >
              DOI <span aria-hidden>↗</span>
            </a>
          )}
          <a
            href={pub.download.metadataUrl}
            download={`nali-jurnal-${pub.slug}.txt`}
            className="font-mono text-[0.7rem] uppercase tracking-wider text-ink/70 underline decoration-dashed underline-offset-4 hover:text-ink-deep"
            data-jurnal-metadata="true"
          >
            Unduh metadata NaLI
          </a>
        </div>

        {/* metadata card */}
        <dl className="mt-10 border border-dashed border-ink/60 bg-ink-wash/40 px-6 py-3">
          <Field label="Jenis" value={PUBLICATION_TYPE_LABEL[pub.publicationType]} />
          {pub.journalOrCollection && <Field label="Jurnal / koleksi" value={pub.journalOrCollection} />}
          <Field label="Penerbit" value={pub.publisherOrInstitution} />
          {pub.authors && pub.authors.length > 0 && <Field label="Penulis" value={pub.authors.join("; ")} />}
          {(pub.year || pub.publicationDate) && (
            <Field label="Tahun" value={pub.publicationDate ?? pub.year} />
          )}
          <Field label="Akses" value={ACCESS_TYPE_LABEL[pub.accessType]} />
          <Field label="Bahasa" value={pub.language} />
          {pub.topics.length > 0 && <Field label="Topik" value={pub.topics.join(" · ")} />}
          {pub.geography.length > 0 && <Field label="Geografi" value={pub.geography.join(" · ")} />}
          {pub.doi && (
            <Field
              label="DOI"
              value={
                <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="link-teal break-all">
                  {pub.doi}
                </a>
              }
            />
          )}
          <Field
            label="URL sumber"
            value={
              <a href={pub.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal break-all">
                {pub.sourceUrl}
              </a>
            }
          />
          <Field label="Dicek" value={pub.checkedAt} />
        </dl>

        {/* limitations */}
        {pub.limitations.length > 0 && (
          <section className="mt-8 border-l-2 border-dashed border-ink/50 pl-4">
            <h2 className="label text-ink/70">Batasan</h2>
            <ul className="mt-2 space-y-1.5">
              {pub.limitations.map((l) => (
                <li key={l} className="font-mono text-[0.8rem] leading-relaxed text-gray">
                  {l}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* related articles + sources */}
        {((pub.relatedArticleIds && pub.relatedArticleIds.length > 0) || relatedSources.length > 0) && (
          <section className="mt-8">
            <h2 className="label text-ink/70">Terkait di NaLI</h2>
            <ul className="mt-3 space-y-2">
              {(pub.relatedArticleIds ?? []).map((id) => (
                <li key={id} className="font-mono text-[0.82rem]">
                  <Link href={`/articles/${id}`} className="link-teal">
                    Artikel: {id}
                  </Link>
                </li>
              ))}
              {relatedSources.map((s) => (
                <li key={s.slug} className="font-mono text-[0.82rem]">
                  <Link href={`/arsip-sumber/${s.slug}`} className="link-teal">
                    Arsip sumber: {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 border-t border-dashed border-ink/40 pt-6 font-mono text-[0.72rem] leading-relaxed text-gray">
          Entri ini adalah katalog publikasi eksternal. Sinopsis ditulis NaLI sebagai ringkasan; naskah asli tetap
          milik penerbitnya dan dibaca di sumber aslinya.
        </p>
      </div>
    </article>
  );
}
