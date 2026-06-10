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
    <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
      <nav className="container-editorial flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="NaLI by NatIve — beranda">
          <Image
            src="/logo.png"
            alt=""
            width={30}
            height={30}
            className="h-7 w-7 rounded-sm object-contain"
            priority
          />
          <span className="font-display text-lg font-semibold tracking-tight text-ink-black">
            NaLI <span className="text-gray">by NatIve</span>
          </span>
        </Link>

        {/* desktop */}
        <ul className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm transition-colors hover:text-teal-dark ${
                  isActive(link.href)
                    ? "text-ink-black"
                    : "text-gray"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="mx-auto mt-0.5 block h-px w-full bg-teal" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-9 w-9 items-center justify-center lg:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-5 flex-col gap-[5px]">
            <span
              className={`h-px bg-ink-black transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`h-px bg-ink-black transition-opacity duration-200 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px bg-ink-black transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-16 z-40 animate-fade-in bg-paper lg:hidden">
          <ul className="container-editorial flex flex-col py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-rule">
                <Link
                  href={link.href}
                  className={`flex items-center justify-between py-4 font-display text-xl ${
                    isActive(link.href) ? "text-teal-dark" : "text-ink-black"
                  }`}
                >
                  {link.label}
                  <span className="label text-gray-light">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
