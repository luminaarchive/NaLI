/**
 * Canonical TypeScript schema for NaLI article frontmatter.
 *
 * Doctrine v2.1 asked for TS enforcement of frontmatter shape. Per the doctrine's
 * own rule "align the types to match what's already there, do not change existing
 * articles" (and Axiom 13, never fake reality), this schema mirrors the REAL keys
 * used across the 43 live articles, not an idealized shape.
 *
 * Mapping from the doctrine's draft names to the actual live keys:
 *   vertical            -> category        ("alam" | "sejarah" | "investigasi" | "catatan-lapangan")
 *   confidenceOverall   -> confidence      ("high" | "medium" | "low" | "needs-verification")
 *   claims[]            -> claimLedger[]   (status is a space-string, sources is a free-text "[1][2]" pointer)
 *   publishedAt         -> date
 *   lastChecked         -> updated (article) / checkedAt (per source, image, diagram)
 *   sources[].id        -> sourceIds[]     (top-level; resolves to content/sources/<id>.mdx)
 *
 * The enums and the runtime validator here are the single source of truth. The
 * CLI validator (scripts/check-schema.mjs) mirrors these exact rules so the gate
 * and the app never drift.
 */

export const CATEGORIES = ["alam", "sejarah", "investigasi", "catatan-lapangan"] as const;
export type Category = (typeof CATEGORIES)[number];

/** The three editorial pillars (Axiom 14). catatan-lapangan is a research-note bucket, not a pillar. */
export const PILLARS = ["alam", "sejarah", "investigasi"] as const;
export type Pillar = (typeof PILLARS)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low", "needs-verification"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const CLAIM_STATUSES = [
  "terverifikasi kuat",
  "didukung sumber",
  "terbatas",
  "diperdebatkan",
  "belum cukup bukti",
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const ARTICLE_STATUSES = ["draft", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const SOURCE_TYPES = ["jurnal", "arsip", "buku", "media", "laporan", "lainnya"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/** A bibliographic source as listed in article frontmatter. url is optional (books / offline citations). */
export interface ArticleSource {
  title: string;
  url?: string;
  type: SourceType;
}

/** One row of the Claim Ledger. `sources` is a free-text pointer like "[1][2]" into the sources array. */
export interface ClaimLedgerItem {
  claim: string;
  status: ClaimStatus;
  sources?: string;
  explanation?: string;
  limitation?: string;
}

/** Canonical, reality-aligned article frontmatter shape. */
export interface ArticleFrontmatter {
  title: string;
  slug: string;
  category: Category;
  date: string; // ISO date the article was published
  updated?: string; // ISO date last reviewed (the doctrine's "lastChecked")
  status: ArticleStatus;
  confidence: ConfidenceLevel;
  summary?: string;
  subtitle?: string;
  tags?: string[];
  series?: string[];
  evidenceBasis?: string;
  firstPartyFieldwork?: boolean; // must be false: NaLI does no first-party fieldwork
  claimLedger: ClaimLedgerItem[];
  sources: ArticleSource[];
  sourceIds?: string[]; // resolves to content/sources/<id>.mdx
  limitations?: string[];
}

const isISODate = (v: unknown): boolean =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) && !Number.isNaN(Date.parse(v));

/** Parse "[1][2][3]" style pointers into numbers. */
export function parseSourcePointers(ref: string | undefined): number[] {
  if (!ref) return [];
  return [...ref.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
}

export interface SchemaIssue {
  level: "error" | "warn";
  field: string;
  message: string;
}

/**
 * Validate one article's parsed frontmatter against the canonical schema.
 * Returns a list of issues; an empty list (or warns-only) means it conforms.
 * Pure and network-free, so both the app and the CLI gate can call it.
 */
export function validateArticleFrontmatter(fm: Record<string, unknown>): SchemaIssue[] {
  const issues: SchemaIssue[] = [];
  const err = (field: string, message: string) => issues.push({ level: "error", field, message });
  const warn = (field: string, message: string) => issues.push({ level: "warn", field, message });

  if (!fm.title || typeof fm.title !== "string") err("title", "missing or not a string");
  if (!fm.slug || typeof fm.slug !== "string") err("slug", "missing or not a string");

  if (!CATEGORIES.includes(fm.category as Category)) {
    err("category", `must be one of ${CATEGORIES.join(", ")}, got ${JSON.stringify(fm.category)}`);
  }
  if (!ARTICLE_STATUSES.includes(fm.status as ArticleStatus)) {
    err("status", `must be one of ${ARTICLE_STATUSES.join(", ")}, got ${JSON.stringify(fm.status)}`);
  }
  if (!CONFIDENCE_LEVELS.includes(fm.confidence as ConfidenceLevel)) {
    err("confidence", `must be one of ${CONFIDENCE_LEVELS.join(", ")}, got ${JSON.stringify(fm.confidence)}`);
  }

  if (!isISODate(fm.date)) err("date", "missing or not an ISO date (YYYY-MM-DD)");
  if (fm.updated !== undefined && !isISODate(fm.updated)) warn("updated", "present but not an ISO date");

  if (fm.firstPartyFieldwork === true) {
    err("firstPartyFieldwork", "must be false, NaLI does no first-party fieldwork");
  }

  // Sources
  const sources = Array.isArray(fm.sources) ? (fm.sources as Record<string, unknown>[]) : null;
  if (!sources || sources.length < 1) {
    err("sources", "must be a non-empty array");
  } else {
    sources.forEach((s, i) => {
      if (!s || typeof s.title !== "string" || !s.title.trim()) {
        err(`sources[${i}].title`, "missing source title");
      }
      if (s && s.url !== undefined && typeof s.url === "string" && s.url && !/^https:\/\//.test(s.url)) {
        warn(`sources[${i}].url`, "should start with https://");
      }
      if (s && (s.url === undefined || s.url === "")) {
        warn(`sources[${i}].url`, "no url (acceptable for books / offline citations, but prefer a traceable link)");
      }
      if (s && s.type !== undefined && !SOURCE_TYPES.includes(s.type as SourceType)) {
        warn(`sources[${i}].type`, `unusual source type ${JSON.stringify(s.type)}`);
      }
    });
  }

  // Claim Ledger
  const ledger = Array.isArray(fm.claimLedger) ? (fm.claimLedger as Record<string, unknown>[]) : null;
  if (!ledger || ledger.length < 1) {
    err("claimLedger", "must be a non-empty array");
  } else {
    const nSources = sources ? sources.length : 0;
    ledger.forEach((c, i) => {
      if (!c || typeof c.claim !== "string" || !c.claim.trim()) {
        err(`claimLedger[${i}].claim`, "missing claim text");
      }
      if (!c || !CLAIM_STATUSES.includes(c.status as ClaimStatus)) {
        err(`claimLedger[${i}].status`, `must be one of ${CLAIM_STATUSES.join(", ")}, got ${JSON.stringify(c?.status)}`);
      }
      const pointers = parseSourcePointers(typeof c?.sources === "string" ? (c.sources as string) : undefined);
      if (pointers.length === 0) {
        warn(`claimLedger[${i}].sources`, "no [n] source pointer; claims should cite at least one source");
      } else if (nSources > 0) {
        const bad = pointers.filter((p) => p < 1 || p > nSources);
        if (bad.length) {
          err(`claimLedger[${i}].sources`, `pointer(s) ${bad.join(", ")} out of range 1..${nSources}`);
        }
      }
    });
  }

  return issues;
}
