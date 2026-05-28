-- ============================================================
-- NaLI Projects and Skills Schema
-- Projects = persistent research workspaces (Manus Projects equivalent)
-- Skills = saved field templates (Manus Skills equivalent)
-- ============================================================

-- Projects table
CREATE TABLE IF NOT EXISTS public.nali_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  instructions  TEXT,
  -- Master instruction for this project context
  mountain_context TEXT,
  -- One of: semeru, merbabu, lawu, sindoro-sumbing, rinjani, or null
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  session_count INTEGER NOT NULL DEFAULT 0
);

-- Link sessions to projects
ALTER TABLE public.nali_sessions
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.nali_projects(id) ON DELETE SET NULL;

-- Skills table (field research templates)
CREATE TABLE IF NOT EXISTS public.nali_skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  -- The starter prompt template for this skill
  category    TEXT NOT NULL DEFAULT 'general',
  -- Values: identification, habitat, survey, conservation, education
  icon_emoji  TEXT DEFAULT '🔬',
  is_builtin  BOOLEAN NOT NULL DEFAULT false,
  -- true = NaLI provided, false = user created
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- null for builtin skills
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert NaLI built-in skills
INSERT INTO public.nali_skills (name, description, prompt_template, category, icon_emoji, is_builtin) VALUES
(
  'Identifikasi Spesies Lapangan',
  'Template untuk identifikasi spesies berdasarkan observasi langsung di lapangan',
  'Saya menemukan spesies berikut di lapangan dan membutuhkan identifikasi ilmiah:

Lokasi: [isi lokasi/gunung]
Elevasi: [isi estimasi elevasi]
Habitat: [deskripsikan tipe vegetasi dan kondisi]
Ciri morfologi: [deskripsikan ukuran, warna, bentuk, ciri khas]
Perilaku yang diamati: [apa yang dilakukan saat ditemukan]
Waktu observasi: [pagi/siang/sore/malam]

Tolong berikan: nama ilmiah kemungkinan, famili, status IUCN, dan catatan batas inferensi.',
  'identification', '🐾', true
),
(
  'Survey Transek Biodiversitas',
  'Template untuk mencatat hasil survey transek standar',
  'Saya melakukan survey transek biodiversitas dengan data berikut:

Lokasi transek: [nama lokasi/gunung]
Panjang transek: [meter]
Elevasi range: [dari X ke Y meter]
Tanggal: [tanggal survey]
Tim: [jumlah anggota]

Spesies yang tercatat:
- [Spesies 1]: [jumlah individu/tanda kehadiran/jarak dari transek]
- [Spesies 2]: [...]

Tolong susun laporan survey terstruktur dengan analisis kekayaan spesies dan rekomendasi monitoring.',
  'survey', '📏', true
),
(
  'Laporan Ancaman Habitat',
  'Template untuk mendokumentasikan ancaman dan tekanan terhadap habitat',
  'Saya mengamati kondisi habitat berikut dan perlu laporan ancaman:

Kawasan: [nama kawasan/gunung]
Tipe habitat: [hutan primer/sekunder/ekoton/dll]
Ancaman yang diamati:
- [Tipe ancaman 1]: [lokasi, estimasi luasan, intensitas]
- [Tipe ancaman 2]: [...]

Bukti fisik: [deskripsikan tanda-tanda kerusakan yang terlihat]
Foto tersedia: [ya/tidak]

Tolong buat laporan ancaman dengan rekomendasi aksi konservasi prioritas.',
  'conservation', '⚠️', true
),
(
  'Profil Spesies Endemik',
  'Riset mendalam untuk spesies endemik Indonesia',
  'Tolong buat profil lengkap untuk spesies endemik Indonesia berikut:

Nama: [nama ilmiah atau nama lokal]

Saya membutuhkan informasi tentang:
1. Distribusi dan sebaran geografis
2. Status konservasi IUCN dan tren populasi
3. Habitat dan kebutuhan ekologis
4. Ancaman utama
5. Upaya konservasi yang sedang berjalan
6. Referensi ilmiah utama

Sertakan batas inferensi yang jelas untuk setiap klaim.',
  'identification', '🦎', true
),
(
  'Monitoring Pasca-Survey',
  'Template untuk laporan monitoring tindak lanjut',
  'Ini adalah monitoring tindak lanjut dari survey sebelumnya:

Lokasi: [sama dengan survey awal]
Tanggal monitoring: [tanggal]
Interval dari survey awal: [berapa hari/minggu/bulan]

Perubahan yang diamati dibanding survey awal:
- Spesies baru ditemukan: [...]
- Spesies tidak ditemukan lagi: [...]
- Perubahan kondisi habitat: [...]
- Perubahan ancaman: [...]

Tolong analisis tren dan buat rekomendasi untuk monitoring berikutnya.',
  'survey', '📊', true
)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nali_projects_user_id ON public.nali_projects(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nali_projects_pinned ON public.nali_projects(user_id, is_pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nali_skills_category ON public.nali_skills(category);
CREATE INDEX IF NOT EXISTS idx_nali_skills_builtin ON public.nali_skills(is_builtin);
CREATE INDEX IF NOT EXISTS idx_nali_sessions_project ON public.nali_sessions(project_id);

-- RLS for projects
ALTER TABLE public.nali_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_projects"
  ON public.nali_projects FOR ALL
  USING (auth.uid() = user_id);

-- RLS for skills
ALTER TABLE public.nali_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_builtin_skills"
  ON public.nali_skills FOR SELECT
  USING (is_builtin = true OR auth.uid() = user_id);

CREATE POLICY "users_manage_own_skills"
  ON public.nali_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_builtin = false);

CREATE POLICY "service_role_all_projects"
  ON public.nali_projects FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_skills"
  ON public.nali_skills FOR ALL
  USING (auth.role() = 'service_role');
