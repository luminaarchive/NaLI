"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ACCESS_TYPE_LABEL,
  PUBLICATION_TYPE_LABEL,
  type AccessType,
  type PublicationType,
} from "@/lib/types";
import { renderItalicTitle, stripHtmlTags } from "@/lib/jurnal-format";


const ALL = "__all__";

export type PublicationCard = {
  slug: string;
  title: string;
  publisherOrInstitution: string;
  journalOrCollection?: string;
  publicationType: PublicationType;
  year?: string;
  doi?: string;
  synopsis: string;
  topics: string[];
  geography: string[];
  accessType: AccessType;
  sourceUrl: string;
  pdfAvailable: boolean;
  downloadLabel: string;
  downloadUrl: string;
  coverImage: string | null;
  coverAlt: string;
};

export function PublicationCatalog({ items }: { items: PublicationCard[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<string>(ALL);
  const [publisher, setPublisher] = useState<string>(ALL);
  const [access, setAccess] = useState<string>(ALL);

  const types = useMemo(() => {
    const m = new Map<PublicationType, number>();
    for (const i of items) m.set(i.publicationType, (m.get(i.publicationType) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const publishers = useMemo(
    () => [...new Set(items.map((i) => i.publisherOrInstitution))].sort((a, b) => a.localeCompare(b, "id")),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (type === ALL || i.publicationType === type) &&
        (publisher === ALL || i.publisherOrInstitution === publisher) &&
        (access === ALL || i.accessType === access) &&
        (q === "" ||
          i.title.toLowerCase().includes(q) ||
          i.publisherOrInstitution.toLowerCase().includes(q) ||
          i.synopsis.toLowerCase().includes(q) ||
          i.topics.some((t) => t.toLowerCase().includes(q))),
    );
  }, [items, query, type, publisher, access]);

  const selectClass =
    "border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.72rem] uppercase tracking-wider text-ink focus:border-ink focus:outline-none";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="font-mono text-xs uppercase tracking-wider text-ink/70">
          {items.length} publikasi terkatalog
        </p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {types.map(([t, n]) => (
            <li key={t} className="font-mono text-[0.68rem] uppercase tracking-wider text-gray">
              {PUBLICATION_TYPE_LABEL[t]} · {n}
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
            placeholder="judul, penerbit, topik"
            className="border border-dashed border-ink/60 bg-paper px-3 py-2 font-mono text-[0.74rem] text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Jenis</span>
          <select className={selectClass} value={type} onChange={(e) => setType(e.target.value)}>
            <option value={ALL}>Semua jenis</option>
            {types.map(([t]) => (
              <option key={t} value={t}>
                {PUBLICATION_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Penerbit</span>
          <select className={selectClass} value={publisher} onChange={(e) => setPublisher(e.target.value)}>
            <option value={ALL}>Semua penerbit</option>
            {publishers.map((pname) => (
              <option key={pname} value={pname}>
                {pname}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="label text-ink/60">Akses</span>
          <select className={selectClass} value={access} onChange={(e) => setAccess(e.target.value)}>
            <option value={ALL}>Semua akses</option>
            {[...new Set(items.map((i) => i.accessType))].map((a) => (
              <option key={a} value={a}>
                {ACCESS_TYPE_LABEL[a]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wider text-ink/50">
        Menampilkan {filtered.length} dari {items.length}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {filtered.map((i) => (
          <li key={i.slug} className="flex h-full flex-col border border-dashed border-ink/60 bg-paper">
            {i.coverImage ? (
              <Link href={`/jurnal/${i.slug}`} className="relative block aspect-[16/9] border-b border-dashed border-ink/45 bg-ink-wash/30">
                <Image src={i.coverImage} alt={stripHtmlTags(i.coverAlt)} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-contain p-4" />
              </Link>
            ) : (
              <Link
                href={`/jurnal/${i.slug}`}
                className="flex aspect-[16/9] flex-col justify-center border-b border-dashed border-ink/45 bg-ink-wash/40 p-5 transition-colors hover:bg-ink-wash"
              >
                <span className="label text-ink/60">{PUBLICATION_TYPE_LABEL[i.publicationType]}</span>
                <span className="mt-1 font-display text-base font-semibold leading-snug text-ink-black line-clamp-3">{renderItalicTitle(i.title)}</span>
                <span className="mt-1 font-mono text-[0.64rem] text-ink/60">{i.journalOrCollection ?? i.publisherOrInstitution}</span>
              </Link>
            )}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-dashed border-ink/50 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-ink">
                  {PUBLICATION_TYPE_LABEL[i.publicationType]}
                </span>
                {i.pdfAvailable && (
                  <span className="border border-dashed border-ink-deep/60 bg-ink-wash/50 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-label text-ink-deep">
                    PDF tersedia
                  </span>
                )}
                <span className="ml-auto font-mono text-[0.6rem] uppercase tracking-wider text-ink/55">
                  {ACCESS_TYPE_LABEL[i.accessType]}
                </span>
              </div>
              <h2 className="mt-3 font-display text-base font-semibold leading-snug text-ink-black">
                <Link href={`/jurnal/${i.slug}`} className="hover:text-ink-deep hover:underline">
                  {renderItalicTitle(i.title)}
                </Link>
              </h2>
              <p className="mt-1 font-mono text-[0.64rem] uppercase tracking-wider text-ink/55">
                {i.journalOrCollection ? `${i.journalOrCollection}` : i.publisherOrInstitution}
                {i.year ? ` · ${i.year}` : ""}
                {i.doi ? " · DOI" : ""}
              </p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-gray line-clamp-4">{i.synopsis}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <a
                  href={i.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink bg-ink px-3 py-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
                >
                  {i.downloadLabel}
                </a>
                <Link href={`/jurnal/${i.slug}`} className="font-mono text-[0.62rem] uppercase tracking-wider text-ink hover:underline">
                  Detail →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="mt-8 font-mono text-[0.85rem] text-gray">Tidak ada publikasi yang cocok dengan saringan ini.</p>
      )}
    </>
  );
}
