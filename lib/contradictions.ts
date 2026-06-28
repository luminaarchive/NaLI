import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Contradictions data layer (Bucket B, Step 2.1)                             */
/*                                                                            */
/*  Reads the `contradictions` table (migration 0007). RLS does the gating:    */
/*  public/anon sees only status='confirmed'; an admin session (private.       */
/*  is_admin()) sees and manages everything. The detect script writes via the  */
/*  service-role key and bypasses RLS.                                         */
/* -------------------------------------------------------------------------- */

export type ContradictionStatus = "candidate" | "confirmed" | "dismissed";

export interface Contradiction {
  id: number;
  claimAArticleSlug: string;
  claimAText: string;
  claimAStatus: string;
  claimBArticleSlug: string;
  claimBText: string;
  claimBStatus: string;
  similarity: number;
  llmVerdict: string | null;
  llmRationale: string | null;
  status: ContradictionStatus;
  createdAt: string;
  reviewedAt: string | null;
}

function mapRow(row: Record<string, unknown>): Contradiction {
  return {
    id: row.id as number,
    claimAArticleSlug: row.claim_a_article_slug as string,
    claimAText: row.claim_a_text as string,
    claimAStatus: row.claim_a_status as string,
    claimBArticleSlug: row.claim_b_article_slug as string,
    claimBText: row.claim_b_text as string,
    claimBStatus: row.claim_b_status as string,
    similarity: row.similarity as number,
    llmVerdict: (row.llm_verdict as string | null) ?? null,
    llmRationale: (row.llm_rationale as string | null) ?? null,
    status: row.status as ContradictionStatus,
    createdAt: row.created_at as string,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
  };
}

/**
 * Confirmed contradictions that touch a given article (either side). Used on
 * the public article page; fails closed (returns []) so a DB hiccup never
 * breaks article rendering.
 */
export async function getConfirmedContradictionsForArticle(
  slug: string,
): Promise<Contradiction[]> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb
      .from("contradictions")
      .select("*")
      .eq("status", "confirmed")
      .or(`claim_a_article_slug.eq.${slug},claim_b_article_slug.eq.${slug}`)
      .order("similarity", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/**
 * All contradictions for the admin review screen, candidates first, then by
 * similarity. Returns [] for non-admins (RLS) or on error.
 */
export async function getAllContradictions(): Promise<Contradiction[]> {
  try {
    const sb = createSupabaseServerClient();
    const { data, error } = await sb
      .from("contradictions")
      .select("*")
      .order("status", { ascending: true })
      .order("similarity", { ascending: false });
    if (error || !data) return [];
    return data.map(mapRow);
  } catch {
    return [];
  }
}

/** Flip a contradiction's review status (admin only; enforced by RLS). */
export async function setContradictionStatus(
  id: number,
  status: ContradictionStatus,
): Promise<boolean> {
  try {
    const sb = createSupabaseServerClient();
    const { error } = await sb
      .from("contradictions")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}
