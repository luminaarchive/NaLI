"use client";

import React from "react";

export function JurnalSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse border border-dashed border-ink/30 bg-paper p-5 flex flex-col md:flex-row gap-6"
        >
          {/* Cover Placeholder */}
          <div className="w-full md:w-[150px] aspect-[3/4] bg-ink-wash/20 border border-dashed border-ink/20 flex-shrink-0" />

          {/* Details Placeholder */}
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-ink-wash/30 rounded w-1/4" />
            <div className="space-y-2">
              <div className="h-6 bg-ink-wash/40 rounded w-3/4" />
              <div className="h-6 bg-ink-wash/40 rounded w-1/2" />
            </div>
            <div className="h-3 bg-ink-wash/20 rounded w-1/3" />
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-ink-wash/20 rounded w-full" />
              <div className="h-3 bg-ink-wash/20 rounded w-5/6" />
            </div>
            <div className="flex gap-3 pt-3">
              <div className="h-9 bg-ink-wash/30 rounded w-32" />
              <div className="h-9 bg-ink-wash/20 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
