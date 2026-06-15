import { getAllArticles, getAllSources } from "./content";
import { SERIES } from "./series";
import { slugifyTag } from "./topics";

export type GraphNodeType = "artikel" | "sumber" | "seri" | "topik";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  href?: string;
  /** Article category, drives colour (alam/sejarah/investigasi). */
  category?: string;
  /** Year, for the year filter. */
  year?: number;
  /** Tags/topics, for the tag filter. */
  tags?: string[];
  /** Series slugs this node belongs to, for the series filter. */
  series?: string[];
  /** Short preview shown in the side panel. */
  excerpt?: string;
  /** Degree, computed; used to size the node. */
  degree?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relasi: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  tags: string[];
  years: number[];
}

/**
 * Build the knowledge graph (F4.3) from real content: articles, the sources they
 * cite, the series they belong to, and shared-topic hubs. Edges encode the
 * relationship type. Only sources actually cited and tags shared by 2+ articles
 * are included, to keep the graph legible.
 */
export async function buildKnowledgeGraph(): Promise<KnowledgeGraph> {
  const articles = await getAllArticles();
  const sources = getAllSources();
  const sourceById = new Map(sources.map((s) => [s.id ?? s.slug, s]));

  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const add = (n: GraphNode) => {
    if (!nodes.has(n.id)) nodes.set(n.id, n);
  };

  // tag frequency, to keep only shared topics as hubs
  const tagCount = new Map<string, number>();
  for (const a of articles) for (const t of a.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  const sharedTags = new Set([...tagCount.entries()].filter(([, c]) => c >= 2).map(([t]) => t));

  for (const a of articles) {
    const id = `a:${a.slug}`;
    add({
      id,
      type: "artikel",
      label: a.title,
      href: `/articles/${a.slug}`,
      category: a.category,
      year: new Date(a.date).getFullYear(),
      tags: a.tags,
      series: a.series,
      excerpt: a.summary || a.subtitle,
    });

    // article -> series
    for (const s of a.series ?? []) {
      const series = SERIES.find((x) => x.slug === s);
      if (!series) continue;
      const sid = `s:${series.slug}`;
      add({ id: sid, type: "seri", label: series.title, href: "/seri", excerpt: series.promise });
      edges.push({ source: id, target: sid, relasi: "bagian dari seri" });
    }

    // article -> cited source
    for (const cid of a.sourceIds ?? []) {
      const src = sourceById.get(cid);
      if (!src) continue;
      const nid = `src:${src.slug}`;
      add({
        id: nid,
        type: "sumber",
        label: src.title,
        href: `/arsip-sumber/${src.slug}`,
        excerpt: src.reliability || src.related_topic || "",
      });
      edges.push({ source: id, target: nid, relasi: "dirujuk oleh artikel" });
    }

    // article -> shared topic hub
    for (const t of a.tags) {
      if (!sharedTags.has(t)) continue;
      const tid = `t:${t}`;
      add({ id: tid, type: "topik", label: t, href: `/topik/${slugifyTag(t)}`, excerpt: `Topik: ${t}` });
      edges.push({ source: id, target: tid, relasi: "topik sama" });
    }
  }

  // compute degree
  for (const e of edges) {
    const s = nodes.get(e.source);
    const t = nodes.get(e.target);
    if (s) s.degree = (s.degree ?? 0) + 1;
    if (t) t.degree = (t.degree ?? 0) + 1;
  }

  const years = [...new Set(articles.map((a) => new Date(a.date).getFullYear()))].sort();
  const tags = [...sharedTags].sort((a, b) => a.localeCompare(b));

  return { nodes: [...nodes.values()], edges, tags, years };
}
