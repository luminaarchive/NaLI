"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/reading-history";

/**
 * Records a visit to the local reading history on mount. Renders nothing. This is
 * the only "tracking" NaLI does, and it never leaves the browser.
 */
export function ReadingTracker({
  slug,
  title,
  category,
}: {
  slug: string;
  title: string;
  category: string;
}) {
  useEffect(() => {
    recordVisit({ slug, title, category });
  }, [slug, title, category]);
  return null;
}
