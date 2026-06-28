-- Citizen field reports (Bucket B, Step 2.3).
--
-- Anonymous visitors submit an (unverified) field observation via /api/report.
-- Reports are PRIVATE: the public can insert but never read. Only an admin
-- (private.is_admin()) reads/triages them, and nothing becomes a public claim
-- until the admin manually promotes it. Mirrors the `subscribers` insert-only
-- model + the contradictions human-review gate.

create table public.citizen_reports (
  id bigint generated always as identity primary key,

  subject        text not null,          -- species / phenomenon / what was seen
  description    text not null,
  location_label text,                    -- free-text place ("Hutan Sahendaruman")
  lat            double precision,        -- optional GPS
  lng            double precision,
  photo_url      text,                    -- public URL in the citizen-reports bucket
  reporter_name  text,                    -- optional
  reporter_contact text,                  -- optional (email/phone), admin-only
  mission_id     text,                    -- optional link to a research mission

  status      text not null default 'baru'
              check (status in ('baru', 'ditinjau', 'terverifikasi', 'ditolak')),
  admin_notes text,

  created_at  timestamptz not null default now(),
  reviewed_at timestamptz
);

create index citizen_reports_status_idx on public.citizen_reports (status);
create index citizen_reports_created_idx on public.citizen_reports (created_at desc);

-- RLS: anon may INSERT only (no read/update); admins manage everything.
alter table public.citizen_reports enable row level security;

-- anon may INSERT only, with bounded lengths as a DB-level spam guard.
create policy "anon_insert_reports"
  on public.citizen_reports for insert
  to anon with check (
    char_length(subject) between 1 and 200
    and char_length(description) between 1 and 5000
    and (location_label is null or char_length(location_label) <= 200)
    and (reporter_name is null or char_length(reporter_name) <= 120)
    and (reporter_contact is null or char_length(reporter_contact) <= 200)
  );

create policy "admins_manage_reports"
  on public.citizen_reports for all
  to authenticated using (private.is_admin()) with check (private.is_admin());

-- Storage bucket for report photos: public-read (by URL), size + mime capped at
-- the storage layer so caps hold even if the API route is bypassed. No broad
-- SELECT policy is needed: public buckets serve objects by URL without one.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'citizen-reports', 'citizen-reports', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "anon_upload_report_photos"
  on storage.objects for insert
  to anon with check (bucket_id = 'citizen-reports');
