import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/lab/auth";
import { getScoredLeads } from "@/lib/lab/leads";
import { LabLeadsBoard } from "@/components/lab/LabLeadsBoard";

/* -------------------------------------------------------------------------- */
/*  /lab : Internal Intelligence Lab, leads dashboard (Bucket C, Step 3.3)     */
/*                                                                            */
/*  Private, admin-only. Every lead is a QUESTION for a human, never a claim.  */
/*  Data falls back DB -> committed real-data snapshot (labeled CONTOH) so the */
/*  dashboard is always populated and the score logic is verifiable.           */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

const SOURCE_NOTE: Record<string, { tone: string; text: string } | null> = {
  db: null,
  sample: {
    tone: "border-[#d96a23]/70 bg-[#d96a23]/[0.06] text-[#9c3c08] dark:text-[#f0a36e]",
    text:
      "CONTOH: data dari snapshot harvester lokal (GBIF + iNaturalist nyata, IUCN kurasi), " +
      "belum dipersist ke tabel lab_leads. Bukan lead yang sudah ditinjau.",
  },
  empty: null,
};

export default async function LabHome() {
  await requireAdmin();
  const { leads, source } = await getScoredLeads();
  const note = SOURCE_NOTE[source];

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-10">
        {/* Internal banner: speculation, not evidence. */}
        <div className="border border-dashed border-[#d96a23]/70 bg-[#d96a23]/[0.06] p-4">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#9c3c08] dark:text-[#f0a36e]">
            Internal, lead belum terverifikasi
          </p>
          <p className="mt-1.5 font-mono text-[0.76rem] leading-relaxed text-ink-charcoal">
            Ruang kerja intelijen privat. Apa pun di sini adalah <strong>petunjuk untuk
            diselidiki</strong>, bukan klaim, dan tidak pernah tampil di situs publik. Skor
            Lazarus adalah heuristik prioritas, bukan probabilitas keberadaan spesies.
          </p>
        </div>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-dashed border-ink/40 pb-5">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-deep">
              NaLI Intelligence Lab
            </p>
            <h1 className="mt-1 font-display text-3xl font-black text-ink">Investigasi Lead</h1>
            <p className="mt-2 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
              Kandidat &ldquo;spesies hantu&rdquo; yang layak diselidiki, diperingkat dari data
              terbuka (GBIF, iNaturalist, IUCN) memakai Skor Lazarus yang transparan.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Link
              href="/lab/harvest-log"
              className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              Harvest Log →
            </Link>
            <Link
              href="/lab/signals"
              className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              Ghost Signals →
            </Link>
          </div>
        </header>

        {note && (
          <div className={`mt-6 border border-dashed p-3 ${note.tone}`}>
            <p className="font-mono text-[0.7rem] leading-relaxed">{note.text}</p>
          </div>
        )}

        {leads.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink/50 bg-ink-wash/30 p-6">
            <p className="font-mono text-[0.8rem] leading-relaxed text-gray">
              Belum ada lead. Jalankan harvester lalu{" "}
              <code className="text-ink-deep">node scripts/lab/build-leads.mjs --emit-sample</code>{" "}
              untuk mengisi snapshot, atau set service-role key untuk menulis ke{" "}
              <code className="text-ink-deep">lab_leads</code>.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <LabLeadsBoard leads={leads} source={source} />
          </div>
        )}
      </div>
    </main>
  );
}
