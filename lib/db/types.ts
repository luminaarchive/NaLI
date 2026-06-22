/**
 * TypeScript interfaces mirroring lib/db/schema.sql exactly (Doctrine v2.1, Phase 3).
 *
 * Note on vocabulary: this relational layer uses the doctrine's kebab-case
 * confidence strings ("terverifikasi-kuat" ...), which is the contract enforced
 * by the DB CHECK constraints. The MDX/file layer uses the same five levels as
 * space strings ("terverifikasi kuat" ...). The sync job maps between them;
 * see CONFIDENCE_DB_FROM_LEDGER below.
 */

export type DbVertical = "alam" | "sejarah" | "investigasi";

export type DbArticleStatus = "draft" | "review" | "published";

export type DbConfidence =
  | "terverifikasi-kuat"
  | "didukung-sumber"
  | "terbatas"
  | "diperdebatkan"
  | "belum-cukup-bukti";

export type DbSourceType =
  | "jurnal"
  | "laporan"
  | "arsip"
  | "media"
  | "buku"
  | "dataset"
  | "primer";

export interface DbSource {
  id: string;
  title: string;
  url: string;
  source_type: DbSourceType | null;
  is_oa: true; // constraint guarantees true
  accessed_at: string;
  created_at: string;
}

export interface DbArticle {
  id: string;
  slug: string;
  title: string;
  vertical: DbVertical;
  published_at: string | null;
  last_checked_at: string;
  author: string;
  status: DbArticleStatus;
  confidence_overall: DbConfidence | null;
  created_at: string;
}

export interface DbClaim {
  id: string;
  article_id: string;
  statement: string;
  confidence: DbConfidence;
  created_at: string;
}

export interface DbClaimSource {
  claim_id: string;
  source_id: string;
}

/**
 * Maps the file/MDX claim-ledger status (space strings) onto the DB confidence
 * enum (kebab). Both layers carry the same five levels.
 */
export const CONFIDENCE_DB_FROM_LEDGER: Record<string, DbConfidence> = {
  "terverifikasi kuat": "terverifikasi-kuat",
  "didukung sumber": "didukung-sumber",
  terbatas: "terbatas",
  diperdebatkan: "diperdebatkan",
  "belum cukup bukti": "belum-cukup-bukti",
};
