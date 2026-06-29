import type { Metadata } from "next";
import { requireAdmin } from "@/lib/lab/auth";
import { getAllLeads, type LabLead } from "@/lib/lab/leads";

/* -------------------------------------------------------------------------- */
/*  /lab : Internal Intelligence Lab (Bucket C, Step 3.1 boilerplate)          */
/*                                                                            */
/*  Private, admin-only. Speculation lives here, never on the public site.     */
/*  The leads dashboard + Lazarus Score breakdown arrive in Step 3.3; this is  */
/*  the gated shell + empty state.                                             */
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<LabLead["status"], string> = {
  lead: "Lead",
  investigating: "Sedang diselidiki",
  promoted: "Dipromosikan",
  dismissed: "Diabaikan",
};

export default async function LabHome() {
  await requireAdmin();
  const leads = await getAllLeads();

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        {/* Internal banner: this is speculation, not evidence. */}
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

        <header className="mt-8 border-b border-dashed border-ink/40 pb-5">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-deep">
            NaLI Intelligence Lab
          </p>
          <h1 className="mt-1 font-display text-3xl font-black text-ink">Investigasi Lead</h1>
          <p className="mt-2 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
            Kandidat &ldquo;spesies hantu&rdquo; yang layak diselidiki, diperingkat dari data
            terbuka (GBIF, iNaturalist, IUCN). Pipeline harvester + skor menyusul di langkah
            berikutnya.
          </p>
        </header>

        {leads.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink/50 bg-ink-wash/30 p-6">
            <p className="font-mono text-[0.8rem] leading-relaxed text-gray">
              Belum ada lead. Jalankan harvester (Langkah 3.2) lalu hitung skor (Langkah 3.3)
              untuk mengisi tabel <code className="text-ink-deep">lab_leads</code>.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {leads.map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-baseline justify-between gap-3 border border-dashed border-ink/50 bg-paper p-4"
              >
                <div className="min-w-0">
                  <span className="font-display text-lg font-bold italic text-ink">
                    {l.taxonName}
                  </span>
                  {l.commonName && (
                    <span className="ml-2 font-mono text-[0.74rem] text-gray">{l.commonName}</span>
                  )}
                  <span className="mt-1 block font-mono text-[0.66rem] uppercase tracking-wider text-ink/55">
                    {STATUS_LABEL[l.status]}
                    {l.iucnStatus && ` · IUCN ${l.iucnStatus}`}
                    {l.lastRecordYear && ` · terakhir ${l.lastRecordYear}`}
                  </span>
                </div>
                {l.score != null && (
                  <span className="font-mono text-2xl font-black tabular-nums text-ink-deep">
                    {l.score}
                    <span className="text-[0.7rem] text-ink/50">/100</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
