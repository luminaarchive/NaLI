"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const centerNavigation = [
  { href: "/create-report", label: "Buat Laporan" },
  { href: "/pricing", label: "Harga" },
  { href: "/learn-report", label: "Panduan" },
  { href: "/#status", label: "Status" },
] as const;

export function PublicAppShell({ children, isHomepage = false }: { children: ReactNode; isHomepage?: boolean }) {
  return (
    <div className={cn(
      "min-h-screen font-sans antialiased selection:bg-[#00FFB3]/20",
      isHomepage 
        ? "bg-[#f5f0e8] text-[#1e3525] selection:text-[#1e3525]" 
        : "dark bg-[#060b08] text-[#f5f0e8] selection:text-[#00FFB3]"
    )}>
      {/* Dynamic ambient backgrounds (App pages only) */}
      {!isHomepage && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#00FFB3]/5 blur-[120px] animate-pulse duration-5000" />
          <div className="absolute bottom-0 left-0 right-0 h-[350px] bg-gradient-to-t from-[#00FFB3]/4 via-transparent to-transparent blur-3xl pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicAppNav isHomepage={isHomepage} />
        {children}
        <PublicAppFooter />
      </div>
    </div>
  );
}

export function PublicAppNav({ isHomepage = false }: { isHomepage?: boolean }) {
  return (
    <header className={cn(
      "sticky top-0 z-40 backdrop-blur-xl transition-all duration-200 h-14 flex items-center",
      isHomepage 
        ? "border-b border-[#1e3525]/8 bg-[#f5f0e8]/80 text-[#1e3525]" 
        : "border-b border-[#14261c] bg-[#060b08]/80 text-[#f5f0e8]"
    )}>
      <div className="w-full mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Logo mark + wordmark */}
        <Link aria-label="NaLI beranda" className="flex min-h-[44px] items-center gap-2 group" href="/">
          <span className={cn(
            "relative h-8 w-8 overflow-hidden rounded-lg border flex items-center justify-center transition-all duration-300",
            isHomepage 
              ? "border-[#1e3525]/12 bg-white group-hover:border-[#1e3525]/30" 
              : "border-[#14261c] bg-[#08100c] group-hover:border-[#00FFB3]/40"
          )}>
            <Image
              alt="NaLI Logo Mark"
              className={cn(
                "object-cover p-0.5 transition-transform duration-300 group-hover:scale-105 logo-img",
                isHomepage ? "invert multiply mix-blend-multiply" : "mix-blend-screen"
              )}
              fill
              src="/assets/nali-mark.jpg"
              unoptimized
            />
          </span>
          <span className={cn(
            "font-serif text-lg font-bold tracking-tight transition-colors duration-200",
            isHomepage ? "text-[#1e3525]" : "text-[#f5f0e8]"
          )}>
            NaLI
          </span>
        </Link>

        {/* Center Navigation (Desktop Only) */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {centerNavigation.map((item) => (
            <Link
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-lg px-3.5 text-xs font-semibold tracking-wide transition-colors duration-200",
                isHomepage 
                  ? "text-[#1e3525]/70 hover:bg-[#1e3525]/5 hover:text-[#1e3525]" 
                  : "text-[#a1b3a8] hover:bg-[#14261c]/40 hover:text-[#00FFB3]"
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          <Link
            className={cn(
              "hidden min-h-[44px] items-center text-xs font-semibold transition-colors duration-200 md:inline-flex",
              isHomepage ? "text-[#1e3525]/70 hover:text-[#1e3525]" : "text-[#a1b3a8] hover:text-[#00FFB3]"
            )}
            href="/login"
          >
            Masuk
          </Link>
          <Link
            className={cn(
              "inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200",
              isHomepage 
                ? "bg-[#1e3525] text-[#f5f0e8] hover:bg-[#162d1d] hover:shadow-[0_4px_12px_rgba(30,53,37,0.15)]" 
                : "bg-[#00FFB3] text-[#060b08] hover:bg-[#00e6a1] hover:shadow-[0_0_20px_rgba(0,255,179,0.35)]"
            )}
            href="/create-report"
          >
            <span className="sm:hidden">Mulai</span>
            <span className="hidden sm:inline">Mulai Gratis</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>

          {/* Mobile Hamburger menu with shadcn Sheet */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Menu Navigasi"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200",
                    isHomepage 
                      ? "border-[#1e3525]/12 bg-white text-[#1e3525] hover:bg-[#1e3525]/5" 
                      : "border-[#14261c] bg-[#08100c] text-[#a1b3a8] hover:text-[#00FFB3]"
                  )}
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className={cn(
                "w-[280px] border-l p-6 sm:max-w-sm",
                isHomepage 
                  ? "border-[#1e3525]/8 bg-[#f5f0e8] text-[#1e3525]" 
                  : "border-[#14261c] bg-[#08100c] text-[#f5f0e8]"
              )}>
                <SheetHeader className={cn(
                  "pb-4 border-b",
                  isHomepage ? "border-[#1e3525]/8" : "border-[#14261c]"
                )}>
                  <SheetTitle className="flex items-center gap-2">
                    <span className={cn(
                      "relative h-7 w-7 overflow-hidden rounded-md border flex items-center justify-center",
                      isHomepage ? "border-[#1e3525]/12 bg-white" : "border-[#14261c] bg-[#08100c]"
                    )}>
                      <Image
                        alt="NaLI Logo"
                        className={cn(
                          "object-cover p-0.5 logo-img",
                          isHomepage ? "invert multiply mix-blend-multiply" : "mix-blend-screen"
                        )}
                        fill
                        src="/assets/nali-mark.jpg"
                        unoptimized
                      />
                    </span>
                    <span className={cn(
                      "text-sm font-bold font-serif",
                      isHomepage ? "text-[#1e3525]" : "text-[#f5f0e8]"
                    )}>NaLI</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 pt-6">
                  {centerNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors",
                        isHomepage 
                          ? "text-[#1e3525]/70 hover:bg-[#1e3525]/5 hover:text-[#1e3525]" 
                          : "text-[#a1b3a8] hover:bg-[#14261c]/40 hover:text-[#00FFB3]"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/login"
                    className={cn(
                      "flex h-11 items-center rounded-lg px-3 text-sm font-semibold transition-colors border-t mt-2 pt-2",
                      isHomepage 
                        ? "border-[#1e3525]/8 text-[#1e3525]/70 hover:bg-[#1e3525]/5 hover:text-[#1e3525]" 
                        : "border-[#14261c] text-[#a1b3a8] hover:bg-[#14261c]/40 hover:text-[#00FFB3]"
                    )}
                  >
                    Masuk
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PublicAppFooter() {
  return (
    <footer className="bg-[#1e3525] text-[#f5f0e8] py-12 px-6 border-t border-[#f5f0e8]/8">
      <div className="mx-auto max-w-[1120px]">
        {/* Top section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 pb-8 border-b border-[#f5f0e8]/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-[#f5f0e8]/12 bg-white flex items-center justify-center">
                <Image
                  alt="NaLI Logo"
                  className="object-cover p-0.5 logo-img-footer mix-blend-screen"
                  fill
                  src="/assets/nali-mark.jpg"
                  unoptimized
                />
              </span>
              <span className="text-lg font-bold font-serif">NaLI</span>
            </div>
            <p className="max-w-[400px] text-xs leading-6 text-[#f5f0e8]/70">
              Nature Life Intelligence and Human Assistance. Draft laporan berbasis bahan pengguna. Batas bukti tetap terlihat dan pemeriksaan akhir tetap milik pengguna.
            </p>
          </div>
          <div className="text-xs text-[#f5f0e8]/50">
            Social Handle: <a href="https://twitter.com/hellonali" target="_blank" rel="noopener noreferrer" className="text-[#00FFB3] hover:underline">@hellonali</a>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <FooterGroup
            label="Produk"
            links={[
              { href: "/create-report", label: "Buat Laporan" },
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

          <div className="space-y-3">
            <p className="text-xs font-bold tracking-[0.15em] text-[#00FFB3] uppercase">Status CP1</p>
            <ul className="space-y-2 text-xs text-[#f5f0e8]/70">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Payment belum aktif
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Upload belum aktif
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Source verification belum aktif
              </li>
            </ul>
          </div>

          <div className="space-y-3 text-xs text-[#f5f0e8]/70 leading-relaxed">
            <p className="font-bold tracking-[0.15em] text-[#00FFB3] uppercase">NatIve</p>
            <p className="pt-2 text-xs text-[#f5f0e8]/60">
              Mendorong keadilan bukti di ekosistem konservasi Indonesia.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#f5f0e8]/10 mt-8 pt-6 flex justify-between text-[#f5f0e8]/50 text-xs">
          <span>&copy; 2026 NatIve</span>
          <a href="https://twitter.com/hellonali" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FFB3]">@hellonali</a>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ label, links }: { label: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold tracking-[0.15em] text-[#00FFB3] uppercase">{label}</p>
      <nav aria-label={label} className="flex flex-col gap-1.5">
        {links.map((link) => (
          <Link
            className="inline-flex min-h-[44px] items-center text-xs text-[#f5f0e8]/70 hover:text-[#00FFB3] transition-colors duration-200"
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
