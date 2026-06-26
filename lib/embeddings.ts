import { createClient } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------- */
/*  Server-side embedding generation + vector retrieval for RAG               */
/*                                                                            */
/*  Uses Google's text-embedding-004 (768-dim, free tier: 1 500 RPM) and      */
/*  Supabase pgvector for cosine-similarity search.                           */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Server-side Supabase client (never exposed to the browser). */
function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

/* ----------------------------- Embedding ---------------------------------- */

const EMBEDDING_MODEL = "text-embedding-004";
const EMBEDDING_API = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Generate a 768-dim embedding vector via the Gemini REST API.
 * Uses the raw REST endpoint to avoid pulling in the full SDK at runtime.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

  const res = await fetch(
    `${EMBEDDING_API}/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.embedding.values as number[];
}

/* ----------------------------- Retrieval ---------------------------------- */

export interface RetrievedChunk {
  slug: string;
  category: string;
  title: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

/**
 * Retrieve the most similar content chunks for a query string.
 *
 * @param query     - the user's question
 * @param topK      - number of results (default 5)
 * @param filterSlug - optional slug to scope results to a specific article/source
 */
export async function retrieveContext(
  query: string,
  topK = 5,
  filterSlug?: string,
): Promise<RetrievedChunk[]> {
  const embedding = await generateEmbedding(query);
  const supabase = getSupabase();

  // Use Supabase's RPC to call the match function.
  // We call the raw SQL via `.rpc()` which requires a stored function,
  // OR we can use the postgrest filter with the vector column.
  // For simplicity, use a raw query via the SQL endpoint.
  const embeddingStr = `[${embedding.join(",")}]`;

  let queryBuilder = supabase
    .rpc("match_embeddings", {
      query_embedding: embeddingStr,
      match_threshold: 0.3,
      match_count: topK,
    });

  if (filterSlug) {
    queryBuilder = queryBuilder.eq("slug", filterSlug);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    // Fallback: if the RPC function doesn't exist yet, use a direct query approach
    console.error("RPC match_embeddings error, using fallback:", error.message);
    return fallbackRetrieve(embeddingStr, topK, filterSlug);
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    slug: row.slug as string,
    category: row.category as string,
    title: row.title as string,
    content: row.content as string,
    similarity: row.similarity as number,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }));
}

/**
 * Fallback retrieval using Supabase's raw SQL query when the RPC function
 * hasn't been created yet. Uses the pgvector `<=>` cosine distance operator.
 */
async function fallbackRetrieve(
  embeddingStr: string,
  topK: number,
  filterSlug?: string,
): Promise<RetrievedChunk[]> {
  const supabase = getSupabase();
  const slugFilter = filterSlug ? `AND slug = '${filterSlug.replace(/'/g, "''")}'` : "";

  const { data, error } = await supabase.rpc("match_content_embeddings", {
    query_embedding: embeddingStr,
    match_count: topK,
    filter_slug: filterSlug ?? null,
  });

  if (error) {
    console.error("Fallback retrieval also failed:", error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    slug: row.slug as string,
    category: row.category as string,
    title: row.title as string,
    content: row.content as string,
    similarity: row.similarity as number,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  }));
}

/* ----------------------------- Chunking ----------------------------------- */

/**
 * Split a document body into overlapping chunks suitable for embedding.
 * Target: ~500 tokens per chunk with ~50 token overlap.
 * Uses paragraph boundaries when possible to keep chunks coherent.
 */
export function chunkText(
  text: string,
  maxChars = 2000,
  overlapChars = 200,
): string[] {
  // Clean up the text
  const cleaned = text
    .replace(/^---[\s\S]*?---\n/m, "") // strip frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, "")    // strip image markdown
    .replace(/\n{3,}/g, "\n\n")         // collapse excessive newlines
    .trim();

  if (cleaned.length <= maxChars) return [cleaned];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = start + maxChars;

    if (end < cleaned.length) {
      // Try to break at a paragraph boundary
      const paragraphBreak = cleaned.lastIndexOf("\n\n", end);
      if (paragraphBreak > start + maxChars * 0.5) {
        end = paragraphBreak;
      } else {
        // Fall back to sentence boundary
        const sentenceBreak = cleaned.lastIndexOf(". ", end);
        if (sentenceBreak > start + maxChars * 0.5) {
          end = sentenceBreak + 1;
        }
      }
    } else {
      end = cleaned.length;
    }

    chunks.push(cleaned.slice(start, end).trim());
    start = end - overlapChars;

    // Don't create tiny trailing chunks
    if (cleaned.length - start < overlapChars * 2) {
      if (start < cleaned.length) {
        chunks.push(cleaned.slice(start).trim());
      }
      break;
    }
  }

  return chunks.filter((c) => c.length > 50); // skip trivially small chunks
}
