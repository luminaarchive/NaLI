"use client";

import { useEffect, useState } from "react";

/**
 * Modul 8: Personal Intelligence Feed (Discovery Score). Tracks which topics a
 * reader has explored in this session using URL state only. No database, no
 * localStorage, no sessionStorage, no cookie. Reload clears it, by design and
 * for privacy. Exploration Depth = topik dijelajahi relatif terhadap total arsip.
 */
const PARAM = "eksplor";

export function DiscoveryScore({
  topics,
  totalArsip,
}: {
  topics: { slug: string; label: string }[];
  totalArsip: number;
}) {
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get(PARAM);
      if (raw) setExplored(new Set(raw.split(",").filter(Boolean)));
    } catch {
      /* ignore */
    }
  }, []);

  function explore(slug: string) {
    setExplored((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        const params = new URLSearchParams(window.location.search);
        if (next.size) params.set(PARAM, [...next].join(","));
        else params.delete(PARAM);
        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const count = explored.size;
  const depth = totalArsip > 0 ? Math.min(100, (count / totalArsip) * 100) : 0;
  const level = count === 0 ? "Pengamat" : count < 3 ? "Penjelajah" : count < 6 ? "Penyelidik" : "Kartografer";

  return (
    <section className="border border-ink/60 bg-paper" aria-label="Discovery score">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-ink/40 px-4 py-3 sm:px-5">
        <p className="label text-ink">Discovery Score</p>
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-ink/80">
          {mounted ? `Level: ${level}` : "Level: ..."}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums text-ink">{mounted ? count : 0}</span>
          <span className="label text-ink/70">topik dijelajahi sesi ini</span>
        </div>
        <div className="mt-2 h-2 w-full border border-ink/40 bg-paper">
          <div className="h-full bg-ink/70 transition-all" style={{ width: `${depth}%` }} />
        </div>
        <p className="mt-1 font-mono text-[0.68rem] text-gray">
          Kedalaman relatif terhadap {totalArsip.toLocaleString("id-ID")} arsip sumber.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {topics.map((t) => {
            const on = explored.has(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => explore(t.slug)}
                aria-pressed={on}
                className={`border px-3 py-1.5 font-mono text-[0.72rem] transition-colors ${
                  on ? "border-ink bg-ink text-paper" : "border-ink/40 text-ink hover:bg-ink-wash"
                }`}
              >
                {on ? "✓ " : ""}
                {t.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 font-mono text-[0.68rem] leading-relaxed text-gray">
          Dilacak murni lewat URL sesi ini, tanpa basis data, tanpa localStorage,
          tanpa cookie. Muat ulang halaman akan menyetelnya kembali. Itu disengaja.
        </p>
      </div>
    </section>
  );
}
