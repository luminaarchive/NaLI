-- NaLI CP1 report balance ledger persistence.
-- Additive and server-only: this prepares auditable report units without activating payment or public premium access.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.report_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('guest', 'user', 'internal')),
  owner_id TEXT NOT NULL CHECK (char_length(owner_id) BETWEEN 8 AND 128),
  basic_reports_remaining INTEGER NOT NULL DEFAULT 0 CHECK (basic_reports_remaining >= 0),
  pro_reports_remaining INTEGER NOT NULL DEFAULT 0 CHECK (pro_reports_remaining >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_type, owner_id)
);

CREATE INDEX IF NOT EXISTS idx_report_balances_owner
  ON public.report_balances(owner_type, owner_id);

DROP TRIGGER IF EXISTS set_report_balances_updated_at ON public.report_balances;
CREATE TRIGGER set_report_balances_updated_at
BEFORE UPDATE ON public.report_balances
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.report_ledger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('guest', 'user', 'internal')),
  owner_id TEXT NOT NULL CHECK (char_length(owner_id) BETWEEN 8 AND 128),
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'purchase_basic',
      'purchase_pro',
      'purchase_pro_bundle',
      'consume_basic_report',
      'consume_pro_report',
      'refund_report',
      'generation_failed_no_charge',
      'admin_adjustment_internal',
      'test_seed_internal'
    )
  ),
  report_type TEXT CHECK (report_type IS NULL OR report_type IN ('basic', 'pro', 'starter', 'unknown')),
  amount INTEGER NOT NULL,
  balance_before INTEGER,
  balance_after INTEGER,
  report_id TEXT,
  payment_id TEXT,
  idempotency_key TEXT,
  source TEXT NOT NULL CHECK (
    source IN ('api_generate', 'payment_webhook_future', 'internal_admin_future', 'test', 'system')
  ),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (event_type IN ('consume_basic_report', 'consume_pro_report') AND amount = -1)
    OR (event_type = 'generation_failed_no_charge' AND amount = 0)
    OR (event_type IN ('purchase_basic', 'purchase_pro', 'purchase_pro_bundle', 'refund_report', 'admin_adjustment_internal', 'test_seed_internal'))
  )
);

CREATE INDEX IF NOT EXISTS idx_report_ledger_events_owner_created_at
  ON public.report_ledger_events(owner_type, owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_ledger_events_report_id
  ON public.report_ledger_events(report_id);
CREATE INDEX IF NOT EXISTS idx_report_ledger_events_payment_id
  ON public.report_ledger_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_report_ledger_events_event_type_created_at
  ON public.report_ledger_events(event_type, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_report_ledger_events_owner_idempotency
  ON public.report_ledger_events(owner_type, owner_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.report_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_ledger_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.report_balances FROM anon, authenticated;
REVOKE ALL ON public.report_ledger_events FROM anon, authenticated;
GRANT ALL ON public.report_balances TO service_role;
GRANT ALL ON public.report_ledger_events TO service_role;

DROP POLICY IF EXISTS report_balances_service_role_all ON public.report_balances;
CREATE POLICY report_balances_service_role_all
ON public.report_balances
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS report_ledger_events_service_role_all ON public.report_ledger_events;
CREATE POLICY report_ledger_events_service_role_all
ON public.report_ledger_events
FOR ALL
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Atomic single-report consumption. It is invoker-only and only the service role may execute it.
CREATE OR REPLACE FUNCTION public.consume_report_balance(
  p_owner_type TEXT,
  p_owner_id TEXT,
  p_report_type TEXT,
  p_idempotency_key TEXT,
  p_report_id TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'api_generate',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  consumed BOOLEAN,
  duplicate BOOLEAN,
  basic_reports_remaining INTEGER,
  pro_reports_remaining INTEGER,
  balance_before INTEGER,
  balance_after INTEGER,
  event_type TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_balance public.report_balances%ROWTYPE;
  v_before INTEGER;
  v_after INTEGER;
  v_event_type TEXT;
BEGIN
  IF p_owner_type NOT IN ('guest', 'user', 'internal') THEN
    RAISE EXCEPTION 'invalid owner_type';
  END IF;
  IF p_report_type NOT IN ('basic', 'pro') THEN
    RAISE EXCEPTION 'invalid report_type';
  END IF;
  IF NULLIF(btrim(p_idempotency_key), '') IS NULL THEN
    RAISE EXCEPTION 'idempotency_key required';
  END IF;
  IF p_source NOT IN ('api_generate', 'payment_webhook_future', 'internal_admin_future', 'test', 'system') THEN
    RAISE EXCEPTION 'invalid source';
  END IF;

  INSERT INTO public.report_balances (owner_type, owner_id)
  VALUES (p_owner_type, p_owner_id)
  ON CONFLICT (owner_type, owner_id) DO NOTHING;

  SELECT rb.*
    INTO v_balance
    FROM public.report_balances rb
    WHERE rb.owner_type = p_owner_type AND rb.owner_id = p_owner_id
    FOR UPDATE;

  IF EXISTS (
    SELECT 1
    FROM public.report_ledger_events rle
    WHERE rle.owner_type = p_owner_type
      AND rle.owner_id = p_owner_id
      AND rle.idempotency_key = p_idempotency_key
  ) THEN
    RETURN QUERY SELECT false, true, v_balance.basic_reports_remaining, v_balance.pro_reports_remaining,
      NULL::INTEGER, NULL::INTEGER, NULL::TEXT;
    RETURN;
  END IF;

  v_before := CASE
    WHEN p_report_type = 'basic' THEN v_balance.basic_reports_remaining
    ELSE v_balance.pro_reports_remaining
  END;

  IF v_before < 1 THEN
    RETURN QUERY SELECT false, false, v_balance.basic_reports_remaining, v_balance.pro_reports_remaining,
      v_before, v_before, NULL::TEXT;
    RETURN;
  END IF;

  IF p_report_type = 'basic' THEN
    UPDATE public.report_balances rb
      SET basic_reports_remaining = rb.basic_reports_remaining - 1
      WHERE rb.owner_type = p_owner_type AND rb.owner_id = p_owner_id
      RETURNING rb.* INTO v_balance;
    v_event_type := 'consume_basic_report';
  ELSE
    UPDATE public.report_balances rb
      SET pro_reports_remaining = rb.pro_reports_remaining - 1
      WHERE rb.owner_type = p_owner_type AND rb.owner_id = p_owner_id
      RETURNING rb.* INTO v_balance;
    v_event_type := 'consume_pro_report';
  END IF;

  v_after := v_before - 1;

  INSERT INTO public.report_ledger_events (
    owner_type,
    owner_id,
    event_type,
    report_type,
    amount,
    balance_before,
    balance_after,
    report_id,
    idempotency_key,
    source,
    metadata
  )
  VALUES (
    p_owner_type,
    p_owner_id,
    v_event_type,
    p_report_type,
    -1,
    v_before,
    v_after,
    p_report_id,
    p_idempotency_key,
    p_source,
    COALESCE(p_metadata, '{}'::jsonb)
  );

  RETURN QUERY SELECT true, false, v_balance.basic_reports_remaining, v_balance.pro_reports_remaining,
    v_before, v_after, v_event_type;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_report_balance(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.consume_report_balance(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_report_balance(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;
