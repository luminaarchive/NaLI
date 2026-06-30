-- Self-running weekly Lab harvest (no founder credential).
--
-- Schedules the `lab-harvest` Edge Function via pg_cron + pg_net. The function
-- harvests GBIF + iNaturalist live (read-only, no key) and writes lab_leads +
-- lab_harvest_runs using Supabase's auto-injected SUPABASE_SERVICE_ROLE_KEY , so
-- the service-role key never leaves Supabase's own runtime and nobody has to set
-- a secret anywhere. pg_net authenticates to the function with the PUBLIC anon
-- key (the same publishable key shipped in the frontend; safe to store here).
--
-- This is the PRIMARY scheduler. .github/workflows/lab-harvest.yml is a
-- manual-dispatch fallback only.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  perform cron.unschedule('lab-harvest-weekly');
exception when others then null;
end $$;

-- Monday 02:00 UTC = 09:00 WIB.
select cron.schedule(
  'lab-harvest-weekly',
  '0 2 * * 1',
  $$
  select net.http_post(
    url := 'https://xxwzufdezpyabqkwrcbz.supabase.co/functions/v1/lab-harvest?trigger=cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d3p1ZmRlenB5YWJxa3dyY2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTEyNDQsImV4cCI6MjA5NjY4NzI0NH0.JYBdSE_zfcFrYpeIamWvJ55sR9qij-LBvhvy-iIWo2A',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d3p1ZmRlenB5YWJxa3dyY2J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTEyNDQsImV4cCI6MjA5NjY4NzI0NH0.JYBdSE_zfcFrYpeIamWvJ55sR9qij-LBvhvy-iIWo2A'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
