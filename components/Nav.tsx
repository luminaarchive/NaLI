"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NaliMark } from "@/components/brand/NaliMark";
import { NAV_LINKS } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearch, SearchTrigger } from "@/components/search/GlobalSearch";

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
      <nav className="relative mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5">
        {/* brand, left aligned on all sizes (doubles as the home link) */}
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 text-ink" aria-label="NaLI, Nature Life Intelligence, beranda">
          <NaliMark className="h-7 w-auto shrink-0" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink-black">NaLI</span>
            <span className="mt-0.5 hidden truncate font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ink/70 min-[400px]:block lg:hidden xl:block">
              Nature Life Intelligence
            </span>
          </span>
        </Link>

        {/* desktop: centered serif caps, archive style, between brand + controls */}
        <ul className="hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`whitespace-nowrap font-display text-[0.82rem] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive(link.href)
                    ? "text-ink-black underline decoration-2 underline-offset-4"
                    : "text-ink hover:text-ink-deep link-underline"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* search + theme toggle, desktop, in flow on the right */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <SearchTrigger />
          <ThemeToggle />
        </div>

        {/* mobile: search + theme toggle + hamburger */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <SearchTrigger />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-10 w-10 items-center justify-center"
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
        </div>
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

      <GlobalSearch />
    </header>
  );
}
