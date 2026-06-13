"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ACCESS_TYPE_LABEL,
  PUBLICATION_TYPE_LABEL,
  type AccessType,
  type PublicationType,
} from "@/lib/types";
import { renderItalicTitle, stripHtmlTags } from "@/lib/jurnal-format";
import { JurnalSkeleton } from "./JurnalSkeleton";

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
  
  // Rich Academic Metadata
  authors?: string[];
  language?: string;
  peerReviewed?: boolean;
  volume?: string;
  issue?: string;
  pages?: string;
  fileSize?: string;
  license?: string;
  cover?: any;
};

export function PublicationCatalog({ items }: { items: PublicationCard[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Card expand/collapse states for advanced metadata
  const [expandedSlugs, setExpandedSlugs] = useState<Record<string, boolean>>({});
  // Clipboard copy state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Filter sections toggle states (sidebar accordions)
  const [showYearFilter, setShowYearFilter] = useState(true);
  const [showPublisherFilter, setShowPublisherFilter] = useState(true);
  const [showTopicFilter, setShowTopicFilter] = useState(true);
  const [showLangFilter, setShowLangFilter] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute total dynamic index counts
  const facetCounts = useMemo(() => {
    const years: Record<string, number> = {};
    const publishers: Record<string, number> = {};
    const languages: Record<string, number> = {};
    const types: Record<string, number> = {};
    const access: Record<string, number> = {};
    const topics: Record<string, number> = {};

    for (const item of items) {
      if (item.year) years[item.year] = (years[item.year] ?? 0) + 1;
      publishers[item.publisherOrInstitution] = (publishers[item.publisherOrInstitution] ?? 0) + 1;
      if (item.language) {
        const l = item.language.toUpperCase();
        languages[l] = (languages[l] ?? 0) + 1;
      }
      types[item.publicationType] = (types[item.publicationType] ?? 0) + 1;
      access[item.accessType] = (access[item.accessType] ?? 0) + 1;
      for (const t of item.topics) {
        topics[t] = (topics[t] ?? 0) + 1;
      }
    }

    return { years, publishers, languages, types, access, topics };
  }, [items]);

  const toggleFilter = (list: string[], setList: (l: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedYears([]);
    setSelectedPublishers([]);
    setSelectedLanguages([]);
    setSelectedTypes([]);
    setSelectedAccess([]);
    setSelectedTopics([]);
  };

  const isFilterActive =
    query.trim() !== "" ||
    selectedYears.length > 0 ||
    selectedPublishers.length > 0 ||
    selectedLanguages.length > 0 ||
    selectedTypes.length > 0 ||
    selectedAccess.length > 0 ||
    selectedTopics.length > 0;

  // Filter & Search publications
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      // 1. Search Query mapping
      if (q !== "") {
        const titleMatch = i.title.toLowerCase().includes(q);
        const synopsisMatch = i.synopsis.toLowerCase().includes(q);
        const publisherMatch = i.publisherOrInstitution.toLowerCase().includes(q);
        const journalMatch = i.journalOrCollection?.toLowerCase().includes(q) ?? false;
        const authorMatch = i.authors?.some((a) => a.toLowerCase().includes(q)) ?? false;
        const topicMatch = i.topics.some((t) => t.toLowerCase().includes(q));
        const geoMatch = i.geography.some((g) => g.toLowerCase().includes(q));
        const doiMatch = i.doi?.toLowerCase().includes(q) ?? false;

        if (
          !titleMatch &&
          !synopsisMatch &&
          !publisherMatch &&
          !journalMatch &&
          !authorMatch &&
          !topicMatch &&
          !geoMatch &&
          !doiMatch
        ) {
          return false;
        }
      }

      // 2. Year Filter
      if (selectedYears.length > 0 && (!i.year || !selectedYears.includes(i.year))) return false;

      // 3. Publisher Filter
      if (selectedPublishers.length > 0 && !selectedPublishers.includes(i.publisherOrInstitution)) return false;

      // 4. Language Filter
      if (selectedLanguages.length > 0 && (!i.language || !selectedLanguages.includes(i.language.toUpperCase()))) return false;

      // 5. Type Filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(i.publicationType)) return false;

      // 6. Access Filter
      if (selectedAccess.length > 0 && !selectedAccess.includes(i.accessType)) return false;

      // 7. Topic Filter
      if (selectedTopics.length > 0 && !i.topics.some((t) => selectedTopics.includes(t))) return false;

      return true;
    });
  }, [items, query, selectedYears, selectedPublishers, selectedLanguages, selectedTypes, selectedAccess, selectedTopics]);

  const copyToClipboard = (slug: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/jurnal/${slug}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2000);
      });
    }
  };

  const toggleExpand = (slug: string) => {
    setExpandedSlugs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  if (!isMounted) {
    return <JurnalSkeleton />;
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
      {/* Sidebar Filter Panel */}
      <aside className="border border-dashed border-ink/40 bg-ink-wash/10 p-5 space-y-6 lg:sticky lg:top-20 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-3">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-black">Penyaring</h3>
          {isFilterActive && (
            <button
              onClick={clearAllFilters}
              className="text-[0.68rem] font-mono uppercase tracking-wider text-ink hover:underline"
            >
              Bersihkan
            </button>
          )}
        </div>

        {/* Text Search Input */}
        <div className="space-y-1">
          <label className="label text-ink/60 text-[0.66rem]">Cari Repositori</label>
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="judul, penulis, abstrak, DOI..."
              className="w-full border border-dashed border-ink/50 bg-paper px-3 py-2 font-mono text-[0.74rem] text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
            />
          </div>
        </div>

        {/* Filter by Publisher */}
        <div className="space-y-2">
          <button
            onClick={() => setShowPublisherFilter(!showPublisherFilter)}
            className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink"
          >
            <span>Penerbit / Jurnal</span>
            <span>{showPublisherFilter ? "−" : "+"}</span>
          </button>
          {showPublisherFilter && (
            <ul className="space-y-1.5 pl-1 max-h-40 overflow-y-auto custom-scrollbar">
              {Object.entries(facetCounts.publishers).map(([pub, count]) => (
                <li key={pub} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`pub-${pub}`}
                    checked={selectedPublishers.includes(pub)}
                    onChange={() => toggleFilter(selectedPublishers, setSelectedPublishers, pub)}
                    className="h-3 w-3 border-ink rounded-none bg-paper accent-ink focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor={`pub-${pub}`} className="font-mono text-[0.7rem] text-ink-charcoal hover:text-ink cursor-pointer truncate flex-1">
                    {pub} <span className="text-ink/40">({count})</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Filter by Year */}
        <div className="space-y-2">
          <button
            onClick={() => setShowYearFilter(!showYearFilter)}
            className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink"
          >
            <span>Tahun Terbit</span>
            <span>{showYearFilter ? "−" : "+"}</span>
          </button>
          {showYearFilter && (
            <ul className="space-y-1.5 pl-1 max-h-40 overflow-y-auto custom-scrollbar">
              {Object.entries(facetCounts.years)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([yr, count]) => (
                  <li key={yr} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`yr-${yr}`}
                      checked={selectedYears.includes(yr)}
                      onChange={() => toggleFilter(selectedYears, setSelectedYears, yr)}
                      className="h-3 w-3 border-ink rounded-none bg-paper accent-ink focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor={`yr-${yr}`} className="font-mono text-[0.7rem] text-ink-charcoal hover:text-ink cursor-pointer">
                      {yr} <span className="text-ink/40">({count})</span>
                    </label>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Filter by Topics */}
        <div className="space-y-2">
          <button
            onClick={() => setShowTopicFilter(!showTopicFilter)}
            className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink"
          >
            <span>Topik Utama</span>
            <span>{showTopicFilter ? "−" : "+"}</span>
          </button>
          {showTopicFilter && (
            <ul className="space-y-1.5 pl-1 max-h-48 overflow-y-auto custom-scrollbar">
              {Object.entries(facetCounts.topics)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([topic, count]) => (
                  <li key={topic} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`topic-${topic}`}
                      checked={selectedTopics.includes(topic)}
                      onChange={() => toggleFilter(selectedTopics, setSelectedTopics, topic)}
                      className="h-3 w-3 border-ink rounded-none bg-paper accent-ink focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor={`topic-${topic}`} className="font-mono text-[0.7rem] text-ink-charcoal hover:text-ink cursor-pointer capitalize">
                      {topic} <span className="text-ink/40">({count})</span>
                    </label>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Filter by Language */}
        <div className="space-y-2">
          <button
            onClick={() => setShowLangFilter(!showLangFilter)}
            className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink"
          >
            <span>Bahasa</span>
            <span>{showLangFilter ? "−" : "+"}</span>
          </button>
          {showLangFilter && (
            <ul className="space-y-1.5 pl-1">
              {Object.entries(facetCounts.languages).map(([lang, count]) => (
                <li key={lang} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`lang-${lang}`}
                    checked={selectedLanguages.includes(lang)}
                    onChange={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                    className="h-3 w-3 border-ink rounded-none bg-paper accent-ink focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor={`lang-${lang}`} className="font-mono text-[0.7rem] text-ink-charcoal hover:text-ink cursor-pointer">
                    {lang} <span className="text-ink/40">({count})</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Publications List Column */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-ink/20 pb-4">
          <p className="font-mono text-xs uppercase tracking-wider text-ink/75">
            Menampilkan {filtered.length} dari {items.length} Publikasi
          </p>
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[0.66rem] uppercase tracking-wider text-ink/50">Filter aktif:</span>
              <button
                onClick={clearAllFilters}
                className="border border-dashed border-ink/40 px-2 py-0.5 font-mono text-[0.62rem] uppercase text-ink hover:bg-ink-wash"
              >
                Reset Semuanya ×
              </button>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-ink/40 p-10 text-center">
            <p className="font-mono text-sm text-gray">Tidak ada publikasi ilmiah yang cocok dengan kriteria pencarian.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 border border-ink bg-ink text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-ink-deep"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          /* Adaptive Layout Grid:
             - lg:grid-cols-1: stacked vertical on mobile/tablet, single column list on laptop
             - [@media(min-width:1400px)]:grid-cols-2: two columns side-by-side on large ultrawide desktops
          */
          <ul className="grid gap-6 grid-cols-1 [@media(min-width:1400px)]:grid-cols-2">
            {filtered.map((i) => {
              const coverUrl = i.coverImage;
              const isExpanded = expandedSlugs[i.slug] ?? false;

              return (
                <li
                  key={i.slug}
                  className="group relative flex flex-col lg:flex-row border border-dashed border-ink/50 bg-paper transition-all hover:shadow-md hover:border-ink hover:scale-[1.003] duration-300"
                >
                  {/* Left Column: Portrait PDF Preview Cover */}
                  <div className="w-full lg:w-[150px] xl:w-[160px] aspect-[3/4] relative flex-shrink-0 border-b lg:border-b-0 lg:border-r border-dashed border-ink/30 bg-ink-wash/5 overflow-hidden flex items-center justify-center">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={stripHtmlTags(i.coverAlt)}
                        fill
                        sizes="(max-width: 1024px) 200px, 160px"
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                        priority={i.slug === "anak-krakatau"}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center text-center p-4">
                        <span className="font-mono text-[0.55rem] uppercase tracking-widest text-ink/50">Dokumen</span>
                        <p className="mt-1 font-display text-[0.7rem] font-bold leading-tight text-ink-black line-clamp-3">
                          {stripHtmlTags(i.title)}
                        </p>
                        <p className="mt-2 font-mono text-[0.5rem] text-ink/40 leading-normal">Cover belum terverifikasi</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Publication Details */}
                  <div className="flex-1 flex flex-col p-5">
                    {/* Quality Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {i.peerReviewed && (
                        <span className="border border-ink bg-ink text-paper px-2 py-0.5 font-mono text-[0.58rem] font-bold uppercase tracking-wider">
                          Peer Reviewed
                        </span>
                      )}
                      <span className="border border-dashed border-ink/50 px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-ink font-semibold">
                        {PUBLICATION_TYPE_LABEL[i.publicationType]}
                      </span>
                      <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-wider text-ink/50">
                        {ACCESS_TYPE_LABEL[i.accessType]}
                      </span>
                    </div>

                    {/* Publication Title */}
                    <h2 className="mt-3 font-display text-base font-bold leading-snug tracking-tight text-ink-black">
                      <Link href={`/jurnal/${i.slug}`} className="hover:text-ink-deep hover:underline after:absolute after:inset-0 after:z-10">
                        {renderItalicTitle(i.title)}
                      </Link>
                    </h2>

                    {/* Primary Metadata */}
                    <div className="mt-2 font-mono text-[0.7rem] text-ink-charcoal leading-relaxed">
                      {i.authors && i.authors.length > 0 && (
                        <p className="truncate">
                          <span className="text-ink/50 uppercase tracking-widest text-[0.55rem] font-bold block">Penulis:</span>
                          {i.authors.join(", ")}
                        </p>
                      )}
                      <p className="mt-1">
                        {i.journalOrCollection ? `${i.journalOrCollection}` : i.publisherOrInstitution}
                        {i.year ? ` · ${i.year}` : ""}
                      </p>
                    </div>

                    {/* Synopsis Description */}
                    <p className="mt-3 text-xs leading-relaxed text-gray line-clamp-3 flex-1">{i.synopsis}</p>

                    {/* Secondary Advanced Metadata Toggle Area */}
                    <div className="relative z-20 mt-3 pt-2 border-t border-dashed border-ink/20">
                      <button
                        onClick={() => toggleExpand(i.slug)}
                        className="text-[0.66rem] font-mono uppercase tracking-wider text-ink/60 hover:text-ink hover:underline flex items-center gap-1"
                      >
                        <span>{isExpanded ? "Sembunyikan" : "Detail Metadata"}</span>
                        <span>{isExpanded ? "▲" : "▼"}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 bg-ink-wash/20 border border-dashed border-ink/20 p-3 text-[0.66rem] font-mono space-y-1 text-ink/80 animate-fadeIn">
                          {i.doi && (
                            <p>
                              <span className="font-bold text-ink/55 uppercase tracking-wide">DOI:</span>{" "}
                              <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                                {i.doi}
                              </a>
                            </p>
                          )}
                          {i.publisherOrInstitution && (
                            <p>
                              <span className="font-bold text-ink/55 uppercase tracking-wide">Penerbit:</span> {i.publisherOrInstitution}
                            </p>
                          )}
                          {(i.volume || i.issue) && (
                            <p>
                              <span className="font-bold text-ink/55 uppercase tracking-wide">Terbitan:</span> Vol. {i.volume ?? "-"}, No. {i.issue ?? "-"}
                            </p>
                          )}
                          {i.pages && (
                            <p>
                              <span className="font-bold text-ink/55 uppercase tracking-wide">Halaman:</span> {i.pages}
                            </p>
                          )}
                          {i.language && (
                            <p>
                              <span className="font-bold text-ink/55 uppercase tracking-wide">Bahasa:</span> {i.language.toUpperCase()}
                            </p>
                          )}
                          {i.license && (
                            <p>
                              <span className="font-bold text-ink/55 uppercase tracking-wide">Lisensi:</span> {i.license}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions panel */}
                    <div className="relative z-20 mt-4 flex items-center justify-between gap-3">
                      <a
                        href={i.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 border border-ink bg-ink px-4 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-paper transition-all hover:bg-ink-deep hover:scale-[1.02]"
                        data-jurnal-download-primary="pdf"
                      >
                        {i.downloadLabel} {i.fileSize ? `(${i.fileSize})` : ""} <span aria-hidden>↓</span>
                      </a>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => copyToClipboard(i.slug)}
                          className="border border-dashed border-ink/40 px-2.5 py-2 font-mono text-[0.62rem] uppercase tracking-wider text-ink/80 hover:bg-ink-wash hover:text-ink"
                          aria-label="Copy publication link"
                        >
                          {copiedSlug === i.slug ? "Tersalin!" : "Salin Link"}
                        </button>
                        <Link
                          href={`/jurnal/${i.slug}`}
                          className="font-mono text-[0.66rem] uppercase tracking-wider text-ink hover:underline py-2"
                        >
                          Detail →
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
