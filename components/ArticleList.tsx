"use client";

import { useMemo, useState } from "react";
import type { ArticleMeta, Category } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";

const CATEGORIES: Category[] = ["alam", "sejarah", "investigasi", "catatan-lapangan"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-dashed border-ink/60 bg-paper text-ink hover:bg-ink-wash"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function ArticleList({
  articles,
  tags,
}: {
  articles: ArticleMeta[];
  tags: string[];
}) {
  const [category, setCategory] = useState<Category | "all">("all");
  const [tag, setTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const okCat = category === "all" || a.category === category;
      const okTag = !tag || a.tags.includes(tag);
      return okCat && okTag;
    });
  }, [articles, category, tag]);

  return (
    <div className="container-editorial py-12">
      {/* filter board wrapper */}
      <div className="border border-dashed border-ink/40 bg-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-ink/20 pb-3 mb-4 font-mono text-[0.66rem] uppercase tracking-wider text-ink/75">
          <div className="flex items-center gap-2">
            <span className="bg-ink-wash/30 border border-dashed border-ink/35 px-2 py-0.5 font-semibold text-ink">SARINGAN</span>
            <span>{"//"}</span>
            <span>DATA FILTER</span>
          </div>
          <span>TOTAL: {articles.length} ENTRI</span>
        </div>

        {/* category filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.68rem] uppercase tracking-wider text-ink/65 mr-2 w-16">Kategori:</span>
          <Chip active={category === "all"} onClick={() => setCategory("all")}>
            Semua
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
              {CATEGORY_LABEL[c]}
            </Chip>
          ))}
        </div>

        {/* tag filter */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed border-ink/10 pt-3">
            <span className="font-mono text-[0.68rem] uppercase tracking-wider text-ink/65 mr-2 w-16">Tag:</span>
            {tags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                #{t}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <p className="mt-8 font-mono text-xs uppercase tracking-wider text-ink/70">
        Menampilkan {filtered.length} dari {articles.length} artikel
      </p>

      {filtered.length === 0 ? (
        <p className="mt-12 text-gray font-mono text-sm">
          Belum ada artikel yang cocok dengan filter ini.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, i) => (
            <ArticleCard key={article.slug} article={article} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
