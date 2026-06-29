import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          toSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  // /lab (Internal Intelligence Lab) is gated by the same admin session as /admin.
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/lab");

  // Local-only Lab preview. Lets the engineer view /lab in dev without a real
  // admin session, to verify the dashboard UI. PRODUCTION-IMPOSSIBLE: requires
  // NODE_ENV !== "production" (Vercel sets it to "production") AND an explicit
  // env flag that only ever lives in the gitignored .env.local. Never weakens
  // /admin and never activates in a deployed build.
  const labDevBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.LAB_DEV_BYPASS === "1" &&
    pathname.startsWith("/lab");
  if (labDevBypass) return res;

  if (!user && isProtected && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }
  if (user && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/lab/:path*"],
};
