/**
 * Proportional distribution bar with a chip legend.
 * Inspired by the Nous Psyche segmented progress bars, rebuilt in NaLI's
 * dashed-ink archive language (single teal ink, dashed segment dividers).
 */
export function SegmentedBar({
  segments,
  className = "",
}: {
  segments: { label: string; value: number }[];
  className?: string;
}) {
  const items = segments.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  const total = items.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className={className}>
      <div
        className="flex h-3 w-full overflow-hidden border border-dashed border-ink/40 bg-paper"
        role="img"
        aria-label={items.map((s) => `${s.label}: ${s.value}`).join(", ")}
      >
        {items.map((s, i) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%` }}
            className={`h-full bg-ink ${i % 2 === 1 ? "opacity-50" : "opacity-80"} ${
              i > 0 ? "border-l border-dashed border-paper/70" : ""
            }`}
            title={`${s.label}: ${s.value}`}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {items.map((s, i) => (
          <li
            key={s.label}
            className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-gray"
          >
            <span
              aria-hidden
              className={`inline-block h-2 w-2 bg-ink ${i % 2 === 1 ? "opacity-50" : "opacity-80"}`}
            />
            {s.label} · {s.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
