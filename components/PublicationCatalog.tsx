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
  
  // Academic Metadata
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
  const [sortBy, setSortBy] = useState("year_desc");

  // Mobile Filters drawer open state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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

  // Compute total dynamic index counts (facets) based on database entries
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

  // Filter publications
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      // 1. Search Query mapping across 10 fields
      if (q !== "") {
        const titleMatch = i.title.toLowerCase().includes(q);
        const synopsisMatch = i.synopsis.toLowerCase().includes(q);
        const publisherMatch = i.publisherOrInstitution.toLowerCase().includes(q);
        const journalMatch = i.journalOrCollection?.toLowerCase().includes(q) ?? false;
        const authorMatch = i.authors?.some((a) => a.toLowerCase().includes(q)) ?? false;
        const topicMatch = i.topics.some((t) => t.toLowerCase().includes(q));
        const geoMatch = i.geography.some((g) => g.toLowerCase().includes(q));
        const doiMatch = i.doi?.toLowerCase().includes(q) ?? false;
        const typeMatch = PUBLICATION_TYPE_LABEL[i.publicationType].toLowerCase().includes(q);
        const langMatch = i.language?.toLowerCase().includes(q) ?? false;

        if (
          !titleMatch &&
          !synopsisMatch &&
          !publisherMatch &&
          !journalMatch &&
          !authorMatch &&
          !topicMatch &&
          !geoMatch &&
          !doiMatch &&
          !typeMatch &&
          !langMatch
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

  // Sort publications
  const sortedAndFiltered = useMemo(() => {
    let list = [...filtered];
    if (sortBy === "year_desc") {
      list.sort((a, b) => (b.year || "").localeCompare(a.year || ""));
    } else if (sortBy === "year_asc") {
      list.sort((a, b) => (a.year || "").localeCompare(b.year || ""));
    } else if (sortBy === "title_asc") {
      list.sort((a, b) => a.title.localeCompare(b.title, "id"));
    } else if (sortBy === "title_desc") {
      list.sort((a, b) => b.title.localeCompare(a.title, "id"));
    }
    return list;
  }, [filtered, sortBy]);

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

  // Common Filter Content for reuse in desktop and mobile drawer
  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between border-b border-dashed border-ink/20 pb-3">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-black">Penyaring</h3>
        {isFilterActive && (
          <button
            onClick={clearAllFilters}
            className="text-[0.68rem] font-mono uppercase tracking-wider text-ink hover:underline focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
            aria-label="Clear all active filters"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Text Search Input */}
      <div className="space-y-1">
        <label htmlFor="search-input" className="label text-ink/60 text-[0.66rem] uppercase tracking-wider block font-bold">Cari Repositori</label>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="judul, penulis, abstrak, DOI..."
          className="w-full border border-dashed border-ink/50 bg-paper px-3 py-2 font-mono text-[0.74rem] text-ink placeholder:text-ink/45 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink"
        />
      </div>

      {/* Sort Options */}
      <div className="space-y-1">
        <label htmlFor="sort-select" className="label text-ink/60 text-[0.66rem] uppercase tracking-wider block font-bold">Urutkan</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border border-dashed border-ink/50 bg-paper px-2 py-1.5 font-mono text-[0.74rem] text-ink focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
        >
          <option value="year_desc">Tahun Baru → Lama</option>
          <option value="year_asc">Tahun Lama → Baru</option>
          <option value="title_asc">Judul A-Z</option>
          <option value="title_desc">Judul Z-A</option>
        </select>
      </div>

      {/* Filter by Publisher */}
      <div className="space-y-2">
        <button
          onClick={() => setShowPublisherFilter(!showPublisherFilter)}
          className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-expanded={showPublisherFilter}
        >
          <span>Penerbit / Jurnal</span>
          <span aria-hidden>{showPublisherFilter ? "−" : "+"}</span>
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
                  className="h-3.5 w-3.5 border-ink rounded-none bg-paper accent-ink focus:ring-0 focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
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
          className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-expanded={showYearFilter}
        >
          <span>Tahun Terbit</span>
          <span aria-hidden>{showYearFilter ? "−" : "+"}</span>
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
                    className="h-3.5 w-3.5 border-ink rounded-none bg-paper accent-ink focus:ring-0 focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
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
          className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-expanded={showTopicFilter}
        >
          <span>Topik Utama</span>
          <span aria-hidden>{showTopicFilter ? "−" : "+"}</span>
        </button>
        {showTopicFilter && (
          <ul className="space-y-1.5 pl-1 max-h-48 overflow-y-auto custom-scrollbar">
            {Object.entries(facetCounts.topics)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 15)
              .map(([topic, count]) => (
                <li key={topic} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`topic-${topic}`}
                    checked={selectedTopics.includes(topic)}
                    onChange={() => toggleFilter(selectedTopics, setSelectedTopics, topic)}
                    className="h-3.5 w-3.5 border-ink rounded-none bg-paper accent-ink focus:ring-0 focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
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
          className="flex w-full items-center justify-between font-display text-xs font-semibold uppercase tracking-wider text-ink-black hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          aria-expanded={showLangFilter}
        >
          <span>Bahasa</span>
          <span aria-hidden>{showLangFilter ? "−" : "+"}</span>
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
                  className="h-3.5 w-3.5 border-ink rounded-none bg-paper accent-ink focus:ring-0 focus-visible:ring-2 focus-visible:ring-ink cursor-pointer"
                />
                <label htmlFor={`lang-${lang}`} className="font-mono text-[0.7rem] text-ink-charcoal hover:text-ink cursor-pointer">
                  {lang} <span className="text-ink/40">({count})</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start relative">
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:block border border-dashed border-ink/40 bg-ink-wash/10 p-5 space-y-6 lg:sticky lg:top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <FilterContent />
      </aside>

      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between w-full border border-dashed border-ink/50 bg-ink-wash/10 p-3 mb-2">
        <span className="font-mono text-xs uppercase tracking-wider text-ink/80">
          Ditemukan {filtered.length} entri
        </span>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="border border-ink bg-ink text-paper px-4 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-wider hover:bg-ink-deep focus-visible:ring-2 focus-visible:ring-ink"
          aria-label="Open filter options dialog"
        >
          Penyaring & Urutkan
        </button>
      </div>

      {/* Mobile Filters Sliding Drawer / Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-ink-black/40 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
          <div className="w-[300px] max-w-[85vw] bg-paper border-r border-dashed border-ink p-5 flex flex-col justify-between h-full shadow-2xl relative animate-slideRight">
            <button
              onClick={() => setShowMobileFilters(false)}
              className="absolute top-4 right-4 text-ink-black font-mono text-xs uppercase tracking-wider border border-ink/30 px-2 py-0.5 hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
              aria-label="Close filters dialog"
            >
              Tutup ×
            </button>
            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-1 pt-6 flex-1">
              <FilterContent />
            </div>
          </div>
          {/* Overlay click to close */}
          <div className="flex-1 cursor-pointer" onClick={() => setShowMobileFilters(false)} />
        </div>
      )}

      {/* Publications List Column */}
      <div className="space-y-5 flex-1">
        <div className="hidden lg:flex items-center justify-between gap-4 border-b border-dashed border-ink/20 pb-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink/75">
            Ditemukan {sortedAndFiltered.length} dari {items.length} Publikasi Ilmiah
          </p>
          {isFilterActive && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[0.66rem] uppercase tracking-wider text-ink/50">Filter aktif:</span>
              <button
                onClick={clearAllFilters}
                className="border border-dashed border-ink/40 px-2 py-0.5 font-mono text-[0.62rem] uppercase text-ink hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
              >
                Reset Semuanya ×
              </button>
            </div>
          )}
        </div>

        {sortedAndFiltered.length === 0 ? (
          <div className="border border-dashed border-ink/40 p-10 text-center">
            <p className="font-mono text-sm text-gray">Tidak ada publikasi ilmiah yang cocok dengan kriteria pencarian.</p>
            <button
              onClick={clearAllFilters}
              className="mt-4 border border-ink bg-ink text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-ink-deep focus-visible:ring-2 focus-visible:ring-ink"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          /* High-Density Card List:
             - lg:grid-cols-1: Single column list on desktop/laptop
             - [@media(min-width:1400px)]:grid-cols-2: 2 columns grid side-by-side on wide screens
          */
          <ul className="grid gap-5 grid-cols-1 [@media(min-width:1400px)]:grid-cols-2">
            {sortedAndFiltered.map((i, index) => {
              const coverUrl = i.coverImage;
              const isExpanded = expandedSlugs[i.slug] ?? false;

              // First visible row gets loading preload (LCP optimization)
              const isLcp = index < 2;

              return (
                <li
                  key={i.slug}
                  className="group relative flex flex-col md:flex-row border border-dashed border-ink/40 bg-paper transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-sm hover:border-ink"
                >
                  {/* Left Column: Cover preview with custom scales (margin trimming) */}
                  <div className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] xl:w-[220px] aspect-[3/4] relative flex-shrink-0 border-b md:border-b-0 md:border-r border-dashed border-ink/30 bg-ink-wash/5 overflow-hidden flex items-center justify-center">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={stripHtmlTags(i.coverAlt)}
                        fill
                        sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, (max-width: 1024px) 180px, (max-width: 1280px) 200px, 220px"
                        // Image margin reduction trim formula
                        className="object-cover object-top scale-[1.10] transition-transform duration-300 group-hover:scale-[1.12]"
                        priority={isLcp}
                        loading={isLcp ? undefined : "lazy"}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center text-center p-3 bg-ink-wash/10">
                        <span className="font-mono text-[0.55rem] uppercase tracking-widest text-ink/55">Dokumen</span>
                        <p className="mt-1 font-display text-[0.7rem] font-bold leading-tight text-ink-black line-clamp-4">
                          {stripHtmlTags(i.title)}
                        </p>
                        <p className="mt-2 font-mono text-[0.5rem] text-ink/45 leading-normal">Cover belum terverifikasi</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: High-Density Details */}
                  <div className="flex-1 flex flex-col p-4">
                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {i.peerReviewed && (
                        <span className="border border-green-700/60 bg-green-50/50 text-green-800 dark:border-green-400/30 dark:bg-green-950/20 dark:text-green-300 px-1.5 py-0.5 font-mono text-[0.58rem] font-bold uppercase tracking-wider">
                          Peer Reviewed
                        </span>
                      )}
                      <span className="border border-dashed border-ink/50 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-ink/80 font-semibold">
                        {PUBLICATION_TYPE_LABEL[i.publicationType]}
                      </span>
                      <span className="ml-auto font-mono text-[0.58rem] uppercase tracking-wider text-ink/50 font-bold">
                        {ACCESS_TYPE_LABEL[i.accessType]}
                      </span>
                    </div>

                    {/* Publication Title (22px) */}
                    <h2 className="mt-2 font-display text-[1.375rem] font-bold leading-snug tracking-tight text-ink-black">
                      <Link href={`/jurnal/${i.slug}`} className="hover:text-ink-deep hover:underline after:absolute after:inset-0 after:z-10 focus-visible:outline-none" aria-label={`Read detail page of ${stripHtmlTags(i.title)}`}>
                        {renderItalicTitle(i.title)}
                      </Link>
                    </h2>

                    {/* Authors prominent listing (15px) */}
                    {i.authors && i.authors.length > 0 && (
                      <p className="mt-1.5 font-mono text-[0.9375rem] text-ink-charcoal truncate" title={i.authors.join(", ")}>
                        <span className="sr-only">Penulis:</span>
                        {i.authors.join(", ")}
                      </p>
                    )}

                    {/* Journal & Publisher listing (14px) */}
                    <p className="mt-0.5 font-mono text-[0.875rem] text-ink/80">
                      {i.journalOrCollection ? `${i.journalOrCollection}` : i.publisherOrInstitution}
                      {i.year ? ` · ${i.year}` : ""}
                    </p>

                    {/* DOI label */}
                    {i.doi && (
                      <p className="mt-0.5 font-mono text-[0.72rem] text-ink/45 select-all">
                        DOI: {i.doi}
                      </p>
                    )}

                    {/* Abstract Synopsis (15px) */}
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-charcoal line-clamp-3 flex-1">
                      {i.synopsis}
                    </p>

                    {/* Action Panel Layered Above Absolute Overlay Click Target */}
                    <div className="relative z-20 mt-3.5 pt-2.5 border-t border-dashed border-ink/20 flex flex-wrap items-center gap-3">
                      {i.pdfAvailable ? (
                        <a
                          href={i.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 border border-ink bg-ink px-4 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-paper hover:bg-ink-deep focus-visible:ring-2 focus-visible:ring-ink"
                        >
                          Unduh PDF <span aria-hidden>↓</span>
                        </a>
                      ) : (
                        <a
                          href={i.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 border border-ink px-4 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-ink hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
                        >
                          Buka Sumber <span aria-hidden>↗</span>
                        </a>
                      )}

                      <button
                        onClick={() => copyToClipboard(i.slug)}
                        className="border border-dashed border-ink/40 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-ink/80 hover:bg-ink-wash focus-visible:ring-2 focus-visible:ring-ink"
                        aria-label="Copy publication URL to clipboard"
                      >
                        {copiedSlug === i.slug ? "Tersalin!" : "Bagikan"}
                      </button>

                      <button
                        onClick={() => toggleExpand(i.slug)}
                        className="ml-auto text-[0.66rem] font-mono uppercase tracking-wider text-ink/60 hover:text-ink hover:underline flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-ink"
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? "Sembunyikan" : "Metadata"}</span>
                        <span aria-hidden>{isExpanded ? "▲" : "▼"}</span>
                      </button>
                    </div>

                    {/* Expandable definition detail metadata list (13px) */}
                    {isExpanded && (
                      <div className="relative z-20 mt-2 bg-ink-wash/20 border border-dashed border-ink/20 p-3 text-[0.8125rem] font-mono space-y-1 text-ink-charcoal animate-fadeIn">
                        {i.doi && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">DOI</span>
                            <a href={`https://doi.org/${i.doi}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink break-all">
                              {i.doi}
                            </a>
                          </div>
                        )}
                        {i.publisherOrInstitution && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">Penerbit</span>
                            <span>{i.publisherOrInstitution}</span>
                          </div>
                        )}
                        {i.volume && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">Volume</span>
                            <span>{i.volume}</span>
                          </div>
                        )}
                        {i.issue && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">Nomor</span>
                            <span>{i.issue}</span>
                          </div>
                        )}
                        {i.pages && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">Halaman</span>
                            <span>{i.pages}</span>
                          </div>
                        )}
                        {i.language && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">Bahasa</span>
                            <span>{i.language.toUpperCase()}</span>
                          </div>
                        )}
                        {i.license && (
                          <div className="grid grid-cols-[6rem_1fr] gap-2 border-b border-dashed border-ink/10 py-1 last:border-0">
                            <span className="font-bold text-ink/55 uppercase tracking-wide">Lisensi</span>
                            <span>{i.license}</span>
                          </div>
                        )}
                      </div>
                    )}

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
