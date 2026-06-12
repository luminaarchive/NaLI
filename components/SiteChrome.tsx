"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";

/**
 * Renders the public chrome (Nav + Footer) on the site, but NOT on /admin
 * routes (the dashboard has its own header). Footer is passed in as a prop
 * so it can stay a server component.
 */
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
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
