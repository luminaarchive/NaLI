import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/create-report";

  // Validate the redirect path to prevent open redirect attacks
  const isSafeRedirect = next.startsWith("/") && !next.startsWith("//");
  const safeNext = isSafeRedirect ? next : "/create-report";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Auth callback exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url));
    }
  }

  // Handle auto linking of guest history after OAuth callback
  const response = NextResponse.redirect(new URL(safeNext, request.url));
  return response;
}
