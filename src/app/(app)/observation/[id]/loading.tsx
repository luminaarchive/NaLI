export default function ObservationLoading() {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Observation audit</p>
          <h1 className="mt-2 text-3xl font-semibold">Loading observation reasoning record</h1>
          <div className="mt-6 aspect-video animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        </div>
        <div className="space-y-4 pt-10">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="h-32 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
