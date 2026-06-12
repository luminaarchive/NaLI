import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { MdxBody } from "@/components/MdxBody";
import { SourceList } from "@/components/SourceList";
import { ArticleCard } from "@/components/ArticleCard";
import { CATEGORY_LABEL } from "@/lib/types";

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
  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: `${article.title} | NaLI by NatIve`,
      description,
      type: "article",
      publishedTime: article.date,
      authors: ["Ansyahri Darma Tri Jati"],
      tags: article.tags,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article);

  return (
    <article>
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
            <span aria-hidden>·</span>
            <span>{article.readingMinutes} menit baca</span>
            <span aria-hidden>·</span>
            <span>{CATEGORY_LABEL[article.category]}</span>
          </div>
        </div>
      </header>

      {/* cover image (DB-backed posts) */}
      {article.coverImage && (
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
      <div className="container-read py-12 sm:py-16">
        <MdxBody source={article.content} />

        <SourceList sources={article.sources} />

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
