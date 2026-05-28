-- ============================================================
-- NaLI Field Notes Schema
-- Equivalent to Manus "Meeting Minutes" — structured field observation records
-- ============================================================

CREATE TABLE IF NOT EXISTS public.nali_field_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      UUID REFERENCES public.nali_sessions(id) ON DELETE SET NULL,
  project_id      UUID REFERENCES public.nali_projects(id) ON DELETE SET NULL,

  -- Core observation data
  title           TEXT NOT NULL,
  location_name   TEXT,
  mountain_context TEXT,
  -- One of: semeru, merbabu, lawu, sindoro-sumbing, rinjani, or custom
  elevation_m     INTEGER,
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),

  -- Observation content
  raw_notes       TEXT NOT NULL,
  -- Free-form field notes as typed by user
  structured_data JSONB,
  -- NaLI-processed structured data: species list, threats, recommendations
  weather_notes   TEXT,
  habitat_type    TEXT,
  -- forest-primary, forest-secondary, grassland, scrubland, wetland, edge

  -- Metadata
  observed_at     TIMESTAMPTZ,
  -- When the observation happened (not when note was created)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_processed    BOOLEAN NOT NULL DEFAULT false
  -- true = NaLI has generated structured analysis from raw_notes
);

-- Species observations linked to field notes
CREATE TABLE IF NOT EXISTS public.nali_observations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id       UUID NOT NULL REFERENCES public.nali_field_notes(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  species_name  TEXT NOT NULL,
  -- Common or scientific name as entered
  species_scientific TEXT,
  -- Filled by NaLI processing
  count_min     INTEGER DEFAULT 1,
  count_max     INTEGER,
  behavior      TEXT,
  iucn_status   TEXT,
  -- Filled by NaLI processing: CR/EN/VU/NT/LC/DD
  confidence    TEXT DEFAULT 'low',
  -- user confidence: low/medium/high
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_notes_user ON public.nali_field_notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_field_notes_project ON public.nali_field_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_field_notes_mountain ON public.nali_field_notes(mountain_context);
CREATE INDEX IF NOT EXISTS idx_observations_note ON public.nali_observations(note_id);

-- RLS
ALTER TABLE public.nali_field_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nali_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_field_notes" ON public.nali_field_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_observations" ON public.nali_observations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "service_role_field_notes" ON public.nali_field_notes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_observations" ON public.nali_observations FOR ALL USING (auth.role() = 'service_role');
