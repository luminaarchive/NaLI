"use client";

import React, { useMemo } from "react";
import { computeSmartAnchor } from "./computeSmartAnchor";

interface HoverCardProps {
  title: string;
  confidence: "high" | "medium" | "low" | "needs-verification" | string;
  excerpt: string;
  year?: number;
  province?: string;
  sourcesCount: number;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

const CONFIDENCE_BADGE: Record<
  string,
  { label: string; class: string }
> = {
  high: {
    label: "TERVERIFIKASI KUAT",
    class: "text-[#46cfa8] border-[#46cfa8] bg-[#11241e]/40",
  },
  medium: {
    label: "DIDUKUNG SUMBER",
    class: "text-[#3b6fb0] border-[#3b6fb0] bg-blue-950/20",
  },
  low: {
    label: "TERBATAS",
    class: "text-[#b08a3b] border-[#b08a3b] bg-amber-950/20",
  },
  "needs-verification": {
    label: "BELUM CUKUP BUKTI",
    class: "text-[#c92f2f] border-[#c92f2f] bg-red-950/20",
  },
};

export const EpistemicHoverCard: React.FC<HoverCardProps> = ({
  title,
  confidence,
  excerpt,
  year,
  province,
  sourcesCount,
  x,
  y,
  viewportWidth,
  viewportHeight,
}) => {
  const badge = CONFIDENCE_BADGE[confidence] || CONFIDENCE_BADGE["needs-verification"];

  const anchor = useMemo(() => {
    return computeSmartAnchor(x, y, viewportWidth, viewportHeight, 320, 180, 16);
  }, [x, y, viewportWidth, viewportHeight]);

  return (
    <div
      style={{
        left: x,
        top: y,
        transform: anchor.transform,
      }}
      className={`fixed z-[9999] w-[calc(100vw-32px)] sm:w-80 bg-[#0a1411] border border-[#9ecdbf] p-4 text-[#cfe8df] font-mono shadow-[0px_8px_32px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-75 ease-out select-none ${anchor.className}`}
    >
      {/* Header section */}
      <div className="border-b border-[#9ecdbf]/35 pb-2 mb-3">
        <h3 className="text-xs font-bold text-white leading-snug tracking-tight line-clamp-2">
          {title}
        </h3>
      </div>

      {/* Epistemic Verification Badge */}
      <div className="mb-3">
        <span
          className={`inline-block px-2 py-0.5 text-[8px] font-bold border rounded-none tracking-widest ${badge.class}`}
        >
          {badge.label}
        </span>
      </div>

      {/* Excerpt Body */}
      <p className="text-[10px] text-[#9ecdbf] leading-relaxed line-clamp-3 mb-4 italic">
        &ldquo;{excerpt}&rdquo;
      </p>

      {/* Footer metadata grid */}
      <div className="grid grid-cols-3 gap-2 border-t border-[#9ecdbf]/15 pt-2 text-[9px] text-emerald-800 uppercase font-semibold">
        <div>
          <span className="block text-[7.5px] text-[#9ecdbf]/50">Tahun</span>
          <span className="text-[#46cfa8]">{year || "N/A"}</span>
        </div>
        <div>
          <span className="block text-[7.5px] text-[#9ecdbf]/50">Wilayah</span>
          <span className="text-[#46cfa8] truncate block" title={province}>
            {province || "N/A"}
          </span>
        </div>
        <div>
          <span className="block text-[7.5px] text-[#9ecdbf]/50">Rujukan</span>
          <span className="text-[#46cfa8]">{sourcesCount} S. Primer</span>
        </div>
      </div>
    </div>
  );
};

export default EpistemicHoverCard;
