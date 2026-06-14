import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ArticleList } from "@/components/ArticleList";
import { PageBackdrop } from "@/components/PageBackdrop";
import { NeuralNoise } from "@/components/ui/neural-noise";
import { getAllArticles, getAllTags } from "@/lib/content";

export const metadata: Metadata = {
  title: "Artikel",
  description:
    "Semua tulisan NaLI by NatIve, alam, sejarah, dan investigasi Indonesia. Saring berdasarkan kategori dan tag.",
  openGraph: {
    title: "Artikel | NaLI by NatIve",
    description:
      "Semua tulisan NaLI by NatIve, alam, sejarah, dan investigasi Indonesia.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const tags = (await getAllTags()).map((t) => t.tag);

  return (
    <div className="theme-artikel relative">
      <PageBackdrop light="opacity-[0.42]" dark="dark:opacity-[0.8]">
        <NeuralNoise color={[0.85, 0.28, 0.66]} />
      </PageBackdrop>
      <PageHeader
        eyebrow="Arsip lengkap"
        title="Semua artikel"
        description="Setiap tulisan dirujuk ke sumber dan diberi label tingkat keyakinan. Saring berdasarkan kategori atau tag."
      />
      <ArticleList articles={articles} tags={tags} />
    </div>
  );
}
