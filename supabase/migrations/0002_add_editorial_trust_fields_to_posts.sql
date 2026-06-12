-- Editorial-trust fields for admin-authored posts (mirrors the MDX article schema).
-- Applied to project nali-field-journal (xxwzufdezpyabqkwrcbz) on 2026-06-12.
alter table public.posts
  add column if not exists evidence_basis text
    check (evidence_basis is null or evidence_basis = any (array[
      'sumber terbuka','arsip historis','jurnal ilmiah',
      'dokumen pemerintah','observasi pihak ketiga','campuran'])),
  add column if not exists first_party_fieldwork boolean not null default false,
  add column if not exists claim_ledger jsonb not null default '[]'::jsonb,
  add column if not exists limitations jsonb not null default '[]'::jsonb,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists series jsonb not null default '[]'::jsonb,
  add column if not exists updated date;

comment on column public.posts.evidence_basis is 'What the writing is based on (EvidenceBasis).';
comment on column public.posts.first_party_fieldwork is 'True only when real first-party field evidence exists. Default false.';
comment on column public.posts.claim_ledger is 'Array of {claim,status,sources?,explanation?,limitation?}.';
comment on column public.posts.limitations is 'Array of limitation strings.';
comment on column public.posts.images is 'Array of ArticleImage credit objects.';
comment on column public.posts.series is 'Array of series slugs.';
