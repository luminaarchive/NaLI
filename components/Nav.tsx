"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/site";

const LINKS = [{ href: "/", label: "Beranda" }, ...NAV_LINKS];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-paper">
      <nav className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 lg:justify-center">
        {/* mobile brand */}
        <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="NaLI by NatIve — beranda">
          <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" priority />
          <span className="font-display text-lg font-semibold tracking-tight text-ink-black">
            NaLI <span className="text-ink">by NatIve</span>
          </span>
        </Link>

        {/* desktop: centered serif caps, archive style */}
        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`font-display text-[0.82rem] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive(link.href)
                    ? "text-ink-black underline decoration-2 underline-offset-4"
                    : "text-ink hover:text-ink-deep hover:underline hover:underline-offset-4"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 items-center justify-center lg:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-5 flex-col gap-[5px]">
            <span className={`h-px bg-ink transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-px bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`h-px bg-ink transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>
      {/* the signature dashed rule */}
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="hairline" />
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[4.05rem] z-40 animate-fade-in bg-paper lg:hidden">
          <ul className="mx-auto max-w-[1240px] px-5 py-2">
            {LINKS.map((link) => (
              <li key={link.href} className="border-b border-dashed border-ink/40">
                <Link
                  href={link.href}
                  className={`flex items-center justify-between py-4 font-display text-lg font-semibold uppercase tracking-[0.06em] ${
                    isActive(link.href) ? "text-ink-black" : "text-ink"
                  }`}
                >
                  {link.label}
                  <span className="font-mono text-xs text-ink/50" aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
