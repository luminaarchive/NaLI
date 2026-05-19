-- NaLI Zero Sprint 0 presigned upload foundation
-- Additive only. Prepares private PDF upload storage and verification metadata.

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS storage_path TEXT UNIQUE;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS original_filename TEXT;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS page_count INTEGER;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS verified_file_sha256 TEXT;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS storage_last_modified TIMESTAMPTZ;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS upload_expires_at TIMESTAMPTZ;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS failure_reason TEXT;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS failure_stage TEXT;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS failure_details TEXT;

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS processing_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_reports_storage_path ON public.reports(storage_path);
CREATE INDEX IF NOT EXISTS idx_reports_upload_expires_at ON public.reports(upload_expires_at);

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

ALTER TABLE public.upload_verification_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS upload_verification_jobs_service_role_all ON public.upload_verification_jobs;
CREATE POLICY upload_verification_jobs_service_role_all
ON public.upload_verification_jobs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('nali_report_uploads', 'nali_report_uploads', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];
