"use client";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <OperationalErrorView reset={reset} scope="NaLI could not load this view." />;
}

function OperationalErrorView({ reset, scope }: { reset: () => void; scope: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Operational error</p>
        <h1 className="mt-2 text-2xl font-semibold">{scope}</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">
          The view did not finish loading. Retry the request, then check system readiness if the issue continues.
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
