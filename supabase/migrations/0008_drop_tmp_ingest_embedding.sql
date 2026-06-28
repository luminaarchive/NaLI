-- 0008_drop_tmp_ingest_embedding.sql
--
-- Closes a Supabase security-advisor finding: a leftover SECURITY DEFINER helper
-- `public.tmp_ingest_embedding(...)` was reachable via /rest/v1/rpc by the anon and
-- authenticated roles, letting anyone write rows into `content_embeddings` without
-- auth. It was a one-off helper from the RAG embeddings ingest work (commit 5e4783e
-- era), never committed to the repo, and nothing in the codebase calls it
-- (`scripts/ingest-embeddings.mjs` writes via .upsert(), not this RPC). So we DROP it.
--
-- Drop every overload of the function regardless of signature (the exact argument
-- types were never captured in source control).
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'tmp_ingest_embedding'
  LOOP
    EXECUTE format('DROP FUNCTION %s', fn.sig);
  END LOOP;
END $$;

-- While here, clear the `function_search_path_mutable` WARNs on the two RAG match
-- functions by pinning an explicit, non-mutable search_path. Their bodies already
-- fully schema-qualify `public.content_embeddings` and the `extensions.vector` cast;
-- `extensions` must stay on the path so the pgvector `<=>` operator still resolves.
ALTER FUNCTION public.match_embeddings(text, double precision, integer)
  SET search_path = public, extensions;

ALTER FUNCTION public.match_content_embeddings(text, integer, text)
  SET search_path = public, extensions;
