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

export interface ArticleSource {
  title: string;
  url?: string;
  type: SourceType;
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
  /** Raw MDX body (only populated by getArticleBySlug). */
  content: string;
  /** Estimated reading time in minutes. */
  readingMinutes: number;
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
}

export const CATEGORY_LABEL: Record<Category, string> = {
  alam: "Alam",
  sejarah: "Sejarah",
  investigasi: "Investigasi",
  "catatan-lapangan": "Catatan Lapangan",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "Terverifikasi",
  medium: "Perlu konteks",
  low: "Hipotesis kerja",
  "needs-verification": "Belum diverifikasi",
};

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  jurnal: "Jurnal",
  arsip: "Arsip",
  buku: "Buku",
  media: "Media",
  laporan: "Laporan",
  lainnya: "Lainnya",
};
