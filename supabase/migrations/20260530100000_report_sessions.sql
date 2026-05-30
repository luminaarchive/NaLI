-- report_sessions: stores user report history linked to auth.users
-- Used by FIX 6: account history for logged-in users
CREATE TABLE IF NOT EXISTS public.report_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT,
  prompt     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_sessions_user ON public.report_sessions(user_id, created_at DESC);

ALTER TABLE public.report_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_report_sessions"
  ON public.report_sessions FOR ALL
  USING (auth.uid() = user_id);
