-- ============================================================
-- Add user_id to public.reports and configure RLS policies
-- Sprint: Production persistence and user ownership
-- ============================================================

-- Add user_id column referencing auth.users
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for faster query performance on user ownership
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);

-- Ensure RLS is enabled on public.reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow users to read reports they own
DROP POLICY IF EXISTS reports_user_select ON public.reports;
CREATE POLICY reports_user_select ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert reports they own
DROP POLICY IF EXISTS reports_user_insert ON public.reports;
CREATE POLICY reports_user_insert ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update reports they own
DROP POLICY IF EXISTS reports_user_update ON public.reports;
CREATE POLICY reports_user_update ON public.reports
  FOR UPDATE
  USING (auth.uid() = user_id);
