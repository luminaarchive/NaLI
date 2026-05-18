"use client";

export default function AppShellError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white">
      <section className="mx-auto max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Field workspace</p>
        <h1 className="mt-2 text-2xl font-semibold">NaLI could not load this field intelligence view.</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          The protected workspace view failed to load. Retry the request or review system readiness.
        </p>
        <button
          className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#09090b] transition hover:bg-white/90"
          onClick={reset}
        >
          Retry
        </button>
      </section>
    </main>
  );
}
