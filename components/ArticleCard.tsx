import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function ArticleCard({
  article,
  index,
}: {
  article: ArticleMeta;
  index?: number;
}) {
  const refNo = `NL-${article.slug.slice(0, 8).toUpperCase()}`;

  return (
    <article className="group relative flex flex-col border border-dashed border-ink/70 bg-paper p-5 transition-colors hover:bg-ink-wash interactive-link">
      {/* Header section */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-ink/30 pb-3 font-mono text-[0.64rem] uppercase tracking-wider">
        <span className="text-ink-deep font-semibold">
          REF NO. {refNo}
        </span>
        <span className="text-ink/65 bg-ink-wash/30 px-2 py-0.5 border border-dashed border-ink/30">
          {CATEGORY_LABEL[article.category]}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-lg font-bold uppercase leading-snug tracking-[0.01em] text-ink group-hover:text-ink-deep">
        <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>

      {/* Summary Body */}
      <p className="mt-3 line-clamp-3 flex-1 font-mono text-[0.74rem] leading-relaxed text-gray">
        {article.summary || article.subtitle || "Rangkuman data belum tersedia."}
      </p>

      {/* Internal divider */}
      <div className="my-4 border-t border-dashed border-ink/20" />

      {/* Bottom metadata strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[0.66rem] font-mono uppercase">
        <div className="flex items-center gap-2 text-ink/60">
          <time dateTime={article.date}>
            {formatDate(article.date)}
          </time>
          <span>•</span>
          <span>{article.readingMinutes} MNT</span>
          {article.sourceIds && article.sourceIds.length > 0 && (
            <>
              <span>•</span>
              <span>{article.sourceIds.length} SUMBER</span>
            </>
          )}
        </div>
        <ConfidenceBadge confidence={article.confidence} size="sm" />
      </div>

      {/* CTA Line with arrow motion */}
      <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/30 pt-3 text-[0.68rem] font-mono uppercase tracking-wider text-ink-deep font-semibold">
        <span>Periksa Data</span>
        <span className="link-arrow">→</span>
      </div>
    </article>
  );
}
