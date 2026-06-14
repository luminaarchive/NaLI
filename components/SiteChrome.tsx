"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";

/**
 * Renders the public chrome (Nav + Footer) on the site, but NOT on /admin
 * routes (the dashboard has its own header). Footer is passed in as a prop
 * so it can stay a server component.
 *
 * It also cascades the active route's theme accent into the chrome via a
 * `display:contents` wrapper: the theme class only sets CSS custom properties
 * (--c-ink etc.), so Nav + Footer inherit the page's accent color WITHOUT the
 * wrapper painting a second background texture or affecting the flex layout.
 * That keeps the top nav color in sync with each page (no teal-on-indigo
 * "belang").
 */
const ROUTE_THEME: { prefix: string; theme: string }[] = [
  { prefix: "/jurnal", theme: "theme-jurnal" },
  { prefix: "/seri", theme: "theme-seri" },
  { prefix: "/arsip-sumber", theme: "theme-arsip" },
  { prefix: "/metodologi", theme: "theme-metodologi" },
  { prefix: "/tentang", theme: "theme-tentang" },
  { prefix: "/kontak", theme: "theme-kontak" },
  { prefix: "/alam", theme: "theme-alam" },
  { prefix: "/sejarah", theme: "theme-sejarah" },
  { prefix: "/investigasi", theme: "theme-investigasi" },
  { prefix: "/catatan-lapangan", theme: "theme-catatan" },
];

function themeForPath(pathname: string | null): string {
  if (!pathname) return "";
  return ROUTE_THEME.find((r) => pathname.startsWith(r.prefix))?.theme ?? "";
}

export function SiteChrome({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="flex-1">{children}</main>;
  }

  const theme = themeForPath(pathname);

  return (
    <div className={theme || undefined} style={{ display: "contents" }}>
      <Nav />
      <main className="flex-1">{children}</main>
      {footer}
    </div>
  );
}
