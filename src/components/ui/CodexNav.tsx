"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NaLIMark } from "@/components/ui/NaLIIconTile";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Harga" },
];

export function CodexNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tickRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (tickRef.current) return;
      tickRef.current = true;

      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        tickRef.current = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-50 border-b transition-all duration-200"
        style={{
          backgroundColor: scrolled ? "rgba(247,243,234,0.96)" : "rgba(247,243,234,0.9)",
          borderColor: scrolled ? "#DDD5C7" : "rgba(221,213,199,0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            aria-label="NaLI beranda"
            className="flex items-center gap-2 text-[#111814]"
            href="/"
            onClick={() => setMobileOpen(false)}
          >
            <NaLIMark className="h-7 w-10" size={40} />
            <span className="text-[15px] font-semibold tracking-normal">NaLI</span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link
                className="text-[14px] font-medium text-[#5F6B62] transition-colors duration-150 hover:text-[#111814]"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            className="hidden rounded-md bg-[#173D2B] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#102F20] md:inline-flex"
            href="/create-report"
          >
            Mulai
          </Link>

          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#DDD5C7] text-[#173D2B] transition-colors hover:bg-white md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-[#F7F3EA]/98 pt-14 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1 px-4 pt-4" aria-label="Navigasi mobile">
            {links.map((link) => (
              <Link
                className="rounded-md px-4 py-3.5 text-[15px] font-medium text-[#5F6B62] transition-colors hover:bg-white hover:text-[#111814]"
                href={link.href}
                key={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="mt-4 flex h-11 w-full items-center justify-center rounded-md bg-[#173D2B] text-sm font-semibold text-white"
              href="/create-report"
              onClick={() => setMobileOpen(false)}
            >
              Mulai Laporan
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
