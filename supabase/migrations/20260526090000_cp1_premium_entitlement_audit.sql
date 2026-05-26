-- NaLI CP1 premium entitlement audit event.
-- Additive only: enables service-role audit logging without activating payment or public premium access.

ALTER TABLE public.report_events
  DROP CONSTRAINT IF EXISTS report_events_event_type_check;

ALTER TABLE public.report_events
  ADD CONSTRAINT report_events_event_type_check CHECK (
    event_type IN (
      'REPORT_CREATED',
      'PREVIEW_GENERATED',
      'PAYMENT_CREATED',
      'PAYMENT_CONFIRMED',
      'EXPORT_ATTEMPTED',
      'EXPORT_UNLOCKED',
      'FEEDBACK_SUBMITTED',
      'PREMIUM_ENTITLEMENT_ATTEMPT'
    )
  );
