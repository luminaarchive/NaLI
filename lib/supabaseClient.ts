import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when the public Supabase env vars are present at build time. */
export const supabaseConfigured = Boolean(url && key);

/**
 * Browser Supabase client (publishable/anon key). `null` when not configured,
 * so UI can degrade gracefully instead of crashing.
 */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, key as string, {
      auth: { persistSession: false },
    })
  : null;
