"use client";

import React from "react";
import { useGraphStore } from "./useGraphStore";

export function TimeSlider() {
  const { filters, setFilter, rawGraph } = useGraphStore();

  // Extract years from the loaded raw graph
  const years = rawGraph?.years || [1900, 2026];
  const minYear = Math.min(...years, 1900);
  const maxYear = Math.max(...years, 2026);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setFilter("yearRange", [minYear, val]);
  };

  return (
    <div className="w-full border border-[#9ecdbf] bg-[#0a1411] p-4 text-[#cfe8df] font-mono flex flex-col space-y-2 select-none">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span>TIMELINE EKSPLORASI RISET</span>
        <span className="text-[#46cfa8] bg-[#11241e] px-2 py-0.5 border border-[#9ecdbf]/25">
          {minYear} - {filters.yearRange[1]}
        </span>
      </div>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={filters.yearRange[1]}
        onChange={handleYearChange}
        className="w-full accent-[#46cfa8] bg-emerald-950/40 h-1 appearance-none cursor-pointer border border-[#9ecdbf]/20 focus:outline-none"
      />
      <div className="flex justify-between text-[9px] text-emerald-800">
        <span>KLAIM TERDAHULU ({minYear})</span>
        <span>MASA KINI (2026)</span>
      </div>
    </div>
  );
}
