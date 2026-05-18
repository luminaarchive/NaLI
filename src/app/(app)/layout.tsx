import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/BottomNav";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">
      <div className="fixed top-3 right-3 z-[60]">
        <LanguageSwitcher compact />
      </div>
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
