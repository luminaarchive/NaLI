import { createBrowserClient } from '@supabase/ssr'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://dummy.supabase.co';
const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || 'dummy';

export const supabase = createBrowserClient(
  cleanedUrl,
  anonKey
)
