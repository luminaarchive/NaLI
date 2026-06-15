import Link from "next/link";
import type { ArticleMeta } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { formatDate, articleDepth, DEPTH_LABEL } from "@/lib/format";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function ArticleCard({
  article,
  index,
}: {
  article: ArticleMeta;
  index?: number;
}) {
  return (
    <article className="group relative flex flex-col border border-dashed border-ink/70 bg-paper p-6 transition-colors hover:bg-ink-wash">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-gray">
          {typeof index === "number" ? `No. ${String(index + 1).padStart(3, "0")} · ` : ""}
          {CATEGORY_LABEL[article.category]}
        </span>
        <span className="flex shrink-0 items-center gap-2 font-mono text-[0.7rem] text-gray">
          <span className="border border-dashed border-ink/40 px-1 text-[0.6rem] uppercase tracking-[0.1em] text-ink/70">
            {DEPTH_LABEL[articleDepth(article.readingMinutes)]}
          </span>
          {article.readingMinutes} mnt
        </span>
      </div>

      <h3 className="font-display text-xl font-bold uppercase leading-snug tracking-[0.01em] text-ink group-hover:underline group-hover:underline-offset-4">
        <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>

      <p className="mt-3 line-clamp-3 flex-1 font-mono text-[0.78rem] leading-relaxed text-gray">
        {article.summary || article.subtitle}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-ink/40 pt-3">
        <time dateTime={article.date} className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">
          {formatDate(article.date)}
        </time>
        <ConfidenceBadge confidence={article.confidence} size="sm" />
      </div>
    </article>
  );
}
