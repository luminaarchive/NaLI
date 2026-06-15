"use client";

import { useState } from "react";

export interface CompareSource {
  id: string;
  title: string;
  type: string;
  reliability?: string;
  url?: string;
  body?: string;
}

/**
 * Modul 12: place two real sources side by side. NaLI does not conclude anything
 * for the reader; it only lines the evidence up so the reader can compare with
 * their own eyes. Pure client state, no storage, no AI summary.
 */
function Panel({
  sources,
  selectedId,
  onSelect,
  side,
}: {
  sources: CompareSource[];
  selectedId: string;
  onSelect: (id: string) => void;
  side: string;
}) {
  const src = sources.find((s) => s.id === selectedId);
  return (
    <div className="border border-dashed border-ink/40">
      <div className="border-b border-dashed border-ink/40 p-3">
        <label className="label block text-ink/60">{side}</label>
        <select
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          className="mt-2 w-full border border-ink/40 bg-paper p-2 font-mono text-[0.78rem] text-ink"
        >
          {sources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title.slice(0, 70)}
            </option>
          ))}
        </select>
      </div>
      {src ? (
        <div className="p-4">
          <p className="label text-ink/60">{src.type}</p>
          <h3 className="mt-1 font-display text-lg leading-tight text-ink-black">{src.title}</h3>
          {src.reliability && (
            <p className="mt-2 font-mono text-[0.74rem] leading-relaxed text-gray">
              {src.reliability}
            </p>
          )}
          {src.body && (
            <p className="mt-3 whitespace-pre-line font-mono text-[0.8rem] leading-relaxed text-ink-charcoal">
              {src.body}
            </p>
          )}
          {src.url && (
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border border-ink/50 px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-wide text-ink transition-colors hover:bg-ink-wash"
            >
              Buka sumber asli
            </a>
          )}
        </div>
      ) : (
        <p className="p-4 font-mono text-sm text-gray">Pilih sumber.</p>
      )}
    </div>
  );
}

export function CompareSources({ sources }: { sources: CompareSource[] }) {
  const [a, setA] = useState(sources[0]?.id ?? "");
  const [b, setB] = useState(sources[1]?.id ?? sources[0]?.id ?? "");

  if (sources.length < 2) {
    return <p className="font-mono text-sm text-gray">Belum cukup sumber untuk dibandingkan.</p>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Panel sources={sources} selectedId={a} onSelect={setA} side="Sumber A" />
      <Panel sources={sources} selectedId={b} onSelect={setB} side="Sumber B" />
    </div>
  );
}
