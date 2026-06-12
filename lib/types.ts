export type Category = "alam" | "sejarah" | "investigasi" | "catatan-lapangan";

export type Confidence = "high" | "medium" | "low" | "needs-verification";

export type Status = "published" | "draft";

export type SourceType =
  | "jurnal"
  | "arsip"
  | "buku"
  | "media"
  | "laporan"
  | "lainnya";

/** Structured reliability tier for source entries (sprint schema). */
export type Reliability =
  | "primary"
  | "high"
  | "medium"
  | "contextual"
  | "needs_caution";

/** Where an article's evidence comes from (shown on the article + used by validation). */
export type EvidenceBasis =
  | "sumber terbuka"
  | "arsip historis"
  | "jurnal ilmiah"
  | "dokumen pemerintah"
  | "observasi pihak ketiga"
  | "campuran";

/** Per-claim verification status used in the Claim Ledger. */
export type ClaimStatus =
  | "terverifikasi kuat"
  | "didukung sumber"
  | "terbatas"
  | "diperdebatkan"
  | "belum cukup bukti";

export interface ArticleSource {
  title: string;
  url?: string;
  type: SourceType;
}

export interface ClaimLedgerItem {
  claim: string;
  status: ClaimStatus;
  /** Free-text source pointer(s), e.g. "[1][3]" or a short citation. */
  sources?: string;
  explanation?: string;
  limitation?: string;
}

/** Licensed image credit attached to an article (Phase 7). */
export interface ArticleImage {
  /** Local path or remote URL actually rendered (optional — some are credit-only). */
  src?: string;
  title?: string;
  creator?: string;
  institution?: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
  alt: string;
  caption: string;
}

export interface Article {
  title: string;
  subtitle: string;
  slug: string;
  date: string;
  category: Category;
  tags: string[];
  summary: string;
  confidence: Confidence;
  status: Status;
  sources: ArticleSource[];
  /** Raw MDX/Markdown body. */
  content: string;
  /** Estimated reading time in minutes. */
  readingMinutes: number;
  /** Optional cover image URL (DB-backed posts; uploaded via admin). */
  coverImage?: string;
  /** Where the article comes from. */
  origin?: "mdx" | "db";

  /* ---- Editorial-trust fields (Phase 8, all optional / backward-compatible) ---- */
  /** Series slugs this article belongs to (see lib/series.ts). */
  series?: string[];
  /** What the writing is based on. */
  evidenceBasis?: EvidenceBasis;
  /** True only when real first-party field evidence exists. Defaults to false. */
  firstPartyFieldwork?: boolean;
  /** Last substantive update (ISO date). */
  updated?: string;
  /** Place names referenced (display only). */
  locationLabels?: string[];
  /** Explicit uncertainty / limitation notes. */
  limitations?: string[];
  /** Per-claim verification ledger. */
  claimLedger?: ClaimLedgerItem[];
  /** Licensed image credits. */
  images?: ArticleImage[];
}

export type ArticleMeta = Omit<Article, "content">;

export interface FieldNote {
  title: string;
  slug: string;
  location_label: string;
  date: string;
  tags: string[];
  summary: string;
  status: Status;
  content: string;
  /** Kinds of open-source evidence the note rests on (Phase 3). */
  evidenceType?: string[];
  /** Uncertainty notes. */
  limitations?: string[];
  /** Traceable sources behind the note. */
  sources?: ArticleSource[];
}

export interface SourceEntry {
  title: string;
  slug: string;
  type: SourceType;
  author?: string;
  year?: number;
  url?: string;
  reliability?: string;
  related_topic?: string;
  /** Markdown description body (rendered on the source detail page). */
  content?: string;

  /* ---- Editorial-trust fields (Phase 5, all optional) ---- */
  /** Structured reliability tier. */
  reliabilityLevel?: Reliability;
  institution?: string;
  doi?: string;
  archiveUrl?: string;
  license?: string;
  language?: "id" | "en" | "nl" | "other";
  /** Topic tags for filtering. */
  topics?: string[];
  geography?: string[];
  /** Claims this source can support. */
  keyClaims?: string[];
  /** Access / scope limitations. */
  limitations?: string[];
  /** Article slugs that cite this source. */
  usedInArticles?: string[];
  /** When the entry was last verified (ISO date). */
  checkedAt?: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  alam: "Alam",
  sejarah: "Sejarah",
  investigasi: "Investigasi",
  "catatan-lapangan": "Catatan Riset",
};

/**
 * Confidence display labels — sprint vocabulary mapped onto the existing
 * 4-value badge enum. "Diperdebatkan" is expressed per-claim in the Claim
 * Ledger, not as a top-level badge.
 */
export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "Terverifikasi kuat",
  medium: "Didukung sumber",
  low: "Terbatas",
  "needs-verification": "Belum cukup bukti",
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  jurnal: "Jurnal",
  arsip: "Arsip",
  buku: "Buku",
  media: "Media",
  laporan: "Laporan",
  lainnya: "Lainnya",
};

export const RELIABILITY_LABEL: Record<Reliability, string> = {
  primary: "Sumber primer",
  high: "Keandalan tinggi",
  medium: "Keandalan sedang",
  contextual: "Kontekstual",
  needs_caution: "Perlu kehati-hatian",
};

export const CLAIM_STATUS_LABEL: Record<ClaimStatus, string> = {
  "terverifikasi kuat": "Terverifikasi kuat",
  "didukung sumber": "Didukung sumber",
  terbatas: "Terbatas",
  diperdebatkan: "Diperdebatkan",
  "belum cukup bukti": "Belum cukup bukti",
};
