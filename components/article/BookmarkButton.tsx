"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { HISTORY_EVENT, isBookmarked, toggleBookmark } from "@/lib/reading-history";

/**
 * Save-for-later button backed by localStorage. No login. Renders a neutral state
 * on the server and syncs with stored state after mount to avoid hydration drift.
 */
export function BookmarkButton({ slug }: { slug: string }) {
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSaved(isBookmarked(slug));
    const sync = () => setSaved(isBookmarked(slug));
    window.addEventListener(HISTORY_EVENT, sync);
    return () => window.removeEventListener(HISTORY_EVENT, sync);
  }, [slug]);

  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={() => setSaved(toggleBookmark(slug))}
      aria-pressed={mounted ? saved : undefined}
      className="inline-flex items-center gap-2 border border-dashed border-ink/50 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
    >
      <Icon size={14} strokeWidth={1.8} aria-hidden />
      {mounted && saved ? "Tersimpan" : "Simpan"}
    </button>
  );
}
