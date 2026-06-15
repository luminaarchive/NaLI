import { getAllArticles, getAllSources } from "./content";
import { getAllPublications } from "./jurnal";
import type { ArticleMeta, SourceEntry } from "./types";
import type { JournalPublication } from "./types";

export function slugifyTag(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export interface TopicData {
  tag: string;
  /** Human-friendly display label (first matching original spelling). */
  label: string;
  articles: ArticleMeta[];
  sources: SourceEntry[];
  jurnal: JournalPublication[];
  total: number;
  yearRange: [number, number] | null;
}

/** All distinct topic slugs across articles, sources, and jurnal (for routing). */
export async function getAllTopicSlugs(): Promise<string[]> {
  const set = new Set<string>();
  for (const a of await getAllArticles()) for (const t of a.tags) set.add(slugifyTag(t));
  for (const s of getAllSources()) for (const t of s.topics ?? []) set.add(slugifyTag(t));
  for (const j of getAllPublications()) for (const t of j.topics ?? []) set.add(slugifyTag(t));
  set.delete("");
  return [...set];
}

/**
 * Aggregate all content carrying a topic/tag (F5.3): articles, sources, jurnal,
 * with a count and year range. Matching is slug-insensitive so kebab article
 * tags and human-readable source topics line up.
 */
export async function getTopicData(tagSlug: string): Promise<TopicData | null> {
  const target = slugifyTag(tagSlug);
  if (!target) return null;

  const articles = (await getAllArticles()).filter((a) =>
    a.tags.some((t) => slugifyTag(t) === target),
  );
  const sources = getAllSources().filter((s) =>
    (s.topics ?? []).some((t) => slugifyTag(t) === target),
  );
  const jurnal = getAllPublications().filter((j) =>
    (j.topics ?? []).some((t) => slugifyTag(t) === target),
  );

  const total = articles.length + sources.length + jurnal.length;
  if (total === 0) return null;

  // human label: prefer an original spelling from any source
  const label =
    articles.flatMap((a) => a.tags).find((t) => slugifyTag(t) === target) ??
    sources.flatMap((s) => s.topics ?? []).find((t) => slugifyTag(t) === target) ??
    tagSlug;

  const years: number[] = [
    ...articles.map((a) => new Date(a.date).getFullYear()),
    ...sources.map((s) => s.year).filter((y): y is number => typeof y === "number"),
    ...jurnal.map((j) => Number(j.year)).filter((y) => !Number.isNaN(y)),
  ].filter((y) => y > 0);
  const yearRange: [number, number] | null = years.length
    ? [Math.min(...years), Math.max(...years)]
    : null;

  return { tag: target, label, articles, sources, jurnal, total, yearRange };
}
