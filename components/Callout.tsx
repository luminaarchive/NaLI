import type { ReactNode } from "react";

/**
 * Filled note / callout box with an icon.
 * Inspired by the Nous Careers info callout, rebuilt as a NaLI archive note:
 * ink-wash fill, solid ink left rule, dashed outer border, mono body.
 */
export function Callout({
  children,
  title,
  variant = "info",
  className = "",
}: {
  children: ReactNode;
  title?: string;
  variant?: "info" | "warning";
  className?: string;
}) {
  const accent = variant === "warning" ? "border-l-confidence-low" : "border-l-ink";
  return (
    <aside
      className={`flex gap-3 border border-dashed border-ink/40 border-l-2 ${accent} bg-ink-wash/40 px-4 py-3 ${className}`}
    >
      <span
        aria-hidden
        className="mt-px font-mono text-[0.85rem] font-bold leading-none text-ink-deep"
      >
        {variant === "warning" ? "!" : "i"}
      </span>
      <div className="min-w-0">
        {title && (
          <p className="label mb-1 text-ink-deep">{title}</p>
        )}
        <div className="font-mono text-[0.8rem] leading-relaxed text-gray [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-ink-charcoal">
          {children}
        </div>
      </div>
    </aside>
  );
}
