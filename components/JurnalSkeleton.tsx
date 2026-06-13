"use client";

import React from "react";

export function JurnalSkeleton() {
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start relative">
      {/* Sidebar Placeholder */}
      <aside className="hidden lg:block border border-solid border-ink/10 bg-ink-wash/10 p-5 space-y-6 lg:sticky lg:top-24 h-[600px] animate-pulse">
        <div className="h-6 bg-ink-wash/30 rounded w-1/3 mb-4" />
        <div className="h-10 bg-ink-wash/20 rounded w-full" />
        <div className="h-10 bg-ink-wash/20 rounded w-full" />
        <div className="space-y-4 pt-4">
          <div className="h-4 bg-ink-wash/30 rounded w-1/2" />
          <div className="h-3 bg-ink-wash/20 rounded w-5/6" />
          <div className="h-3 bg-ink-wash/20 rounded w-2/3" />
        </div>
      </aside>

      {/* List Column Placeholder */}
      <div className="space-y-5 flex-1">
        <div className="hidden lg:flex items-center justify-between border-b border-solid border-ink/10 pb-3">
          <div className="h-4 bg-ink-wash/20 rounded w-48 animate-pulse" />
        </div>
        <div className="grid gap-5 grid-cols-1 [@media(min-width:1400px)]:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse border border-solid border-ink/10 bg-paper flex flex-col md:flex-row"
            >
              {/* Cover Placeholder matching responsive sizes */}
              <div className="w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] aspect-[3/4] bg-ink-wash/20 border-b md:border-b-0 md:border-r border-solid border-ink/10 flex-shrink-0" />

              {/* Details Placeholder */}
              <div className="flex-1 space-y-3 p-4">
                <div className="h-4 bg-ink-wash/30 rounded w-1/4" />
                <div className="space-y-2">
                  <div className="h-6 bg-ink-wash/40 rounded w-5/6" />
                  <div className="h-6 bg-ink-wash/40 rounded w-2/3" />
                </div>
                <div className="h-3 bg-ink-wash/20 rounded w-1/3" />
                <div className="space-y-1.5 pt-2">
                  <div className="h-3 bg-ink-wash/25 rounded w-full" />
                  <div className="h-3 bg-ink-wash/25 rounded w-full" />
                  <div className="h-3 bg-ink-wash/20 rounded w-4/5" />
                </div>
                <div className="flex gap-3 pt-3">
                  <div className="h-8 bg-ink-wash/30 rounded w-24" />
                  <div className="h-8 bg-ink-wash/20 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
