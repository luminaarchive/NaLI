import readingTime from "reading-time";
import type { JournalCategory, JournalEntry } from "./types";
import { journalEntries as rawEntries } from "@/content/jurnal";

function withReadingTime(entry: JournalEntry): JournalEntry {
  return {
    ...entry,
    readingMinutes: Math.max(1, Math.round(readingTime(entry.body).minutes)),
  };
}

let _cache: JournalEntry[] | null = null;

/** All Jurnal entries, de-duplicated by slug, newest checkedAt first. */
export function getAllJournalEntries(): JournalEntry[] {
  if (_cache) return _cache;
  const bySlug = new Map<string, JournalEntry>();
  for (const entry of rawEntries) {
    if (!bySlug.has(entry.slug)) bySlug.set(entry.slug, withReadingTime(entry));
  }
  _cache = [...bySlug.values()].sort((a, b) => {
    const byDate = (b.checkedAt ?? "").localeCompare(a.checkedAt ?? "");
    if (byDate !== 0) return byDate;
    return a.title.localeCompare(b.title, "id");
  });
  return _cache;
}

export function getJournalCount(): number {
  return getAllJournalEntries().length;
}

export function getJournalSlugs(): string[] {
  return getAllJournalEntries().map((e) => e.slug);
}

export function getJournalEntryBySlug(slug: string): JournalEntry | undefined {
  return getAllJournalEntries().find((e) => e.slug === slug);
}

export function getJournalCategories(): { category: JournalCategory; count: number }[] {
  const counts = new Map<JournalCategory, number>();
  for (const e of getAllJournalEntries()) {
    counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function getJournalTopics(): string[] {
  const set = new Set<string>();
  for (const e of getAllJournalEntries()) for (const t of e.topics) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b, "id"));
}

export function getJournalGeographies(): string[] {
  const set = new Set<string>();
  for (const e of getAllJournalEntries()) for (const g of e.geography) set.add(g);
  return [...set].sort((a, b) => a.localeCompare(b, "id"));
}

export function getRelatedJournalEntries(entry: JournalEntry, limit = 4): JournalEntry[] {
  return getAllJournalEntries()
    .filter((e) => e.slug !== entry.slug && e.category === entry.category)
    .slice(0, limit);
}
