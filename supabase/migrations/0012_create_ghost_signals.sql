-- Ghost Signals (Bucket C, Step 3.5). The most speculative Lab artifact.
--
-- A "ghost signal" is an external ANOMALY worth a human look: a YouTube clip, a
-- Xeno-canto recording, or an iNaturalist "needs ID" observation that *might*
-- point to a notable or elusive species. It is NOT a claim and NOT evidence; it
-- is a lead even softer than a Lazarus lead. So this table is Lab-private:
-- admin-only RLS, NO anon policy, never served to the public API. The only way
-- anything here reaches the public site is via manual promotion into a mission
-- (an open field-verification QUESTION).
--
-- NOTE: public.watch_alerts / public.alert_events are a SEPARATE feature
-- (internal content-change notifications) and are intentionally left untouched.

create table public.ghost_signals (
  id bigint generated always as identity primary key,

  source text not null
         check (source in ('youtube', 'xeno-canto', 'inaturalist')),
  external_id text not null,            -- video / recording / observation id
  title text not null,
  url   text not null,
  observed_on    date,
  location_label text,
  taxon_hint     text,                  -- suspected taxon: a HINT, never a claim
  summary        text,

  -- Notability heuristic 0..100 (recency + unidentified + locatability + match).
  -- A prioritization signal, NOT a probability the species is present.
  score   int check (score between 0 and 100),
  signals jsonb not null default '[]'::jsonb,

  provenance text not null default 'api'
             check (provenance in ('api', 'curated', 'sample')),
  status text not null default 'signal'
         check (status in ('signal', 'investigating', 'promoted', 'dismissed')),
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (source, external_id)
);

create index ghost_signals_status_idx on public.ghost_signals (status);
create index ghost_signals_score_idx on public.ghost_signals (score desc);

-- RLS: admin-only. No anon policy -> the public/anon API returns nothing.
alter table public.ghost_signals enable row level security;

create policy "admins_manage_ghost_signals"
  on public.ghost_signals for all
  to authenticated using (private.is_admin()) with check (private.is_admin());
