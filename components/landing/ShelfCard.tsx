import Link from "next/link";
import Image from "next/image";
import type { ArticleMeta } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

function cover(a: ArticleMeta): string | undefined {
  return a.coverImage ?? a.images?.[0]?.src;
}

/**
 * Compact card for the landing shelves. The honest "hook" is the article subtitle
 * shown as a kicker above the real title; the confidence badge always stays.
 */
export function ShelfCard({ article }: { article: ArticleMeta }) {
  const img = cover(article);
  return (
    <article className="group relative flex w-[80vw] max-w-[300px] shrink-0 snap-start flex-col border border-dashed border-ink/60 bg-paper transition-colors hover:bg-ink-wash sm:w-[300px]">
      {img ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-dashed border-ink/40">
          <Image
            src={img}
            alt=""
            fill
            sizes="300px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* soft blur-fade so the colour photo melts into the card */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper/85 to-transparent backdrop-blur-[1px] [mask-image:linear-gradient(to_top,black,transparent)]" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[1.02rem] font-bold uppercase leading-snug tracking-[0.01em] text-ink group-hover:underline group-hover:underline-offset-4">
          <Link href={`/articles/${article.slug}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h3>

        {article.subtitle ? (
          <p className="mt-2 line-clamp-2 font-mono text-[0.78rem] leading-relaxed text-ink-charcoal">
            {article.subtitle}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-gray">
          <span>
            {CATEGORY_LABEL[article.category]} · {article.readingMinutes} mnt
          </span>
          <ConfidenceBadge confidence={article.confidence} size="sm" />
        </div>
      </div>
    </article>
  );
}
