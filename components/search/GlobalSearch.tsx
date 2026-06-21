"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import type { SearchDoc } from "@/app/api/search-index/route";

const OPEN_EVENT = "nali:open-search";
const TYPE_LABEL: Record<SearchDoc["type"], string> = {
  artikel: "Artikel",
  jurnal: "Jurnal",
  sumber: "Sumber",
};
const TYPE_ORDER: SearchDoc["type"][] = ["artikel", "jurnal", "sumber"];

/** Button that opens the global search. Dispatches a window event the modal listens for. */
export function SearchTrigger({ variant = "icon" }: { variant?: "icon" | "bar" }) {
  const open = () => window.dispatchEvent(new Event(OPEN_EVENT));
  if (variant === "bar") {
    return (
      <button
        type="button"
        onClick={open}
        className="flex w-full items-center gap-2 border border-dashed border-ink/50 px-3 py-2 font-mono text-[0.78rem] text-gray transition-colors hover:bg-ink-wash"
        aria-label="Cari di NaLI"
      >
        <Search className="h-4 w-4" strokeWidth={1.7} aria-hidden />
        Cari artikel, jurnal, sumber...
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={open}
      className="flex h-9 items-center gap-2 border border-dashed border-ink/50 px-2.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
      aria-label="Cari di NaLI (Cmd+K)"
      title="Cari (⌘K)"
    >
      <Search className="h-4 w-4" strokeWidth={1.7} aria-hidden />
      <span className="hidden xl:inline">Cari</span>
      <kbd className="hidden border border-ink/30 px-1 text-[0.6rem] text-ink/60 xl:inline">⌘K</kbd>
    </button>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadIndex = useCallback(async () => {
    if (docs || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/search-index");
      const data = await res.json();
      setDocs(data.docs as SearchDoc[]);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [docs, loading]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // open via custom event + Cmd/Ctrl+K
  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      void loadIndex();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [loadIndex]);

  // focus + lock scroll while open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open]);

  const fuse = useMemo(
    () =>
      docs
        ? new Fuse(docs, {
            keys: [
              { name: "title", weight: 0.6 },
              { name: "excerpt", weight: 0.25 },
              { name: "tags", weight: 0.15 },
            ],
            threshold: 0.3,
            ignoreLocation: true,
            minMatchCharLength: 2,
          })
        : null,
    [docs],
  );

  const results = useMemo(() => {
    if (!fuse || query.trim().length < 2) return [] as SearchDoc[];
    return fuse.search(query.trim(), { limit: 24 }).map((r) => r.item);
  }, [fuse, query]);

  const grouped = useMemo(() => {
    const g: Record<SearchDoc["type"], SearchDoc[]> = { artikel: [], jurnal: [], sumber: [] };
    for (const r of results) g[r.type].push(r);
    return g;
  }, [results]);

  // flat list for keyboard nav, in display order
  const flat = useMemo(
    () => TYPE_ORDER.flatMap((t) => grouped[t]),
    [grouped],
  );

  useEffect(() => {
    setActive(0);
  }, [query]);

  const go = useCallback(
    (doc: SearchDoc) => {
      close();
      router.push(doc.href);
    },
    [close, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active]);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-black/40 px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pencarian"
      onClick={close}
    >
      <div
        className="w-full max-w-xl border border-ink/60 bg-paper shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-dashed border-ink/50 px-4">
          <Search className="h-4 w-4 shrink-0 text-gray" strokeWidth={1.7} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari artikel, jurnal, atau sumber..."
            className="w-full bg-transparent py-4 font-mono text-sm text-ink-black outline-none placeholder:text-gray-light"
            aria-label="Kata kunci pencarian"
          />
          <kbd className="hidden shrink-0 border border-ink/30 px-1.5 py-0.5 font-mono text-[0.6rem] text-ink/50 sm:inline">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto">
          {loading && (
            <p className="px-4 py-8 text-center font-mono text-xs text-gray">Memuat indeks...</p>
          )}
          {!loading && query.trim().length < 2 && (
            <p className="px-4 py-8 text-center font-mono text-xs text-gray">
              Ketik minimal 2 huruf. Cari di {docs?.length ?? 0} entri.
            </p>
          )}
          {!loading && query.trim().length >= 2 && flat.length === 0 && (
            <p className="px-4 py-8 text-center font-mono text-xs text-gray">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;.
            </p>
          )}

          {TYPE_ORDER.map((type) =>
            grouped[type].length === 0 ? null : (
              <div key={type}>
                <p className="sticky top-0 bg-ink-wash px-4 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-deep">
                  {TYPE_LABEL[type]} ({grouped[type].length})
                </p>
                <ul>
                  {grouped[type].map((doc) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const isActive = idx === active;
                    return (
                      <li key={doc.href}>
                        <button
                          type="button"
                          data-active={isActive}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => go(doc)}
                          className={`flex w-full flex-col gap-1 border-b border-dashed border-ink/25 px-4 py-3 text-left transition-colors ${
                            isActive ? "bg-ink-wash" : "hover:bg-ink-wash/60"
                          }`}
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span className="font-display text-sm font-semibold uppercase leading-snug tracking-[0.01em] text-ink">
                              {doc.title}
                            </span>
                            {doc.confidence && (
                              <ConfidenceBadge confidence={doc.confidence} size="sm" />
                            )}
                          </span>
                          {doc.excerpt && (
                            <span className="line-clamp-1 font-mono text-[0.72rem] text-gray">
                              {doc.excerpt}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          )}
        </div>

        <div className="flex items-center justify-between border-t border-dashed border-ink/40 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-gray">
          <span>↑↓ pilih · ↵ buka · esc tutup</span>
          <span>NaLI</span>
        </div>
      </div>
    </div>
  );
}
