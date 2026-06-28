"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Confirm / dismiss a contradiction candidate. RLS (private.is_admin())
 * enforces that only an admin session can write. The public site only ever
 * shows rows a human has flipped to 'confirmed' here.
 */
export function ContradictionReviewButtons({
  id,
  status,
}: {
  id: number;
  status: "candidate" | "confirmed" | "dismissed";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(next: "confirmed" | "dismissed" | "candidate") {
    setBusy(true);
    const { error } = await createSupabaseBrowserClient()
      .from("contradictions")
      .update({ status: next, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setBusy(false);
    if (error) {
      alert(`Gagal memperbarui: ${error.message}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "confirmed" && (
        <button
          type="button"
          onClick={() => setStatus("confirmed")}
          disabled={busy}
          className="border border-ink bg-ink px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-paper transition-colors hover:bg-ink-deep disabled:opacity-50"
        >
          {busy ? "…" : "Konfirmasi"}
        </button>
      )}
      {status !== "dismissed" && (
        <button
          type="button"
          onClick={() => setStatus("dismissed")}
          disabled={busy}
          className="border border-dashed border-ink/50 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-wider text-gray transition-colors hover:bg-ink-wash disabled:opacity-50"
        >
          {busy ? "…" : "Abaikan"}
        </button>
      )}
      {status !== "candidate" && (
        <button
          type="button"
          onClick={() => setStatus("candidate")}
          disabled={busy}
          className="font-mono text-[0.64rem] uppercase tracking-wider text-gray-light hover:underline disabled:opacity-50"
        >
          {busy ? "…" : "Kembalikan"}
        </button>
      )}
    </div>
  );
}
