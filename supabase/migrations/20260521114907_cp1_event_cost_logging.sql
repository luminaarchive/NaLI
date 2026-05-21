-- NaLI CP1 event and cost logging foundation
-- Additive only: server-side operational audit and internal API usage estimates.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.report_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'REPORT_CREATED',
      'PREVIEW_GENERATED',
      'PAYMENT_CREATED',
      'PAYMENT_CONFIRMED',
      'EXPORT_ATTEMPTED',
      'EXPORT_UNLOCKED',
      'FEEDBACK_SUBMITTED'
    )
  ),
  status TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_events_report_id_created_at
  ON public.report_events(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_events_event_type_created_at
  ON public.report_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  operation TEXT NOT NULL,
  provider_alias TEXT,
  model_alias TEXT,
  estimated_input_tokens INTEGER,
  estimated_output_tokens INTEGER,
  estimated_cost NUMERIC(12,6),
  status TEXT NOT NULL DEFAULT 'skipped' CHECK (status IN ('success', 'failed', 'skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_report_id_created_at
  ON public.api_usage_logs(report_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_operation_created_at
  ON public.api_usage_logs(operation, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status_created_at
  ON public.api_usage_logs(status, created_at DESC);

ALTER TABLE public.report_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS report_events_service_role_all ON public.report_events;
CREATE POLICY report_events_service_role_all
ON public.report_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS api_usage_logs_service_role_all ON public.api_usage_logs;
CREATE POLICY api_usage_logs_service_role_all
ON public.api_usage_logs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
