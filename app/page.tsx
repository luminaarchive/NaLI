import type { Metadata } from "next";
import { getAllArticles } from "@/lib/content";
import { NAV_LINKS } from "@/lib/site";
import { buildShowcaseGraph } from "@/lib/graph";
import { NeoMuseum, type Chapter } from "@/components/landing/NeoMuseum";
import type { ArticleMeta } from "@/lib/types";

export const metadata: Metadata = {
  // Canonical "/" so session-state variants like ?eksplor= are not indexed as duplicates.
  alternates: { canonical: "/" },
};

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<string, string> = {
  alam: "Alam",
  sejarah: "Sejarah",
  investigasi: "Investigasi",
  "catatan-lapangan": "Catatan Riset",
};

function cover(a: ArticleMeta): string | undefined {
  return a.coverImage ?? a.images?.[0]?.src;
}

export default async function HomePage() {
  const articles = await getAllArticles();
  const graph = await buildShowcaseGraph();

  // Chapters = newest published articles that carry a real (licensed) image.
  const withImages = articles.filter((a) => Boolean(cover(a)));
  const chapters: Chapter[] = withImages.slice(0, 5).map((a) => ({
    name: a.title,
    image: cover(a) as string,
    href: `/articles/${a.slug}`,
    meta: CATEGORY_LABEL[a.category] ?? a.category,
  }));

  // Featured "specimen" card: prefer the Javan tiger flagship, else newest.
  const flagship =
    articles.find((a) => a.slug === "harimau-jawa-lazarus-species") ??
    withImages[0] ??
    articles[0];

  const confidenceLabel: Record<string, string> = {
    high: "Terverifikasi kuat",
    medium: "Didukung sumber",
    low: "Terbatas",
    "needs-verification": "Belum cukup bukti",
  };

  const featured = flagship
    ? {
        title: flagship.title,
        subtitle: flagship.subtitle || flagship.summary,
        href: `/articles/${flagship.slug}`,
        label: confidenceLabel[flagship.confidence] ?? "Belum cukup bukti",
        sources: String(flagship.sources?.length ?? flagship.sourceIds?.length ?? 0),
      }
    : {
        title: "NaLI",
        subtitle: "Jurnal riset terbuka Indonesia",
        href: "/articles",
        label: "Berlabel",
        sources: "0",
      };

  return (
    <NeoMuseum chapters={chapters} navLinks={NAV_LINKS} featured={featured} graph={graph} />
  );
}
