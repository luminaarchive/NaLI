import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/admin/AdminHeader";
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

export default async function AdminDashboard() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("posts")
    .select("id, slug, title, category, confidence, status, date")
    .order("date", { ascending: false });
  const posts = (data ?? []) as Row[];
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.length - published;

  return (
    <div className="min-h-screen bg-paper">
      <AdminHeader active="posts" />
      <div className="container-editorial py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black uppercase text-ink">Tulisan</h1>
            <p className="mt-2 font-mono text-[0.8rem] text-gray">
              {posts.length} total · {published} terbit · {drafts} draft
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="border border-ink bg-ink px-5 py-2.5 font-mono text-[0.8rem] font-semibold uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep"
          >
            + Tulisan baru
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="mt-12 border border-dashed border-ink/50 bg-ink-wash p-8 text-center font-mono text-[0.85rem] text-gray">
            Belum ada tulisan di database. Klik “Tulisan baru” untuk mulai.
            <br />
            <span className="text-ink/70">
              (5 artikel contoh masih tampil di situs dari file MDX bawaan.)
            </span>
          </p>
        ) : (
          <div className="mt-8 overflow-hidden border border-ink/50">
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
    </div>
  );
}
