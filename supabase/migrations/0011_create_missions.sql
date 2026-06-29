-- Research missions, DB-backed (Bucket C, Step 3.4).
--
-- Missions were static JSON (content/missions/*.json). They move to the DB so a
-- Lab lead can be PROMOTED into a public mission (the one-directional Lab ->
-- public hand-off), and so citizen_reports.mission_id can link to them.
--
-- A mission is always an OPEN QUESTION ("help us find current evidence"), never
-- a claim. The public site reads this table; the static JSON remains an
-- editorial fallback so /misi never breaks if the table is empty.

create table public.missions (
  id   text primary key,                 -- slug; matches citizen_reports.mission_id (text)
  title       text not null,
  description text not null,

  status text not null default 'active'
         check (status in ('active', 'closed')),
  -- Where the mission came from. 'lab' missions show a "from Lab investigation"
  -- badge and carry the originating lead id (for traceability, not as a claim).
  source text not null default 'editorial'
         check (source in ('editorial', 'lab')),
  lead_id bigint references public.lab_leads(id) on delete set null,

  evidence_needed jsonb not null default '[]'::jsonb,
  progress int not null default 0 check (progress between 0 and 100),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index missions_status_idx on public.missions (status);
create index missions_source_idx on public.missions (source);

-- RLS: public may READ all missions; only an admin may write. Missions are
-- public by design (they are open calls for evidence), so read is unrestricted.
alter table public.missions enable row level security;

create policy "public_read_missions"
  on public.missions for select
  to anon, authenticated using (true);

create policy "admins_manage_missions"
  on public.missions for all
  to authenticated using (private.is_admin()) with check (private.is_admin());
