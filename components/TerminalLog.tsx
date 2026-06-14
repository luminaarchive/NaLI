/**
 * A small terminal-window "log" device — window chrome + monospace lines +
 * a blinking cursor, wrapped in an animated gradient-stroke frame.
 * Inspired by the Nous Hermes Agent terminal mockup, rebuilt in NaLI ink.
 * Both motions (blink, gradient pan) are neutralized by the reduced-motion guard.
 */
export function TerminalLog({
  title,
  lines,
  prompt = "$",
}: {
  title: string;
  lines: string[];
  prompt?: string;
}) {
  return (
    <div className="gradient-stroke overflow-hidden font-mono text-[0.8rem] leading-relaxed">
      <div className="flex items-center gap-2 border-b border-dashed border-ink/30 bg-ink-wash/50 px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 bg-ink/40" />
          <span className="h-2 w-2 bg-ink/30" />
          <span className="h-2 w-2 bg-ink/20" />
        </span>
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-gray">{title}</span>
      </div>
      <div className="space-y-1.5 bg-paper px-4 py-4">
        {lines.map((l, i) => (
          <p key={i} className={l.startsWith(prompt) ? "text-ink-deep" : "text-gray"}>
            {l}
          </p>
        ))}
        <p className="text-ink-deep">
          {prompt} <span className="terminal-cursor align-middle text-ink" />
        </p>
      </div>
    </div>
  );
}
