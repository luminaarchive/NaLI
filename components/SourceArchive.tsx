"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  RELIABILITY_LABEL,
  SOURCE_TYPE_LABEL,
  type Reliability,
  type SourceEntry,
  type SourceType,
} from "@/lib/types";

function excerpt(text: string | undefined, n = 120): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > n ? `${clean.slice(0, n).trimEnd()}…` : clean;
}

const ALL = "__all__";

export function SourceArchive({ sources }: { sources: SourceEntry[] }) {
  const [type, setType] = useState<string>(ALL);
  const [topic, setTopic] = useState<string>(ALL);
  const [reliability, setReliability] = useState<string>(ALL);

  const typeCounts = useMemo(() => {
    const m = new Map<SourceType, number>();
    for (const s of sources) m.set(s.type, (m.get(s.type) ?? 0) + 1);
    return m;
  }, [sources]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const s of sources) for (const t of s.topics ?? []) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [sources]);

  const reliabilities = useMemo(() => {
    const set = new Set<Reliability>();
    for (const s of sources) if (s.reliabilityLevel) set.add(s.reliabilityLevel);
    return [...set];
  }, [sources]);

  const filtered = useMemo(
    () =>
      sources.filter(
        (s) =>
          (type === ALL || s.type === type) &&
          (topic === ALL || (s.topics ?? []).includes(topic)) &&
          (reliability === ALL || s.reliabilityLevel === reliability),
      ),
    [sources, type, topic, reliability],
  );

  const selectClass =
    "border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.72rem] uppercase tracking-wider text-ink focus:border-ink focus:outline-none";

  return (
    <>
      {/* stats */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
          {sources.length} entri sumber terverifikasi
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {[...typeCounts.entries()].map(([t, n]) => (
            <li key={t} className="font-mono text-[0.68rem] uppercase tracking-wider text-gray">
              {SOURCE_TYPE_LABEL[t]} · {n}
            </li>
          ))}
        </ul>
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Tipe</span>
          <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value={ALL}>Semua tipe</option>
            {[...typeCounts.keys()].map((t) => (
              <option key={t} value={t}>
                {SOURCE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Topik</span>
          <select className={selectClass} value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value={ALL}>Semua topik</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Keandalan</span>
          <select
            className={selectClass}
            value={reliability}
            onChange={(e) => setReliability(e.target.value)}
          >
            <option value={ALL}>Semua tingkat</option>
            {reliabilities.map((r) => (
              <option key={r} value={r}>
                {RELIABILITY_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wider text-ink/50">
        Menampilkan {filtered.length} dari {sources.length}
      </p>

      {/* table (sm+) */}
      <div className="mt-4 hidden overflow-hidden border border-ink/60 sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-ink-wash">
              {["No.", "Sumber", "Tipe & keandalan", "Penulis / Lembaga", "Tahun", ""].map((h) => (
                <th
                  key={h}
                  className="border border-ink/40 px-4 py-3 text-left font-mono text-[0.68rem] uppercase tracking-label text-ink-deep"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr
                key={s.slug}
                className="group align-top font-mono text-[0.8rem] odd:bg-ink-wash/40 hover:bg-ink-wash"
              >
                <td className="border border-ink/30 px-4 py-3 font-mono text-[0.7rem] text-ink/60">
                  {String(i + 1).padStart(3, "0")}
                </td>
                <td className="border border-ink/30 px-4 py-3">
                  <Link
                    href={`/arsip-sumber/${s.slug}`}
                    className="font-semibold text-ink-deep underline decoration-ink/40 decoration-1 underline-offset-2 group-hover:decoration-ink-deep"
                  >
                    {s.title}
                  </Link>
                  {s.topics && s.topics.length > 0 && (
                    <span className="mt-1 block font-mono text-[0.66rem] uppercase tracking-wider text-ink/50">
                      {s.topics.slice(0, 4).join(" · ")}
                    </span>
                  )}
                  {s.content && (
                    <span className="mt-1 block max-w-xl font-mono text-xs text-gray-light">
                      {excerpt(s.content)}
                    </span>
                  )}
                </td>
                <td className="border border-ink/30 px-4 py-3">
                  <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-label text-ink">
                    {SOURCE_TYPE_LABEL[s.type]}
                  </span>
                  {s.reliabilityLevel && (
                    <span className="mt-1.5 block font-mono text-[0.64rem] uppercase tracking-wider text-ink/60">
                      {RELIABILITY_LABEL[s.reliabilityLevel]}
                    </span>
                  )}
                  {s.checkedAt && (
                    <span className="mt-0.5 block font-mono text-[0.6rem] text-ink/40">
                      dicek {s.checkedAt}
                    </span>
                  )}
                </td>
                <td className="border border-ink/30 px-4 py-3 text-gray">
                  {s.institution ?? s.author ?? "Tidak dicatat"}
                </td>
                <td className="border border-ink/30 px-4 py-3 font-mono text-gray">
                  {s.year ?? "Tidak dicatat"}
                </td>
                <td className="border border-ink/30 px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/arsip-sumber/${s.slug}`}
                    className="font-mono text-[0.68rem] uppercase tracking-wider text-ink hover:underline"
                  >
                    Baca →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* stacked (mobile) */}
      <ul className="mt-4 space-y-4 sm:hidden">
        {filtered.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/arsip-sumber/${s.slug}`}
              className="block border border-dashed border-ink/60 bg-paper p-4 transition-colors hover:bg-ink-wash"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink">
                  {SOURCE_TYPE_LABEL[s.type]}
                </span>
                {s.year && (
                  <span className="font-mono text-xs uppercase tracking-wider text-ink/70">
                    {s.year}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-charcoal">{s.title}</p>
              {s.reliabilityLevel && (
                <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-wider text-ink/60">
                  {RELIABILITY_LABEL[s.reliabilityLevel]}
                </p>
              )}
              {s.content && (
                <p className="mt-2 font-mono text-xs leading-relaxed text-gray-light">
                  {excerpt(s.content, 100)}
                </p>
              )}
              <p className="mt-3 font-mono text-[0.66rem] uppercase tracking-wider text-ink">
                Baca keterangan →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
