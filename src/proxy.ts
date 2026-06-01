import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://dummy.supabase.co";
  const cleanedUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "dummy";

  const supabase = createServerClient(cleanedUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Routes that require authentication
  const isProtectedPath =
    pathname.startsWith("/create-report") ||
    pathname.startsWith("/settings") ||
    // Legacy app routes
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/cases") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/observation") ||
    pathname.startsWith("/observe") ||
    pathname.startsWith("/system");

  // Auth pages — logged-in users should not linger here
  const isAuthPath =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname.startsWith("/signup/") ||
    pathname === "/register" ||
    pathname.startsWith("/register/");

  // Logged-in user visits landing page → send to workspace
  if (user && pathname === "/") {
    return NextResponse.redirect(new URL("/create-report", request.url));
  }

  // Logged-in user visits an auth page → send to workspace
  if (user && isAuthPath) {
    const next = request.nextUrl.searchParams.get("next") || "/create-report";
    const isSafe = next.startsWith("/") && !next.startsWith("//");
    return NextResponse.redirect(new URL(isSafe ? next : "/create-report", request.url));
  }

  // Local-development-only auth bypass for visual verification. This can NEVER
  // be active on a Vercel deployment because every Vercel build runs with
  // NODE_ENV === "production". Requires an explicit opt-in env flag as well.
  const devAuthBypass = process.env.NODE_ENV === "development" && process.env.NALI_PREVIEW_BYPASS === "1";

  // Unauthenticated user visits a protected route → send to login
  if (!user && isProtectedPath && !devAuthBypass) {
    const nextUrl = pathname + request.nextUrl.search;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextUrl)}`, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|nali-logo.png|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
