import "server-only";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Lab auth gate (Bucket C, Step 3.1)                                         */
/*                                                                            */
/*  /lab is the private Internal Intelligence Lab. Middleware already requires */
/*  a session; this adds the is_admin teeth at the page layer. Non-admins get  */
/*  notFound() (a 404, not a redirect) so the Lab's existence isn't advertised.*/
/* -------------------------------------------------------------------------- */

/** Throws notFound() unless the caller is a signed-in admin. */
export async function requireAdmin(): Promise<void> {
  const sb = createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) notFound();

  // private.is_admin() is unexposed; call the public wrapper (authenticated-only).
  const { data, error } = await sb.rpc("is_current_user_admin");
  if (error || data !== true) notFound();
}
