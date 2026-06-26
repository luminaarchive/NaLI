"use client";

import React from "react";
import { useGraphStore } from "./useGraphStore";
import { useGraphURLSync } from "./useGraphURLSync";

export function ObservatoryListing() {
  // Sync state with URL search params
  useGraphURLSync();

  const {
    rawGraph,
    filteredNodes,
    filteredEdges,
    selectedNode,
    hoveredNode,
    filters,
    viewMode,
    setFilter,
    setSelectedNode,
    setHoveredNode,
    setViewMode,
    resetFilters,
  } = useGraphStore();

  const provinces = React.useMemo(() => {
    if (!rawGraph) return [];
    const provs = new Set<string>();
    rawGraph.nodes.forEach((n) => {
      if (n.locationLabels) {
        n.locationLabels.forEach((label) => {
          const lastPart = label.split(",").pop()?.trim();
          if (lastPart) provs.add(lastPart);
        });
      }
    });
    return [...provs].sort();
  }, [rawGraph]);

  const handleCategoryToggle = (cat: string) => {
    const active = filters.categories.includes(cat);
    setFilter(
      "categories",
      active ? filters.categories.filter((c) => c !== cat) : [...filters.categories, cat]
    );
  };

  const handleProvinceToggle = (prov: string) => {
    const active = filters.provinces.includes(prov);
    setFilter(
      "provinces",
      active ? filters.provinces.filter((p) => p !== prov) : [...filters.provinces, prov]
    );
  };

  const activeNode = React.useMemo(() => {
    if (!selectedNode || !rawGraph) return null;
    return rawGraph.nodes.find((n) => n.id === selectedNode) || null;
  }, [selectedNode, rawGraph]);

  return (
    <div className="flex flex-col lg:flex-row border border-[#9ecdbf] bg-[#0a1411] font-mono text-[#cfe8df] select-none min-h-[600px] overflow-hidden">
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#9ecdbf] p-6 bg-[#0a1411]/90 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center border-b border-[#9ecdbf] pb-4 mb-6">
            <h2 className="text-xs font-bold tracking-widest text-[#46cfa8]">FILTRASI RISET</h2>
            <button
              onClick={resetFilters}
              className="text-xs border border-[#9ecdbf] px-2 py-0.5 hover:bg-[#11241e] active:bg-[#46cfa8] active:text-[#0a1411] transition-all"
            >
              [RESET]
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <label className="text-xs block mb-2 font-semibold">CARI ENTITAS</label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilter("searchQuery", e.target.value)}
              placeholder="Masukkan kata kunci..."
              className="w-full bg-[#11241e] border border-[#9ecdbf] px-3 py-2 text-sm text-[#cfe8df] focus:outline-none focus:border-[#46cfa8] rounded-none placeholder-emerald-800/40"
            />
          </div>

          {/* Kategori Pilar */}
          <div className="mb-6">
            <label className="text-xs block mb-3 font-semibold border-b border-emerald-950 pb-1">KATEGORI PILAR</label>
            <div className="space-y-2">
              {["alam", "sejarah", "investigasi"].map((cat) => (
                <label key={cat} className="flex items-center space-x-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => handleCategoryToggle(cat)}
                    className="w-4 h-4 border border-[#9ecdbf] bg-transparent appearance-none checked:bg-[#46cfa8] text-[#0a1411] rounded-none flex items-center justify-center cursor-pointer checked:after:content-['✓']"
                  />
                  <span className="capitalize">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Provinsi */}
          <div className="mb-6">
            <label className="text-xs block mb-3 font-semibold border-b border-emerald-950 pb-1">PROVINSI</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {provinces.map((prov) => (
                <label key={prov} className="flex items-center space-x-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={filters.provinces.includes(prov)}
                    onChange={() => handleProvinceToggle(prov)}
                    className="w-4 h-4 border border-[#9ecdbf] bg-transparent appearance-none checked:bg-[#46cfa8] text-[#0a1411] rounded-none flex items-center justify-center cursor-pointer checked:after:content-['✓']"
                  />
                  <span>{prov}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-emerald-700/60 border-t border-emerald-950/40 pt-4 mt-6">
          <div>NaLI OBSERVATORIUM v0.2</div>
          <div>SATELLITE GROUND TRACKING</div>
        </div>
      </aside>

      {/* Main Listing Panel */}
      <main className="flex-1 flex flex-col p-6 bg-[#0a1411]/40 justify-between">
        <div>
          {/* Header Stats */}
          <div className="flex flex-wrap justify-between items-center border-b border-[#9ecdbf]/30 pb-4 mb-6 gap-4">
            <div>
              <h1 className="text-lg font-bold text-[#46cfa8] uppercase">
                {viewMode === "local" ? "Observasi Lokal" : "Indeks Global Nusantara"}
              </h1>
              <p className="text-xs text-gray-light mt-1">
                Menampilkan {filteredNodes.length} simpul dan {filteredEdges.length} relasi aktif.
              </p>
            </div>
            {viewMode === "local" && (
              <button
                onClick={() => setViewMode("global")}
                className="text-xs border border-[#46cfa8] px-3 py-1 hover:bg-[#11241e] text-[#46cfa8]"
              >
                [KEMBALI KE INDEKS GLOBAL]
              </button>
            )}
          </div>

          {/* Focused Node Panel (if selected) */}
          {activeNode && (
            <div className="border border-[#46cfa8] bg-[#11241e]/50 p-4 mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <span className="text-[10px] text-[#46cfa8] uppercase tracking-wider block mb-1">
                  Simpul Terfokus: {activeNode.type}
                </span>
                <h3 className="text-md font-bold text-white">{activeNode.label}</h3>
                {activeNode.excerpt && (
                  <p className="text-xs text-[#9ecdbf] mt-1 italic">{activeNode.excerpt}</p>
                )}
                {activeNode.locationLabels && activeNode.locationLabels.length > 0 && (
                  <p className="text-xs mt-1 text-emerald-700">
                    Lokasi: {activeNode.locationLabels.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {activeNode.href && (
                  <a
                    href={activeNode.href}
                    className="text-xs border border-[#46cfa8] bg-[#46cfa8] text-[#0a1411] px-3 py-1.5 font-bold hover:bg-emerald-300 transition-colors"
                  >
                    BUKA ARSIP
                  </a>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs border border-[#9ecdbf]/50 px-3 py-1.5 hover:bg-[#0a1411]"
                >
                  BATAL FOKUS
                </button>
              </div>
            </div>
          )}

          {/* Node Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredNodes.length === 0 ? (
              <p className="text-xs text-emerald-950 italic col-span-2 py-8 text-center">
                Tidak ada entitas riset yang cocok dengan filter aktif.
              </p>
            ) : (
              filteredNodes.map((node) => {
                const isSelected = selectedNode === node.id;
                const isHovered = hoveredNode === node.id;

                return (
                  <div
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      setSelectedNode(node.id);
                      setViewMode("local");
                    }}
                    className={`border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#46cfa8] bg-[#11241e]/30"
                        : isHovered
                        ? "border-[#9ecdbf] bg-[#11241e]/10"
                        : "border-[#9ecdbf]/30 hover:border-[#9ecdbf]/60"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] uppercase tracking-widest text-[#46cfa8]">
                          {node.type}
                        </span>
                        {node.year && <span className="text-[10px] text-gray-light">{node.year}</span>}
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{node.label}</h4>
                      {node.excerpt && (
                        <p className="text-[11px] text-gray-light mt-1 line-clamp-2 leading-relaxed">
                          {node.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#9ecdbf]/10 flex justify-between items-center text-[10px] text-emerald-800">
                      <span>DERAJAT RELASI: {node.degree || 1}</span>
                      <span className="text-[#46cfa8] uppercase">[KLIK UNTUK FOKUS]</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-[11px] border-t border-[#9ecdbf]/20 pt-4 mt-6 text-emerald-800">
          <span>* Pilih simpul di atas untuk masuk ke mode Local View dan menelusuri relasinya.</span>
        </div>
      </main>
    </div>
  );
}
