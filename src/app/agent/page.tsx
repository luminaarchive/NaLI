"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { NaLILogo } from "@/components/ui/NaLILogo";
import {
  BookOpen,
  Clipboard,
  Clock,
  Plus,
  Sparkles,
  StickyNote,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AgentPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setUserLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const cards = [
    {
      icon: Clipboard,
      title: "Laporan",
      description: "Susun dan kelola laporan berbasis bukti",
      href: "/create-report",
      active: true,
    },
    {
      icon: BookOpen,
      title: "Draf Jurnal",
      description: "Buat draf jurnal ilmiah berbasis IMRaD",
      href: "/create-report",
      active: true,
    },
    {
      icon: StickyNote,
      title: "Catatan",
      description: "Kelola catatan lapangan observasi",
      href: "/field-notes",
      active: true,
    },
    {
      icon: BookOpen,
      title: "Library",
      description: "Kelola referensi dan pustaka penelitian",
      href: null,
      active: false,
    },
    {
      icon: Clock,
      title: "Scheduled",
      description: "Atur tugas terjadwal dan otomasi laporan",
      href: null,
      active: false,
    },
  ];

  const Sidebar = () => (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-white/[0.07] bg-[#191919] transition-transform duration-300 md:static md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/[0.07] px-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <NaLILogo size={24} variant="light" />
          <span className="text-sm font-semibold text-white/80">NaLI</span>
        </Link>
        <button
          aria-label="Tutup menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/40 hover:bg-white/[0.05] hover:text-white md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={() => {
            const sessionId = typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `s-${Date.now().toString(36)}`;
            router.push(`/create-report?session=${sessionId}`);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#2a2a2a] px-4 py-2.5 text-sm font-semibold text-white/90 transition duration-200 hover:bg-[#333]"
        >
          <Plus className="h-4 w-4" />
          Buat Laporan Baru
        </button>
      </div>

      <div className="space-y-0.5 px-3 py-2">
        <Link
          href="/create-report"
          className="flex h-10 w-full items-center gap-3 rounded-[10px] px-3.5 text-left text-sm font-medium text-white/60 transition duration-150 hover:bg-white/[0.05] hover:text-white/90"
        >
          <Clipboard className="h-4 w-4 text-white/40" />
          Laporan
        </Link>
        <Link
          href="/agent"
          className="flex h-10 w-full items-center gap-3 rounded-[10px] bg-white/[0.06] px-3.5 text-left text-sm font-medium text-white/90 transition duration-150 hover:bg-white/[0.09]"
        >
          <Sparkles className="h-4 w-4 text-white/60" />
          Agent
        </Link>
        <Link
          href="/field-notes"
          className="flex h-10 w-full items-center gap-3 rounded-[10px] px-3.5 text-left text-sm font-medium text-white/60 transition duration-150 hover:bg-white/[0.05] hover:text-white/90"
        >
          <StickyNote className="h-4 w-4 text-white/40" />
          Catatan
        </Link>
        <div className="flex h-9 w-full items-center justify-between rounded-[10px] px-3.5 text-sm text-white/30 cursor-not-allowed select-none">
          <span className="flex items-center gap-3">
            <BookOpen className="h-4 w-4" />
            Library
          </span>
          <span className="text-[9px] font-bold tracking-wider text-white/20 uppercase">Soon</span>
        </div>
        <div className="flex h-9 w-full items-center justify-between rounded-[10px] px-3.5 text-sm text-white/30 cursor-not-allowed select-none">
          <span className="flex items-center gap-3">
            <Clock className="h-4 w-4" />
            Scheduled
          </span>
          <span className="text-[9px] font-bold tracking-wider text-white/20 uppercase">Soon</span>
        </div>
      </div>

      <div className="mt-auto border-t border-white/[0.05] p-3 bg-[#161616] space-y-2">
        {!userLoading && (
          user ? (
            <div className="flex items-center justify-between gap-2 rounded-[10px] bg-white/[0.04] px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00FFB3]/20 text-[11px] font-bold text-[#00FFB3]">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </div>
                <span className="truncate text-[11px] text-white/60">{user.email}</span>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="shrink-0 text-[11px] font-semibold text-white/35 hover:text-white/60 transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-[10px] bg-white/[0.04] px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-bold text-white/40">?</div>
                <span className="text-[11px] text-white/40">Tamu</span>
              </div>
              <Link
                href="/login"
                className="shrink-0 text-[11px] font-semibold text-[#00FFB3]/70 hover:text-[#00FFB3] transition-colors"
              >
                Masuk
              </Link>
            </div>
          )
        )}
        <div className="px-1 text-[10px] text-white/20">NaLI 1.0 Alpha</div>
      </div>
    </aside>
  );

  return (
    <div className="relative flex min-h-screen w-screen overflow-hidden bg-[#191919] text-[#f5f0e8]">
      <Sidebar />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#191919]/95 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              aria-label="Buka menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/60 hover:bg-white/[0.05] hover:text-white md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-white/80">NaLI Agent</span>
          </div>
          <div className="flex items-center gap-2">
            {!userLoading && (
              user ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00FFB3]/20 text-[11px] font-bold text-[#00FFB3]">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-8 items-center rounded-lg border border-white/[0.08] px-3 text-xs font-semibold text-white/60 transition hover:text-white hover:border-white/20"
                >
                  Masuk
                </Link>
              )
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-8 bg-[#191919]">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-semibold text-[#f5f0e8] mb-2">NaLI Agent</h1>
              <p className="text-sm text-white/50">Pilih mode kerja yang ingin kamu jalankan.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;
                if (!card.active) {
                  return (
                    <div
                      key={card.title}
                      className="relative rounded-2xl border border-white/[0.06] bg-[#222]/60 p-5 opacity-50 cursor-not-allowed select-none"
                    >
                      <div className="absolute top-3 right-3">
                        <span className="text-[9px] font-bold tracking-wider text-white/30 uppercase bg-white/[0.05] border border-white/[0.06] px-1.5 py-0.5 rounded-full">
                          Segera hadir
                        </span>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] mb-3">
                        <Icon className="h-5 w-5 text-white/30" />
                      </div>
                      <h3 className="font-semibold text-white/50 mb-1">{card.title}</h3>
                      <p className="text-xs text-white/30 leading-relaxed">{card.description}</p>
                    </div>
                  );
                }
                return (
                  <Link
                    key={card.title}
                    href={card.href!}
                    className="group relative rounded-2xl border border-white/[0.09] bg-[#222]/60 p-5 transition duration-200 hover:border-white/[0.15] hover:bg-[#2a2a2a]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00FFB3]/10 mb-3 transition duration-200 group-hover:bg-[#00FFB3]/15">
                      <Icon className="h-5 w-5 text-[#00FFB3]" />
                    </div>
                    <h3 className="font-semibold text-white/90 mb-1">{card.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed">{card.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
