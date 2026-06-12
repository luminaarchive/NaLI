"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Hapus tulisan "${title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setBusy(true);
    const { error } = await createSupabaseBrowserClient().from("posts").delete().eq("id", id);
    setBusy(false);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="font-mono text-[0.68rem] uppercase tracking-wider text-confidence-medium hover:underline disabled:opacity-50"
    >
      {busy ? "…" : "Hapus"}
    </button>
  );
}
