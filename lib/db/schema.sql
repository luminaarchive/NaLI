-- NaLI relational evidence layer (Doctrine v2.1, Phase 3).
--
-- ADDITIVE only. Foundation for the future evidence graph (Axiom 03, 08): a
-- normalized articles / claims / sources model with hard integrity constraints.
-- The live site still renders from MDX; these tables are the structured backbone
-- that a sync job will populate. Empty until then, by design.
--
-- Hard guarantees baked in at the database level (cannot be bypassed by app code):
--   * sources.is_oa must be true (Axiom 16, legal survival)
--   * articles.vertical limited to the three pillars (Axiom 14)
--   * confidence levels limited to the canonical vocabulary
--
-- RLS is enabled with public-read / no public-write, matching the rest of the
-- project (subscribers, posts, publications). Writes happen via the service role.

-- Sources table: only open-access sources may enter.
CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('jurnal','laporan','arsip','media','buku','dataset','primer')),
  is_oa BOOLEAN NOT NULL DEFAULT false,
  accessed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- HARD CONSTRAINT: only open-access sources enter this table.
  CONSTRAINT sources_must_be_open_access CHECK (is_oa = true)
);

-- Articles table.
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  vertical TEXT NOT NULL CHECK (vertical IN ('alam','sejarah','investigasi')),
  published_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  confidence_overall TEXT CHECK (confidence_overall IN ('terverifikasi-kuat','didukung-sumber','diperdebatkan','belum-cukup-bukti')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claims table.
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  statement TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('terverifikasi-kuat','didukung-sumber','diperdebatkan','belum-cukup-bukti')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction: which sources back which claims.
CREATE TABLE IF NOT EXISTS claim_sources (
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  PRIMARY KEY (claim_id, source_id)
);

-- Indexes.
CREATE INDEX IF NOT EXISTS idx_articles_vertical ON articles(vertical);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_confidence ON articles(confidence_overall);
CREATE INDEX IF NOT EXISTS idx_claims_article ON claims(article_id);
CREATE INDEX IF NOT EXISTS idx_claims_confidence ON claims(confidence);

-- Row Level Security: public can read, only the service role can write.
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sources public read" ON sources;
CREATE POLICY "sources public read" ON sources FOR SELECT USING (true);
DROP POLICY IF EXISTS "articles public read" ON articles;
CREATE POLICY "articles public read" ON articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "claims public read" ON claims;
CREATE POLICY "claims public read" ON claims FOR SELECT USING (true);
DROP POLICY IF EXISTS "claim_sources public read" ON claim_sources;
CREATE POLICY "claim_sources public read" ON claim_sources FOR SELECT USING (true);
