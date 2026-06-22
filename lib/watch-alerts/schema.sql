-- Watch Alerts schema (Doctrine v2.1, Phase 4). ADDITIVE only.
--
-- watch_alerts: a registered interest in a topic / series / article.
-- alert_events: events emitted when watched evidence changes.
--
-- RLS is enabled with NO public policy: these are internal signals, readable and
-- writable only via the service role (or an authenticated admin), never anon.

CREATE TABLE IF NOT EXISTS watch_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_slug TEXT,
  series_id TEXT,
  article_slug TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('new-source-on-topic','claim-status-changed','article-updated','series-new-article')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alert_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES watch_alerts(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_events_alert ON alert_events(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_seen ON alert_events(seen);

ALTER TABLE watch_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_events ENABLE ROW LEVEL SECURITY;
-- No public policy: service role / admin only.
