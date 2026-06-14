/**
 * Status / "live" dot with an optional radar-ping ring.
 * Inspired by the Nous Psyche live-status indicators, rebuilt in NaLI's ink.
 * The ping uses Tailwind's `animate-ping` under `motion-safe:` and is further
 * neutralized by the global prefers-reduced-motion guard.
 */
export function PulseDot({
  live = false,
  className = "",
  tone = "ink",
}: {
  live?: boolean;
  className?: string;
  tone?: "ink" | "amber" | "muted";
}) {
  const fill =
    tone === "amber" ? "bg-confidence-medium" : tone === "muted" ? "bg-gray" : "bg-ink";
  return (
    <span className={`relative inline-flex h-2 w-2 shrink-0 ${className}`} aria-hidden>
      {live && (
        <span
          className={`absolute inset-0 inline-flex rounded-full ${fill} opacity-60 motion-safe:animate-ping`}
        />
      )}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${fill}`} />
    </span>
  );
}
