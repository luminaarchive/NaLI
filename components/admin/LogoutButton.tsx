"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

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
      className="border border-dashed border-ink/60 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-paper"
    >
      Keluar
    </button>
  );
}
