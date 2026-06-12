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
    <header className="bg-paper">
      <div className="container-editorial pb-10 pt-12 text-center sm:pt-16">
        <p className="label text-ink/80">
          {index ? `${index}: ` : ""}
          {eyebrow}
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-black uppercase leading-[0.98] tracking-tight text-ink sm:text-6xl md:text-7xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-2xl font-mono text-[0.85rem] leading-relaxed text-gray">
            {description}
          </p>
        )}
      </div>
      <div className="container-editorial">
        <div className="hairline" />
      </div>
    </header>
  );
}
