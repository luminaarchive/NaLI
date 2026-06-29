"use client";

import { useMemo, useState } from "react";
import type { ScoredLead, LabLeadStatus } from "@/lib/lab/leads";
import { scoreBand, LAZARUS_METHOD_NOTE } from "@/lib/lab/scoring";

/* -------------------------------------------------------------------------- */
/*  Lab leads board (Bucket C, Step 3.3)                                       */
/*                                                                            */
/*  Sortable/filterable list of scored leads with a fully transparent score    */
/*  breakdown on expand. Every lead is a QUESTION for a human, never a claim.   */
/*  The "Promosikan ke Misi" button is the Phase-3 seam (wired in Step 3.4).    */
/* -------------------------------------------------------------------------- */

type SortKey = "score" | "gap" | "name";

const STATUS_LABEL: Record<LabLeadStatus, string> = {
  lead: "Lead",
  investigating: "Diselidiki",
  promoted: "Dipromosikan",
  dismissed: "Diabaikan",
};

const BAND_CLASS: Record<string, string> = {
  high: "text-[#b3320a] dark:text-[#f0a36e]",
  mid: "text-ink-deep",
  low: "text-ink/45",
};

function pointsBarWidth(points: number, max: number): string {
  if (max <= 0) return "0%";
  return `${Math.min(100, (Math.abs(points) / max) * 100)}%`;
}

export function LabLeadsBoard({
  leads,
  source,
}: {
  leads: ScoredLead[];
  source: "db" | "sample" | "empty";
}) {
  const [sort, setSort] = useState<SortKey>("score");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LabLeadStatus | "all">("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const view = useMemo(() => {
    let rows = leads.slice();
    if (statusFilter !== "all") rows = rows.filter((l) => l.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (l) =>
          l.taxonName.toLowerCase().includes(q) ||
          (l.commonName || "").toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      if (sort === "score") return b.score - a.score;
      if (sort === "name") return a.taxonName.localeCompare(b.taxonName);
      // gap: oldest last record first; nulls (no record) on top
      const ay = a.lastRecordYear ?? -Infinity;
      const by = b.lastRecordYear ?? -Infinity;
      return ay - by;
    });
    return rows;
  }, [leads, sort, query, statusFilter]);

  const maxAbsPoints = useMemo(() => {
    let m = 1;
    for (const l of leads) for (const c of l.breakdown) m = Math.max(m, Math.abs(c.points));
    return m;
  }, [leads]);

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink/30 pb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari taksa..."
          className="min-w-[10rem] flex-1 border border-dashed border-ink/40 bg-paper px-3 py-1.5 font-mono text-[0.78rem] text-ink placeholder:text-ink/40 focus:border-ink-deep focus:outline-none"
          aria-label="Cari taksa"
        />
        <label className="font-mono text-[0.66rem] uppercase tracking-wider text-ink/55">
          Urut
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="ml-1.5 border border-dashed border-ink/40 bg-paper px-2 py-1 text-ink"
          >
            <option value="score">Skor</option>
            <option value="gap">Jeda waktu</option>
            <option value="name">Nama</option>
          </select>
        </label>
        <label className="font-mono text-[0.66rem] uppercase tracking-wider text-ink/55">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LabLeadStatus | "all")}
            className="ml-1.5 border border-dashed border-ink/40 bg-paper px-2 py-1 text-ink"
          >
            <option value="all">Semua</option>
            <option value="lead">Lead</option>
            <option value="investigating">Diselidiki</option>
            <option value="promoted">Dipromosikan</option>
            <option value="dismissed">Diabaikan</option>
          </select>
        </label>
        <span className="ml-auto font-mono text-[0.66rem] text-ink/45">
          {view.length}/{leads.length} lead
        </span>
      </div>

      {/* method note */}
      <p className="mt-3 font-mono text-[0.68rem] leading-relaxed text-ink/55">
        {LAZARUS_METHOD_NOTE}
      </p>

      {/* list */}
      <ul className="mt-4 space-y-2">
        {view.map((l) => {
          const band = scoreBand(l.score);
          const open = openId === l.id;
          return (
            <li key={l.id} className="border border-dashed border-ink/45 bg-paper">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : l.id)}
                aria-expanded={open}
                className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-ink-wash/30"
              >
                <span
                  className={`font-mono text-2xl font-black tabular-nums ${BAND_CLASS[band.key]}`}
                  title={band.label}
                >
                  {l.score}
                  <span className="text-[0.6rem] text-ink/40">/100</span>
                </span>
                <span className="min-w-0">
                  <span className="font-display text-lg font-bold italic text-ink">
                    {l.taxonName}
                  </span>
                  {l.commonName && (
                    <span className="ml-2 font-mono text-[0.72rem] text-gray">{l.commonName}</span>
                  )}
                  <span className="mt-0.5 block font-mono text-[0.64rem] uppercase tracking-wider text-ink/50">
                    {STATUS_LABEL[l.status]}
                    {l.iucnStatus && ` · IUCN ${l.iucnStatus}`}
                    {l.lastRecordYear != null
                      ? ` · rekaman terakhir ${l.lastRecordYear}`
                      : " · tanpa rekaman"}
                  </span>
                </span>
                <span className="ml-auto font-mono text-[0.7rem] text-ink/40" aria-hidden>
                  {open ? "tutup ▲" : "rincian ▾"}
                </span>
              </button>

              {open && (
                <div className="border-t border-dashed border-ink/30 px-4 py-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-deep">
                    Rincian skor Lazarus, {band.label}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {l.breakdown.map((c) => (
                      <li key={c.key}>
                        <div className="flex items-baseline justify-between gap-2 font-mono text-[0.72rem]">
                          <span className="text-ink">
                            {c.label}
                            <span className="ml-1.5 text-ink/45">
                              (bobot {c.weight}
                              {c.direction === "penalty" ? ", pengurang" : ""})
                            </span>
                          </span>
                          <span
                            className={`tabular-nums font-bold ${
                              c.points < 0
                                ? "text-[#b3320a] dark:text-[#f0a36e]"
                                : "text-ink-deep"
                            }`}
                          >
                            {c.points > 0 ? "+" : ""}
                            {c.points}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-ink/10">
                          <div
                            className={`h-full ${
                              c.points < 0 ? "bg-[#d96a23]" : "bg-ink-deep"
                            }`}
                            style={{ width: pointsBarWidth(c.points, maxAbsPoints) }}
                          />
                        </div>
                        <p className="mt-1 font-mono text-[0.64rem] leading-snug text-ink/55">
                          {c.signalValue == null
                            ? c.note
                            : `sinyal ${c.signalValue} · ${c.note}`}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {/* sources */}
                  {l.sources.length > 0 && (
                    <div className="mt-4 border-t border-dashed border-ink/20 pt-3">
                      <p className="font-mono text-[0.62rem] uppercase tracking-wider text-ink/45">
                        Sumber (tautan langsung)
                      </p>
                      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                        {l.sources.map((s, i) => (
                          <li key={i} className="font-mono text-[0.72rem]">
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
                              >
                                {s.label} ↗
                              </a>
                            ) : (
                              <span className="text-ink/60">{s.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Phase-3 promotion seam (wired in Step 3.4) */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-dashed border-ink/20 pt-3">
                    <button
                      type="button"
                      disabled
                      title="Tersedia di Langkah 3.4 (promosi lead menjadi Misi Verifikasi Lapangan)"
                      className="cursor-not-allowed border border-dashed border-ink/40 bg-ink/5 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-ink/40"
                    >
                      Promosikan ke Misi
                    </button>
                    <span className="font-mono text-[0.62rem] text-ink/40">
                      Loop umpan-balik Fase 3, aktif di Langkah 3.4.
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {view.length === 0 && (
        <p className="mt-6 font-mono text-[0.78rem] text-ink/55">
          Tidak ada lead yang cocok dengan filter.
        </p>
      )}
    </div>
  );
}
