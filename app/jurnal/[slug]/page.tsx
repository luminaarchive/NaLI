import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationBySlug, getPublicationSlugs } from "@/lib/jurnal";
import { getSourceBySlug } from "@/lib/content";
import { ACCESS_TYPE_LABEL, PUBLICATION_TYPE_LABEL } from "@/lib/types";
import { SITE } from "@/lib/site";
import { renderItalicTitle, stripHtmlTags, formatLicense } from "@/lib/jurnal-format";
import { CitationModal } from "@/components/CitationModal";

type Params = { slug: string };

export function generateStaticParams() {
  return getPublicationSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const pub = getPublicationBySlug(params.slug);
  if (!pub) return { title: "Publikasi tidak ditemukan" };
  const cleanTitle = stripHtmlTags(pub.title);
  return {
    title: `${cleanTitle} | Jurnal, NaLI by NatIve`,
    description: pub.synopsis.slice(0, 160),
    alternates: { canonical: `/jurnal/${pub.slug}` },
    openGraph: {
      title: `${cleanTitle} | Jurnal, NaLI by NatIve`,
      description: pub.synopsis.slice(0, 160),
      type: "article",
    },
  };
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
    "@type": "ScholarlyArticle",
    headline: stripHtmlTags(pub.title),
    name: stripHtmlTags(pub.title),
    description: pub.synopsis,
    url: pub.sourceUrl,
    ...(pub.year ? { datePublished: String(pub.year) } : {}),
    ...(pub.authors?.length
      ? { author: pub.authors.map((a) => ({ "@type": "Person", name: a })) }
      : {}),
    ...(pub.doi ? { sameAs: `https://doi.org/${pub.doi}` } : {}),
    publisher: { "@type": "Organization", name: pub.publisherOrInstitution },
    isPartOf: { "@type": "CreativeWorkSeries", name: "Jurnal NaLI", url: `${SITE.url}/jurnal` },
  };

  return (
    <article className="bg-paper min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* Navigation header */}
      <div className="mx-auto w-full max-w-editorial px-5 sm:px-8 pt-8 pb-4">
        <Link href="/jurnal" className="font-mono text-xs uppercase tracking-wider text-gray hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
          ← Katalog jurnal
        </Link>
      </div>

      <div className="mx-auto w-full max-w-editorial px-5 sm:px-8 py-8">
               {/* 1. Large Cover Preview (centered with A4 scale trimming) */}
        <div className="flex justify-center mb-8">
          <figure data-jurnal-cover="true" className="w-full max-w-[280px] sm:max-w-[320px] flex flex-col items-center">
            <div className="w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] aspect-[3/4] relative overflow-hidden border border-dashed border-ink/40 bg-ink-wash/5">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={stripHtmlTags(pub.cover.alt)}
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 200px, 220px"
                  className="object-cover object-top scale-[1.10]"
                  priority
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-center text-center p-4 bg-ink-wash/10" data-jurnal-cover-fallback="true">
                  <span className="font-mono text-[0.7rem] uppercase tracking-widest text-gray">Dokumen</span>
                  <p className="mt-2 font-display text-xs font-bold leading-snug text-ink-black line-clamp-4">{stripHtmlTags(pub.title)}</p>
                  <p className="mt-3 font-mono text-[0.7rem] text-gray">
                    Cover asli tidak ditampilkan karena lisensi belum jelas.
                  </p>
                </div>
              )}
            </div>
            <figcaption className="mt-3 text-center" data-jurnal-cover-credit="true">
              <p className="font-mono text-[0.7rem] leading-relaxed text-gray">{renderItalicTitle(pub.cover.caption)}</p>
              <p className="mt-1 font-mono text-[0.7rem] leading-relaxed text-gray">
                {pub.cover.creator ? `${pub.cover.creator}. ` : ""}
                {pub.cover.publisherOrInstitution}.{" "}
                <a href={pub.cover.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink" data-jurnal-cover-source="true">
                  Sumber visual
                </a>
                {pub.cover.displayBasis ? ` · ${pub.cover.displayBasis}` : ""}
              </p>
            </figcaption>
          </figure>
        </div>

        {/* 2. Title Section */}
        <div className="text-center max-w-4xl mx-auto mb-5">
          <h1 className="font-display text-2xl font-bold leading-snug tracking-tight text-ink-black sm:text-3xl lg:text-4xl">
            {renderItalicTitle(pub.title)}
          </h1>
          {pub.originalTitle && pub.originalTitle !== pub.title && (
            <p className="mt-2 font-mono text-[0.8rem] text-gray leading-relaxed max-w-2xl mx-auto">
              <span className="uppercase tracking-wider text-[0.7rem] text-gray font-bold">Judul Asli: </span>
              {renderItalicTitle(pub.originalTitle)}
            </p>
          )}
        </div>

        {/* 3. Badges */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
          {pub.peerReviewed && (
            <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-ink-deep">
              Peer Reviewed
            </span>
          )}
          <span className="border border-dashed border-ink/40 px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-ink font-semibold">
            {PUBLICATION_TYPE_LABEL[pub.publicationType]}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-widest font-bold text-ink-deep">
            {ACCESS_TYPE_LABEL[pub.accessType]}
          </span>
        </div>

        {/* 4. Authors Section */}
        {pub.authors && pub.authors.length > 0 && (
          <div className="text-center mb-6 max-w-2xl mx-auto">
            <p className="font-display text-sm sm:text-base text-ink-charcoal font-medium">
              {pub.authors.join(", ")}
            </p>
          </div>
        )}

        {/* 5. Download Button (Visually Dominant CTA) */}
        <div className="flex flex-wrap justify-center items-center gap-3.5 mb-10 pb-6 border-b border-dashed border-ink/40">
          {hasPdf ? (
            <a
              href={pub.download.primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-ink bg-ink px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink-deep focus-visible:ring-2 focus-visible:ring-ink"
              data-jurnal-download-primary="pdf"
            >
              Download PDF <span aria-hidden>↓</span>
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2.5 border border-gray-light bg-gray-light px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-gray cursor-not-allowed"
            >
              PDF Tidak Tersedia
            </button>
          )}
          
          {pub.doi && (
            <a
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-ink px-5 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
            >
              Buka DOI <span aria-hidden>↗</span>
            </a>
          )}
          
          <a
            href={pub.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-ink px-5 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
          >
            Halaman Penerbit <span aria-hidden>↗</span>
          </a>

          <a
            href={pub.download.metadataUrl}
            download={`nali-jurnal-${pub.slug}.txt`}
            className="inline-flex items-center gap-2 border border-dashed border-ink/40 px-5 py-3.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-gray transition-colors hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
            data-jurnal-metadata="true"
          >
            Metadata NaLI <span aria-hidden>↓</span>
          </a>

          <CitationModal
            item={{
              title: stripHtmlTags(pub.title),
              slug: pub.slug,
              date: pub.publicationDate ?? (pub.year ? `${pub.year}-01-01` : new Date().toISOString()),
              kind: "jurnal",
              authors: pub.authors,
            }}
          />
        </div>

        {/* 6. Metadata Table (Definition List) */}
        <div className="border border-dashed border-ink/40 bg-ink-wash/5 p-6 md:p-8 mb-10 max-w-4xl mx-auto">
          <h3 className="font-mono text-[0.7rem] uppercase tracking-wider font-bold text-gray border-b border-dashed border-ink/40 pb-2.5 mb-4">
            Bibliografi & Identitas
          </h3>
          <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {pub.journalOrCollection && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Journal</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.journalOrCollection}</dd>
              </div>
            )}
            {pub.publisherOrInstitution && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Publisher</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.publisherOrInstitution}</dd>
              </div>
            )}
            {pub.year && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Year</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.year}</dd>
              </div>
            )}
            {pub.doi && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0 sm:col-span-2">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">DOI</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal break-all">
                  <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
                    {pub.doi}
                  </a>
                </dd>
              </div>
            )}
            {pub.language && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Language</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.language.toUpperCase()}</dd>
              </div>
            )}
            {pub.license && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">License</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{formatLicense(pub.license)}</dd>
              </div>
            )}
            {pub.volume && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Volume</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.volume}</dd>
              </div>
            )}
            {pub.issue && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Issue</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.issue}</dd>
              </div>
            )}
            {pub.pages && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Pages</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{pub.pages}</dd>
              </div>
            )}
            {pub.accessType && (
              <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
                <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Access</dt>
                <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">{ACCESS_TYPE_LABEL[pub.accessType]}</dd>
              </div>
            )}
            <div className="flex flex-col border-b border-dashed border-ink/20 pb-2 last:border-0">
              <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">Repository</dt>
              <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal">NaLI Research Archive</dd>
            </div>
          </dl>
          
          {pub.limitations && pub.limitations.length > 0 && (
            <div className="border-t border-dashed border-ink/40 mt-4 pt-4">
              <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-gray font-bold mb-2">Batasan & Catatan</h4>
              <ul className="list-disc list-inside space-y-1 pl-1">
                {pub.limitations.map((l) => (
                  <li key={l} className="font-mono text-[0.7rem] leading-normal text-gray">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 7. Synopsis (abstract style) */}
          <section className="border-l-2 border-dashed border-ink/40 pl-5" data-jurnal-synopsis="true">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-wider font-bold text-gray">Sinopsis</h2>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-charcoal whitespace-pre-wrap">{pub.synopsis}</p>
          </section>

          {/* 8. Why It Matters */}
          <section className="border-l-2 border-dashed border-ink/40 pl-5">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-wider font-bold text-gray">Kenapa penting</h2>
            <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-charcoal whitespace-pre-wrap">{pub.whyItMatters}</p>
          </section>

          {/* 9. Topics / Geography Tags */}
          <div className="grid gap-6 sm:grid-cols-2 pb-6 border-b border-dashed border-ink/40">
            {pub.topics && pub.topics.length > 0 && (
              <div>
                <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-gray font-bold mb-2">Kata Kunci / Topik</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pub.topics.map((t) => (
                    <span key={t} className="bg-ink-wash/40 px-2 py-0.5 font-mono text-[0.7rem] text-ink-charcoal">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {pub.geography && pub.geography.length > 0 && (
              <div>
                <h4 className="font-mono text-[0.7rem] uppercase tracking-wider text-gray font-bold mb-2">Geografi / Lokasi</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pub.geography.map((g) => (
                    <span key={g} className="bg-ink-wash/40 px-2 py-0.5 font-mono text-[0.7rem] text-ink-charcoal">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 10. References / Related Content */}
          {((pub.relatedArticleIds && pub.relatedArticleIds.length > 0) || relatedSources.length > 0) && (
            <section className="mb-6">
              <h2 className="font-mono text-[0.7rem] uppercase tracking-wider font-bold text-gray mb-4">Terkait di NaLI</h2>
              <ul className="space-y-3">
                {(pub.relatedArticleIds ?? []).map((id) => (
                  <li key={id} className="font-mono text-xs">
                    <span className="text-gray uppercase tracking-widest text-[0.7rem] font-bold mr-2">Artikel:</span>
                    <Link href={`/articles/${id}`} className="link-teal font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
                      {id}
                    </Link>
                  </li>
                ))}
                {relatedSources.map((s) => (
                  <li key={s.slug} className="font-mono text-xs">
                    <span className="text-gray uppercase tracking-widest text-[0.7rem] font-bold mr-2">Sumber:</span>
                    <Link href={`/arsip-sumber/${s.slug}`} className="link-teal font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Footer disclaimer */}
          <p className="border-t border-dashed border-ink/40 pt-6 font-mono text-[0.7rem] leading-relaxed text-gray">
            Entri ini adalah katalog publikasi eksternal. Sinopsis ditulis NaLI sebagai ringkasan; naskah asli tetap
            milik penerbitnya dan dibaca di sumber aslinya.
          </p>
        </div>
      </div>
    </article>
  );
}

