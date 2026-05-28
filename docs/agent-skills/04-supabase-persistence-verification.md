# Supabase Persistence Verification

Guidelines to check the database configurations and schemas.

## Production Schema

- Table: `public.reports`
  - Columns:
    - `id` (UUID, PK)
    - `user_id` (UUID, References `auth.users`, Nullable)
    - `guest_session_id_hash` (TEXT, Nullable)
    - `report_type` (TEXT)
    - `title` (TEXT)
    - `draft` (JSONB)
- Row Level Security (RLS):
  - Authenticated policy: `auth.uid() = user_id`.
  - Guest/Key policy: checked via cryptographic token signatures.

## Verification Checklist

1. **Verify migrations**: Check the `supabase/migrations/` folder.
2. **Execute RLS validation**: Run `node scripts/validate-rls.cjs` to confirm RLS policies exist and are correctly active on all public tables.
3. **Inspect connectivity**: Run `node scripts/validate-supabase-live.cjs` to verify read/write access to the database instance.
4. **Environment check**: Verify that `NEXT_PUBLIC_SUPABASE_URL` is set to your active Supabase project endpoint.
