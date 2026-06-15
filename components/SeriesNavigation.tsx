import Link from "next/link";
import type { SeriesNav } from "@/lib/content";

/**
 * Series progress + next-article navigation (F4.2). Server component, rendered
 * on the article page for every series the article belongs to.
 */
export function SeriesNavigation({ nav }: { nav: SeriesNav[] }) {
  if (nav.length === 0) return null;
  return (
    <div className="space-y-4">
      {nav.map((s) => {
        const pct = Math.round((s.position / Math.max(s.total, 1)) * 100);
        return (
          <div key={s.slug} className="border border-dashed border-ink/60 bg-paper p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-deep">
                Artikel {s.position} dari {s.total} dalam seri
              </p>
              <Link
                href="/seri"
                className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-gray transition-colors hover:text-ink-deep"
              >
                Lihat seri ↗
              </Link>
            </div>
            <Link
              href="/seri"
              className="mt-1 block font-display text-base font-bold uppercase leading-snug text-ink transition-colors hover:text-ink-deep"
            >
              {s.title}
            </Link>

            {/* progress bar */}
            <div className="mt-3 h-1.5 w-full border border-ink/30 bg-ink-wash/40" aria-hidden>
              <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[0.72rem]">
              {s.prev ? (
                <Link href={`/articles/${s.prev.slug}`} className="text-gray transition-colors hover:text-ink-deep">
                  ← {s.prev.title}
                </Link>
              ) : (
                <span className="text-gray-light">Awal seri</span>
              )}
              {s.next ? (
                <Link
                  href={`/articles/${s.next.slug}`}
                  className="text-right font-semibold text-ink transition-colors hover:text-ink-deep"
                >
                  Berikutnya: {s.next.title} →
                </Link>
              ) : (
                <span className="border border-dashed border-ink/40 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-gray-light">
                  Artikel berikutnya segera hadir
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
