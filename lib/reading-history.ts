/**
 * Local, login-free reading memory. Everything lives in the browser via
 * localStorage: no account, no server, no tracking leaves the device. Used by the
 * "Lanjutkan membaca" rail, the "karena kamu sering baca" recommendations, and the
 * bookmark button. All functions are SSR-safe (no-op without `window`).
 */

export interface HistoryItem {
  slug: string;
  title: string;
  category: string;
  ts: number;
}

const HISTORY_KEY = "nali:history";
const BOOKMARK_KEY = "nali:bookmarks";
const MAX_HISTORY = 40;

/** Fired on any change so live components (rails, buttons) can refresh. */
export const HISTORY_EVENT = "nali:history-change";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(HISTORY_EVENT));
  } catch {
    /* storage full or blocked, fail silently */
  }
}

export function getHistory(): HistoryItem[] {
  return readJSON<HistoryItem[]>(HISTORY_KEY, []);
}

export function recordVisit(item: Omit<HistoryItem, "ts">): void {
  const list = getHistory().filter((h) => h.slug !== item.slug);
  list.unshift({ ...item, ts: Date.now() });
  writeJSON(HISTORY_KEY, list.slice(0, MAX_HISTORY));
}

/** Most recent reads, optionally excluding a slug (e.g. the current article). */
export function getRecent(n = 6, excludeSlug?: string): HistoryItem[] {
  return getHistory()
    .filter((h) => h.slug !== excludeSlug)
    .slice(0, n);
}

/** The category the reader visits most, used for gentle recommendations. */
export function topCategory(): string | null {
  const counts = new Map<string, number>();
  for (const h of getHistory()) counts.set(h.category, (counts.get(h.category) ?? 0) + 1);
  let best: string | null = null;
  let max = 0;
  for (const [cat, c] of counts) {
    if (c > max) {
      max = c;
      best = cat;
    }
  }
  return best;
}

export function readSlugs(): Set<string> {
  return new Set(getHistory().map((h) => h.slug));
}

export function getBookmarks(): string[] {
  return readJSON<string[]>(BOOKMARK_KEY, []);
}

export function isBookmarked(slug: string): boolean {
  return getBookmarks().includes(slug);
}

/** Toggle a bookmark, returning the new state. */
export function toggleBookmark(slug: string): boolean {
  const list = getBookmarks();
  const has = list.includes(slug);
  writeJSON(BOOKMARK_KEY, has ? list.filter((s) => s !== slug) : [slug, ...list]);
  return !has;
}
