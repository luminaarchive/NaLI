import type { LivingStats } from "@/types/living-engine";

/**
 * Modul 1: Living Knowledge Engine dashboard. A monochromatic, terminal-style
 * panel that reads the live state of the evidence base. Pure server component
 * (no client JS); the "breathing" indicator is CSS-only via animate-pulse.
 */

const NF = new Intl.NumberFormat("id-ID");

function Metric({
  value,
  label,
  hint,
}: {
  value: number;
  label: string;
  hint?: string;
}) {
  return (
    <div className="border border-dashed border-ink/40 p-4 sm:p-5">
      <div className="font-mono text-3xl font-bold tabular-nums text-ink sm:text-4xl">
        {NF.format(value)}
      </div>
      <div className="label mt-2 text-ink/70">{label}</div>
      {hint && <p className="mt-1 font-mono text-[0.7rem] leading-snug text-gray">{hint}</p>}
    </div>
  );
}

export function LivingDashboard({ stats }: { stats: LivingStats }) {
  const breathing = stats.revisiHariIniCount > 0;

  return (
    <section
      aria-label="Ruang kendali riset NaLI"
      className="border border-ink/60 bg-paper"
    >
      {/* status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-ink/40 px-4 py-3 sm:px-5">
        <p className="label text-ink">NaLI // Living Knowledge Engine</p>
        <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-wider text-ink/80">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${
              breathing ? "animate-pulse bg-[#2DD4A7]" : "bg-gray/50"
            }`}
            aria-hidden="true"
          />
          {breathing ? "Status: bernapas" : "Status: tenang"}
        </span>
      </div>

      {/* metrics grid */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 lg:grid-cols-4">
        <Metric value={stats.totalSumber} label="Total bukti terkatalog" hint="Arsip sumber + jurnal" />
        <Metric value={stats.totalJurnal} label="Jurnal" />
        <Metric value={stats.totalArsip} label="Arsip sumber" />
        <Metric value={stats.totalInvestigasi} label="Investigasi terbit" />
        <Metric value={stats.buktiDicariCount} label="Bukti masih dicari" hint="Artikel di bawah terverifikasi kuat" />
        <Metric value={stats.misiAktifCount} label="Misi riset aktif" hint="Segera, modul kolaborasi" />
        <Metric value={stats.kontributorAktifCount} label="Kontributor aktif" hint="Segera, kontribusi terbuka" />
        <Metric value={stats.revisiHariIniCount} label="Diperbarui hari ini" />
      </div>

      {/* footer line */}
      <div className="border-t border-dashed border-ink/40 px-4 py-3 font-mono text-[0.72rem] text-gray sm:px-5">
        Diperbarui terakhir: {stats.lastUpdated}. Semua angka dihitung langsung dari
        arsip yang ada, bukan perkiraan. Yang belum punya sistemnya kami tulis nol
        dengan jujur.
      </div>
    </section>
  );
}
