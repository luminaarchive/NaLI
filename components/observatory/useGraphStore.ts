import { create } from "zustand";
import type { GraphNode, GraphEdge, KnowledgeGraph } from "@/lib/graph";

export interface GraphFilters {
  categories: string[];
  confidence: string[];
  provinces: string[];
  yearRange: [number, number];
  searchQuery: string;
}

interface GraphState {
  rawGraph: KnowledgeGraph | null;
  filteredNodes: GraphNode[];
  filteredEdges: GraphEdge[];
  filters: GraphFilters;
  hoveredNode: string | null;
  selectedNode: string | null;
  viewMode: "global" | "local";

  // Actions
  setRawGraph: (graph: KnowledgeGraph) => void;
  setFilter: <K extends keyof GraphFilters>(key: K, value: GraphFilters[K]) => void;
  resetFilters: () => void;
  setHoveredNode: (id: string | null) => void;
  setSelectedNode: (id: string | null) => void;
  setViewMode: (mode: "global" | "local") => void;
  applyFiltering: () => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  rawGraph: null,
  filteredNodes: [],
  filteredEdges: [],
  hoveredNode: null,
  selectedNode: null,
  viewMode: "global",
  filters: {
    categories: [],
    confidence: [],
    provinces: [],
    yearRange: [1900, 2026],
    searchQuery: "",
  },

  setRawGraph: (graph) => {
    const years = graph.years || [1900, 2026];
    const minYear = Math.min(...years, 1900);
    const maxYear = Math.max(...years, 2026);

    set({
      rawGraph: graph,
      filters: {
        categories: [],
        confidence: [],
        provinces: [],
        yearRange: [minYear, maxYear],
        searchQuery: "",
      },
    });
    get().applyFiltering();
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().applyFiltering();
  },

  resetFilters: () => {
    const { rawGraph } = get();
    if (!rawGraph) return;

    const years = rawGraph.years || [1900, 2026];
    const minYear = Math.min(...years, 1900);
    const maxYear = Math.max(...years, 2026);

    set({
      filters: {
        categories: [],
        confidence: [],
        provinces: [],
        yearRange: [minYear, maxYear],
        searchQuery: "",
      },
    });
    get().applyFiltering();
  },

  setHoveredNode: (id) => set({ hoveredNode: id }),
  setSelectedNode: (id) => set({ selectedNode: id }),
  setViewMode: (mode) => {
    set({ viewMode: mode });
    get().applyFiltering();
  },

  applyFiltering: () => {
    const { rawGraph, filters, selectedNode, viewMode } = get();
    if (!rawGraph) return;

    // 1. Filter nodes based on search queries and meta matches
    let nodes = rawGraph.nodes.filter((node) => {
      // Text search match
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesLabel = node.label.toLowerCase().includes(query);
        const matchesExcerpt = (node.excerpt || "").toLowerCase().includes(query);
        if (!matchesLabel && !matchesExcerpt) return false;
      }

      // Category match
      if (filters.categories.length > 0) {
        if (node.type === "artikel" && node.category) {
          if (!filters.categories.includes(node.category)) {
            return false;
          }
        }
      }

      // Province match
      if (filters.provinces.length > 0) {
        if (node.type === "artikel") {
          if (!node.locationLabels || node.locationLabels.length === 0) return false;
          const matchesProv = node.locationLabels.some((label) => {
            const lastPart = label.split(",").pop()?.trim() || "";
            return filters.provinces.includes(lastPart);
          });
          if (!matchesProv) return false;
        }
      }

      // Year range match
      if (node.year) {
        if (node.year < filters.yearRange[0] || node.year > filters.yearRange[1]) {
          return false;
        }
      }

      return true;
    });

    // 2. Keep metadata nodes (sources, topics, series) only if connected to active articles
    const activeArticleIds = new Set(nodes.filter((n) => n.type === "artikel").map((n) => n.id));
    if (filters.categories.length > 0 || filters.provinces.length > 0) {
      const connectedToActiveArticle = new Set<string>();
      rawGraph.edges.forEach((edge) => {
        const s = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
        const t = typeof edge.target === "string" ? edge.target : (edge.target as any).id;

        if (activeArticleIds.has(s)) connectedToActiveArticle.add(t);
        if (activeArticleIds.has(t)) connectedToActiveArticle.add(s);
      });

      nodes = nodes.filter((n) => n.type === "artikel" || connectedToActiveArticle.has(n.id));
    }

    const activeNodeIds = new Set(nodes.map((n) => n.id));

    // 3. Filter edges
    let edges = rawGraph.edges.filter((edge) => {
      const sourceId = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
      const targetId = typeof edge.target === "string" ? edge.target : (edge.target as any).id;
      return activeNodeIds.has(sourceId) && activeNodeIds.has(targetId);
    });

    // 4. Local view constraint
    if (viewMode === "local" && selectedNode) {
      const localNodeIds = new Set<string>([selectedNode]);

      rawGraph.edges.forEach((edge) => {
        const sourceId = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
        const targetId = typeof edge.target === "string" ? edge.target : (edge.target as any).id;

        if (sourceId === selectedNode) localNodeIds.add(targetId);
        if (targetId === selectedNode) localNodeIds.add(sourceId);
      });

      nodes = nodes.filter((n) => localNodeIds.has(n.id));
      edges = edges.filter((edge) => {
        const sourceId = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
        const targetId = typeof edge.target === "string" ? edge.target : (edge.target as any).id;
        return sourceId === selectedNode || targetId === selectedNode;
      });
    }

    set({ filteredNodes: nodes, filteredEdges: edges });
  },
}));
