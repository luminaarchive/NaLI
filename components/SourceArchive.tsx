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
import { SegmentedBar } from "./SegmentedBar";
import { PulseDot } from "./PulseDot";
import { Glyph, glyphForSourceType } from "./Glyph";
import { CopyLinkButton } from "./CopyLinkButton";

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
  const [q, setQ] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

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

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const from = yearFrom ? Number(yearFrom) : null;
    const to = yearTo ? Number(yearTo) : null;
    const matchesText = (s: SourceEntry) => {
      if (!query) return true;
      const hay = [
        s.title,
        s.author,
        s.institution,
        s.related_topic,
        ...(s.topics ?? []),
        ...(s.keyClaims ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    };
    return sources.filter(
      (s) =>
        (type === ALL || s.type === type) &&
        (topic === ALL || (s.topics ?? []).includes(topic)) &&
        (reliability === ALL || s.reliabilityLevel === reliability) &&
        (from === null || (s.year ?? 0) >= from) &&
        (to === null || (s.year ?? 9999) <= to) &&
        matchesText(s),
    );
  }, [sources, type, topic, reliability, q, yearFrom, yearTo]);

  const resetAll = () => {
    setType(ALL);
    setTopic(ALL);
    setReliability(ALL);
    setQ("");
    setYearFrom("");
    setYearTo("");
  };

  const selectClass =
    "border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.72rem] uppercase tracking-wider text-ink focus:border-ink focus:outline-none";

  return (
    <>
      {/* instrument panel: total + live indicator + type distribution */}
      <div className="border border-dashed border-ink/40 bg-ink-wash/30 p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-2xl font-bold leading-none text-ink-black">
            {sources.length}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-gray">
            entri sumber terverifikasi
          </span>
          <span className="marching-ants ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-gray">
            <PulseDot live /> Terus diperbarui
          </span>
        </div>
        <SegmentedBar
          className="mt-3"
          segments={[...typeCounts.entries()].map(([t, n]) => ({
            label: SOURCE_TYPE_LABEL[t],
            value: n,
          }))}
        />
      </div>

      {/* free-text search */}
      <div className="mt-5">
        <label className="flex flex-col gap-1">
          <span className="label text-gray">Cari teks bebas</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Judul, penulis, lembaga, topik, atau klaim..."
            className="w-full border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.78rem] text-ink placeholder:text-gray-light focus:border-ink focus:outline-none"
          />
        </label>
      </div>

      {/* filters */}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label text-gray">Tipe</span>
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
          <span className="label text-gray">Topik</span>
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
          <span className="label text-gray">Keandalan</span>
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
        <label className="flex flex-col gap-1">
          <span className="label text-gray">Tahun</span>
          <span className="flex items-center gap-1">
            <input
              type="number"
              inputMode="numeric"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="dari"
              className="w-20 border border-dashed border-ink/60 bg-paper px-2 py-2 font-mono text-[0.72rem] text-ink placeholder:text-gray-light focus:border-ink focus:outline-none"
            />
            <span className="text-gray" aria-hidden>
              –
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="sampai"
              className="w-20 border border-dashed border-ink/60 bg-paper px-2 py-2 font-mono text-[0.72rem] text-ink placeholder:text-gray-light focus:border-ink focus:outline-none"
            />
          </span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">
          Menampilkan {filtered.length} dari {sources.length}
        </p>
        {(type !== ALL || topic !== ALL || reliability !== ALL || q || yearFrom || yearTo) && (
          <button
            type="button"
            onClick={resetAll}
            className="border border-dashed border-ink/50 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* table (sm+) */}
      <div className="mt-4 hidden overflow-hidden border border-ink/60 sm:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-ink-wash">
              {["No.", "Sumber", "Tipe & keandalan", "Penulis / Lembaga", "Tahun", ""].map((h) => (
                <th
                  key={h}
                  className="border border-ink/40 px-4 py-3 text-left font-mono text-[0.7rem] uppercase tracking-label text-ink-deep"
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
                <td className="border border-ink/30 px-4 py-3 font-mono text-[0.7rem] text-gray">
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
                    <span className="mt-1 block font-mono text-[0.7rem] uppercase tracking-wider text-gray">
                      {s.topics.slice(0, 4).join(" · ")}
                    </span>
                  )}
                  {s.content && (
                    <span className="mt-1 block max-w-xl font-mono text-xs text-gray">
                      {excerpt(s.content)}
                    </span>
                  )}
                </td>
                <td className="border border-ink/30 px-4 py-3">
                  <span className="inline-flex items-center gap-1 border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-label text-ink">
                    <Glyph name={glyphForSourceType(s.type)} className="h-3 w-3" />
                    {SOURCE_TYPE_LABEL[s.type]}
                  </span>
                  {s.reliabilityLevel && (
                    <span className="mt-1.5 block font-mono text-[0.7rem] uppercase tracking-wider text-gray">
                      {RELIABILITY_LABEL[s.reliabilityLevel]}
                    </span>
                  )}
                  {s.checkedAt && (
                    <span className="mt-0.5 block font-mono text-[0.7rem] text-gray">
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
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/arsip-sumber/${s.slug}`}
                      className="font-mono text-[0.7rem] uppercase tracking-wider text-ink hover:underline"
                    >
                      Baca →
                    </Link>
                    <CopyLinkButton path={`/arsip-sumber/${s.slug}`} />
                  </div>
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
                <span className="inline-flex items-center gap-1 border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.7rem] uppercase tracking-label text-ink">
                  <Glyph name={glyphForSourceType(s.type)} className="h-3 w-3" />
                  {SOURCE_TYPE_LABEL[s.type]}
                </span>
                {s.year && (
                  <span className="font-mono text-xs uppercase tracking-wider text-gray">
                    {s.year}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-charcoal">{s.title}</p>
              {s.reliabilityLevel && (
                <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-wider text-gray">
                  {RELIABILITY_LABEL[s.reliabilityLevel]}
                </p>
              )}
              {s.content && (
                <p className="mt-2 font-mono text-xs leading-relaxed text-gray">
                  {excerpt(s.content, 100)}
                </p>
              )}
              <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-wider text-ink">
                Baca keterangan →
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
