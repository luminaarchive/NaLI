import type { ArticleMeta } from "./types";
import { getAnalyticsSummary } from "./analytics";

export interface Shelf {
  key: string;
  title: string;
  /** Honest curiosity line for the shelf, not clickbait. */
  kicker: string;
  /** Where "lihat semua" points. */
  href: string;
  items: ArticleMeta[];
}

const LAZARUS_SERIES = "spesies-hilang-bertahan";

/** Map a tracked path like "/articles/<slug>" to its slug, else null. */
function slugFromPath(path: string): string | null {
  const m = path.match(/^\/articles\/([^/?#]+)/);
  return m ? m[1] : null;
}

/**
 * Build the landing "shelves" (Netflix-style rows) from real content. Trending is
 * real when page-view data exists, otherwise it falls back to the internal score
 * and recency so the row is never empty or faked. Empty shelves are dropped.
 */
export async function buildShelves(articles: ArticleMeta[]): Promise<Shelf[]> {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const byDateDesc = [...articles].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  // trending: prefer real page-view counts, fall back to score + recency
  let trending: ArticleMeta[] = [];
  try {
    const analytics = await getAnalyticsSummary(7);
    const seen = new Set<string>();
    for (const [path] of analytics.topPaths) {
      const slug = slugFromPath(path);
      if (!slug) continue;
      const a = bySlug.get(slug);
      if (a && !seen.has(slug)) {
        seen.add(slug);
        trending.push(a);
      }
    }
  } catch {
    trending = [];
  }
  if (trending.length < 4) {
    const fallback = [...articles]
      .sort((a, b) => (b.internalScore ?? 0) - (a.internalScore ?? 0) || +new Date(b.date) - +new Date(a.date))
      .filter((a) => !trending.includes(a));
    trending = [...trending, ...fallback];
  }

  const inCategory = (cat: ArticleMeta["category"]) =>
    byDateDesc.filter((a) => a.category === cat);

  const lazarus = byDateDesc.filter((a) => (a.series ?? []).includes(LAZARUS_SERIES));
  const openQuestions = byDateDesc.filter(
    (a) => a.confidence === "needs-verification" || a.confidence === "low",
  );

  const shelves: Shelf[] = [
    {
      key: "trending",
      title: "Sedang ramai",
      kicker: "Paling banyak dibaca belakangan ini",
      href: "/articles",
      items: trending.slice(0, 10),
    },
    {
      key: "spesies-hilang",
      title: "Spesies yang sempat hilang",
      kicker: "Dinyatakan punah, lalu muncul lagi",
      href: "/seri",
      items: lazarus.slice(0, 10),
    },
    {
      key: "alam",
      title: "Alam",
      kicker: "Ekologi, satwa, dan lanskap Nusantara",
      href: "/alam",
      items: inCategory("alam").slice(0, 10),
    },
    {
      key: "sejarah",
      title: "Sejarah",
      kicker: "Arsip dan ingatan yang nyaris hilang",
      href: "/sejarah",
      items: inCategory("sejarah").slice(0, 10),
    },
    {
      key: "investigasi",
      title: "Investigasi",
      kicker: "Penelusuran berbasis sumber publik",
      href: "/investigasi",
      items: inCategory("investigasi").slice(0, 10),
    },
    {
      key: "pertanyaan-terbuka",
      title: "Pertanyaan yang belum terjawab",
      kicker: "Bukti masih kurang, dan kami katakan terus terang",
      href: "/bukti-dicari",
      items: openQuestions.slice(0, 10),
    },
    {
      key: "terbaru",
      title: "Baru diterbitkan",
      kicker: "Tulisan paling baru di NaLI",
      href: "/articles",
      items: byDateDesc.slice(0, 10),
    },
  ];

  return shelves.filter((s) => s.items.length > 0);
}
