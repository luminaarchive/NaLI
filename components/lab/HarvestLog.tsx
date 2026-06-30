import type { HarvestRun } from "@/lib/lab/harvest-log";

/* -------------------------------------------------------------------------- */
/*  Harvest log render (server component, admin-only page).                    */
/*  One card per run: when, trigger, status, counts, per-provider records,     */
/*  and the longest silences that run saw. Plain server component, no client   */
/*  JS , this is a read-only audit trail.                                       */
/* -------------------------------------------------------------------------- */

const TRIGGER_LABEL: Record<string, string> = {
  manual: "Manual",
  cron: "Terjadwal",
  dev: "Dev",
  backfill: "Backfill",
};

const STATUS_TONE: Record<string, string> = {
  success: "border-[#1f7a52]/60 text-[#1f7a52] dark:text-[#46cfa8]",
  partial: "border-[#d96a23]/60 text-[#9c3c08] dark:text-[#f0a36e]",
  failed: "border-[#c0392b]/60 text-[#c0392b] dark:text-[#f08a7e]",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function HarvestLog({ runs }: { runs: HarvestRun[] }) {
  return (
    <ul className="space-y-4">
      {runs.map((run) => (
        <li
          key={run.id}
          className="border border-dashed border-ink/40 bg-paper p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-deep">
                Run #{run.id}
              </span>
              <span className="font-mono text-[0.78rem] text-ink">{fmtDate(run.ranAt)}</span>
              <span
                className={`border px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider ${
                  STATUS_TONE[run.status] ?? "border-ink/40 text-gray"
                }`}
              >
                {run.status}
              </span>
              <span className="border border-ink/30 px-1.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-wider text-gray">
                {TRIGGER_LABEL[run.trigger] ?? run.trigger}
              </span>
            </div>
            <div className="font-mono text-[0.7rem] text-gray">
              {run.taxaCount} taksa &middot;{" "}
              <span className="text-ink-deep">{run.leadsUpserted} lead ditulis</span>
            </div>
          </div>

          {run.providers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {run.providers.map((p) => (
                <span
                  key={p.source}
                  className={`border px-2 py-0.5 font-mono text-[0.64rem] ${
                    p.ok
                      ? "border-ink/30 text-ink-charcoal"
                      : "border-[#c0392b]/50 text-[#c0392b] dark:text-[#f08a7e]"
                  }`}
                >
                  {p.source.toUpperCase()}: {p.records} rekaman
                  {p.provenance ? ` (${p.provenance})` : ""}
                  {p.ok ? "" : " , gagal"}
                </span>
              ))}
            </div>
          )}

          {run.highlights.length > 0 && (
            <div className="mt-3 border-t border-dashed border-ink/20 pt-3">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-gray">
                Kesunyian terpanjang run ini
              </p>
              <ul className="mt-1.5 space-y-1">
                {run.highlights.map((h) => (
                  <li key={h.taxon} className="font-mono text-[0.74rem] leading-relaxed text-ink-charcoal">
                    <span className="italic text-ink">{h.taxon}</span>
                    {h.gap_years != null ? (
                      <span className="text-ink-deep"> , jeda {h.gap_years} tahun</span>
                    ) : (
                      <span className="text-ink-deep"> , tanpa rekaman</span>
                    )}
                    {h.note ? <span className="text-gray"> ({h.note})</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {run.notes && (
            <p className="mt-3 font-mono text-[0.72rem] leading-relaxed text-gray">{run.notes}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
