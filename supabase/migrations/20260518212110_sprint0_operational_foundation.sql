-- NaLI Zero Sprint 0 operational foundation
-- Additive only: internal usage logging and lightweight report feedback.

CREATE TABLE IF NOT EXISTS public.usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_session_id_hash TEXT,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  processing_class TEXT CHECK (processing_class IN ('Peregrine', 'Obsidian', 'Zephyr')),
  estimated_energy INTEGER,
  estimated_cost_idr NUMERIC,
  status TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_guest_hash ON public.usage_events(guest_session_id_hash);
CREATE INDEX IF NOT EXISTS idx_usage_events_report_id ON public.usage_events(report_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_action_created_at ON public.usage_events(action_type, created_at);

CREATE TABLE IF NOT EXISTS public.report_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  guest_session_id_hash TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('helpful', 'not_helpful')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_feedback_report_id ON public.report_feedback(report_id);
CREATE INDEX IF NOT EXISTS idx_report_feedback_created_at ON public.report_feedback(created_at);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usage_events_service_role_all ON public.usage_events;
CREATE POLICY usage_events_service_role_all
ON public.usage_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS report_feedback_service_role_all ON public.report_feedback;
CREATE POLICY report_feedback_service_role_all
ON public.report_feedback
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
