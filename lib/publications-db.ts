import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read layer for the open-access library (Pustaka Terbuka).
 *
 * Reads METADATA ONLY of open-access works from the `publications` table.
 * No full text is stored or served here; every record links out to the legally
 * hosted open-access copy. This scales to the million-paper target because the
 * data lives in Postgres with paginated / searched queries, not as static files.
 *
 * Uses the public anon key (RLS allows read-only). When Supabase is not
 * configured the functions degrade to empty results so the build never crashes.
 */

export interface Publication {
  id: string;
  slug: string;
  title: string;
  abstract: string | null;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  oa_url: string | null;
  pdf_url: string | null;
  landing_url: string | null;
  topics: string[];
  geography: string[];
  language: string | null;
  license: string | null;
  relevance: number;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
function db(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export const publicationsEnabled = Boolean(url && key);

export const PAGE_SIZE = 24;

export interface ListResult {
  rows: Publication[];
  total: number;
  page: number;
  pageSize: number;
}

const COLS =
  "id,slug,title,abstract,authors,year,venue,doi,oa_url,pdf_url,landing_url,topics,geography,language,license,relevance";

/** Total number of catalogued open-access works (for the counter). */
export async function getPublicationCount(): Promise<number> {
  const c = db();
  if (!c) return 0;
  const { count, error } = await c
    .from("publications")
    .select("id", { count: "estimated", head: true });
  if (error) return 0;
  return count ?? 0;
}

/** Paginated + optional free-text search over the library. */
export async function listPublications(opts: {
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<ListResult> {
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  const c = db();
  if (!c) return { rows: [], total: 0, page, pageSize };

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const q = (opts.q ?? "").trim();

  let query = c
    .from("publications")
    .select(COLS, { count: "estimated" });

  if (q) {
    // websearch_to_tsquery handles user phrases safely.
    query = query.textSearch("tsv", q, { type: "websearch", config: "simple" });
    query = query.order("relevance", { ascending: false });
  } else {
    query = query.order("relevance", { ascending: false }).order("year", {
      ascending: false,
      nullsFirst: false,
    });
  }

  const { data, count, error } = await query.range(from, to);
  if (error) return { rows: [], total: 0, page, pageSize };
  return {
    rows: (data ?? []) as unknown as Publication[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getPublicationBySlug(slug: string): Promise<Publication | null> {
  const c = db();
  if (!c) return null;
  const { data, error } = await c
    .from("publications")
    .select(COLS)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as Publication;
}
