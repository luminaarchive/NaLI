import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/content";
import { getSeries } from "@/lib/series";
import { formatDate } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { MdxBody } from "@/components/MdxBody";
import { SourceList } from "@/components/SourceList";
import { ArticleCard } from "@/components/ArticleCard";
import { CATEGORY_LABEL, CLAIM_STATUS_LABEL, type ClaimStatus } from "@/lib/types";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Artikel tidak ditemukan" };
  const description = article.summary || article.subtitle;
  const metadataImage =
    article.images?.find((image) => image.src)?.src ??
    article.diagrams?.find((diagram) => diagram.src)?.src ??
    article.coverImage;
  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: `${article.title} | NaLI by NatIve`,
      description,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: ["NaLI by NatIve"],
      tags: article.tags,
      images: metadataImage ? [metadataImage] : undefined,
    },
  };
}

const CLAIM_STATUS_COLOR: Record<ClaimStatus, string> = {
  "terverifikasi kuat": "text-ink-deep",
  "didukung sumber": "text-ink",
  terbatas: "text-[#9c6a08] dark:text-[#e8c277]",
  diperdebatkan: "text-[#9c3c08] dark:text-[#f0a36e]",
  "belum cukup bukti": "text-[#a31515] dark:text-[#f09090]",
};

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);
  const series = (article.series ?? [])
    .map((slug) => getSeries(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const displayedImages = (article.images ?? []).filter((image) => Boolean(image.src));
  const displayedDiagrams = (article.diagrams ?? []).filter((diagram) => Boolean(diagram.src));
  const metadataImage =
    displayedImages[0]?.src ?? displayedDiagrams[0]?.src ?? article.coverImage;

  // Build the JSON-LD for the article.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary || article.subtitle,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    author: { "@type": "Organization", name: "NaLI by NatIve" },
    publisher: { "@type": "Organization", name: "NaLI by NatIve" },
    ...(metadataImage ? { image: metadataImage } : {}),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* header */}
      <header className="border-b border-dashed border-ink/40">
        <div className="container-read py-12 sm:py-16">
          <Link
            href="/articles"
            className="label text-gray transition-colors hover:text-ink-deep"
          >
            ← Semua artikel
          </Link>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <CategoryBadge category={article.category} />
            <span className="text-gray-light" aria-hidden>
              ·
            </span>
            <ConfidenceBadge confidence={article.confidence} />
          </div>

          <h1 className="mt-5 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-ink-black sm:text-5xl">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mt-4 font-display text-xl leading-snug text-gray sm:text-2xl">
              {article.subtitle}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            {article.updated && article.updated !== article.date && (
              <>
                <span aria-hidden>·</span>
                <span>diperbarui {formatDate(article.updated)}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} menit baca</span>
            <span aria-hidden>·</span>
            <span>{CATEGORY_LABEL[article.category]}</span>
          </div>

          {series.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="label text-ink/70">Seri</span>
              {series.map((s) => (
                <Link
                  key={s.slug}
                  href="/seri"
                  className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.68rem] text-ink transition-colors hover:bg-ink-wash"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* evidence-basis banner: honesty about how the piece is sourced */}
      <div className="container-read pt-8">
        <div className="border border-dashed border-ink/60 bg-ink-wash/40 p-5">
          <p className="font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
            <span className="font-semibold text-ink-deep">Basis tulisan:</span>{" "}
            {article.evidenceBasis
              ? `${article.evidenceBasis}, arsip, dan observasi pihak ketiga. `
              : "sumber terbuka, arsip, dan observasi pihak ketiga. "}
            {article.firstPartyFieldwork
              ? "Artikel ini memuat bukti lapangan pertama yang ditampilkan di bawah."
              : "NaLI tidak mengklaim observasi lapangan pribadi untuk artikel ini."}
          </p>
        </div>
      </div>

      {/* CATEGORY 1: licensed images actually displayed */}
      {displayedImages.length > 0 && (
        <div className="container-read pt-10">
          <section className="border border-dashed border-ink/60 bg-paper p-5" aria-labelledby="gambar-artikel">
            <h2 id="gambar-artikel" className="label text-ink/70">
              Gambar artikel
            </h2>
            <div className="mt-5 space-y-7">
              {displayedImages.map((img, i) => (
                <figure key={`${img.src}-${i}`} data-article-visual="displayed-image">
                  <div className="overflow-hidden border border-dashed border-ink/45 bg-ink-wash/30">
                    <Image
                      src={img.src ?? ""}
                      alt={img.alt}
                      width={1200}
                      height={675}
                      className="h-auto w-full object-contain"
                      priority={i === 0}
                    />
                  </div>
                  <figcaption data-visual-credit="true" className="mt-3">
                    <p className="font-mono text-[0.76rem] leading-relaxed text-gray">
                      <span className="text-ink-charcoal">{img.caption}</span>
                    </p>
                    <p className="mt-2 font-mono text-[0.68rem] leading-relaxed text-ink/60">
                      {img.attribution}.{" "}
                      <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                        Sumber
                      </a>
                      {img.licenseUrl ? (
                        <>
                          {", "}
                          <a href={img.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                            {img.license}
                          </a>
                        </>
                      ) : (
                        <>{`, ${img.license}`}</>
                      )}
                      {img.checkedAt && <span className="text-ink/40">, dicek {img.checkedAt}</span>}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* cover image fallback for DB-backed posts without structured image records */}
      {displayedImages.length === 0 && displayedDiagrams.length === 0 && article.coverImage && (
        <div className="container-read pt-10">
          <div className="overflow-hidden border border-dashed border-ink/60">
            <Image
              src={article.coverImage}
              alt={article.title}
              width={1200}
              height={675}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* internal explanatory diagrams, maps, or timelines */}
      {displayedDiagrams.length > 0 && (
        <div className="container-read pt-10">
          <section className="border border-dashed border-ink/60 bg-paper p-5" aria-labelledby="diagram-penjelas">
            <h2 id="diagram-penjelas" className="label text-ink/70">
              Diagram penjelas
            </h2>
            <div className="mt-5 space-y-6">
              {displayedDiagrams.map((diagram, i) => (
                <figure
                  key={`${diagram.title}-${i}`}
                  data-article-visual="displayed-diagram"
                  className="border-t border-dashed border-ink/35 pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="overflow-hidden border border-dashed border-ink/45 bg-ink-wash/30">
                    <Image
                      src={diagram.src ?? ""}
                      alt={diagram.alt}
                      width={1200}
                      height={675}
                      className="h-auto w-full object-contain"
                      priority={displayedImages.length === 0 && i === 0}
                    />
                  </div>
                  <figcaption data-visual-credit="true" className="mt-3">
                    <p className="font-display text-lg font-semibold uppercase leading-tight text-ink">
                      {diagram.title}
                    </p>
                    <p className="mt-2 font-mono text-[0.76rem] leading-relaxed text-gray">
                      {diagram.caption}
                    </p>
                  </figcaption>
                  <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                    {diagram.items.map((item, itemIndex) => (
                      <li
                        key={`${item}-${itemIndex}`}
                        className="border border-dashed border-ink/35 bg-ink-wash/35 p-3 font-mono text-[0.74rem] leading-relaxed text-ink-charcoal"
                      >
                        <span className="mr-2 text-ink/45">{String(itemIndex + 1).padStart(2, "0")}</span>
                        {item}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 font-mono text-[0.68rem] leading-relaxed text-ink/60">
                    {diagram.attribution}.{" "}
                    <a href={diagram.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                      Sumber data
                    </a>
                    {diagram.licenseUrl ? (
                      <>
                        {", "}
                        <a href={diagram.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                          {diagram.license}
                        </a>
                      </>
                    ) : (
                      <>{`, ${diagram.license}`}</>
                    )}
                    {diagram.checkedAt && <span className="text-ink/40">, dicek {diagram.checkedAt}</span>}
                  </p>
                </figure>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* body */}
      <div className="container-read py-12 sm:py-16">
        <MdxBody source={article.content} />

        {/* Claim Ledger */}
        {article.claimLedger && article.claimLedger.length > 0 && (
          <section className="mt-14 border-t border-dashed border-ink/70 pt-6" aria-labelledby="claim-ledger">
            <h2 id="claim-ledger" className="font-display text-xl font-bold uppercase text-ink">
              Claim Ledger
            </h2>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Tiap klaim utama dipisahkan dan diberi status bukti sendiri.
            </p>
            <div className="mt-5 overflow-hidden border border-ink/50">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-ink-wash">
                    {["Klaim", "Status", "Sumber", "Catatan"].map((h) => (
                      <th
                        key={h}
                        className="border border-ink/40 px-3 py-2.5 font-mono text-[0.64rem] uppercase tracking-label text-ink-deep"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {article.claimLedger.map((c, i) => (
                    <tr key={i} className="align-top odd:bg-ink-wash/30">
                      <td className="border border-ink/30 px-3 py-2.5 text-[0.82rem] leading-snug text-ink-charcoal">
                        {c.claim}
                      </td>
                      <td className={`border border-ink/30 px-3 py-2.5 font-mono text-[0.7rem] font-semibold uppercase ${CLAIM_STATUS_COLOR[c.status]}`}>
                        {CLAIM_STATUS_LABEL[c.status]}
                      </td>
                      <td className="border border-ink/30 px-3 py-2.5 font-mono text-[0.72rem] text-gray">
                        {c.sources ?? "Tidak dicatat"}
                      </td>
                      <td className="border border-ink/30 px-3 py-2.5 font-mono text-[0.72rem] leading-snug text-gray">
                        {c.limitation ?? c.explanation ?? "Catatan belum tersedia"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Limitations */}
        {article.limitations && article.limitations.length > 0 && (
          <section className="mt-12 border-l-2 border-dashed border-ink/50 pl-5" aria-labelledby="batasan">
            <h2 id="batasan" className="font-display text-lg font-bold uppercase text-ink">
              Batasan & hal yang belum pasti
            </h2>
            <ul className="mt-3 space-y-2">
              {article.limitations.map((l) => (
                <li key={l} className="font-mono text-[0.82rem] leading-relaxed text-gray">
                  {l}
                </li>
              ))}
            </ul>
          </section>
        )}

        <SourceList sources={article.sources} />

        {/* CATEGORY 1: licensed images actually displayed */}
        {article.images && article.images.length > 0 && (
          <section className="mt-12 border-t border-dashed border-ink/40 pt-6" aria-labelledby="kredit-gambar">
            <h2 id="kredit-gambar" className="label text-ink/70">
              Foto berlisensi yang ditampilkan
            </h2>
            <ul className="mt-4 space-y-3">
              {article.images.map((img, i) => (
                <li key={i} className="font-mono text-[0.76rem] leading-relaxed text-gray">
                  <span className="text-ink-charcoal">{img.title ?? img.caption}</span>,{" "}
                  {img.attribution}.{" "}
                  <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                    Sumber
                  </a>
                  {img.licenseUrl ? (
                    <>
                      {", "}
                      <a href={img.licenseUrl} target="_blank" rel="noopener noreferrer" className="link-teal">
                        {img.license}
                      </a>
                    </>
                  ) : (
                    <>, {img.license}</>
                  )}
                  {img.checkedAt && <span className="text-ink/40">, dicek {img.checkedAt}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CATEGORY 2: external visual evidence, linked only and never displayed */}
        {article.externalVisuals && article.externalVisuals.length > 0 && (
          <section className="mt-10 border-t border-dashed border-ink/40 pt-6" aria-labelledby="bukti-visual">
            <h2 id="bukti-visual" className="label text-ink/70">
              Bukti visual eksternal yang hanya ditautkan
            </h2>
            <p className="mt-2 font-mono text-[0.74rem] leading-relaxed text-gray">
              Foto/video nyata yang relevan tetapi lisensinya belum jelas. NaLI{" "}
              <strong>tidak menampilkan ulang</strong> gambar ini. Tautan diarahkan ke
              sumber aslinya.
            </p>
            <ul className="mt-4 space-y-4">
              {article.externalVisuals.map((ev, i) => (
                <li key={i} className="border border-dashed border-ink/40 p-4">
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-teal font-mono text-[0.82rem] font-semibold"
                  >
                    {ev.title} ↗
                  </a>
                  <p className="mt-1.5 font-mono text-[0.74rem] leading-relaxed text-gray">
                    {ev.shows}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.66rem] uppercase tracking-wider text-ink/55">
                    {ev.platform && <span>Sumber: {ev.platform}</span>}
                    {ev.creator && <span>{ev.creator}</span>}
                    <span>dicek {ev.checkedAt}</span>
                  </div>
                  <p className="mt-2 font-mono text-[0.7rem] italic leading-relaxed text-ink/60">
                    {ev.limitation}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(!article.images || article.images.length === 0) &&
          (!article.diagrams || article.diagrams.length === 0) &&
          (!article.externalVisuals || article.externalVisuals.length === 0) &&
          article.visualEvidenceNote && (
            <section className="mt-10 border-t border-dashed border-ink/40 pt-6" aria-labelledby="catatan-visual">
              <h2 id="catatan-visual" className="label text-ink/70">
                Catatan bukti visual
              </h2>
              <p className="mt-3 border border-dashed border-ink/40 p-4 font-mono text-[0.74rem] leading-relaxed text-gray">
                {article.visualEvidenceNote}
              </p>
            </section>
          )}

        {article.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t border-dashed border-ink/40 pt-6">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="border border-dashed border-ink/50 bg-paper px-3 py-1 font-mono text-xs text-ink"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-dashed border-ink/40 bg-paper">
          <div className="container-editorial py-14">
            <p className="label">Baca juga</p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase text-ink">
              Dari kategori {CATEGORY_LABEL[article.category]}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <ArticleCard key={r.slug} article={r} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
