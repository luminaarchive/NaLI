-- Enable the pgvector extension (available on Supabase free tier)
create extension if not exists vector with schema extensions;

-- Enable trigram support for the hybrid full-text index below
create extension if not exists pg_trgm with schema extensions;

-- Table to store content embeddings for RAG retrieval
create table public.content_embeddings (
  id bigint generated always as identity primary key,
  slug text not null,
  category text not null,          -- 'artikel' | 'sumber' | 'field-note'
  title text not null,
  chunk_index int not null default 0,
  content text not null,           -- the chunk text
  metadata jsonb default '{}'::jsonb,
  embedding extensions.vector(768),-- Gemini text-embedding-004 = 768 dims
  created_at timestamptz default now(),

  unique(slug, chunk_index)
);

-- HNSW index for fast cosine similarity search
create index on public.content_embeddings
  using hnsw (embedding extensions.vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Full-text search index on content for hybrid retrieval
create index content_embeddings_content_trgm
  on public.content_embeddings
  using gin (content extensions.gin_trgm_ops);

-- RLS: read-only for anon role
alter table public.content_embeddings enable row level security;

create policy "anon_read_embeddings"
  on public.content_embeddings for select
  to anon using (true);

-- RPC function for vector similarity search
create or replace function match_embeddings(
  query_embedding text,
  match_threshold float default 0.3,
  match_count int default 5
)
returns table (
  slug text,
  category text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ce.slug,
    ce.category,
    ce.title,
    ce.content,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding::extensions.vector) as similarity
  from public.content_embeddings ce
  where 1 - (ce.embedding <=> query_embedding::extensions.vector) > match_threshold
  order by ce.embedding <=> query_embedding::extensions.vector
  limit match_count;
end;
$$;

-- Fallback RPC with optional slug filter
create or replace function match_content_embeddings(
  query_embedding text,
  match_count int default 5,
  filter_slug text default null
)
returns table (
  slug text,
  category text,
  title text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ce.slug,
    ce.category,
    ce.title,
    ce.content,
    ce.metadata,
    1 - (ce.embedding <=> query_embedding::extensions.vector) as similarity
  from public.content_embeddings ce
  where (filter_slug is null or ce.slug = filter_slug)
  order by ce.embedding <=> query_embedding::extensions.vector
  limit match_count;
end;
$$;
