import { getAnalyticsSummary } from "@/lib/analytics";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { total, last7, last30, days, maxDay, topPaths } = await getAnalyticsSummary(14);

  const stat = (label: string, value: number) => (
    <div className="border border-dashed border-ink/60 bg-paper p-5">
      <p className="label text-ink/70">{label}</p>
      <p className="mt-2 font-display text-4xl font-black text-ink">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <AdminHeader active="analytics" />
      <div className="container-editorial py-10">
        <h1 className="font-display text-3xl font-black uppercase text-ink">Statistik Pengunjung</h1>
        <p className="mt-2 font-mono text-[0.8rem] text-gray">
          Dihitung sendiri dari kunjungan halaman. Tanpa cookie, tanpa pihak ketiga.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stat("Total kunjungan", total)}
          {stat("7 hari terakhir", last7)}
          {stat("30 hari terakhir", last30)}
        </div>

        {/* 14-day bar chart */}
        <div className="mt-8 border border-dashed border-ink/60 p-6">
          <p className="label text-ink/70">14 hari terakhir</p>
          <div className="mt-6 flex items-end gap-2" style={{ height: "160px" }}>
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-2">
                <div
                  className="w-full bg-ink"
                  style={{ height: `${(d.count / maxDay) * 130}px`, minHeight: d.count > 0 ? "3px" : "0" }}
                  title={`${d.label}: ${d.count} kunjungan`}
                />
                <span className="font-mono text-[0.55rem] uppercase text-gray-light">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* top paths */}
        <div className="mt-8">
          <p className="label text-ink/70">Halaman terpopuler (30 hari)</p>
          {topPaths.length === 0 ? (
            <p className="mt-4 font-mono text-[0.8rem] text-gray">
              Belum ada data. Statistik mulai terisi begitu ada pengunjung.
            </p>
          ) : (
            <div className="mt-4 overflow-hidden border border-ink/50">
              <table className="w-full border-collapse">
                <tbody>
                  {topPaths.map(([path, count]) => (
                    <tr key={path} className="odd:bg-ink-wash/30">
                      <td className="border border-ink/20 px-4 py-2.5 font-mono text-[0.78rem] text-ink-deep">{path}</td>
                      <td className="w-20 border border-ink/20 px-4 py-2.5 text-right font-mono text-[0.78rem] text-gray">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
