-- Internal Intelligence Lab foundation (Bucket C, Step 3.1).
--
-- Lab data is PRIVATE speculation: leads, never claims. Tables live in `public`
-- but are prefixed `lab_` and have NO anon policy at all, so the public API
-- returns nothing. Only an admin session (private.is_admin()) can read/write.
-- This is the database half of the one-directional Lab -> manual promotion ->
-- public contract; code isolation + a CI import guard enforce the other half.

create table public.lab_leads (
  id bigint generated always as identity primary key,

  taxon_name      text not null,        -- scientific name
  taxon_rank      text,                 -- species | subspecies | ...
  common_name     text,
  iucn_status     text,                 -- EX | EW | CR | ... | DD (free text from source)
  last_record_year int,                 -- last confirmed record (GBIF/iNat/IUCN)

  -- The Lazarus Score is a prioritization heuristic, NOT a probability of
  -- existence. signals holds the transparent sub-score breakdown + raw evidence.
  score   int check (score between 0 and 100),
  signals jsonb not null default '{}'::jsonb,
  sources jsonb not null default '[]'::jsonb,

  status text not null default 'lead'
         check (status in ('lead', 'investigating', 'promoted', 'dismissed')),
  notes  text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (taxon_name)
);

create index lab_leads_status_idx on public.lab_leads (status);
create index lab_leads_score_idx on public.lab_leads (score desc);

-- RLS: admin-only. No anon policy -> the public/anon API sees nothing.
alter table public.lab_leads enable row level security;

create policy "admins_manage_lab_leads"
  on public.lab_leads for all
  to authenticated using (private.is_admin()) with check (private.is_admin());

-- App-layer admin check: private.is_admin() is in an unexposed schema and the
-- admins table is intentionally unreadable, so expose a thin SECURITY DEFINER
-- wrapper that only reveals whether the CALLER is an admin (no data leak).
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;
