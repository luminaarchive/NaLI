import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dummy.supabase.co";
  const cleanedUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, "");

  const supabase = createServerClient(
    cleanedUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "dummy",
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
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/archive", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
