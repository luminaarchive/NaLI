import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Shelf } from "@/lib/shelves";
import { ShelfCard } from "./ShelfCard";

/**
 * Netflix-style shelves on the landing page. Horizontal scroll-snap rows, no JS:
 * the browser handles the swipe on mobile and the drag-scroll on desktop. Each row
 * is a real slice of content (trending, pillars, open questions, newest).
 */
export function KnowledgeShelves({ shelves }: { shelves: Shelf[] }) {
  if (shelves.length === 0) return null;
  return (
    <section className="relative z-20 w-full bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-[1240px] px-5">
        <header className="mb-10 max-w-2xl">
          <h2 className="font-display text-[2rem] font-medium leading-[1.1] tracking-tight text-ink-black md:text-[2.75rem]">
            Jangan berhenti di satu artikel.
          </h2>
          <p className="mt-3 font-mono text-[0.82rem] leading-relaxed text-gray">
            Geser tiap rak, temukan jalur berikutnya. Tiap kartu membawa label
            keyakinan, jadi kamu tahu sekuat apa buktinya sebelum membaca.
          </p>
        </header>
      </div>

      <div className="flex flex-col gap-12">
        {shelves.map((shelf) => (
          <div key={shelf.key} className="mx-auto w-full max-w-[1240px]">
            <div className="mb-4 flex items-baseline justify-between gap-4 px-5 md:px-8">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-ink-black md:text-2xl">
                {shelf.title}
              </h3>
              <Link
                href={shelf.href}
                className="group flex shrink-0 items-center gap-1.5 font-mono text-[0.66rem] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:text-ink-deep"
              >
                Lihat semua
                <ArrowRight size={13} strokeWidth={1.8} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)] md:px-8 [&::-webkit-scrollbar]:hidden">
              {shelf.items.map((article) => (
                <ShelfCard key={article.slug} article={article} />
              ))}
              <div className="shrink-0 pr-1" aria-hidden />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
