-- Add result and model_used columns to report_sessions
-- Needed for: storing AI-generated markdown + tracking which model produced it
ALTER TABLE public.report_sessions
  ADD COLUMN IF NOT EXISTS result     TEXT,
  ADD COLUMN IF NOT EXISTS model_used TEXT;
