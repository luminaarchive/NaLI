import type { ArticleSource } from "@/lib/types";
import { SOURCE_TYPE_LABEL } from "@/lib/types";

export function SourceList({ sources }: { sources: ArticleSource[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-14 border-t border-dashed border-ink/70 pt-8" aria-labelledby="sumber">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="border border-dashed border-ink/60 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink bg-ink-wash/30" aria-hidden="true">
            Ledger
          </span>
          <h2 id="sumber" className="font-display text-xl font-bold uppercase text-ink">
            Jejak Sumber
          </h2>
        </div>
        <span className="border border-dashed border-ink/50 bg-paper px-2.5 py-0.5 font-mono text-[0.66rem] uppercase tracking-label text-ink">
          {sources.length} Rujukan
        </span>
      </div>
      <ol className="mt-5 space-y-3">
        {sources.map((source, i) => (
          <li key={i} className="border border-dashed border-ink/30 bg-paper p-4 flex gap-4 items-start">
            <span className="font-mono text-[0.72rem] text-ink/40 select-none bg-ink-wash/20 border border-dashed border-ink/25 px-1.5 py-0.5">
              #{String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[0.82rem] leading-relaxed text-ink-charcoal font-semibold">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-teal hover:underline interactive-link"
                  >
                    {source.title} <span className="link-arrow-diagonal">↗</span>
                  </a>
                ) : (
                  source.title
                )}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="border border-dashed border-ink/40 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-label text-ink/75 bg-ink-wash/10">
                  {SOURCE_TYPE_LABEL[source.type]}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
