import { createBrowserClient } from '@supabase/ssr'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://dummy.supabase.co';
const cleanedUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");

export const supabase = createBrowserClient(
  cleanedUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dummy'
)
