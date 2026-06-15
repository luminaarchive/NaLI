import "server-only";
import { getAllArticles, getAllSources, getAllFieldNotes } from "./content";
import { SERIES } from "./series";

export interface SiteStats {
  /** Total published articles (MDX + DB merged). */
  artikel: number;
  /** Total verified source-archive entries. */
  sumber: number;
  /** Active editorial series. */
  seri: number;
  /** Research notes: field notes + any catatan-lapangan articles. */
  catatanRiset: number;
}

/**
 * Single source of truth for the site-wide counters surfaced on /tentang
 * (BUG-001). Reads real data, never hardcoded. Per MBD F1.1 the series count
 * is restricted to active series, and research notes combine field notes with
 * catatan-lapangan articles.
 */
export async function getSiteStats(): Promise<SiteStats> {
  const articles = await getAllArticles();
  const fieldNotes = getAllFieldNotes();
  const catatanArticles = articles.filter(
    (a) => a.category === "catatan-lapangan",
  ).length;
  return {
    artikel: articles.length,
    sumber: getAllSources().length,
    seri: SERIES.filter((s) => s.status === "active").length,
    catatanRiset: fieldNotes.length + catatanArticles,
  };
}
