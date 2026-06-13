import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicationBySlug, getPublicationSlugs } from "@/lib/jurnal";
import { getSourceBySlug } from "@/lib/content";
import { ACCESS_TYPE_LABEL, PUBLICATION_TYPE_LABEL } from "@/lib/types";
import { SITE } from "@/lib/site";
import { renderItalicTitle, stripHtmlTags } from "@/lib/jurnal-format";

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

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-dashed border-ink/20 py-2.5 last:border-0 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="font-mono text-[0.7rem] uppercase tracking-wider text-ink/60">{label}</dt>
      <dd className="mt-0.5 text-xs font-semibold text-ink-charcoal sm:mt-0 break-all">{value}</dd>
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
    name: stripHtmlTags(pub.title),
    description: pub.synopsis,
    url: pub.sourceUrl,
    ...(pub.doi ? { sameAs: `https://doi.org/${pub.doi}` } : {}),
    publisher: { "@type": "Organization", name: pub.publisherOrInstitution },
    isPartOf: { "@type": "CreativeWorkSeries", name: "Jurnal NaLI", url: `${SITE.url}/jurnal` },
  };

  return (
    <article className="bg-paper min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="container-editorial pt-8 pb-4">
        <Link href="/jurnal" className="font-mono text-xs uppercase tracking-wider text-ink/70 hover:text-ink hover:underline">
          ← Katalog jurnal
        </Link>
      </div>

      <div className="border-b border-dashed border-ink/30 bg-ink-wash/10 py-10 sm:py-14">
        <div className="container-editorial grid gap-8 md:grid-cols-[240px_1fr] items-start">
          
          <div className="mx-auto w-full max-w-[240px]">
            <figure data-jurnal-cover="true" className="w-full">
              {coverImage ? (
                <div className="flex justify-center overflow-hidden border border-dashed border-ink/40 bg-paper p-4 shadow-sm aspect-[3/4] relative">
                  <Image
                    src={coverImage}
                    alt={stripHtmlTags(pub.cover.alt)}
                    fill
                    sizes="240px"
                    className="object-contain p-2"
                    priority
                  />
                </div>
              ) : (
                <div className="border border-dashed border-ink/40 bg-ink-wash/30 p-5 aspect-[3/4] flex flex-col justify-center text-center" data-jurnal-cover-fallback="true">
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink/55">Dokumen</span>
                  <p className="mt-2 font-display text-sm font-semibold leading-snug text-ink-black line-clamp-4">{stripHtmlTags(pub.title)}</p>
                  <p className="mt-3 font-mono text-[0.6rem] text-ink/50 leading-relaxed">
                    Cover asli tidak ditampilkan karena lisensi belum jelas.
                  </p>
                </div>
              )}
              <figcaption className="mt-2.5" data-jurnal-cover-credit="true">
                <p className="font-mono text-[0.62rem] leading-relaxed text-ink/75 line-clamp-2">{pub.cover.caption}</p>
                <p className="mt-0.5 font-mono text-[0.58rem] leading-relaxed text-ink/50">
                  {pub.cover.creator ? `${pub.cover.creator}. ` : ""}
                  {pub.cover.publisherOrInstitution}.{" "}
                  <a href={pub.cover.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-deep" data-jurnal-cover-source="true">
                    Sumber visual
                  </a>
                  {pub.cover.displayBasis ? ` · ${pub.cover.displayBasis}` : ""}
                </p>
              </figcaption>
            </figure>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="border border-dashed border-ink/50 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-ink font-semibold">
                {PUBLICATION_TYPE_LABEL[pub.publicationType]}
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-widest font-bold text-ink-deep">
                {ACCESS_TYPE_LABEL[pub.accessType]}
              </span>
              {pub.year && (
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-ink/50">{pub.year}</span>
              )}
            </div>

            <h1 className="mt-4 font-display text-2xl font-bold leading-snug tracking-tight text-ink-black sm:text-3xl lg:text-4xl">
              {renderItalicTitle(pub.title)}
            </h1>
            
            {pub.originalTitle && pub.originalTitle !== pub.title && (
              <p className="mt-2 font-mono text-[0.78rem] text-ink/60 leading-relaxed">
                <span className="uppercase tracking-wider text-[0.62rem] text-ink/40 font-bold block">Judul Asli:</span>
                {renderItalicTitle(pub.originalTitle)}
              </p>
            )}

            {pub.authors && pub.authors.length > 0 && (
              <p className="mt-3 font-mono text-xs text-ink/80">
                <span className="text-ink/55 font-bold uppercase tracking-wider text-[0.62rem] block">Penulis:</span>
                {pub.authors.join(", ")}
              </p>
            )}

            <p className="mt-3 font-mono text-xs text-ink/80">
              <span className="text-ink/55 font-bold uppercase tracking-wider text-[0.62rem] block">Penerbit / Jurnal:</span>
              {pub.journalOrCollection ? `${pub.journalOrCollection} · ` : ""}{pub.publisherOrInstitution}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {hasPdf ? (
                <a
                  href={pub.download.primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-ink bg-ink px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-paper transition-all hover:bg-ink-deep hover:scale-[1.02]"
                  data-jurnal-download-primary="pdf"
                >
                  Download PDF <span aria-hidden>↓</span>
                </a>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 border border-gray-light bg-gray-light px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-gray cursor-not-allowed"
                >
                  PDF Tidak Tersedia
                </button>
              )}
              
              {pub.doi && (
                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink-wash"
                >
                  Buka DOI <span aria-hidden>↗</span>
                </a>
              )}
              
              <a
                href={pub.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink-wash"
              >
                Halaman Penerbit <span aria-hidden>↗</span>
              </a>

              <a
                href={pub.download.metadataUrl}
                download={`nali-jurnal-${pub.slug}.txt`}
                className="inline-flex items-center gap-2 border border-dashed border-ink/60 px-4 py-2.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/80 transition-colors hover:bg-ink-wash"
                data-jurnal-metadata="true"
              >
                Metadata NaLI <span aria-hidden>↓</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      <div className="container-editorial py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] items-start">
          
          <div className="space-y-8">
            <section className="border-l-2 border-dashed border-ink/40 pl-5" data-jurnal-synopsis="true">
              <h2 className="label text-ink/75 font-bold uppercase tracking-wider text-xs">Sinopsis</h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-charcoal whitespace-pre-wrap">{pub.synopsis}</p>
            </section>

            <section className="border-l-2 border-dashed border-ink/40 pl-5">
              <h2 className="label text-ink/75 font-bold uppercase tracking-wider text-xs">Kenapa penting</h2>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-charcoal whitespace-pre-wrap">{pub.whyItMatters}</p>
            </section>

            {((pub.relatedArticleIds && pub.relatedArticleIds.length > 0) || relatedSources.length > 0) && (
              <section className="border-t border-dashed border-ink/30 pt-8">
                <h2 className="label text-ink/70 font-bold uppercase tracking-wider text-xs mb-4">Terkait di NaLI</h2>
                <ul className="space-y-3">
                  {(pub.relatedArticleIds ?? []).map((id) => (
                    <li key={id} className="font-mono text-xs">
                      <span className="text-ink/50 uppercase tracking-widest text-[0.6rem] font-bold mr-2">Artikel:</span>
                      <Link href={`/articles/${id}`} className="link-teal font-semibold">
                        {id}
                      </Link>
                    </li>
                  ))}
                  {relatedSources.map((s) => (
                    <li key={s.slug} className="font-mono text-xs">
                      <span className="text-ink/50 uppercase tracking-widest text-[0.6rem] font-bold mr-2">Sumber:</span>
                      <Link href={`/arsip-sumber/${s.slug}`} className="link-teal font-semibold">
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="border border-dashed border-ink/50 bg-ink-wash/30 p-5 shadow-sm">
            <h3 className="label text-ink/80 font-bold uppercase tracking-wider text-xs border-b border-dashed border-ink/30 pb-2 mb-3">Detail Publikasi</h3>
            <dl className="space-y-1">
              <Field label="Jenis" value={PUBLICATION_TYPE_LABEL[pub.publicationType]} />
              {pub.journalOrCollection && <Field label="Koleksi / Jurnal" value={pub.journalOrCollection} />}
              <Field label="Penerbit" value={pub.publisherOrInstitution} />
              {pub.authors && pub.authors.length > 0 && <Field label="Penulis" value={pub.authors.join("; ")} />}
              {(pub.year || pub.publicationDate) && (
                <Field label="Tanggal / Tahun" value={pub.publicationDate ?? pub.year} />
              )}
              <Field label="Akses" value={ACCESS_TYPE_LABEL[pub.accessType]} />
              <Field label="Bahasa" value={pub.language.toUpperCase()} />
              
              {pub.topics && pub.topics.length > 0 && (
                <Field label="Topik" value={pub.topics.join(" · ")} />
              )}
              
              {pub.geography && pub.geography.length > 0 && (
                <Field label="Geografi" value={pub.geography.join(" · ")} />
              )}
              
              {pub.doi && (
                <Field
                  label="DOI"
                  value={
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="link-teal break-all underline">
                      {pub.doi}
                    </a>
                  }
                />
              )}
              <Field label="Dicek" value={pub.checkedAt} />
            </dl>

            {pub.limitations && pub.limitations.length > 0 && (
              <div className="border-t border-dashed border-ink/30 mt-4 pt-4">
                <h4 className="font-mono text-[0.66rem] uppercase tracking-wider text-ink/60 font-bold mb-2">Batasan & Catatan</h4>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  {pub.limitations.map((l) => (
                    <li key={l} className="font-mono text-[0.66rem] leading-normal text-ink/70">
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

        </div>

        <p className="mt-12 border-t border-dashed border-ink/30 pt-6 font-mono text-[0.72rem] leading-relaxed text-gray">
          Entri ini adalah katalog publikasi eksternal. Sinopsis ditulis NaLI sebagai ringkasan; naskah asli tetap
          milik penerbitnya dan dibaca di sumber aslinya.
        </p>
      </div>
    </article>
  );
}

