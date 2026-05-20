-- =====================================================================
-- NaLI Zero Sprint 0 Consolidated Additive Migration Script
-- Target Database: Supabase Project wvpplfjrbndzxlgpuicn
-- Purpose: Prepares tables, indexes, RLS, and functions for NaLI Sprint 0 MVP.
-- How to apply: Copy this entire block, open the SQL Editor in the Supabase
-- dashboard for project wvpplfjrbndzxlgpuicn, paste it, and click Run.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Helper function for handling updated_at columns
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Core reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_session_id_hash TEXT NOT NULL,
  report_access_token_hash TEXT NOT NULL,
  storage_path TEXT UNIQUE,
  original_filename TEXT,
  status TEXT NOT NULL DEFAULT 'pending_upload' CHECK (
    status IN ('pending_upload', 'verifying', 'pending_payment', 'processing', 'export_ready', 'failed')
  ),
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  mode TEXT,
  file_size_bytes BIGINT,
  page_count INTEGER,
  verified_file_sha256 TEXT,
  storage_last_modified TIMESTAMPTZ,
  upload_expires_at TIMESTAMPTZ,
  failure_reason TEXT,
  failure_stage TEXT,
  failure_details TEXT,
  processing_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_guest_hash ON public.reports(guest_session_id_hash);
CREATE INDEX IF NOT EXISTS idx_reports_status_created_at ON public.reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_access_hash ON public.reports(report_access_token_hash);
CREATE INDEX IF NOT EXISTS idx_reports_storage_path ON public.reports(storage_path);
CREATE INDEX IF NOT EXISTS idx_reports_upload_expires_at ON public.reports(upload_expires_at);

DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
CREATE TRIGGER set_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Upload verification jobs
CREATE TABLE IF NOT EXISTS public.upload_verification_jobs (
  report_id UUID PRIMARY KEY REFERENCES public.reports(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'verifying', 'verified', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  lease_expires_at TIMESTAMPTZ,
  heartbeat_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS set_upload_verification_jobs_updated_at ON public.upload_verification_jobs;
CREATE TRIGGER set_upload_verification_jobs_updated_at
BEFORE UPDATE ON public.upload_verification_jobs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  midtrans_order_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'cancelled', 'denied')),
  export_type TEXT NOT NULL DEFAULT 'markdown' CHECK (export_type IN ('markdown', 'pdf', 'docx')),
  payment_type TEXT,
  payment_expires_at TIMESTAMPTZ,
  raw_notification JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_report_id ON public.payments(report_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Energy ledger (Usage units)
CREATE TABLE IF NOT EXISTS public.energy_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_session_id_hash TEXT NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'deposit', 'refund')),
  amount INTEGER NOT NULL CHECK (
    amount <> 0
    AND (
      (type IN ('credit', 'refund') AND amount > 0)
      OR (type IN ('debit', 'deposit') AND amount < 0)
    )
  ),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_energy_guest_hash ON public.energy_ledger(guest_session_id_hash);
CREATE INDEX IF NOT EXISTS idx_energy_report_id ON public.energy_ledger(report_id);

-- 6. Rate limits with composite primary key
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key_hash TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key_hash, action_type)
);

-- 7. Internal usage logging events
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

-- 8. Report feedback
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

-- 9. Manual fulfillment jobs (Founder dashboard orders queue)
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

-- 10. Enable Row Level Security (RLS) across all tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_verification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_fulfillment_jobs ENABLE ROW LEVEL SECURITY;

-- 11. Define service_role bypass policies for all tables
DROP POLICY IF EXISTS reports_service_role_all ON public.reports;
CREATE POLICY reports_service_role_all
ON public.reports FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS upload_verification_jobs_service_role_all ON public.upload_verification_jobs;
CREATE POLICY upload_verification_jobs_service_role_all
ON public.upload_verification_jobs FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS payments_service_role_all ON public.payments;
CREATE POLICY payments_service_role_all
ON public.payments FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS energy_ledger_service_role_all ON public.energy_ledger;
CREATE POLICY energy_ledger_service_role_all
ON public.energy_ledger FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS rate_limits_service_role_all ON public.rate_limits;
CREATE POLICY rate_limits_service_role_all
ON public.rate_limits FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS usage_events_service_role_all ON public.usage_events;
CREATE POLICY usage_events_service_role_all
ON public.usage_events FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS report_feedback_service_role_all ON public.report_feedback;
CREATE POLICY report_feedback_service_role_all
ON public.report_feedback FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS manual_fulfillment_jobs_service_role_all ON public.manual_fulfillment_jobs;
CREATE POLICY manual_fulfillment_jobs_service_role_all
ON public.manual_fulfillment_jobs FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- 12. Create private uploads storage bucket (For PDF files)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('nali_report_uploads', 'nali_report_uploads', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];
