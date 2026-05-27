"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

const centerNavigation = [
  { href: "/create-report", label: "Buat Laporan" },
  { href: "/pricing", label: "Harga" },
  { href: "/learn-report", label: "Panduan" },
  { href: "/#status", label: "Status" },
] as const;

export function PublicAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060b08] text-[#f5f0e8] font-sans selection:bg-[#00FFB3]/20 selection:text-[#00FFB3]">
      {/* Dynamic ambient backgrounds */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[400px] w-[400px] rounded-full bg-[#00FFB3]/5 blur-[120px] animate-pulse duration-5000" />
        <div className="absolute bottom-0 left-0 right-0 h-[350px] bg-gradient-to-t from-[#00FFB3]/4 via-transparent to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <PublicAppNav />
        {children}
        <PublicAppFooter />
      </div>
    </div>
  );
}

export function PublicAppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#14261c] bg-[#060b08]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Logo mark + wordmark */}
        <Link aria-label="NaLI beranda" className="flex min-h-[44px] items-center gap-2 group" href="/">
          <span className="relative h-8 w-8 overflow-hidden rounded-lg border border-[#14261c] bg-[#08100c] flex items-center justify-center transition-all duration-300 group-hover:border-[#00FFB3]/40">
            <Image
              alt="NaLI Logo Mark"
              className="object-cover mix-blend-screen p-0.5 transition-transform duration-300 group-hover:scale-105"
              fill
              src="/assets/nali-mark.jpg"
              unoptimized
            />
          </span>
          <span className="relative h-4 w-12 overflow-hidden flex items-center justify-center">
            <Image
              alt="NaLI Logo Wordmark"
              className="object-contain mix-blend-screen transition-transform duration-300"
              fill
              src="/assets/nali-wordmark.jpg"
              unoptimized
            />
          </span>
        </Link>

        {/* Center Navigation (Desktop Only) */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {centerNavigation.map((item) => (
            <Link
              className="inline-flex min-h-[44px] items-center rounded-lg px-3.5 text-xs font-semibold tracking-wide text-[#a1b3a8] transition-colors duration-200 hover:bg-[#14261c]/40 hover:text-[#00FFB3]"
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
            className="hidden min-h-[44px] items-center text-xs font-semibold text-[#a1b3a8] hover:text-[#00FFB3] transition-colors duration-200 md:inline-flex"
            href="/login"
          >
            Masuk
          </Link>
          <Link
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#00FFB3] px-4 py-2 text-xs font-bold text-[#060b08] transition-all duration-200 hover:bg-[#00e6a1] hover:shadow-[0_0_20px_rgba(0,255,179,0.35)]"
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
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#08100c] text-[#a1b3a8] hover:text-[#00FFB3] transition-all duration-200"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] border-l border-[#14261c] bg-[#08100c] p-6 text-[#f5f0e8] sm:max-w-sm">
                <SheetHeader className="pb-4 border-b border-[#14261c]">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="relative h-7 w-7 overflow-hidden rounded-md border border-[#14261c] bg-[#08100c] flex items-center justify-center">
                      <Image
                        alt="NaLI Logo"
                        className="object-cover mix-blend-screen p-0.5"
                        fill
                        src="/assets/nali-mark.jpg"
                        unoptimized
                      />
                    </span>
                    <span className="text-sm font-bold text-[#f5f0e8] font-serif">NaLI</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 pt-6">
                  {centerNavigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#a1b3a8] hover:bg-[#14261c]/40 hover:text-[#00FFB3] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/login"
                    className="flex h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#a1b3a8] hover:bg-[#14261c]/40 hover:text-[#00FFB3] transition-colors border-t border-[#14261c] mt-2 pt-2"
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
    <footer className="border-t border-[#14261c] bg-[#030604] px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-[1120px] gap-10 text-sm sm:grid-cols-2 lg:grid-cols-[1.50fr_0.9fr_0.9fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative h-7 w-7 overflow-hidden rounded-md border border-[#14261c] bg-[#08100c] flex items-center justify-center">
              <Image
                alt="NaLI Logo"
                className="object-cover mix-blend-screen p-0.5"
                fill
                src="/assets/nali-mark.jpg"
                unoptimized
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#f5f0e8] font-serif">NaLI</span>
              <span className="text-[8px] text-[#00FFB3] font-semibold uppercase tracking-wider">by NatIve</span>
            </div>
          </div>
          <p className="max-w-[300px] text-xs leading-6 text-[#a1b3a8]">
            Nature Life Intelligence and Human Assistance. Draft laporan berbasis bahan pengguna. Batas bukti tetap terlihat dan pemeriksaan akhir tetap milik pengguna.
          </p>
          <p className="text-[10px] text-[#a1b3a8]/50">
            Social Handle: <a href="https://twitter.com/hellonali" target="_blank" rel="noopener noreferrer" className="text-[#00FFB3] hover:underline">@hellonali</a>
          </p>
        </div>
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
          <ul className="space-y-2 text-xs text-[#a1b3a8]">
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
            className="inline-flex min-h-[44px] items-center text-xs text-[#a1b3a8] transition-colors duration-200 hover:text-[#00FFB3]"
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
