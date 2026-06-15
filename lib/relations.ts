import "server-only";
import { buildKnowledgeGraph, type GraphNodeType } from "./graph";

export interface MasterRelasi {
  id: string;
  entitasUtama: string;
  type: GraphNodeType;
  href?: string;
  total: number;
  terhubungDengan: {
    artikel: number;
    sumber: number;
    seri: number;
    topik: number;
  };
}

/**
 * Modul 11: "Everything Connects". From the real knowledge graph, count how many
 * other entities each node touches, broken down by neighbour type. No new data;
 * this is a read over the same graph that powers the explorer.
 */
export async function getMasterRelasi(limit = 40): Promise<MasterRelasi[]> {
  const graph = await buildKnowledgeGraph();
  const typeOf = new Map(graph.nodes.map((n) => [n.id, n.type]));
  const neighbours = new Map<string, Set<string>>();

  for (const e of graph.edges) {
    if (!neighbours.has(e.source)) neighbours.set(e.source, new Set());
    if (!neighbours.has(e.target)) neighbours.set(e.target, new Set());
    neighbours.get(e.source)!.add(e.target);
    neighbours.get(e.target)!.add(e.source);
  }

  const out: MasterRelasi[] = graph.nodes.map((n) => {
    const breakdown = { artikel: 0, sumber: 0, seri: 0, topik: 0 };
    for (const nb of neighbours.get(n.id) ?? []) {
      const t = typeOf.get(nb);
      if (t && t in breakdown) breakdown[t as keyof typeof breakdown]++;
    }
    const total = breakdown.artikel + breakdown.sumber + breakdown.seri + breakdown.topik;
    return {
      id: n.id,
      entitasUtama: n.label,
      type: n.type,
      href: n.href,
      total,
      terhubungDengan: breakdown,
    };
  });

  return out.sort((a, b) => b.total - a.total).slice(0, limit);
}
