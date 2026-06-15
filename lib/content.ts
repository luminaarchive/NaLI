import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { calculateReadingTime } from "./format";
import { getDbPublishedArticles } from "./posts";
import type {
  Article,
  ArticleMeta,
  Category,
  FieldNote,
  SourceEntry,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
const FIELD_NOTES_DIR = path.join(CONTENT_DIR, "field-notes");
const SOURCES_DIR = path.join(CONTENT_DIR, "sources");

function readMdxFiles(dir: string): { slug: string; raw: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(/\.mdx?$/, ""),
      raw: fs.readFileSync(path.join(dir, file), "utf8"),
    }));
}

function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
}

/* ---------------------------------- Articles --------------------------------- */

function parseArticle(slug: string, raw: string): Article {
  const { data, content } = matter(raw);
  const fm = data as Partial<Article> & { readingTime?: number };
  // Manual frontmatter `readingTime` wins; otherwise compute from the body.
  const readingMinutes =
    typeof fm.readingTime === "number" && fm.readingTime > 0
      ? Math.ceil(fm.readingTime)
      : calculateReadingTime(content);
  return {
    title: fm.title ?? "Tanpa judul",
    subtitle: fm.subtitle ?? "",
    slug: fm.slug ?? slug,
    date: fm.date ?? "1970-01-01",
    category: (fm.category ?? "alam") as Category,
    tags: fm.tags ?? [],
    summary: fm.summary ?? "",
    confidence: fm.confidence ?? "needs-verification",
    status: fm.status ?? "draft",
    sourceIds: fm.sourceIds,
    sources: fm.sources ?? [],
    coverImage: fm.coverImage,
    content,
    readingMinutes,
    series: fm.series,
    related: fm.related,
    evidenceBasis: fm.evidenceBasis,
    firstPartyFieldwork: fm.firstPartyFieldwork ?? false,
    updated: fm.updated,
    locationLabels: fm.locationLabels,
    limitations: fm.limitations,
    claimLedger: fm.claimLedger,
    images: fm.images,
    diagrams: fm.diagrams,
    externalVisuals: fm.externalVisuals,
    visualEvidenceNote: fm.visualEvidenceNote,
  };
}

let _articleCache: Article[] | null = null;

function loadArticles(): Article[] {
  if (_articleCache) return _articleCache;
  _articleCache = readMdxFiles(ARTICLES_DIR)
    .map(({ slug, raw }) => parseArticle(slug, raw))
    .filter((a) => a.status === "published")
    .sort(byDateDesc);
  return _articleCache;
}

const stripBody = ({ content: _body, ...meta }: Article): ArticleMeta => meta;

/**
 * All published articles = bundled MDX files + Supabase posts, merged.
 * Same slug → the Supabase post wins (lets the admin override/edit an MDX entry).
 */
async function allPublishedArticles(): Promise<Article[]> {
  const mdx = loadArticles().map((a) => ({ ...a, origin: "mdx" as const }));
  const db = await getDbPublishedArticles();
  const bySlug = new Map<string, Article>();
  for (const a of mdx) bySlug.set(a.slug, a);
  for (const a of db) bySlug.set(a.slug, a); // DB precedence
  return [...bySlug.values()].sort(byDateDesc);
}

export async function getAllArticles(): Promise<ArticleMeta[]> {
  return (await allPublishedArticles()).map(stripBody);
}

export async function getArticleSlugs(): Promise<string[]> {
  return (await allPublishedArticles()).map((a) => a.slug);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return (await allPublishedArticles()).find((a) => a.slug === slug);
}

export async function getArticlesByCategory(category: Category): Promise<ArticleMeta[]> {
  return (await getAllArticles()).filter((a) => a.category === category);
}

export async function getLatestArticles(limit: number): Promise<ArticleMeta[]> {
  return (await getAllArticles()).slice(0, limit);
}

export interface SeriesNav {
  slug: string;
  title: string;
  promise: string;
  status: "active" | "planned";
  /** 1-based position of the current article within the series. */
  position: number;
  /** Number of published articles currently in the series. */
  total: number;
  next?: { slug: string; title: string };
  prev?: { slug: string; title: string };
}

/**
 * Series navigation for an article (F4.2): for each series the article belongs
 * to, its position, the published total, and prev/next articles (ordered oldest
 * to newest). Returns [] for articles not in any series.
 */
export async function getSeriesNavigation(articleSlug: string): Promise<SeriesNav[]> {
  const { SERIES } = await import("./series");
  const all = (await getAllArticles())
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const out: SeriesNav[] = [];
  for (const series of SERIES) {
    const inSeries = all.filter((a) => (a.series ?? []).includes(series.slug));
    const idx = inSeries.findIndex((a) => a.slug === articleSlug);
    if (idx === -1) continue;
    out.push({
      slug: series.slug,
      title: series.title,
      promise: series.promise,
      status: series.status,
      position: idx + 1,
      total: inSeries.length,
      prev: idx > 0 ? { slug: inSeries[idx - 1].slug, title: inSeries[idx - 1].title } : undefined,
      next:
        idx < inSeries.length - 1
          ? { slug: inSeries[idx + 1].slug, title: inSeries[idx + 1].title }
          : undefined,
    });
  }
  return out;
}

/**
 * Resolve an article's explicit contextual related refs (F3.2) to article
 * metadata, preserving the author's relevance note and skipping missing slugs.
 */
export async function getContextualRelated(
  refs: { slug: string; relasi: string }[],
): Promise<{ article: ArticleMeta; relasi: string }[]> {
  const all = await getAllArticles();
  const bySlug = new Map(all.map((a) => [a.slug, a]));
  return refs
    .map((r) => {
      const article = bySlug.get(r.slug);
      return article ? { article, relasi: r.relasi } : null;
    })
    .filter((x): x is { article: ArticleMeta; relasi: string } => x !== null);
}

export async function getRelatedArticles(
  article: { slug: string; category: Category },
  limit = 3,
): Promise<ArticleMeta[]> {
  return (await getAllArticles())
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const article of await getAllArticles()) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/* -------------------------------- Field notes -------------------------------- */

export function getAllFieldNotes(): FieldNote[] {
  return readMdxFiles(FIELD_NOTES_DIR)
    .map(({ slug, raw }) => {
      const { data, content } = matter(raw);
      const fm = data as Partial<FieldNote>;
      return {
        title: fm.title ?? "Catatan tanpa judul",
        slug: fm.slug ?? slug,
        location_label: fm.location_label ?? "Lokasi tidak dicatat",
        date: fm.date ?? "1970-01-01",
        tags: fm.tags ?? [],
        summary: fm.summary ?? "",
        status: fm.status ?? "draft",
        content,
        evidenceType: fm.evidenceType,
        limitations: fm.limitations,
        sources: fm.sources,
      } satisfies FieldNote;
    })
    .filter((n) => n.status === "published")
    .sort(byDateDesc);
}

/* ---------------------------------- Sources ---------------------------------- */

function parseSource(slug: string, raw: string): SourceEntry {
  const { data, content } = matter(raw);
  const fm = data as Partial<SourceEntry>;
  return {
    id: fm.id ?? slug,
    title: fm.title ?? "Sumber tanpa judul",
    slug: fm.slug ?? slug,
    type: fm.type ?? fm.sourceType ?? "lainnya",
    sourceType: fm.sourceType ?? fm.type ?? "lainnya",
    author: fm.author,
    year: fm.year,
    publishedAt: fm.publishedAt,
    url: fm.url,
    reliability: fm.reliability,
    related_topic: fm.related_topic,
    content: content.trim(),
    reliabilityLevel: fm.reliabilityLevel,
    institution: fm.institution,
    doi: fm.doi,
    archiveUrl: fm.archiveUrl,
    license: fm.license,
    language: fm.language,
    topics: fm.topics,
    geography: fm.geography,
    keyClaims: fm.keyClaims ?? fm.keyClaimsSupported,
    keyClaimsSupported: fm.keyClaimsSupported ?? fm.keyClaims,
    limitations: fm.limitations,
    usedInArticles: fm.usedInArticles,
    usedInArticleIds: fm.usedInArticleIds ?? fm.usedInArticles,
    checkedAt: fm.checkedAt,
  } satisfies SourceEntry;
}

export function getAllSources(): SourceEntry[] {
  return readMdxFiles(SOURCES_DIR)
    .map(({ slug, raw }) => parseSource(slug, raw))
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));
}

/** Distinct topic tags across all sources (for the archive filter). */
export function getAllSourceTopics(): string[] {
  const set = new Set<string>();
  for (const s of getAllSources()) for (const t of s.topics ?? []) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function getSourceSlugs(): string[] {
  return getAllSources().map((s) => s.slug);
}

export function getSourceBySlug(slug: string): SourceEntry | undefined {
  return getAllSources().find((s) => s.slug === slug);
}
