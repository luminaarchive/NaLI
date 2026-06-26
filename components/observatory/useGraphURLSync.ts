import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useGraphStore } from "./useGraphStore";

export function useGraphURLSync() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const {
    filters,
    selectedNode,
    viewMode,
    setFilter,
    setSelectedNode,
    setViewMode,
  } = useGraphStore();

  const isHydrating = useRef(true);

  // 1. Initial hydration of Zustand state from URL Search Params
  useEffect(() => {
    if (!isHydrating.current) return;

    const node = searchParams.get("node");
    const view = searchParams.get("view");
    const categories = searchParams.get("categories");
    const confidence = searchParams.get("confidence");
    const provinsi = searchParams.get("provinsi");
    const years = searchParams.get("years");
    const search = searchParams.get("search");

    if (node) setSelectedNode(node);
    if (view === "local" || view === "global") setViewMode(view);
    if (categories) setFilter("categories", categories.split(","));
    if (confidence) setFilter("confidence", confidence.split(","));
    if (provinsi) setFilter("provinces", provinsi.split(","));
    if (search) setFilter("searchQuery", search);
    if (years) {
      const [min, max] = years.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        setFilter("yearRange", [min, max]);
      }
    }

    isHydrating.current = false;
  }, [searchParams, setSelectedNode, setViewMode, setFilter]);

  // 2. Synchronize Zustand store updates back to URL Search Params
  useEffect(() => {
    if (isHydrating.current) return;

    const params = new URLSearchParams();

    if (selectedNode) params.set("node", selectedNode);
    if (viewMode !== "global") params.set("view", viewMode);
    if (filters.categories.length > 0) {
      params.set("categories", filters.categories.join(","));
    }
    if (filters.confidence.length > 0) {
      params.set("confidence", filters.confidence.join(","));
    }
    if (filters.provinces.length > 0) {
      params.set("provinsi", filters.provinces.join(","));
    }
    if (filters.searchQuery) {
      params.set("search", filters.searchQuery);
    }
    if (filters.yearRange) {
      params.set("years", `${filters.yearRange[0]}-${filters.yearRange[1]}`);
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      const url = newQuery ? `${pathname}?${newQuery}` : pathname;
      router.replace(url);
    }
  }, [selectedNode, viewMode, filters, pathname, router, searchParams]);
}
export default useGraphURLSync;
