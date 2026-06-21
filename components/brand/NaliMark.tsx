/**
 * NaLI gunungan emblem, the exact original artwork (brand-source masters keyed to
 * transparent by scripts/build-brand.mjs into public/brand/nali-emblem-*.png).
 *
 * `variant`:
 *   - "auto"  (default) navy art on light surfaces, white art in dark mode
 *   - "navy"  always the navy art (for known-light backgrounds)
 *   - "white" always the white art (for known-dark backgrounds)
 *
 * className controls sizing (e.g. "h-7 w-auto"); the image keeps its aspect ratio.
 */
const NAVY_SRC = "/brand/nali-emblem-navy.png";
const WHITE_SRC = "/brand/nali-emblem-white.png";

export function NaliMark({
  className = "",
  variant = "auto",
  alt = "",
}: {
  className?: string;
  variant?: "auto" | "navy" | "white";
  alt?: string;
}) {
  if (variant === "navy") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={NAVY_SRC} alt={alt} className={className} />;
  }
  if (variant === "white") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={WHITE_SRC} alt={alt} className={className} />;
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={NAVY_SRC} alt={alt} className={`${className} dark:hidden`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={WHITE_SRC} alt={alt} className={`${className} hidden dark:block`} />
    </>
  );
}

/** Full brand lockup: emblem + wordmark. Uses currentColor for the text. */
export function NaliLockup({
  className = "",
  markClassName = "",
  showTagline = false,
}: {
  className?: string;
  markClassName?: string;
  showTagline?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <NaliMark className={markClassName || "h-7 w-auto"} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight">
          NaLI
        </span>
        {showTagline && (
          <span className="mt-0.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] opacity-70">
            Nature Life Intelligence
          </span>
        )}
      </span>
    </span>
  );
}
