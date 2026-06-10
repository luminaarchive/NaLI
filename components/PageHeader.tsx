export function PageHeader({
  eyebrow,
  title,
  description,
  index,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  index?: string;
}) {
  return (
    <header className="border-b border-rule">
      <div className="container-editorial py-14 sm:py-20">
        <div className="flex items-baseline gap-4">
          {index && (
            <span className="font-mono text-base text-teal-dark">{index}</span>
          )}
          <p className="label">{eyebrow}</p>
        </div>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink-black sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
