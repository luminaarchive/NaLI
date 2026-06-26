"use client";

import React, { useEffect } from "react";
import { useGraphStore } from "./useGraphStore";
import { GraphCanvas } from "./GraphCanvas";
import { FilterSidebar } from "./FilterSidebar";
import { TimeSlider } from "./TimeSlider";
import type { KnowledgeGraph } from "@/lib/graph";

export function ObservatoryWrapper({ graph }: { graph: KnowledgeGraph }) {
  const setRawGraph = useGraphStore((state) => state.setRawGraph);

  useEffect(() => {
    setRawGraph(graph);
  }, [graph, setRawGraph]);

  return (
    <div className="flex flex-col md:flex-row border border-[#9ecdbf] bg-[#0a1411] overflow-hidden">
      <FilterSidebar />
      <div className="flex-1 flex flex-col relative">
        <GraphCanvas />
        <div className="p-4 bg-[#0a1411] border-t border-[#9ecdbf]/30">
          <TimeSlider />
        </div>
      </div>
    </div>
  );
}
