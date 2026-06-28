import Link from "next/link";
import type { ReadingPath } from "@/lib/reading-paths";

/* -------------------------------------------------------------------------- */
/*  ReadingPaths                                                               */
/*                                                                            */
/*  "Jalur Baca yang Disarankan": curated journeys through the ontology,       */
/*  rendered as path cards. Server component, no client JS. Mobile-first: a     */
/*  horizontal scroll-snap row on small screens, a grid on md+.                */
/* -------------------------------------------------------------------------- */

/** How many ordered steps to show on a card before collapsing the rest. */
const VISIBLE_STEPS = 4;

export function ReadingPaths({ paths }: { paths: ReadingPath[] }) {
  if (paths.length === 0) return null;

  return (
    <section aria-labelledby="jalur-baca">
      <h2 id="jalur-baca" className="font-display text-2xl text-ink-black">
        Jalur baca yang disarankan
      </h2>
      <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
        Rute baca terkurasi menembus arsip: tiap jalur menyusun tulisan yang saling
        terhubung dalam urutan yang masuk akal, dari pembuka hingga lanjutannya.
      </p>

      <div className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3">
        {paths.map((path) => {
          const shown = path.steps.slice(0, VISIBLE_STEPS);
          const remaining = path.total - shown.length;
          const first = path.steps[0];
          return (
            <article
              key={path.slug}
              className="flex shrink-0 basis-[80%] snap-start flex-col border border-dashed border-ink/60 bg-paper p-5 sm:basis-[320px] md:basis-auto md:shrink"
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-deep">
                Jalur baca · {path.total} tulisan
              </p>
              <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink">
                {path.title}
              </h3>
              <p className="mt-2 line-clamp-3 font-mono text-[0.74rem] leading-relaxed text-gray">
                {path.promise}
              </p>

              <ol className="mt-4 space-y-2 border-t border-dashed border-ink/30 pt-3">
                {shown.map((step, i) => (
                  <li key={step.slug} className="flex gap-2.5">
                    <span
                      aria-hidden
                      className="shrink-0 font-mono text-[0.66rem] tabular-nums text-ink/45"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/articles/${step.slug}`}
                      className="font-mono text-[0.76rem] leading-snug text-ink-charcoal transition-colors hover:text-ink-deep"
                    >
                      {step.title}
                    </Link>
                  </li>
                ))}
                {remaining > 0 && (
                  <li className="pl-[1.9rem] font-mono text-[0.7rem] text-ink/50">
                    +{remaining} tulisan lagi
                  </li>
                )}
              </ol>

              {first && (
                <Link
                  href={`/articles/${first.slug}`}
                  className="link-teal mt-4 inline-block font-mono text-[0.74rem] font-semibold"
                >
                  Mulai dari awal →
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
