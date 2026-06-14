"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Glyph } from "@/components/Glyph";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.refresh();
    router.replace("/admin/login");
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="flex w-full items-center gap-3 border border-dashed border-transparent px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-gray transition-colors hover:border-ink/40 hover:bg-ink hover:text-paper"
    >
      <Glyph name="logout" className="h-4 w-4 shrink-0" />
      <span className="hidden lg:inline">Keluar</span>
    </button>
  );
}
