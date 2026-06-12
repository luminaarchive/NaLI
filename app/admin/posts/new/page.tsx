import { AdminHeader } from "@/components/admin/AdminHeader";
import { PostEditor } from "@/components/admin/PostEditor";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-paper">
      <AdminHeader active="dashboard" />
      <div className="container-editorial py-10">
        <h1 className="mb-8 font-display text-3xl font-black uppercase text-ink">
          Tulisan Baru
        </h1>
        <PostEditor />
      </div>
    </div>
  );
}
