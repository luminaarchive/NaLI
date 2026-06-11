import { PageHeader } from "@/components/PageHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { getArticlesByCategory } from "@/lib/content";
import type { Category } from "@/lib/types";

export function CategoryView({
  category,
  index,
  title,
  description,
}: {
  category: Category;
  index: string;
  title: string;
  description: string;
}) {
  const articles = getArticlesByCategory(category);

  return (
    <>
      <PageHeader
        eyebrow="Pilar"
        index={index}
        title={title}
        description={description}
      />
      <div className="container-editorial py-12">
        {articles.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">
            Belum ada artikel di kategori ini. Konten pertama sedang disiapkan.
          </p>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
              {articles.length} artikel
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <ArticleCard key={article.slug} article={article} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
