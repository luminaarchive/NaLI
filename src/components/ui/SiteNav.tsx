"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { NaLIMark } from "@/components/ui/NaLIIconTile";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Harga" },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#DDD5C7] bg-[#F7F3EA]/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            aria-label="NaLI beranda"
            className="flex items-center gap-2 text-[#111814]"
            href="/"
            onClick={() => setMobileOpen(false)}
          >
            <NaLIMark className="h-7 w-10" size={40} />
            <span className="text-[15px] font-semibold tracking-normal">NaLI</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 text-[13px] font-medium md:flex">
            {links.map((link) => (
              <Link
                className="text-[#5F6B62] transition-colors duration-150 hover:text-[#111814]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/create-report"
            className="hidden h-8 items-center gap-1.5 rounded-md bg-[#173D2B] px-4 text-xs font-semibold text-white transition hover:bg-[#102F20] md:inline-flex"
          >
            Mulai
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>

          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#DDD5C7] text-[#173D2B] transition-colors hover:bg-white md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#F7F3EA]/98 pt-14 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1 px-4 pt-4" aria-label="Navigasi mobile">
            {links.map((link) => (
              <Link
                className="rounded-md px-4 py-3 text-base font-medium text-[#5F6B62] transition-colors hover:bg-white hover:text-[#111814]"
                href={link.href}
                key={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-[#DDD5C7] pt-4">
              <Link
                href="/create-report"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#173D2B] text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Mulai Laporan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-[#DDD5C7] bg-[#F5F1E8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <NaLIMark className="h-7 w-10" size={40} />
          <p className="text-[#5F6B62]">NaLI menyusun, bukan mengarang. Validasi akhir tetap manusia.</p>
        </div>
        <div className="flex flex-wrap gap-5 text-[13px] font-medium text-[#5F6B62]">
          <Link href="/learn-report" className="transition-colors hover:text-[#111814]">
            Learn & Report
          </Link>
          <Link href="/field-intelligence" className="transition-colors hover:text-[#111814]">
            Field Intelligence
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-[#111814]">
            Harga
          </Link>
          <Link href="/create-report" className="transition-colors hover:text-[#111814]">
            Mulai Laporan
          </Link>
        </div>
      </div>
    </footer>
  );
}
