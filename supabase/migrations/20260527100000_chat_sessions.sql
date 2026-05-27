-- ============================================================
-- NaLI Chat Sessions Schema
-- Stores conversation sessions and individual messages
-- Sprint: Manus-style chat session system
-- ============================================================

-- Sessions table: one row per conversation
CREATE TABLE IF NOT EXISTS public.nali_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- null user_id = anonymous/guest session
  title         TEXT,
  -- Auto-generated from first user message, max 80 chars
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Metadata
  first_query   TEXT,
  -- The original query that started this session
  message_count INTEGER NOT NULL DEFAULT 0,
  is_archived   BOOLEAN NOT NULL DEFAULT false
);

-- Messages table: one row per turn (user or assistant)
CREATE TABLE IF NOT EXISTS public.nali_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES public.nali_sessions(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content       TEXT NOT NULL,
  -- Full text of the message
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ordering
  position      INTEGER NOT NULL DEFAULT 0,
  -- Metadata for assistant messages (server-only, never exposed to client UI)
  model_slug    TEXT,
  tokens_used   INTEGER,
  generation_ms INTEGER,
  -- Error tracking
  has_error     BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_nali_sessions_user_id
  ON public.nali_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nali_sessions_updated_at
  ON public.nali_sessions(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_nali_messages_session_id
  ON public.nali_messages(session_id, position ASC);

-- Trigger: auto-update updated_at on nali_sessions when new message inserted
CREATE OR REPLACE FUNCTION public.update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.nali_sessions
  SET
    updated_at = now(),
    message_count = message_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_session_on_message ON public.nali_messages;
CREATE TRIGGER trg_update_session_on_message
  AFTER INSERT ON public.nali_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_session_on_message();

-- RLS: Row Level Security
ALTER TABLE public.nali_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nali_messages ENABLE ROW LEVEL SECURITY;

-- Sessions RLS policies
CREATE POLICY "users_read_own_sessions"
  ON public.nali_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "users_insert_sessions"
  ON public.nali_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "users_update_own_sessions"
  ON public.nali_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Messages RLS policies
CREATE POLICY "users_read_own_messages"
  ON public.nali_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nali_sessions s
      WHERE s.id = session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

CREATE POLICY "users_insert_messages"
  ON public.nali_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.nali_sessions s
      WHERE s.id = session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

-- Service role can do everything (for server-side operations)
CREATE POLICY "service_role_all_sessions"
  ON public.nali_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_messages"
  ON public.nali_messages FOR ALL
  USING (auth.role() = 'service_role');
