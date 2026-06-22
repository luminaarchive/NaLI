import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DbArticle, DbClaim, DbSource, DbVertical } from "./types";

/**
 * Typed query helpers for the relational evidence layer (Doctrine v2.1, Phase 3).
 *
 * These read the articles / claims / sources tables via the existing Supabase
 * server client (anon key, RLS public-read). The tables are the structured
 * backbone for the evidence graph; they return empty until a sync job populates
 * them, which is expected. The live site still renders from MDX.
 */

export async function getArticleBySlug(slug: string): Promise<DbArticle | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("articles").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return data as DbArticle;
}

export async function getArticlesByVertical(vertical: DbVertical): Promise<DbArticle[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("articles")
    .select("*")
    .eq("vertical", vertical)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error || !data) return [];
  return data as DbArticle[];
}

export async function getPublishedArticles(limit?: number): Promise<DbArticle[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as DbArticle[];
}

export async function getClaimsForArticle(articleId: string): Promise<DbClaim[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("claims")
    .select("*")
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data as DbClaim[];
}

export async function getSourcesForClaim(claimId: string): Promise<DbSource[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("claim_sources")
    .select("sources(*)")
    .eq("claim_id", claimId);
  if (error || !data) return [];
  return (data as unknown as { sources: DbSource }[]).map((row) => row.sources).filter(Boolean);
}

/** Explicit OA filter, redundant with the CHECK constraint but kept as defense in depth. */
export async function getOpenAccessSources(): Promise<DbSource[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb.from("sources").select("*").eq("is_oa", true);
  if (error || !data) return [];
  return data as DbSource[];
}
