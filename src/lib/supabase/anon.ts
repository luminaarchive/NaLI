import { createServerClient } from "@supabase/ssr";

/**
 * A forced-anonymous Supabase server client. It deliberately ignores the
 * visitor's auth cookies, so every read happens as the `anon` Postgres role —
 * regardless of whether the visitor is logged in. Used by the public, read-only
 * shared report page (/r/[id]), which relies on the anon RLS policy + column
 * grants to expose only non-PII report content.
 */
export function createAnonSupabaseClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://dummy.supabase.co";
  const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "dummy";

  return createServerClient(cleanedUrl, anonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        /* no-op: anon page never mutates the session */
      },
    },
  });
}
