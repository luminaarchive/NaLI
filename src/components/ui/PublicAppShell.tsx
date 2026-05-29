"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowRight, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NaLILogo } from "@/components/ui/NaLILogo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface PublicAppShellProps {
  children: ReactNode;
  isHomepage?: boolean;
}


export function PublicAppShell({ children, isHomepage = false }: PublicAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const logoVariant = isHomepage ? "dark" : "light";

  return (
    <div
      className={cn(
        "min-h-screen font-sans antialiased selection:bg-[#00FFB3]/20",
        isHomepage
          ? "bg-[#f5f0e8] text-[#1e3525] selection:text-[#1e3525]"
          : "dark bg-[#060b08] text-[#f5f0e8] selection:text-[#00FFB3]",
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 flex h-14 items-center border-b backdrop-blur-sm",
          isHomepage
            ? "border-[#1e3525]/10 bg-[#f5f0e8]/95"
            : "border-[#14261c] bg-[#060b08]/95",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-4 sm:px-6">
          <NaLILogo size={30} variant={logoVariant} />

          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 md:flex">
            <Link
              className={cn(
                "text-sm transition-colors font-medium",
                isHomepage
                  ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                  : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
              )}
              href="/create-report"
            >
              Buat Laporan
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors outline-none cursor-pointer",
                    isHomepage
                      ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                      : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
                  )}
                >
                  Fitur
                  <ChevronDown className="h-3 w-3 stroke-[2.5] opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="mt-1 w-48 rounded-xl border p-1 shadow-lg bg-[#08100c] border-[#14261c] text-[#f5f0e8]"
              >
                <DropdownMenuItem asChild>
                  <Link
                    href="/species"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#a1b3a8] transition-colors hover:bg-[#14261c] hover:text-[#f5f0e8] focus:bg-[#14261c] focus:text-[#f5f0e8]"
                  >
                    <span>🔬</span>
                    <span>Spesies Intelligence</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/field-report"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#a1b3a8] transition-colors hover:bg-[#14261c] hover:text-[#f5f0e8] focus:bg-[#14261c] focus:text-[#f5f0e8]"
                  >
                    <span>📋</span>
                    <span>Field Report Builder</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/projects"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#a1b3a8] transition-colors hover:bg-[#14261c] hover:text-[#f5f0e8] focus:bg-[#14261c] focus:text-[#f5f0e8]"
                  >
                    <span>📁</span>
                    <span>Proyek Riset</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/skills"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#a1b3a8] transition-colors hover:bg-[#14261c] hover:text-[#f5f0e8] focus:bg-[#14261c] focus:text-[#f5f0e8]"
                  >
                    <span>⚡</span>
                    <span>NaLI Skills</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              className={cn(
                "text-sm transition-colors font-medium",
                isHomepage
                  ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                  : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
              )}
              href="/field-notes"
            >
              Catatan
            </Link>

            <Link
              className={cn(
                "text-sm transition-colors font-medium",
                isHomepage
                  ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                  : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
              )}
              href="/pricing"
            >
              Harga
            </Link>

            <Link
              className={cn(
                "text-sm transition-colors font-medium",
                isHomepage
                  ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                  : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
              )}
              href="/learn-report"
            >
              Panduan
            </Link>

            <Link
              className={cn(
                "text-sm transition-colors font-medium",
                isHomepage
                  ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                  : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
              )}
              href="/#status"
            >
              Status
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!userLoading && (
              user ? (
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20",
                    isHomepage ? "text-[#1e3525]" : "text-[#00FFB3]"
                  )}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "inline-flex min-h-[44px] items-center px-2 text-sm font-semibold transition-colors cursor-pointer",
                      isHomepage
                        ? "text-red-700 hover:text-red-800"
                        : "text-red-400 hover:text-red-300",
                    )}
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <Link
                  className={cn(
                    "inline-flex min-h-[44px] items-center px-2 text-sm transition-colors",
                    isHomepage
                      ? "text-[#1e3525]/65 hover:text-[#1e3525]"
                      : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
                  )}
                  href="/login"
                >
                  Masuk
                </Link>
              )
            )}
            <Link
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1e3525] px-4 text-sm font-medium text-[#f5f0e8] transition-colors hover:bg-[#162d1d]"
              href="/create-report"
            >
              Mulai Susun Laporan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Buka menu navigasi"
                className={cn("md:hidden", isHomepage ? "text-[#1e3525]" : "text-[#f5f0e8]")}
                size="icon-lg"
                variant="ghost"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className={cn(
                "w-[280px] border-l",
                isHomepage ? "border-[#1e3525]/10 bg-[#f5f0e8]" : "border-[#14261c] bg-[#060b08]",
              )}
              side="right"
            >
              <SheetHeader className="border-b border-current/10">
                <SheetTitle>
                  <NaLILogo href={null} size={28} variant={logoVariant} />
                </SheetTitle>
                <SheetDescription className="sr-only">Navigasi halaman publik NaLI</SheetDescription>
              </SheetHeader>
              <nav aria-label="Navigasi seluler" className="flex flex-col gap-1 px-4 pt-3">
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/create-report"
                  onClick={() => setMobileOpen(false)}
                >
                  Buat Laporan
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors pl-6",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/species"
                  onClick={() => setMobileOpen(false)}
                >
                  🔬 Spesies Intelligence
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors pl-6",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/field-report"
                  onClick={() => setMobileOpen(false)}
                >
                  📋 Field Report Builder
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors pl-6",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/projects"
                  onClick={() => setMobileOpen(false)}
                >
                  📁 Proyek Riset
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors pl-6",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/skills"
                  onClick={() => setMobileOpen(false)}
                >
                  ⚡ NaLI Skills
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/field-notes"
                  onClick={() => setMobileOpen(false)}
                >
                  📝 Catatan Lapangan
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                >
                  Harga
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/learn-report"
                  onClick={() => setMobileOpen(false)}
                >
                  Panduan
                </Link>
                <Link
                  className={cn(
                    "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors",
                    isHomepage
                      ? "text-[#1e3525] hover:bg-[#1e3525]/5"
                      : "text-[#f5f0e8] hover:bg-white/5",
                  )}
                  href="/#status"
                  onClick={() => setMobileOpen(false)}
                >
                  Status
                </Link>
                <div className="mt-5 flex flex-col gap-2 border-t border-current/10 pt-5">
                  {!userLoading && (
                    user ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-center font-medium opacity-60 truncate">
                          {user.email}
                        </span>
                        <button
                          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-red-500/30 text-sm font-semibold text-red-500 bg-red-500/5 hover:bg-red-500/10 cursor-pointer"
                          onClick={() => {
                            setMobileOpen(false);
                            handleLogout();
                          }}
                        >
                          Keluar
                        </button>
                      </div>
                    ) : (
                      <Link
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-current/20 text-sm font-medium"
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                      >
                        Masuk
                      </Link>
                    )
                  )}
                  <Link
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-4 text-sm font-medium text-[#f5f0e8]"
                    href="/create-report"
                    onClick={() => setMobileOpen(false)}
                  >
                    Mulai Susun Laporan
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#f5f0e8]/10 bg-[#1e3525] px-4 py-12 text-[#f5f0e8] sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 border-b border-[#f5f0e8]/10 pb-8">
            <NaLILogo size={30} variant="light" />
            <p className="mt-3 max-w-[380px] text-sm leading-6 text-[#f5f0e8]/60">
              Nature Life Intelligence and Human Assistance. Draft laporan berbasis bahan pengguna. Batas bukti
              tetap terlihat dan pemeriksaan akhir tetap milik pengguna.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterGroup
              label="Produk"
              links={[
                { href: "/create-report", label: "Buat Laporan" },
                { href: "/species", label: "Spesies Intelligence" },
                { href: "/field-report", label: "Field Report Builder" },
                { href: "/projects", label: "Proyek Riset" },
                { href: "/skills", label: "NaLI Skills" },
                { href: "/field-notes", label: "Catatan Lapangan" },
                { href: "/pricing", label: "Harga" },
                { href: "/learn-report", label: "Panduan" },
              ]}
            />
            <FooterGroup
              label="NaLI"
              links={[
                { href: "/learn-report", label: "Evidence Boundary" },
                { href: "/learn-report", label: "Integritas Akademik" },
                { href: "/privacy", label: "Privacy" },
              ]}
            />
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#00FFB3]/80">Status Rilis</p>
              <div className="flex flex-col gap-2 text-sm text-[#f5f0e8]/60">
                <span>Pembayaran belum aktif</span>
                <span>Upload belum aktif</span>
                <span>Source verification belum aktif</span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#00FFB3]/80">NatIve</p>
              <p className="text-sm leading-6 text-[#f5f0e8]/60">
                Mendorong keadilan bukti di ekosistem konservasi Indonesia.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-[#f5f0e8]/10 pt-6 text-xs text-[#f5f0e8]/45 sm:flex-row sm:justify-between">
            <span>&copy; 2026 NatIve</span>
            <span>@hellonali</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterGroup({ label, links }: { label: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#00FFB3]/80">{label}</p>
      <nav aria-label={label} className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            className="inline-flex min-h-[44px] items-center text-sm text-[#f5f0e8]/60 transition-colors hover:text-[#f5f0e8]"
            href={link.href}
            key={`${label}-${link.label}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default PublicAppShell;
