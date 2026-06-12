import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

interface ViewRow {
  path: string;
  created_at: string;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const supabase = createSupabaseServerClient();

  // total count (head request)
  const { count: total } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true });

  // recent rows for aggregation (last 30 days, capped)
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data } = await supabase
    .from("page_views")
    .select("path, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10000);
  const rows = (data ?? []) as ViewRow[];

  const now = Date.now();
  const last7 = rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * 864e5).length;
  const last30 = rows.length;

  // top paths
  const byPath = new Map<string, number>();
  for (const r of rows) byPath.set(r.path, (byPath.get(r.path) ?? 0) + 1);
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

  // last 14 days daily
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 864e5);
    days.push({ key: dayKey(d), label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }), count: 0 });
  }
  const dayMap = new Map(days.map((d) => [d.key, d]));
  for (const r of rows) {
    const k = dayKey(new Date(r.created_at));
    const d = dayMap.get(k);
    if (d) d.count += 1;
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  const stat = (label: string, value: number | null | undefined) => (
    <div className="border border-dashed border-ink/60 bg-paper p-5">
      <p className="label text-ink/70">{label}</p>
      <p className="mt-2 font-display text-4xl font-black text-ink">{value ?? 0}</p>
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
                  title={`${d.count} kunjungan`}
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
