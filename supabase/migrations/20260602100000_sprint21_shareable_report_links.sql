-- Sprint 21: shareable read-only report links (/r/[id]).
-- Adds a non-guessable public token and an anon read path that exposes ONLY
-- non-PII report content. user_id, prompt, model_used, messages, updated_at are
-- never selectable by the anon role (column-level privilege enforces this).

ALTER TABLE public.report_sessions
  ADD COLUMN IF NOT EXISTS share_id text;

-- UNIQUE so tokens can't collide; nullable so unshared rows stay NULL.
-- (Postgres allows many NULLs in a unique index, so existing rows are fine.)
CREATE UNIQUE INDEX IF NOT EXISTS uq_report_sessions_share_id
  ON public.report_sessions (share_id);

-- Anon may read ONLY rows that have been explicitly shared (share_id set).
DROP POLICY IF EXISTS "anon_read_shared_report_sessions" ON public.report_sessions;
CREATE POLICY "anon_read_shared_report_sessions"
  ON public.report_sessions
  FOR SELECT
  TO anon
  USING (share_id IS NOT NULL);

-- Column-level privilege: anon can physically SELECT ONLY these safe columns.
-- Guarantees user_id / prompt / model_used / messages can never leak to anon,
-- even if a crafted query asks for them. Owner (authenticated) access is untouched.
REVOKE ALL ON public.report_sessions FROM anon;
GRANT SELECT (id, title, result, created_at, share_id) ON public.report_sessions TO anon;
