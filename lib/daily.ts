import type { ArticleMeta } from "./types";
import { ANNIVERSARIES, type Anniversary } from "@/content/daily/anniversaries";
import { DAILY_FACTS, type DailyFact } from "@/content/daily/facts";

/** Days since the Unix epoch (UTC). Stable for a whole calendar day. */
export function epochDay(now = new Date()): number {
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
}

export interface DailyFactResolved extends DailyFact {
  article?: ArticleMeta;
}

export interface DailyDigest {
  anniversary?: Anniversary & { article?: ArticleMeta };
  sorotan?: ArticleMeta;
  fakta?: DailyFactResolved;
  pertanyaan?: ArticleMeta;
}

function pick<T>(arr: T[], seed: number): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

/**
 * Deterministic daily digest built only from real content: a true "on this day"
 * anniversary (when the date matches), a rotating highlight, a verifiable fact,
 * and an open-question article. Changes every day, no database, nothing invented.
 */
export function getDaily(articles: ArticleMeta[], now = new Date()): DailyDigest {
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const day = epochDay(now);

  // on this day, only when month + day actually match
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const anni = ANNIVERSARIES.find((a) => a.month === m && a.day === d);

  // highlight of the day, prefer articles that carry a cover image
  const withCover = articles.filter((a) => a.coverImage ?? a.images?.[0]?.src);
  const sorotan = pick(withCover.length ? withCover : articles, day);

  // verified fact of the day
  const factRaw = pick(DAILY_FACTS, day + 3);
  const fakta: DailyFactResolved | undefined = factRaw
    ? { ...factRaw, article: bySlug.get(factRaw.slug) }
    : undefined;

  // open question of the day: the honest "mysteries" are our low-confidence articles
  const open = articles.filter(
    (a) => a.confidence === "needs-verification" || a.confidence === "low",
  );
  const pertanyaan = pick(open.length ? open : articles, day + 7);

  return {
    anniversary: anni ? { ...anni, article: bySlug.get(anni.slug) } : undefined,
    sorotan,
    fakta,
    pertanyaan,
  };
}
