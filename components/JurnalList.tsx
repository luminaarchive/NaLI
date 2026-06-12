"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  JOURNAL_CATEGORY_LABEL,
  type JournalCategory,
  type JournalEntry,
} from "@/lib/types";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

const ALL = "__all__";

type Card = Pick<
  JournalEntry,
  "slug" | "title" | "dek" | "category" | "topics" | "geography" | "confidence" | "readingMinutes"
>;

export function JurnalList({ entries }: { entries: Card[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [topic, setTopic] = useState<string>(ALL);
  const [geo, setGeo] = useState<string>(ALL);

  const categories = useMemo(() => {
    const m = new Map<JournalCategory, number>();
    for (const e of entries) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const topics = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) for (const t of e.topics) s.add(t);
    return [...s].sort((a, b) => a.localeCompare(b, "id"));
  }, [entries]);

  const geographies = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) for (const g of e.geography) s.add(g);
    return [...s].sort((a, b) => a.localeCompare(b, "id"));
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(
      (e) =>
        (category === ALL || e.category === category) &&
        (topic === ALL || e.topics.includes(topic)) &&
        (geo === ALL || e.geography.includes(geo)) &&
        (q === "" ||
          e.title.toLowerCase().includes(q) ||
          e.dek.toLowerCase().includes(q) ||
          e.topics.some((t) => t.toLowerCase().includes(q))),
    );
  }, [entries, query, category, topic, geo]);

  const selectClass =
    "border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.72rem] uppercase tracking-wider text-ink focus:border-ink focus:outline-none";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
          {entries.length} entri jurnal
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {categories.map(([c, n]) => (
            <li key={c} className="font-mono text-[0.68rem] uppercase tracking-wider text-gray">
              {JOURNAL_CATEGORY_LABEL[c]} · {n}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Cari</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="kata kunci, spesies, tempat"
            className="border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.74rem] text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Kategori</span>
          <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value={ALL}>Semua kategori</option>
            {categories.map(([c]) => (
              <option key={c} value={c}>
                {JOURNAL_CATEGORY_LABEL[c]}
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
          <span className="label text-ink/60">Wilayah</span>
          <select className={selectClass} value={geo} onChange={(e) => setGeo(e.target.value)}>
            <option value={ALL}>Semua wilayah</option>
            {geographies.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wider text-ink/50">
        Menampilkan {filtered.length} dari {entries.length}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/jurnal/${e.slug}`}
              className="flex h-full flex-col border border-dashed border-ink/60 bg-paper p-5 transition-colors hover:bg-ink-wash"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink">
                  {JOURNAL_CATEGORY_LABEL[e.category]}
                </span>
                <ConfidenceBadge confidence={e.confidence} size="sm" />
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-ink-black">
                {e.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray">{e.dek}</p>
              <p className="mt-3 font-mono text-[0.64rem] uppercase tracking-wider text-ink/50">
                {e.topics.slice(0, 3).join(" · ")}
                {e.readingMinutes ? ` · ${e.readingMinutes} mnt` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 font-mono text-[0.85rem] text-gray">
          Tidak ada entri yang cocok dengan saringan ini.
        </p>
      )}
    </>
  );
}
