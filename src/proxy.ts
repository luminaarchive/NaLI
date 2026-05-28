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

  const supabase = createServerClient(
    cleanedUrl,
    anonKey,
    {
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
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtectedPath =
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/cases") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/monitoring") ||
    pathname.startsWith("/observation") ||
    pathname.startsWith("/observe") ||
    pathname.startsWith("/system");

  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isProtectedPath && !user) {
    const nextUrl = pathname + request.nextUrl.search;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(nextUrl)}`, request.url));
  }

  if (isAuthPath && user) {
    const next = request.nextUrl.searchParams.get("next") || "/archive";
    const isSafe = next.startsWith("/") && !next.startsWith("//");
    return NextResponse.redirect(new URL(isSafe ? next : "/archive", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
