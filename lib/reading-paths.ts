import type { ArticleMeta } from "./types";
import { SERIES } from "./series";

/* -------------------------------------------------------------------------- */
/*  Reading paths                                                              */
/*                                                                            */
/*  Curated journeys through the ontology, assembled from real editorial       */
/*  SERIES (lib/series.ts) and the articles attached to them. Steps are        */
/*  ordered oldest -> newest, matching getSeriesNavigation. Nothing invented:  */
/*  only active series that actually have a walkable sequence are surfaced.     */
/* -------------------------------------------------------------------------- */

export interface ReadingPathStep {
  slug: string;
  title: string;
}

export interface ReadingPath {
  slug: string;
  title: string;
  promise: string;
  total: number;
  steps: ReadingPathStep[];
}

/** Minimum number of published articles for a series to count as a "journey". */
const MIN_STEPS = 2;

/**
 * Build the suggested reading paths shown on /peta-eksplorasi. Only active
 * series with at least MIN_STEPS published articles are included, so a path is
 * always something the reader can actually walk (no empty or "coming soon"
 * cards). Articles are ordered oldest -> newest.
 */
export function buildReadingPaths(articles: ArticleMeta[]): ReadingPath[] {
  const byDateAsc = [...articles].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const paths: ReadingPath[] = [];
  for (const series of SERIES) {
    if (series.status !== "active") continue;
    const inSeries = byDateAsc.filter((a) => (a.series ?? []).includes(series.slug));
    if (inSeries.length < MIN_STEPS) continue;
    paths.push({
      slug: series.slug,
      title: series.title,
      promise: series.promise,
      total: inSeries.length,
      steps: inSeries.map((a) => ({ slug: a.slug, title: a.title })),
    });
  }

  // Longest, most-developed journeys first.
  paths.sort((a, b) => b.total - a.total);

  // PHASE-3 SEAM (Bucket C, Internal Intelligence Lab): once the Lab produces
  // verified research leads, an extra "Investigasi Lanjutan" path can be
  // appended here (clearly labeled, fed only by promoted/verified findings).

  return paths;
}
