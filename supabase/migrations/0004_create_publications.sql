-- 0004_create_publications.sql
-- Open-access research library (Pustaka Terbuka).
--
-- Holds METADATA ONLY for open-access scholarly works (OpenAlex is CC0).
-- We never store or rehost copyrighted full text. Each row links out to the
-- full text that is ALREADY hosted legally (publisher / repository OA copy).
-- This is the scalable home for the million-paper catalog: 1M rows in Postgres
-- is trivial, where 1M static files would break the build.

create table if not exists public.publications (
  -- Stable id, normally the OpenAlex work id (e.g. "W2755950973").
  id            text primary key,
  -- URL-safe slug for the detail route.
  slug          text not null unique,
  title         text not null,
  -- Reconstructed abstract from OpenAlex (CC0 metadata), may be null.
  abstract      text,
  authors       text[] not null default '{}',
  year          int,
  venue         text,
  doi           text,
  -- Best legally-hosted open-access full-text location (publisher / repo).
  oa_url        text,
  pdf_url       text,
  landing_url   text,
  topics        text[] not null default '{}',
  geography     text[] not null default '{}',
  language      text,
  -- We only ingest works flagged open-access. Guarded again at write time.
  is_oa         boolean not null default true,
  license       text,
  provider      text not null default 'openalex',
  -- Indonesia-relevance score from the harvester (0..1), for ranking.
  relevance     real not null default 0,
  created_at    timestamptz not null default now(),
  -- Full-text search vector over title + abstract.
  tsv tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(abstract, '')), 'B')
  ) stored
);

create index if not exists publications_tsv_idx       on public.publications using gin (tsv);
create index if not exists publications_year_idx       on public.publications (year desc nulls last);
create index if not exists publications_relevance_idx  on public.publications (relevance desc);
create index if not exists publications_created_idx    on public.publications (created_at desc);
create index if not exists publications_doi_idx         on public.publications (doi);

alter table public.publications enable row level security;

-- Public can read the catalog. Writes are service-role only (the harvester),
-- so the public anon key can never insert/modify rows.
drop policy if exists "publications public read" on public.publications;
create policy "publications public read"
  on public.publications for select
  using (true);

-- Hard guard: refuse any row that is not open-access, so a misconfigured
-- writer can never smuggle non-OA / copyrighted entries into the library.
alter table public.publications
  add constraint publications_oa_only check (is_oa = true);
