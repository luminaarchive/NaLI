-- Add conversation messages array to report_sessions
-- Each element: { role: "user"|"assistant", content: string, timestamp: ISO8601 }
ALTER TABLE public.report_sessions
  ADD COLUMN IF NOT EXISTS messages JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_report_sessions_messages
  ON public.report_sessions USING GIN (messages);
