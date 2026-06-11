import type { ArticleSource } from "@/lib/types";
import { SOURCE_TYPE_LABEL } from "@/lib/types";

export function SourceList({ sources }: { sources: ArticleSource[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-14 border-t border-dashed border-ink/70 pt-6" aria-labelledby="sumber">
      <div className="flex items-baseline justify-between">
        <h2 id="sumber" className="font-display text-xl font-bold uppercase text-ink">
          Sumber
        </h2>
        <span className="label">{sources.length} rujukan</span>
      </div>
      <ol className="mt-5 space-y-4">
        {sources.map((source, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-0.5 font-mono text-xs text-ink">
              [{i + 1}]
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.85rem] leading-snug text-ink-charcoal">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-teal"
                  >
                    {source.title}
                  </a>
                ) : (
                  source.title
                )}
              </p>
              <span className="label mt-1 inline-block text-ink/70">
                {SOURCE_TYPE_LABEL[source.type]}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
