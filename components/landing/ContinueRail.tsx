"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { CATEGORY_LABEL, type Category } from "@/lib/types";
import {
  HISTORY_EVENT,
  getRecent,
  readSlugs,
  topCategory,
  type HistoryItem,
} from "@/lib/reading-history";

export interface RailArticle {
  slug: string;
  title: string;
  category: string;
  subtitle: string;
}

function catLabel(cat: string): string {
  return CATEGORY_LABEL[cat as Category] ?? cat;
}

/**
 * Login-free "continue where you left off" rail. Reads the local history after
 * mount (renders nothing on the server, so no hydration drift and no flash for
 * first-time visitors). Shows recent reads plus gentle same-topic suggestions.
 */
export function ContinueRail({ pool }: { pool: RailArticle[] }) {
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [topCat, setTopCat] = useState<string | null>(null);
  const [read, setRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => {
      setRecent(getRecent(4));
      setTopCat(topCategory());
      setRead(readSlugs());
    };
    sync();
    window.addEventListener(HISTORY_EVENT, sync);
    return () => window.removeEventListener(HISTORY_EVENT, sync);
  }, []);

  if (recent.length === 0) return null;

  const suggestions = topCat
    ? pool.filter((a) => a.category === topCat && !read.has(a.slug)).slice(0, 4)
    : [];

  return (
    <section className="relative z-20 w-full border-b border-dashed border-ink/30 bg-paper py-12">
      <div className="mx-auto max-w-[1240px] px-5">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-deep">
          <Clock3 size={13} strokeWidth={1.8} aria-hidden />
          Lanjutkan membaca
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((h) => (
            <li key={h.slug}>
              <Link
                href={`/articles/${h.slug}`}
                className="group flex h-full flex-col border border-dashed border-ink/50 bg-paper p-4 transition-colors hover:bg-ink-wash"
              >
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-gray">
                  {catLabel(h.category)}
                </span>
                <span className="mt-2 line-clamp-2 font-display text-sm font-bold uppercase leading-snug text-ink group-hover:underline group-hover:underline-offset-4">
                  {h.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {suggestions.length > 0 ? (
          <>
            <p className="mt-9 font-mono text-[0.72rem] leading-relaxed text-gray">
              Karena kamu sering membaca{" "}
              <span className="text-ink-deep">{catLabel(topCat as string)}</span>:
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suggestions.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="group flex h-full flex-col border border-dashed border-ink/50 bg-paper p-4 transition-colors hover:bg-ink-wash"
                  >
                    <span className="line-clamp-2 font-display text-sm font-bold uppercase leading-snug text-ink group-hover:underline group-hover:underline-offset-4">
                      {a.title}
                    </span>
                    {a.subtitle ? (
                      <span className="mt-2 line-clamp-2 font-mono text-[0.72rem] leading-relaxed text-gray">
                        {a.subtitle}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}
