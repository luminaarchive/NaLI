import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for Server Components / Server Actions / Route Handlers.
 * Reads & refreshes the auth session from cookies. RLS still applies, an
 * admin is simply an authenticated session.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // called from a Server Component render, safe to ignore;
          // middleware refreshes the session cookie instead.
        }
      },
    },
  });
}

/** True when the current request has a logged-in admin session. */
export async function getAdminUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
