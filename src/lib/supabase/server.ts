import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://dummy.supabase.co';
  const cleanedUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");

  return createServerClient(
    cleanedUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dummy',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if proxy is refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
