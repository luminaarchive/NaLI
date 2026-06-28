-- Cross-article claim contradictions (Bucket B, Step 2.1).
--
-- The detection script (scripts/detect-contradictions.mjs) writes rows as
-- status='candidate' using the service-role key. A human reviewer flips a row
-- to 'confirmed' (or 'dismissed') in /admin. Only 'confirmed' rows are ever
-- shown to the public: similarity is not proof of contradiction, so nothing
-- reaches readers without human confirmation.

create table public.contradictions (
  id bigint generated always as identity primary key,

  -- claim A (the lower slug, to keep pairs canonical / deduped)
  claim_a_article_slug text not null,
  claim_a_text         text not null,
  claim_a_status       text not null,

  -- claim B
  claim_b_article_slug text not null,
  claim_b_text         text not null,
  claim_b_status       text not null,

  -- detection signals
  similarity    real not null,                    -- cosine similarity 0..1
  llm_verdict   text,                             -- 'CONTRADICT' (only verdict kept)
  llm_rationale text,                             -- one-sentence model rationale

  -- review lifecycle
  status      text not null default 'candidate'
              check (status in ('candidate', 'confirmed', 'dismissed')),

  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,

  -- a claim pair is unique regardless of detection re-runs (idempotent upsert)
  unique (claim_a_article_slug, claim_a_text, claim_b_article_slug, claim_b_text)
);

create index contradictions_status_idx on public.contradictions (status);
create index contradictions_article_a_idx on public.contradictions (claim_a_article_slug);
create index contradictions_article_b_idx on public.contradictions (claim_b_article_slug);

-- RLS: public sees only confirmed contradictions; admins (private.is_admin()
-- allowlist from migration 0005) see and manage everything. The service-role
-- key used by the detect script bypasses RLS entirely.
alter table public.contradictions enable row level security;

create policy "anon_read_confirmed_contradictions"
  on public.contradictions for select
  to anon using (status = 'confirmed');

create policy "admins_manage_contradictions"
  on public.contradictions for all
  to authenticated using (private.is_admin()) with check (private.is_admin());
