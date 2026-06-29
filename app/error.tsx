"use client";

import { useEffect } from "react";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Route-segment error boundary.                                              */
/*                                                                            */
/*  Catches render/runtime errors in any page below the root layout so a       */
/*  single failing component degrades into a calm, NaLI-styled message instead */
/*  of Next's catastrophic full-page "client-side exception" screen. The nav   */
/*  and footer (in the layout) survive, and the reader can retry or leave.     */
/* -------------------------------------------------------------------------- */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console for diagnostics; no sensitive data is shown to users.
    console.error("Route error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] bg-paper">
      <div className="container-editorial flex flex-col items-start py-20 sm:py-28">
        <p className="label text-ink/60">Ada yang tersendat</p>
        <h1 className="mt-3 max-w-xl font-display text-3xl leading-tight text-ink-black sm:text-4xl">
          Halaman ini gagal dimuat dengan sempurna
        </h1>
        <p className="mt-4 max-w-xl font-mono text-[0.82rem] leading-relaxed text-gray">
          Sesuatu di bagian ini berhenti di tengah jalan. Ini gangguan teknis di sisi
          kami, bukan kesalahanmu. Coba muat ulang; kalau masih bermasalah, bagian lain
          situs tetap bisa diakses.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="border border-ink bg-ink px-5 py-2.5 font-mono text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-deep"
          >
            Coba muat ulang
          </button>
          <Link
            href="/"
            className="border border-dashed border-ink/60 px-5 py-2.5 font-mono text-[0.74rem] uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink-wash"
          >
            Ke beranda
          </Link>
          <Link
            href="/kontak"
            className="px-1 py-2.5 font-mono text-[0.74rem] uppercase tracking-[0.1em] text-ink/70 underline-offset-2 hover:text-ink hover:underline"
          >
            Laporkan masalah
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-8 font-mono text-[0.66rem] text-ink/40">
            Kode rujukan: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
