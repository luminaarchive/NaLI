import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAnalyticsSummary } from "@/lib/analytics";
import { getAllSources, getAllFieldNotes } from "@/lib/content";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABEL, CONFIDENCE_LABEL, type Category, type Confidence, type Status } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  title: string;
  category: Category;
  confidence: Confidence;
  status: Status;
  date: string;
}

function StatCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="h-full border border-dashed border-ink/60 bg-paper p-5 transition-colors hover:bg-ink-wash">
      <p className="label text-ink/70">{label}</p>
      <p className="mt-2 font-display text-4xl font-black text-ink">{value}</p>
      {hint && <p className="mt-1 font-mono text-[0.66rem] text-gray-light">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, category, confidence, status, date")
    .order("date", { ascending: false });
  const posts = (data ?? []) as Row[];
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.length - published;

  const analytics = await getAnalyticsSummary(14);
  const sourceCount = getAllSources().length;
  const fieldNoteCount = getAllFieldNotes().length;
  const topPaths = analytics.topPaths.slice(0, 6);

  return (
    <AdminShell active="dashboard">
      <div className="container-editorial py-10">
        {/* heading + quick actions */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black uppercase text-ink">Dashboard</h1>
            <p className="mt-2 font-mono text-[0.8rem] text-gray">
              Ringkasan tulisan dan kunjungan situs NaLI.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/posts/new"
              className="border border-ink bg-ink px-5 py-2.5 font-mono text-[0.78rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep"
            >
              + Tulisan baru
            </Link>
            <Link
              href="/admin/analytics"
              className="border border-ink/70 px-5 py-2.5 font-mono text-[0.78rem] font-semibold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Statistik lengkap
            </Link>
          </div>
        </div>

        {/* stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total tulisan" value={posts.length} hint="di database" />
          <StatCard label="Terbit" value={published} hint="tampil publik" />
          <StatCard label="Draft" value={drafts} hint="belum tampil" />
          <StatCard label="Total kunjungan" value={analytics.total} hint="sepanjang waktu" href="/admin/analytics" />
          <StatCard label="7 hari terakhir" value={analytics.last7} hint="kunjungan" href="/admin/analytics" />
          <StatCard label="Arsip sumber" value={sourceCount} hint={`${fieldNoteCount} catatan riset`} href="/arsip-sumber" />
        </div>

        {/* chart + top paths */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* 14-day bar chart */}
          <div className="border border-dashed border-ink/60 p-6">
            <div className="flex items-center justify-between">
              <p className="label text-ink/70">Kunjungan 14 hari</p>
              <Link href="/admin/analytics" className="font-mono text-[0.66rem] uppercase tracking-wider text-ink hover:underline">
                Detail →
              </Link>
            </div>
            {analytics.days.length === 0 ? (
              <p className="mt-6 font-mono text-[0.8rem] text-gray">Belum ada data kunjungan.</p>
            ) : (
              <div className="mt-6 flex items-end gap-1.5" style={{ height: "150px" }}>
                {analytics.days.map((d) => (
                  <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full bg-ink"
                      style={{ height: `${(d.count / analytics.maxDay) * 120}px`, minHeight: d.count > 0 ? "3px" : "0" }}
                      title={`${d.label}: ${d.count} kunjungan`}
                    />
                    <span className="font-mono text-[0.5rem] uppercase text-gray-light">{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* top paths */}
          <div className="border border-dashed border-ink/60 p-6">
            <p className="label text-ink/70">Halaman terpopuler</p>
            {topPaths.length === 0 ? (
              <p className="mt-6 font-mono text-[0.8rem] text-gray">Belum ada data.</p>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {topPaths.map(([path, count]) => (
                  <li key={path} className="flex items-center justify-between gap-3 border-b border-dashed border-ink/25 pb-2 last:border-0">
                    <span className="truncate font-mono text-[0.74rem] text-ink-deep">{path}</span>
                    <span className="shrink-0 font-mono text-[0.74rem] text-gray">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* posts management */}
        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-black uppercase text-ink">Tulisan</h2>
            <p className="mt-1 font-mono text-[0.78rem] text-gray">
              {posts.length} total · {published} terbit · {drafts} draft
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="font-mono text-[0.72rem] uppercase tracking-wider text-ink hover:underline"
          >
            + Tulisan baru
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="mt-6 border border-dashed border-ink/50 bg-ink-wash p-8 text-center font-mono text-[0.85rem] text-gray">
            Belum ada tulisan di database. Klik “Tulisan baru” untuk mulai.
            <br />
            <span className="text-ink/70">
              (Artikel dari file MDX bawaan tetap tampil di situs.)
            </span>
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto border border-ink/50">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-ink-wash">
                  {["Judul", "Kategori", "Keyakinan", "Status", "Tanggal", ""].map((h) => (
                    <th key={h} className="border border-ink/30 px-4 py-3 text-left font-mono text-[0.66rem] uppercase tracking-label text-ink-deep">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="align-middle odd:bg-ink-wash/30">
                    <td className="border border-ink/20 px-4 py-3">
                      <Link href={`/admin/posts/${p.id}`} className="font-mono text-[0.82rem] font-semibold text-ink-deep hover:underline">
                        {p.title}
                      </Link>
                      <span className="mt-0.5 block font-mono text-[0.66rem] text-gray-light">/{p.slug}</span>
                    </td>
                    <td className="border border-ink/20 px-4 py-3 font-mono text-[0.72rem] uppercase text-ink/80">
                      {CATEGORY_LABEL[p.category]}
                    </td>
                    <td className="border border-ink/20 px-4 py-3 font-mono text-[0.72rem] text-gray">
                      {CONFIDENCE_LABEL[p.confidence]}
                    </td>
                    <td className="border border-ink/20 px-4 py-3">
                      <span
                        className={`border px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider ${
                          p.status === "published"
                            ? "border-ink/60 text-ink-deep"
                            : "border-dashed border-gray-light text-gray"
                        }`}
                      >
                        {p.status === "published" ? "Terbit" : "Draft"}
                      </span>
                    </td>
                    <td className="border border-ink/20 px-4 py-3 font-mono text-[0.72rem] text-gray">
                      {formatDate(p.date)}
                    </td>
                    <td className="border border-ink/20 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/admin/posts/${p.id}`} className="font-mono text-[0.68rem] uppercase tracking-wider text-ink hover:underline">
                          Edit
                        </Link>
                        <DeletePostButton id={p.id} title={p.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
