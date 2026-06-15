import { NextResponse } from "next/server";
import { getAllArticles, getAllSources } from "@/lib/content";
import { getAllPublications } from "@/lib/jurnal";
import type { Confidence } from "@/lib/types";

export const dynamic = "force-dynamic";

export interface SearchDoc {
  type: "artikel" | "jurnal" | "sumber";
  title: string;
  href: string;
  excerpt: string;
  tags: string[];
  kategori?: string;
  confidence?: Confidence;
}

/**
 * Combined client-search index (F2.1). Articles (MDX + DB), jurnal catalog, and
 * source archive in one payload. Consumed once by the GlobalSearch component,
 * which builds a Fuse index in the browser for instant (<100ms) results.
 */
export async function GET() {
  const [articles, sources, jurnal] = [
    await getAllArticles(),
    getAllSources(),
    getAllPublications(),
  ];

  const docs: SearchDoc[] = [
    ...articles.map((a) => ({
      type: "artikel" as const,
      title: a.title,
      href: `/articles/${a.slug}`,
      excerpt: a.summary || a.subtitle,
      tags: a.tags,
      kategori: a.category,
      confidence: a.confidence,
    })),
    ...jurnal.map((j) => ({
      type: "jurnal" as const,
      title: j.title,
      href: `/jurnal/${j.slug}`,
      excerpt: j.synopsis,
      tags: j.topics ?? [],
    })),
    ...sources.map((s) => ({
      type: "sumber" as const,
      title: s.title,
      href: `/arsip-sumber/${s.slug}`,
      excerpt: s.reliability || s.related_topic || "",
      tags: s.topics ?? [],
    })),
  ];

  return NextResponse.json(
    { docs, count: docs.length },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
