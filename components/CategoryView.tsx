import { PageHeader } from "@/components/PageHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { PillarMotif } from "@/components/PillarMotif";
import { getArticlesByCategory } from "@/lib/content";
import type { Category } from "@/lib/types";

const PILLAR_THEME: Partial<Record<Category, string>> = {
  alam: "theme-alam",
  sejarah: "theme-sejarah",
  investigasi: "theme-investigasi",
};

export async function CategoryView({
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
  const articles = await getArticlesByCategory(category);

  return (
    <div className={`relative ${PILLAR_THEME[category] ?? ""}`}>
      <PillarMotif category={category} />
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
            <p className="font-mono text-xs uppercase tracking-wider text-gray">
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
    </div>
  );
}
