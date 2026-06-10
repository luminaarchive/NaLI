import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { CategoryBadge } from "./CategoryBadge";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function ArticleCard({
  article,
  index,
}: {
  article: ArticleMeta;
  index?: number;
}) {
  return (
    <article className="group relative flex flex-col border-t border-rule pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {typeof index === "number" && (
            <span className="font-mono text-xs text-gray-light">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <CategoryBadge category={article.category} />
        </div>
        <ConfidenceBadge confidence={article.confidence} size="sm" />
      </div>

      <h3 className="font-display text-xl leading-snug text-ink-black transition-colors group-hover:text-teal-dark sm:text-2xl">
        <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray">
        {article.summary || article.subtitle}
      </p>

      <div className="mt-4 flex items-center gap-3 text-xs text-gray-light">
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} mnt baca</span>
      </div>
    </article>
  );
}
