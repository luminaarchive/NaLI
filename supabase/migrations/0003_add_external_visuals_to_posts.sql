-- Category 2 of the revised image policy: external visual evidence references
-- (real photos/videos with unclear license, linked only, never displayed).
-- Applied to project nali-field-journal (xxwzufdezpyabqkwrcbz) on 2026-06-12.
alter table public.posts
  add column if not exists external_visuals jsonb not null default '[]'::jsonb;

comment on column public.posts.external_visuals is 'Array of ExternalVisualEvidence (linked, never displayed).';
