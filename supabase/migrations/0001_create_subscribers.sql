-- NaLI by NatIve, newsletter subscribers
-- Supabase project: nali-field-journal (xxwzufdezpyabqkwrcbz)
--
-- Privacy model:
--   * anon + authenticated may INSERT a subscription (email shape enforced)
--   * NO select/update/delete policies  => the list is never publicly readable
--   * manage/export subscribers from the Supabase dashboard (service role)

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'web',
  locale text default 'id',
  created_at timestamptz not null default now()
);

alter table public.subscribers
  add constraint subscribers_email_format
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

alter table public.subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and length(email) <= 254
    and length(coalesce(source, '')) <= 40
    and length(coalesce(locale, '')) <= 12
  );

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);
