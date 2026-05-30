"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  Home,
  LogOut,
  Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface UserProfileButtonProps {
  loginHref?: string;
}

export function UserProfileButton({ loginHref = "/login" }: UserProfileButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleHistoryClick = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("nali:open-sidebar-history"));
  };

  if (loading) {
    return (
      <div className="h-8 w-8 rounded-full bg-white/[0.06] animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        href={loginHref}
        className="inline-flex h-8 items-center rounded-lg border border-white/[0.08] px-3 text-xs font-semibold text-white/60 transition hover:text-white hover:border-white/20"
      >
        Masuk
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Pengguna";

  const emailDisplay =
    user.email && user.email.length > 28
      ? user.email.slice(0, 28) + "..."
      : user.email || "";

  const initial = (displayName[0] ?? user.email?.[0] ?? "U").toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      {/* Avatar circle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka profil"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00FFB3]/15 text-[12px] font-bold text-[#00FFB3] transition hover:bg-[#00FFB3]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFB3]/50"
      >
        {initial}
      </button>

      {/* Profile panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[280px] rounded-2xl border border-white/[0.08] bg-[#141414] shadow-2xl shadow-black/60 overflow-hidden"
          role="dialog"
          aria-label="Panel profil"
        >
          {/* Header: avatar + name + email + chevron */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#00FFB3]/15 text-[18px] font-bold text-[#00FFB3]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-[11px] text-white/45">{emailDisplay}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
              aria-label="Tutup panel"
            >
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Plan row */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-white/60">
              Seeds (Gratis)
            </span>
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/50 transition hover:bg-white/[0.08] hover:text-white/80"
            >
              Upgrade
            </Link>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Nav rows */}
          <div className="px-2 py-1.5 space-y-0.5">
            <button
              onClick={handleHistoryClick}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ClipboardList className="h-4 w-4 shrink-0 text-white/40" />
              Riwayat Laporan
            </button>
            <div className="relative group">
              <button
                disabled
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/35 cursor-not-allowed"
              >
                <Settings className="h-4 w-4 shrink-0 text-white/25" />
                Pengaturan
                <span className="ml-auto text-[9px] font-bold tracking-wider text-white/20 uppercase">Segera</span>
              </button>
            </div>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* External link rows */}
          <div className="px-2 py-1.5 space-y-0.5">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white"
            >
              <Home className="h-4 w-4 shrink-0 text-white/40" />
              Beranda
              <ExternalLink className="ml-auto h-3 w-3 text-white/25" />
            </Link>
            <Link
              href="/learn-report"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-white/40" />
              Panduan
              <ExternalLink className="ml-auto h-3 w-3 text-white/25" />
            </Link>
          </div>

          <div className="border-t border-white/[0.06]" />

          {/* Logout */}
          <div className="px-2 py-1.5">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
