"use client";

import React, { useEffect } from "react";
import { useGraphStore } from "./useGraphStore";
import { ObservatoryListing } from "./ObservatoryListing";
import type { KnowledgeGraph } from "@/lib/graph";

export function ObservatoryListingWrapper({ graph }: { graph: KnowledgeGraph }) {
  const setRawGraph = useGraphStore((state) => state.setRawGraph);

  useEffect(() => {
    setRawGraph(graph);
  }, [graph, setRawGraph]);

  return <ObservatoryListing />;
}
