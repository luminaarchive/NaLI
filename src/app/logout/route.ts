import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "https://naliai.vercel.app"));
  return response;
}
