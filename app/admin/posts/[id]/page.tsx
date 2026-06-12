import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PostEditor, type EditablePost } from "@/components/admin/PostEditor";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostRow } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("posts").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const r = data as PostRow;

  const initial: EditablePost = {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle ?? "",
    date: r.date,
    category: r.category,
    tags: r.tags ?? [],
    summary: r.summary ?? "",
    confidence: r.confidence,
    status: r.status,
    sources: r.sources ?? [],
    coverImage: r.cover_image,
    body: r.body ?? "",
  };

  return (
    <div className="min-h-screen bg-paper">
      <AdminHeader active="posts" />
      <div className="container-editorial py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-black uppercase text-ink">Edit Tulisan</h1>
          <a
            href={`/articles/${r.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[0.72rem] uppercase tracking-wider text-gray hover:text-ink"
          >
            Pratinjau →
          </a>
        </div>
        <PostEditor initial={initial} />
      </div>
    </div>
  );
}
