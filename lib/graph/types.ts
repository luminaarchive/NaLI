/**
 * Evidence Graph data model (Doctrine v2.1, Part 3).
 *
 * Auto-generated from the relational evidence layer (articles, sources,
 * claim_sources) that Part 1 populated, augmented with topic/series/vertical
 * nodes read from MDX. Generated at build/sync time into public/graph-data.json
 * (the Vercel runtime filesystem is read-only, so the API serves the cache, it
 * does not write it).
 */

export type NodeType = "article" | "source" | "topic" | "series" | "vertical";

export type EdgeType =
  | "article-cites-source"
  | "article-in-series"
  | "article-has-topic"
  | "article-in-vertical"
  | "source-shared-by"
  | "articles-share-source";

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  slug?: string;
  vertical?: string;
  confidence?: string;
  sourceCount?: number; // article nodes: how many sources
  claimCount?: number; // article nodes: how many claims
  articleCount?: number; // source/topic nodes: how many articles reference it
}

export interface GraphEdge {
  source: string; // GraphNode.id
  target: string; // GraphNode.id
  type: EdgeType;
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    generatedAt: string;
    totalNodes: number;
    totalEdges: number;
    articleCount: number;
    sourceCount: number;
  };
}

export const EMPTY_GRAPH: GraphData = {
  nodes: [],
  edges: [],
  meta: {
    generatedAt: new Date(0).toISOString(),
    totalNodes: 0,
    totalEdges: 0,
    articleCount: 0,
    sourceCount: 0,
  },
};
