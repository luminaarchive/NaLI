-- NaLI Zero Sprint 0 foundation
-- Additive migration only. Does not apply external credentials, storage buckets, or payment setup.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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

DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;
CREATE TRIGGER set_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  midtrans_order_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key_hash TEXT NOT NULL,
  action_type TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key_hash, action_type)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_verification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reports_service_role_all ON public.reports;
CREATE POLICY reports_service_role_all
ON public.reports
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS upload_verification_jobs_service_role_all ON public.upload_verification_jobs;
CREATE POLICY upload_verification_jobs_service_role_all
ON public.upload_verification_jobs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS payments_service_role_all ON public.payments;
CREATE POLICY payments_service_role_all
ON public.payments
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS energy_ledger_service_role_all ON public.energy_ledger;
CREATE POLICY energy_ledger_service_role_all
ON public.energy_ledger
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS rate_limits_service_role_all ON public.rate_limits;
CREATE POLICY rate_limits_service_role_all
ON public.rate_limits
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
