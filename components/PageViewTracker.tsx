"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Records a page view (self-hosted analytics) on each route change. */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (last.current === pathname) return;
    last.current = pathname;
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
