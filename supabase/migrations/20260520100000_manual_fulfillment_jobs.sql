-- NaLI Zero Sprint 0 Manual Fulfillment Jobs
-- Additive only. Prepares manual fulfillment jobs.

CREATE TABLE IF NOT EXISTS public.manual_fulfillment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  guest_session_id_hash TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'in_review', 'waiting_user', 'completed', 'cancelled')
  ),
  complexity_score INTEGER NOT NULL,
  reason TEXT,
  founder_note TEXT,
  user_scope_note TEXT,
  estimated_turnaround_hours INTEGER,
  revision_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_fulfillment_jobs_report_id ON public.manual_fulfillment_jobs(report_id);
CREATE INDEX IF NOT EXISTS idx_manual_fulfillment_jobs_status ON public.manual_fulfillment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_manual_fulfillment_jobs_guest_hash ON public.manual_fulfillment_jobs(guest_session_id_hash);

DROP TRIGGER IF EXISTS set_manual_fulfillment_jobs_updated_at ON public.manual_fulfillment_jobs;
CREATE TRIGGER set_manual_fulfillment_jobs_updated_at
BEFORE UPDATE ON public.manual_fulfillment_jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.manual_fulfillment_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS manual_fulfillment_jobs_service_role_all ON public.manual_fulfillment_jobs;
CREATE POLICY manual_fulfillment_jobs_service_role_all
ON public.manual_fulfillment_jobs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
