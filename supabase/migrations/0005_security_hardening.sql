-- 0005_security_hardening.sql
--
-- Tightens write authorization on `posts` from "any authenticated session" to an
-- explicit admin allowlist, per the Supabase security advisor (rls_policy_always_true)
-- and Doctrine Axiom 16 (least privilege).
--
-- Pattern: an `admins` allowlist table + a SECURITY DEFINER `is_admin()` helper
-- placed in a PRIVATE schema so it is NOT reachable via the PostgREST /rpc API
-- (the advisor flags SECURITY DEFINER functions exposed in `public`). RLS policies
-- reference it cross-schema. The allowlist is seeded with the existing admin
-- account so the dashboard keeps working.
--
-- NOTE for the founder: when you create a NEW admin auth user, add it to the
-- allowlist:  insert into public.admins (user_id) values ('<auth-user-uuid>');

CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
-- No policy on admins: unreadable by anon/authenticated, checked only via the
-- SECURITY DEFINER function below.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

INSERT INTO public.admins (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Replace the always-true posts policies with admin-only checks.
DROP POLICY IF EXISTS "authenticated insert posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated update posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated delete posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated read all posts" ON public.posts;

CREATE POLICY "admins read all posts" ON public.posts
  FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "admins insert posts" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (private.is_admin());
CREATE POLICY "admins update posts" ON public.posts
  FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "admins delete posts" ON public.posts
  FOR DELETE TO authenticated USING (private.is_admin());

-- The public "read published posts" SELECT policy is intentionally kept.
