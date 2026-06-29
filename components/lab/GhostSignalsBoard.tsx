"use client";

import { useMemo, useState } from "react";
import type { GhostSignal, GhostSource } from "@/lib/lab/ghost";

/* -------------------------------------------------------------------------- */
/*  Ghost Signals board (Bucket C, Step 3.5)                                   */
/*                                                                            */
/*  External anomalies (iNat needs-ID, Xeno-canto, YouTube). Even softer than  */
/*  a Lazarus lead: each is an UNVERIFIED signal, never a claim. Promotion      */
/*  turns one into a public field-verification QUESTION (same seam as leads).  */
/* -------------------------------------------------------------------------- */

const SOURCE_LABEL: Record<GhostSource, string> = {
  inaturalist: "iNaturalist",
  "xeno-canto": "Xeno-canto",
  youtube: "YouTube",
};

function bandClass(score: number): string {
  if (score >= 70) return "text-[#b3320a] dark:text-[#f0a36e]";
  if (score >= 40) return "text-ink-deep";
  return "text-ink/45";
}

export function GhostSignalsBoard({ signals }: { signals: GhostSignal[] }) {
  const [sourceFilter, setSourceFilter] = useState<GhostSource | "all">("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [promoting, setPromoting] = useState<number | null>(null);
  const [promoted, setPromoted] = useState<Record<number, { href: string }>>({});
  const [promoteError, setPromoteError] = useState<Record<number, string>>({});

  const view = useMemo(
    () => (sourceFilter === "all" ? signals : signals.filter((s) => s.source === sourceFilter)),
    [signals, sourceFilter],
  );
  const maxAbs = useMemo(
    () => Math.max(1, ...signals.flatMap((s) => s.signals.map((c) => Math.abs(c.points)))),
    [signals],
  );

  async function promote(id: number) {
    setPromoting(id);
    setPromoteError((m) => ({ ...m, [id]: "" }));
    try {
      const res = await fetch("/api/lab/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setPromoteError((m) => ({ ...m, [id]: data.error || `Gagal (HTTP ${res.status})` }));
      } else {
        setPromoted((m) => ({ ...m, [id]: { href: data.href } }));
      }
    } catch (e) {
      setPromoteError((m) => ({ ...m, [id]: (e as Error).message }));
    } finally {
      setPromoting(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink/30 pb-4">
        <label className="font-mono text-[0.66rem] uppercase tracking-wider text-ink/55">
          Sumber
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as GhostSource | "all")}
            className="ml-1.5 border border-dashed border-ink/40 bg-paper px-2 py-1 text-ink"
          >
            <option value="all">Semua</option>
            <option value="inaturalist">iNaturalist</option>
            <option value="xeno-canto">Xeno-canto</option>
            <option value="youtube">YouTube</option>
          </select>
        </label>
        <span className="ml-auto font-mono text-[0.66rem] text-ink/45">
          {view.length}/{signals.length} sinyal
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {view.map((s) => {
          const open = openId === s.id;
          return (
            <li key={s.id} className="border border-dashed border-ink/45 bg-paper">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : s.id)}
                aria-expanded={open}
                className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-ink-wash/30"
              >
                <span className={`font-mono text-2xl font-black tabular-nums ${bandClass(s.score)}`}>
                  {s.score}
                  <span className="text-[0.6rem] text-ink/40">/100</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display text-base font-bold text-ink">{s.title}</span>
                  <span className="mt-0.5 block font-mono text-[0.64rem] uppercase tracking-wider text-ink/50">
                    {SOURCE_LABEL[s.source]}
                    {s.provenance === "sample" && " · CONTOH"}
                    {s.taxonHint && ` · ${s.taxonHint}`}
                    {s.observedOn && ` · ${s.observedOn}`}
                    {s.locationLabel && ` · ${s.locationLabel}`}
                  </span>
                </span>
                <span className="font-mono text-[0.7rem] text-ink/40" aria-hidden>
                  {open ? "tutup ▲" : "rincian ▾"}
                </span>
              </button>

              {open && (
                <div className="border-t border-dashed border-ink/30 px-4 py-4">
                  {s.summary && (
                    <p className="font-mono text-[0.72rem] leading-relaxed text-ink-charcoal">
                      {s.summary}
                    </p>
                  )}
                  <ul className="mt-3 space-y-2.5">
                    {s.signals.map((c) => (
                      <li key={c.key}>
                        <div className="flex items-baseline justify-between gap-2 font-mono text-[0.72rem]">
                          <span className="text-ink">
                            {c.label}
                            <span className="ml-1.5 text-ink/45">(bobot {c.weight})</span>
                          </span>
                          <span className="tabular-nums font-bold text-ink-deep">+{c.points}</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-ink/10">
                          <div
                            className="h-full bg-ink-deep"
                            style={{ width: `${Math.min(100, (Math.abs(c.points) / maxAbs) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1 font-mono text-[0.64rem] leading-snug text-ink/55">
                          sinyal {c.value} · {c.note}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 border-t border-dashed border-ink/20 pt-3">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[0.72rem] text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
                    >
                      Buka sumber asli ({SOURCE_LABEL[s.source]}) ↗
                    </a>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-ink/20 pt-3">
                    {promoted[s.id] ? (
                      <>
                        <span className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-deep">
                          ✓ Misi dibuat
                        </span>
                        <a
                          href={promoted[s.id].href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[0.68rem] uppercase tracking-wider text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
                        >
                          Lihat misi publik ↗
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => promote(s.id)}
                          disabled={promoting === s.id}
                          className="border border-ink bg-ink px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
                        >
                          {promoting === s.id ? "Mempromosikan…" : "Promosikan ke Misi"}
                        </button>
                        <span className="font-mono text-[0.62rem] text-ink/45">
                          Membuat <strong>pertanyaan</strong> verifikasi lapangan, bukan klaim.
                        </span>
                      </>
                    )}
                    {promoteError[s.id] && (
                      <span className="w-full font-mono text-[0.64rem] text-[#b3320a] dark:text-[#f0a36e]">
                        {promoteError[s.id]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {view.length === 0 && (
        <p className="mt-6 font-mono text-[0.78rem] text-ink/55">Tidak ada sinyal yang cocok.</p>
      )}
    </div>
  );
}
