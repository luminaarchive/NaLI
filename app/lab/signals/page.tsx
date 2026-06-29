import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/lab/auth";
import { getGhostSignals } from "@/lib/lab/ghost";
import { GhostSignalsBoard } from "@/components/lab/GhostSignalsBoard";

/* -------------------------------------------------------------------------- */
/*  /lab/signals : Ghost Signals (Bucket C, Step 3.5)                          */
/*                                                                            */
/*  Private, admin-only. External anomalies (iNat needs-ID, Xeno-canto,        */
/*  YouTube) that MIGHT point to something notable. Unverified, never public.  */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ghost Signals",
  robots: { index: false, follow: false },
};

const PROVENANCE_NOTE: Record<string, string | null> = {
  db: null,
  sample:
    "CONTOH: snapshot dari harvester lokal (iNaturalist needs-ID nyata + contoh Xeno-canto/YouTube). " +
    "Belum dipersist ke tabel ghost_signals.",
  empty: null,
};

export default async function GhostSignalsPage() {
  await requireAdmin();
  const { signals, source } = await getGhostSignals();
  const note = PROVENANCE_NOTE[source];

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
        <div className="border border-dashed border-[#d96a23]/70 bg-[#d96a23]/[0.06] p-4">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#9c3c08] dark:text-[#f0a36e]">
            Internal, anomali belum terverifikasi
          </p>
          <p className="mt-1.5 font-mono text-[0.76rem] leading-relaxed text-ink-charcoal">
            Sinyal hantu adalah <strong>anomali dari sumber terbuka</strong> (iNaturalist, Xeno-canto,
            YouTube) yang mungkin menarik, bukan klaim dan bukan bukti. Skor adalah heuristik
            kemenarikan, bukan probabilitas. Tidak pernah tampil di situs publik kecuali dipromosikan
            jadi pertanyaan verifikasi lapangan.
          </p>
        </div>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-dashed border-ink/40 pb-5">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-deep">
              NaLI Intelligence Lab
            </p>
            <h1 className="mt-1 font-display text-3xl font-black text-ink">Ghost Signals</h1>
          </div>
          <Link
            href="/lab"
            className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            ← Investigasi Lead
          </Link>
        </header>

        {note && (
          <div className="mt-6 border border-dashed border-[#d96a23]/70 bg-[#d96a23]/[0.06] p-3">
            <p className="font-mono text-[0.7rem] leading-relaxed text-[#9c3c08] dark:text-[#f0a36e]">
              {note}
            </p>
          </div>
        )}

        {signals.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink/50 bg-ink-wash/30 p-6">
            <p className="font-mono text-[0.8rem] leading-relaxed text-gray">
              Belum ada sinyal. Jalankan monitor (<code className="text-ink-deep">lab:ghost:*</code>)
              lalu <code className="text-ink-deep">lab:build-signals</code>.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <GhostSignalsBoard signals={signals} />
          </div>
        )}
      </div>
    </main>
  );
}
