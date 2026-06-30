import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/lab/auth";
import { getHarvestRuns } from "@/lib/lab/harvest-log";
import { HarvestLog } from "@/components/lab/HarvestLog";

/* -------------------------------------------------------------------------- */
/*  /lab/harvest-log : verifiable audit trail of every harvest run.            */
/*                                                                            */
/*  Private, admin-only. Answers "mana buktinya": each row is a timestamped    */
/*  record of the harvesters running against GBIF/iNaturalist/IUCN and writing */
/*  lab_leads. Cross-check against the GitHub Actions run history + commit log.*/
/* -------------------------------------------------------------------------- */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lab , Harvest Log",
  robots: { index: false, follow: false },
};

export default async function HarvestLogPage() {
  await requireAdmin();
  const { runs, source } = await getHarvestRuns();

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-10">
        <div className="border border-dashed border-[#d96a23]/70 bg-[#d96a23]/[0.06] p-4">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[#9c3c08] dark:text-[#f0a36e]">
            Internal, jejak audit harvester
          </p>
          <p className="mt-1.5 font-mono text-[0.76rem] leading-relaxed text-ink-charcoal">
            Catatan setiap kali mesin Lab benar-benar berjalan: kapan, dipicu oleh apa, berapa
            rekaman per sumber, dan kesunyian terpanjang yang terdeteksi. Bukti, bukan klaim.
            Bisa disilangkan dengan riwayat GitHub Actions dan log commit.
          </p>
        </div>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-3 border-b border-dashed border-ink/40 pb-5">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-deep">
              NaLI Intelligence Lab
            </p>
            <h1 className="mt-1 font-display text-3xl font-black text-ink">Harvest Log</h1>
            <p className="mt-2 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
              Riwayat panen data terbuka (GBIF, iNaturalist, IUCN) yang mengisi tabel{" "}
              <code className="text-ink-deep">lab_leads</code>. Tiap baris adalah satu eksekusi
              nyata dengan stempel waktu.
            </p>
          </div>
          <Link
            href="/lab"
            className="font-mono text-[0.7rem] uppercase tracking-wider text-ink-deep underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            &larr; Lead
          </Link>
        </header>

        {source === "empty" || runs.length === 0 ? (
          <div className="mt-8 border border-dashed border-ink/50 bg-ink-wash/30 p-6">
            <p className="font-mono text-[0.8rem] leading-relaxed text-gray">
              Belum ada run tercatat. Jalankan{" "}
              <code className="text-ink-deep">npm run lab:harvest:gbif</code> +{" "}
              <code className="text-ink-deep">lab:harvest:inat</code> lalu{" "}
              <code className="text-ink-deep">node scripts/lab/build-leads.mjs --trigger manual</code>{" "}
              (butuh service-role key), atau biarkan cron mingguan mengisinya.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <HarvestLog runs={runs} />
          </div>
        )}
      </div>
    </main>
  );
}
