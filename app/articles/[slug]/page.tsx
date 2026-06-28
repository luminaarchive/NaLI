import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getArticleBySlug,
  getAllArticles,
  getRelatedArticles,
  getContextualRelated,
  getAllSources,
  getSeriesNavigation,
} from "@/lib/content";
import { formatDate, articleDepth, DEPTH_LABEL } from "@/lib/format";
import { safeJsonLd } from "@/lib/http";
import { slugifyTag } from "@/lib/topics";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { MdxBody } from "@/components/MdxBody";
import { SourceList } from "@/components/SourceList";
import { SeriesNavigation } from "@/components/SeriesNavigation";
import { CitationModal } from "@/components/CitationModal";
import { ArticleCard } from "@/components/ArticleCard";
import { ReadingTracker } from "@/components/article/ReadingTracker";
import { BookmarkButton } from "@/components/article/BookmarkButton";
import { RabbitHole } from "@/components/article/RabbitHole";
import { ArticleTutor } from "@/components/article/ArticleTutor";
import { KnowledgeGenome } from "@/components/article/KnowledgeGenome";
import { QuickRead } from "@/components/article/QuickRead";
import { ReadingProgress } from "@/components/article/ReadingProgress";
import { ShareButton } from "@/components/ShareButton";
import { buildEntityIndex } from "@/lib/wikilinks";
import { getConfirmedContradictionsForArticle } from "@/lib/contradictions";
import { getAllCorrections } from "@/lib/corrections";
import { CATEGORY_LABEL, CLAIM_STATUS_LABEL, type ClaimStatus } from "@/lib/types";

/** Stable per-slug index so the "Coba sudut lain" pick is consistent per article. */
function slugHash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

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
  // Prefer a real content image; fall back to the dynamic OG route
  const contentImage =
    article.images?.find((image) => image.src)?.src ??
    article.diagrams?.find((diagram) => diagram.src)?.src ??
    article.coverImage;
  const ogImageUrl =
    contentImage ??
    `/api/og?${new URLSearchParams({
      title: article.title,
      category: article.category,
      date: article.date,
    }).toString()}`;
  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: `${article.title} | NaLI`,
      description,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: ["NaLI"],
      tags: article.tags,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImageUrl],
    },
  };
}

const CHANGE_TYPE_LABEL: Record<string, string> = {
  koreksi: "Koreksi",
  "pembaruan-data": "Pembaruan data",
  "tambahan-sumber": "Tambahan sumber",
  klarifikasi: "Klarifikasi",
};

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

  const contextualRelated = article.related?.length
    ? await getContextualRelated(article.related)
    : [];
  const related =
    contextualRelated.length > 0 ? [] : await getRelatedArticles(article);
  const depth = articleDepth(article.readingMinutes);
  const seriesNav = await getSeriesNavigation(article.slug);

  // "Coba sudut lain": prefer an open-question article from another angle, so the
  // foot of every piece offers a fresh, deterministic jump-off.
  const allArticles = await getAllArticles();
  const surprisePool = (() => {
    const open = allArticles.filter(
      (a) => a.slug !== article.slug && (a.confidence === "needs-verification" || a.confidence === "low"),
    );
    const cross = allArticles.filter((a) => a.slug !== article.slug && a.category !== article.category);
    const base = open.length > 0 ? open : cross.length > 0 ? cross : allArticles.filter((a) => a.slug !== article.slug);
    return base;
  })();
  const surprise =
    surprisePool.length > 0 ? surprisePool[slugHash(article.slug) % surprisePool.length] : undefined;

  // Wikipedia-style inline links across the body
  const entities = buildEntityIndex(allArticles);
  const selfHref = `/articles/${article.slug}`;

  // Confirmed cross-article contradictions touching this article (Step 2.1).
  const contradictions = await getConfirmedContradictionsForArticle(article.slug);
  const titleBySlug = new Map(allArticles.map((a) => [a.slug, a.title]));
  // Normalize each contradiction to "this article's claim" vs "the other side".
  const contradictionViews = contradictions.map((c) => {
    const selfIsA = c.claimAArticleSlug === article.slug;
    return {
      id: c.id,
      thisClaim: selfIsA ? c.claimAText : c.claimBText,
      otherClaim: selfIsA ? c.claimBText : c.claimAText,
      otherSlug: selfIsA ? c.claimBArticleSlug : c.claimAArticleSlug,
      otherTitle:
        titleBySlug.get(selfIsA ? c.claimBArticleSlug : c.claimAArticleSlug) ??
        (selfIsA ? c.claimBArticleSlug : c.claimAArticleSlug),
      rationale: c.llmRationale,
    };
  });

  // Living Articles (Step 2.2): unified evolution timeline = changelog + corrections.
  const corrections = getAllCorrections().filter((c) => c.artikelSlug === article.slug);
  const revisionCount = (article.changelog?.length ?? 0) + corrections.length;
  const supersededByTitle = article.supersededBy
    ? titleBySlug.get(article.supersededBy)
    : undefined;
  // Merge into one date-sorted list (newest first).
  const timeline = [
    ...(article.changelog ?? []).map((c) => ({
      kind: "changelog" as const,
      date: c.tanggal,
      tipe: c.tipe,
      deskripsi: c.deskripsi,
    })),
    ...corrections.map((c) => ({
      kind: "koreksi" as const,
      date: c.tanggalDiperbaiki,
      klaimLama: c.klaimLama,
      klaimBaru: c.klaimBaru,
      alasan: c.alasan,
      sumber: c.sumberKoreksi,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // resolve cited source IDs to archive entries for clickable Claim Ledger links
  const allSources = getAllSources();
  const citedSources = (article.sourceIds ?? [])
    .map((id) => allSources.find((s) => s.id === id || s.slug === id))
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
    author: { "@type": "Organization", name: "NaLI" },
    publisher: { "@type": "Organization", name: "NaLI" },
    ...(metadataImage ? { image: metadataImage } : {}),
  };

  return (
    <article>
      <ReadingProgress />
      <ReadingTracker slug={article.slug} title={article.title} category={article.category} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
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
            <span aria-hidden>·</span>
            <span
              className="border border-dashed border-ink/50 px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink"
              title={
                depth === "ringkasan"
                  ? "Pengantar singkat ke topik"
                  : depth === "mendalam"
                    ? "Analisis dengan banyak sumber"
                    : "Referensi lengkap dengan data dan debat ilmiah"
              }
            >
              {DEPTH_LABEL[depth]}
            </span>
          </div>

          {depth === "ringkasan" && (
            <p className="mt-4 border-l-2 border-dashed border-ink/50 pl-3 font-mono text-[0.72rem] leading-relaxed text-gray">
              Artikel ini adalah ringkasan. Versi yang lebih mendalam sedang disiapkan.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <CitationModal
              item={{ title: article.title, slug: article.slug, date: article.date, kind: "articles" }}
            />
            <BookmarkButton slug={article.slug} />
            <ShareButton
              path={`/articles/${article.slug}`}
              title={article.title}
              description={article.summary || article.subtitle}
              category={article.category}
              image={metadataImage}
            />
          </div>
        </div>
      </header>

      {/* Knowledge Genome: epistemic "nutrition label" at the top (Step 1.2).
          Subsumes the former "Basis tulisan" banner. */}
      <div className="container-read pt-8">
        <KnowledgeGenome
          confidence={article.confidence}
          claimLedger={article.claimLedger}
          evidenceBasis={article.evidenceBasis}
          firstPartyFieldwork={article.firstPartyFieldwork}
          sourcesCount={article.sources?.length ?? 0}
          limitationsCount={article.limitations?.length ?? 0}
          readingMinutes={article.readingMinutes}
          hasClaimLedgerAnchor={Boolean(article.claimLedger && article.claimLedger.length > 0)}
          hasLimitationsAnchor={Boolean(article.limitations && article.limitations.length > 0)}
          updated={article.updated}
          contradictionCount={contradictionViews.length}
          articleStatus={article.articleStatus}
          lastVerified={article.lastVerified}
          supersededBySlug={article.supersededBy}
          supersededByTitle={supersededByTitle}
          revisionCount={revisionCount}
        />
      </div>

      {/* quick read: 30-second entry into a long piece */}
      <div className="container-read pt-8">
        <QuickRead
          summary={article.summary}
          readingMinutes={article.readingMinutes}
          claimLedger={article.claimLedger}
        />
      </div>

      {/* series progress + next-article navigation (F4.2) */}
      {seriesNav.length > 0 && (
        <div className="container-read pt-8">
          <SeriesNavigation nav={seriesNav} />
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

      {/* body */}
      <div id="isi" className="container-read scroll-mt-24 py-12 sm:py-16">
        <MdxBody
          source={article.content}
          images={article.images}
          diagrams={article.diagrams}
          entities={entities}
          selfHref={selfHref}
        />

        {/* Claim Ledger (collapsible) */}
        {article.claimLedger && article.claimLedger.length > 0 && (
          <details open className="group mt-14 border-t border-dashed border-ink/70 pt-6" aria-labelledby="claim-ledger">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <h2 id="claim-ledger" className="font-display text-xl font-bold uppercase text-ink">
                Claim Ledger
              </h2>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-gray transition-transform group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </summary>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Tiap klaim utama dipisahkan dan diberi status bukti sendiri.
            </p>
            <div className="mt-5 overflow-x-auto border border-ink/50">
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

            {citedSources.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink/60">
                  Sumber yang dirujuk
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {citedSources.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/arsip-sumber/${s.slug}`}
                        className="inline-block border border-dashed border-ink/50 px-2.5 py-1 font-mono text-[0.7rem] text-ink transition-colors hover:bg-ink-wash"
                      >
                        {s.title} ↗
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </details>
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

        {/* Confirmed cross-article contradictions (Step 2.1). Only human-confirmed
            pairs reach here; empty = nothing rendered. */}
        {contradictionViews.length > 0 && (
          <section
            id="kontradiksi"
            className="mt-12 scroll-mt-24 border border-dashed border-[#d96a23]/60 bg-[#d96a23]/[0.05] p-5"
            aria-labelledby="kontradiksi-judul"
          >
            <h2
              id="kontradiksi-judul"
              className="font-display text-lg font-bold uppercase text-[#9c3c08] dark:text-[#f0a36e]"
            >
              Klaim yang diperdebatkan lintas tulisan
            </h2>
            <p className="mt-2 font-mono text-[0.76rem] leading-relaxed text-gray">
              Klaim di tulisan ini tampak bertentangan dengan klaim di tulisan NaLI lain.
              NaLI menampilkannya terbuka, bukan menyembunyikannya, dan menyerahkan penilaian
              kepada pembaca atas dasar sumber masing-masing.
            </p>
            <ul className="mt-5 space-y-5">
              {contradictionViews.map((c) => (
                <li key={c.id} className="border-l-2 border-dashed border-[#d96a23]/60 pl-4">
                  <p className="font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
                    <span className="font-semibold text-ink-deep">Di tulisan ini:</span>{" "}
                    {c.thisClaim}
                  </p>
                  <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
                    <span className="font-semibold text-[#9c3c08] dark:text-[#f0a36e]">
                      Berbeda dengan
                    </span>{" "}
                    <Link href={`/articles/${c.otherSlug}`} className="link-teal">
                      {c.otherTitle} ↗
                    </Link>
                    : {c.otherClaim}
                  </p>
                  {c.rationale && (
                    <p className="mt-2 font-mono text-[0.72rem] italic leading-relaxed text-gray">
                      {c.rationale}
                    </p>
                  )}
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
              <Link
                key={tag}
                href={`/topik/${slugifyTag(tag)}`}
                className="border border-dashed border-ink/50 bg-paper px-3 py-1 font-mono text-xs text-ink transition-colors hover:bg-ink-wash"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Riwayat & koreksi (Living Articles, Step 2.2): unified evolution
            timeline = changelog entries + this article's corrections. */}
        {timeline.length > 0 && (
          <details
            id="riwayat"
            open
            className="group mt-12 scroll-mt-24 border-t border-dashed border-ink/40 pt-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <h2 className="label text-ink/70">Riwayat &amp; koreksi artikel ini</h2>
              <span className="font-mono text-[0.7rem] text-gray transition-transform group-open:rotate-180" aria-hidden>
                ▾
              </span>
            </summary>
            <ol className="mt-4 space-y-4">
              {timeline.map((t, i) => (
                <li key={i} className="border-l-2 border-dashed border-ink/40 pl-4">
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-deep">
                    {formatDate(t.date)} ·{" "}
                    {t.kind === "changelog" ? CHANGE_TYPE_LABEL[t.tipe] : "Koreksi"}
                  </p>
                  {t.kind === "changelog" ? (
                    <p className="mt-1 font-mono text-[0.8rem] leading-relaxed text-gray">
                      {t.deskripsi}
                    </p>
                  ) : (
                    <div className="mt-1.5 space-y-1.5">
                      <p className="font-mono text-[0.78rem] leading-relaxed text-gray">
                        <span className="text-[#9c3c08] line-through dark:text-[#f0a36e]">
                          {t.klaimLama}
                        </span>{" "}
                        → <span className="text-ink-charcoal">{t.klaimBaru}</span>
                      </p>
                      <p className="font-mono text-[0.74rem] leading-relaxed text-gray">
                        {t.alasan}
                        {t.sumber && (
                          <>
                            {" "}
                            <span className="text-ink/60">({t.sumber})</span>
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>

      {/* contextual related (F3.2): explicit relevance per link */}
      {contextualRelated.length > 0 && (
        <section className="border-t border-dashed border-ink/40 bg-paper">
          <div className="container-editorial py-14">
            <p className="label">Lanjut menelusuri</p>
            <h2 className="mt-3 font-display text-2xl font-bold uppercase text-ink">
              Terhubung dengan tulisan ini
            </h2>
            <ul className="mt-8 space-y-4">
              {contextualRelated.map(({ article: r, relasi }) => (
                <li
                  key={r.slug}
                  className="border border-dashed border-ink/50 bg-paper p-5 transition-colors hover:bg-ink-wash"
                >
                  <Link href={`/articles/${r.slug}`} className="group block">
                    <span className="flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-gray">
                      {CATEGORY_LABEL[r.category]}
                      <span aria-hidden>·</span>
                      {r.readingMinutes} mnt
                    </span>
                    <span className="mt-2 block font-display text-lg font-bold uppercase leading-snug text-ink group-hover:underline group-hover:underline-offset-4">
                      {r.title}
                    </span>
                    <span className="mt-2 block font-mono text-[0.78rem] leading-relaxed text-gray">
                      {relasi}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* related (category fallback when no explicit contextual links) */}
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

      {/* rabbit-hole: never let the reader hit a dead end */}
      <RabbitHole surprise={surprise} />

      {/* Tanya NaLI: per-article RAG assistant (Bucket A, Step 1.1) */}
      <ArticleTutor
        slug={article.slug}
        title={article.title}
        contradictionCount={contradictionViews.length}
      />
    </article>
  );
}
