import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
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
  const fm = data as Partial<Article>;
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
    sources: fm.sources ?? [],
    content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
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

export function getAllArticles(): ArticleMeta[] {
  return loadArticles().map(stripBody);
}

export function getArticleSlugs(): string[] {
  return loadArticles().map((a) => a.slug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return loadArticles().find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: Category): ArticleMeta[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getLatestArticles(limit: number): ArticleMeta[] {
  return getAllArticles().slice(0, limit);
}

export function getRelatedArticles(
  article: { slug: string; category: Category },
  limit = 3,
): ArticleMeta[] {
  return getAllArticles()
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, limit);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const article of getAllArticles()) {
    for (const tag of article.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function countArticlesByCategory(): Record<Category, number> {
  const result: Record<Category, number> = {
    alam: 0,
    sejarah: 0,
    investigasi: 0,
    "catatan-lapangan": 0,
  };
  for (const article of getAllArticles()) result[article.category] += 1;
  return result;
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
      } satisfies FieldNote;
    })
    .filter((n) => n.status === "published")
    .sort(byDateDesc);
}

/* ---------------------------------- Sources ---------------------------------- */

export function getAllSources(): SourceEntry[] {
  return readMdxFiles(SOURCES_DIR)
    .map(({ slug, raw }) => {
      const { data } = matter(raw);
      const fm = data as Partial<SourceEntry>;
      return {
        title: fm.title ?? "Sumber tanpa judul",
        slug: fm.slug ?? slug,
        type: fm.type ?? "lainnya",
        author: fm.author,
        year: fm.year,
        url: fm.url,
        reliability: fm.reliability,
        related_topic: fm.related_topic,
      } satisfies SourceEntry;
    })
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.title.localeCompare(b.title));
}
