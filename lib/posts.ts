import "server-only";
import readingTime from "reading-time";
import { createSupabaseServerClient } from "./supabase/server";
import type {
  Article,
  ArticleImage,
  ArticleSource,
  Category,
  ClaimLedgerItem,
  Confidence,
  EvidenceBasis,
  ExternalVisualEvidence,
  Status,
} from "./types";

/** Shape of a row in the `posts` table. */
export interface PostRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  category: Category;
  tags: string[] | null;
  summary: string;
  confidence: Confidence;
  status: Status;
  sources: ArticleSource[] | null;
  cover_image: string | null;
  body: string;
  created_at: string;
  updated_at: string;
  /* editorial-trust fields (migration 0002) */
  evidence_basis: EvidenceBasis | null;
  first_party_fieldwork: boolean | null;
  claim_ledger: ClaimLedgerItem[] | null;
  limitations: string[] | null;
  images: ArticleImage[] | null;
  external_visuals: ExternalVisualEvidence[] | null;
  series: string[] | null;
  updated: string | null;
}

export function rowToArticle(r: PostRow): Article {
  const content = r.body ?? "";
  return {
    title: r.title,
    subtitle: r.subtitle ?? "",
    slug: r.slug,
    date: r.date,
    category: r.category,
    tags: r.tags ?? [],
    summary: r.summary ?? "",
    confidence: r.confidence,
    status: r.status,
    sources: r.sources ?? [],
    content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes || 1)),
    coverImage: r.cover_image ?? undefined,
    origin: "db",
    evidenceBasis: r.evidence_basis ?? undefined,
    firstPartyFieldwork: r.first_party_fieldwork ?? false,
    claimLedger: r.claim_ledger ?? undefined,
    limitations: r.limitations ?? undefined,
    images: r.images ?? undefined,
    externalVisuals: r.external_visuals ?? undefined,
    series: r.series ?? undefined,
    updated: r.updated ?? undefined,
  };
}

/** Published posts from Supabase (public). Returns [] if Supabase is unreachable. */
export async function getDbPublishedArticles(): Promise<Article[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "published")
      .order("date", { ascending: false });
    if (error || !data) return [];
    return (data as PostRow[]).map(rowToArticle);
  } catch {
    return [];
  }
}
