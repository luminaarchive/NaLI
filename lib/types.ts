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

/** Where an article's evidence comes from (shown on the article and used by validation). */
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

/**
 * CATEGORY 1: Displayable image asset. Rendered inside the article only when
 * reuse is clearly permitted (public domain / CC0 / CC BY / CC BY-SA /
 * institutional or government open license / Wikimedia with verified metadata).
 * AI-generated images are never evidence and are not used here.
 */
export interface ArticleImage {
  /** Local path or remote URL actually rendered. */
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
  /** When the license was last verified (ISO date). Required for display. */
  checkedAt?: string;
  relatedArticleIds?: string[];
}

/**
 * CATEGORY 2: External visual evidence reference. A real photo/video whose
 * license is unclear. It is LINKED, never downloaded, hosted, hotlinked,
 * cropped, edited, or displayed as an image. Rendered as a "Bukti visual
 * eksternal" link with a description and an explicit limitation note.
 */
export interface ExternalVisualEvidence {
  /** Title or short description of the visual. */
  title: string;
  /** Creator / institution if known. */
  creator?: string;
  /** Original page URL (the source page, not a media file). */
  sourceUrl: string;
  /** Platform / source (e.g. "Mongabay", "AntaraFoto", "YouTube"). */
  platform?: string;
  /** What the visual evidence appears to show. */
  shows: string;
  /** Which claim it supports (free-text pointer). */
  supportsClaim?: string;
  /** Why NaLI does not re-display it (license uncertainty). */
  limitation: string;
  /** When the reference was last checked (ISO date). */
  checkedAt: string;
}

/**
 * CATEGORY 3: Internal explanatory diagram, timeline, or map. This is displayed
 * as a NaLI-made explanatory visual based on cited sources. It is not a field
 * photo and must say so plainly in its caption.
 */
export interface ArticleDiagram {
  /** Local image path for the rendered non-AI explanatory visual. */
  src?: string;
  type?: "diagram" | "timeline" | "map";
  title: string;
  creator?: string;
  institution?: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
  alt: string;
  caption: string;
  checkedAt: string;
  relatedArticleIds?: string[];
  items: string[];
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
  /** Source archive IDs cited by this article (file slugs in content/sources). */
  sourceIds?: string[];
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
  /** Licensed, displayable image credits (Category 1). */
  images?: ArticleImage[];
  /** Internal explanatory diagram/map/timeline credits (Category 3). */
  diagrams?: ArticleDiagram[];
  /** External visual evidence references, linked only and never displayed (Category 2). */
  externalVisuals?: ExternalVisualEvidence[];
  /** Explicit note when no safe visual can be displayed or linked yet. */
  visualEvidenceNote?: string;
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

/**
 * Jurnal = the natural-knowledge library. Shorter than a longform Artikel
 * (target 250 to 600 words) but still source-backed: every entry cites at least
 * one entry in Arsip Sumber, carries a confidence label, and states its limits.
 */
export type JournalCategory =
  | "satwa"
  | "tumbuhan"
  | "geologi"
  | "laut"
  | "hutan"
  | "pesisir"
  | "iklim"
  | "perairan"
  | "konservasi"
  | "wallacea"
  | "arsip-alam"
  | "ekologi";

/**
 * Mandatory visible cover for a Jurnal entry. Displayed on the listing card and
 * the detail page. May be a licensed photo / archive image / map, or a
 * last-resort internal non-AI explanatory visual (in which case creator is
 * "NaLI by NatIve", license is "Internal explanatory visual for NaLI Jurnal",
 * and the caption states it is an explanatory visual, not a field photo).
 */
export interface JurnalCover {
  id: string;
  /** Renderable local path or remote URL actually shown. */
  src: string;
  type: "photo" | "archive_image" | "map" | "diagram" | "timeline" | "chart";
  title: string;
  creator?: string;
  institution?: string;
  /** Source page or source record used to build / license the visual. */
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
  caption: string;
  alt: string;
  checkedAt: string;
  relatedJurnalIds?: string[];
}

export interface JournalEntry {
  /** Stable id, equal to the slug. */
  id: string;
  slug: string;
  title: string;
  /** One-line standfirst. */
  dek: string;
  /** Human-written synopsis, 35 to 80 words, shown on listing + detail. */
  synopsis: string;
  category: JournalCategory;
  topics: string[];
  geography: string[];
  /** Must resolve to real entries in Arsip Sumber (content/sources). */
  sourceIds: string[];
  confidence: Confidence;
  /** Markdown body, 250 to 600 words. */
  body: string;
  keyTakeaway: string;
  limitations: string[];
  /** Mandatory visible cover. */
  cover: JurnalCover;
  /** Optional reference to an article image id, kept for future visuals. */
  imageId?: string;
  /** ISO date the entry was last checked. */
  checkedAt: string;
  /** Filled by the loader. */
  readingMinutes?: number;
}

export const JOURNAL_CATEGORY_LABEL: Record<JournalCategory, string> = {
  satwa: "Satwa",
  tumbuhan: "Tumbuhan",
  geologi: "Geologi",
  laut: "Laut",
  hutan: "Hutan",
  pesisir: "Pesisir",
  iklim: "Iklim",
  perairan: "Perairan",
  konservasi: "Konservasi",
  wallacea: "Wallacea",
  "arsip-alam": "Arsip Alam",
  ekologi: "Ekologi",
};

export interface SourceEntry {
  /** Stable source ID, normally equal to the file slug. */
  id?: string;
  title: string;
  slug: string;
  type: SourceType;
  /** Alias kept for editorial reports and validation vocabulary. */
  sourceType?: SourceType;
  author?: string;
  year?: number;
  publishedAt?: string;
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
  keyClaimsSupported?: string[];
  /** Access / scope limitations. */
  limitations?: string[];
  /** Article slugs that cite this source. */
  usedInArticles?: string[];
  usedInArticleIds?: string[];
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
 * Confidence display labels, sprint vocabulary mapped onto the existing
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
