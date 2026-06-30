-- Lab harvest audit trail (Bucket C, follow-up to Step 3.2).
--
-- Every time the harvesters run and build-leads writes lab_leads, it also logs
-- ONE row here: when it ran, what triggered it, how many taxa/leads it touched,
-- per-provider record counts, and the longest silences it saw that run. This is
-- the verifiable "the machine actually ran" record, surfaced at /lab/harvest-log.
--
-- Same privacy contract as lab_leads: admin-only, no anon policy.

create table public.lab_harvest_runs (
  id bigint generated always as identity primary key,

  ran_at  timestamptz not null default now(),
  trigger text not null default 'manual'
          check (trigger in ('manual', 'cron', 'dev', 'backfill')),
  status  text not null default 'success'
          check (status in ('success', 'partial', 'failed')),

  taxa_count     int not null default 0,   -- seed taxa processed this run
  leads_upserted int not null default 0,   -- rows written to lab_leads

  -- per-provider breakdown: [{ "source": "gbif", "records": 12, "ok": true }, ...]
  providers  jsonb not null default '[]'::jsonb,
  -- the run's most notable silences: [{ "taxon", "gap_years", "note" }, ...]
  highlights jsonb not null default '[]'::jsonb,
  notes      text,

  created_at timestamptz not null default now()
);

create index lab_harvest_runs_ran_at_idx on public.lab_harvest_runs (ran_at desc);

-- RLS: admin-only. No anon policy -> the public/anon API sees nothing.
alter table public.lab_harvest_runs enable row level security;

create policy "admins_manage_lab_harvest_runs"
  on public.lab_harvest_runs for all
  to authenticated using (private.is_admin()) with check (private.is_admin());
