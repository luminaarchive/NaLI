"use client";

export default function AlertsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white">
      <section className="mx-auto max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Ecological alerts</p>
        <h1 className="mt-2 text-2xl font-semibold">NaLI could not load this field intelligence view.</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">Alert evidence and trace links are unavailable for this request.</p>
        <button className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#09090b] transition hover:bg-white/90" onClick={reset}>Retry</button>
      </section>
    </main>
  );
}
