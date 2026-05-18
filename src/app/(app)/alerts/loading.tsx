export default function AlertsLoading() {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Ecological alerts</p>
        <h1 className="mt-2 text-3xl font-semibold">Loading ecological alert evidence</h1>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
