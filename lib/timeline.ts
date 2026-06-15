import "server-only";
import { getAllArticles } from "./content";
import type { TimelineEvent } from "@/types/timeline";

/**
 * Pull a 4-digit year (1000..2099) from a string, if present. Used to detect a
 * real event year in an article's title, tags, or slug, so the timeline only
 * carries events whose year is actually stated, never invented.
 */
function detectYear(...candidates: string[]): number | null {
  for (const c of candidates) {
    const m = String(c).match(/\b(1[0-9]{3}|20[0-2][0-9])\b/);
    if (m) return Number(m[1]);
  }
  return null;
}

/**
 * Modul 4: build the historical timeline from real articles that carry an
 * explicit year. Sorted oldest first.
 */
export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const articles = await getAllArticles();
  const events: TimelineEvent[] = [];

  for (const a of articles) {
    const tahun = detectYear(a.title, ...(a.tags ?? []), a.slug);
    if (tahun === null) continue;
    events.push({
      id: a.slug,
      tahun,
      peristiwa: a.title,
      ringkasan: a.summary || a.subtitle,
      kategori: a.category,
      articleSlug: a.slug,
      sumberId: a.sourceIds ?? [],
    });
  }

  return events.sort((x, y) => x.tahun - y.tahun);
}
