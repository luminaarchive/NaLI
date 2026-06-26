"use client";

import React from "react";
import { useGraphStore } from "./useGraphStore";

export function FilterSidebar() {
  const { filters, setFilter, resetFilters } = useGraphStore();

  const handleCategoryToggle = (category: string) => {
    const active = filters.categories.includes(category);
    const newCats = active
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    setFilter("categories", newCats);
  };

  const handleConfidenceToggle = (level: string) => {
    const active = filters.confidence.includes(level);
    const newConf = active
      ? filters.confidence.filter((c) => c !== level)
      : [...filters.confidence, level];
    setFilter("confidence", newConf);
  };

  return (
    <aside className="w-full md:w-80 h-full border-b md:border-b-0 md:border-r border-[#9ecdbf] bg-[#0a1411] p-6 text-[#cfe8df] font-mono flex flex-col justify-between select-none">
      <div>
        <div className="flex justify-between items-center border-b border-[#9ecdbf] pb-4 mb-6">
          <h2 className="text-xs font-bold tracking-widest text-[#46cfa8]">NaLI OBSERVATORY</h2>
          <button
            onClick={resetFilters}
            className="text-xs border border-[#9ecdbf] px-2 py-0.5 hover:bg-[#11241e] active:bg-[#46cfa8] active:text-[#0a1411] transition-all"
          >
            [RESET]
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="text-xs block mb-2 font-semibold">CARI SIMPUL</label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilter("searchQuery", e.target.value)}
            placeholder="Ketik kata kunci..."
            className="w-full bg-[#11241e] border border-[#9ecdbf] px-3 py-2 text-sm text-[#cfe8df] focus:outline-none focus:border-[#46cfa8] rounded-none placeholder-emerald-800/40"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="text-xs block mb-3 font-semibold border-b border-emerald-950 pb-1">PILAR OBSERVASI</label>
          <div className="space-y-2">
            {[
              { id: "alam", label: "Alam & Lanskap", color: "#2f9e6e" },
              { id: "sejarah", label: "Sejarah Nusantara", color: "#3b6fb0" },
              { id: "investigasi", label: "Liputan Investigasi", color: "#c9772f" },
            ].map((cat) => (
              <label key={cat.id} className="flex items-center space-x-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id)}
                  onChange={() => handleCategoryToggle(cat.id)}
                  className="w-4 h-4 border border-[#9ecdbf] bg-transparent appearance-none checked:bg-[#46cfa8] text-[#0a1411] rounded-none flex items-center justify-center cursor-pointer checked:after:content-['✓']"
                />
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: cat.color }} />
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="text-xs block mb-3 font-semibold border-b border-emerald-950 pb-1">TINGKAT KEYAKINAN</label>
          <div className="space-y-2">
            {[
              { id: "high", label: "Terverifikasi Kuat" },
              { id: "medium", label: "Didukung Sumber" },
              { id: "low", label: "Terbatas" },
              { id: "needs-verification", label: "Belum Cukup Bukti" },
            ].map((level) => (
              <label key={level.id} className="flex items-center space-x-3 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={filters.confidence.includes(level.id)}
                  onChange={() => handleConfidenceToggle(level.id)}
                  className="w-4 h-4 border border-[#9ecdbf] bg-transparent appearance-none checked:bg-[#46cfa8] text-[#0a1411] rounded-none flex items-center justify-center cursor-pointer checked:after:content-['✓']"
                />
                <span>{level.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-emerald-700/60 border-t border-emerald-950/40 pt-4 mt-6">
        <div>DOKUMENTASI BUKTI TERBUKA</div>
        <div>INDONESIA KNOWLEDGE ENGINE</div>
      </div>
    </aside>
  );
}
