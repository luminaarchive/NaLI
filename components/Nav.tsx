"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // close the mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-3 z-50 px-3 sm:top-4 sm:px-5">
      <nav className="mx-auto flex h-14 max-w-[1160px] items-center justify-between rounded-full bg-[#1c1c1a] pl-2.5 pr-2 text-white shadow-[0_12px_32px_-14px_rgba(0,0,0,0.5)]">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3"
          aria-label="NaLI by NatIve — beranda"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <Image
              src="/logo.png"
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] object-contain"
              priority
            />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            NaLI <span className="text-white/55">by NatIve</span>
          </span>
        </Link>

        {/* desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-full px-3.5 py-2 text-sm transition-colors hover:text-white ${
                  isActive(link.href) ? "bg-white/10 text-white" : "text-white/70"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/articles"
            className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink-black transition-transform hover:scale-[1.03] sm:block"
          >
            Mulai membaca
          </Link>

          {/* mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full lg:hidden"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <div className="flex w-5 flex-col gap-[5px]">
              <span
                className={`h-px bg-white transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
              />
              <span
                className={`h-px bg-white transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-px bg-white transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-x-3 top-[4.6rem] z-40 animate-fade-in rounded-3xl bg-[#1c1c1a] p-3 text-white shadow-2xl lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-white/10 last:border-0">
                <Link
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-4 font-display text-xl ${
                    isActive(link.href) ? "text-teal" : "text-white"
                  }`}
                >
                  {link.label}
                  <span className="font-mono text-xs text-white/40" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
            <li className="p-3">
              <Link
                href="/articles"
                className="block rounded-full bg-white py-3 text-center text-sm font-semibold text-ink-black"
              >
                Mulai membaca
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
