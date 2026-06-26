import type { GraphNode, GraphEdge } from "@/lib/graph";

export interface GraphHighlightState {
  hoveredNodeId: string | null;
  highlightNodes: Set<string>;
  highlightLinks: Set<string>;
  degrees: Map<string, number>;
}

export function computeAuditorTrace(
  nodes: GraphNode[],
  links: GraphEdge[],
  hoveredNodeId: string | null
): GraphHighlightState {
  const highlightNodes = new Set<string>();
  const highlightLinks = new Set<string>();
  const degrees = new Map<string, number>();

  if (!hoveredNodeId) {
    return { hoveredNodeId, highlightNodes, highlightLinks, degrees };
  }

  // 0-degree (hovered node itself)
  highlightNodes.add(hoveredNodeId);
  degrees.set(hoveredNodeId, 0);

  // Build adjacency list for fast lookup
  const adj = new Map<string, string[]>();
  for (const l of links) {
    const s = typeof l.source === "string" ? l.source : (l.source as any).id;
    const t = typeof l.target === "string" ? l.target : (l.target as any).id;

    if (!adj.has(s)) adj.set(s, []);
    if (!adj.has(t)) adj.set(t, []);
    adj.get(s)!.push(t);
    adj.get(t)!.push(s);
  }

  // BFS Queue: [NodeId, CurrentDegree]
  const queue: [string, number][] = [[hoveredNodeId, 0]];

  while (queue.length > 0) {
    const [curr, dist] = queue.shift()!;

    if (dist >= 2) continue; // Limit trace to 2nd-degree neighbors

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!highlightNodes.has(neighbor)) {
        highlightNodes.add(neighbor);
        degrees.set(neighbor, dist + 1);
        queue.push([neighbor, dist + 1]);
      }
    }
  }

  // Identify active connections matching the trace path
  for (const l of links) {
    const s = typeof l.source === "string" ? l.source : (l.source as any).id;
    const t = typeof l.target === "string" ? l.target : (l.target as any).id;

    if (highlightNodes.has(s) && highlightNodes.has(t)) {
      // Keep connection highlighted if it touches the hovered node directly,
      // or connects degree 1 nodes.
      if (s === hoveredNodeId || t === hoveredNodeId) {
        highlightLinks.add(`${s}-${t}`);
        highlightLinks.add(`${t}-${s}`);
      }
    }
  }

  return { hoveredNodeId, highlightNodes, highlightLinks, degrees };
}
