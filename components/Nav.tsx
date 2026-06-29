"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NaliMark } from "@/components/brand/NaliMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearch, SearchTrigger } from "@/components/search/GlobalSearch";

/* -------------------------------------------------------------------------- */
/*  Primary navigation.                                                        */
/*                                                                            */
/*  Reader-first and discovery-focused: a short, scannable set of links so a   */
/*  new visitor immediately sees what they can do. "Artikel" expands to the     */
/*  pillars; Jelajah and Misi Warga carry badges that hint at the interactive   */
/*  features. Everything else (Jurnal, Pustaka, Arsip, Seri, Ruang Kendali,     */
/*  Kontak) stays reachable from the footer. /lab and /admin are never shown.   */
/* -------------------------------------------------------------------------- */

interface SubLink {
  href: string;
  label: string;
}
interface NavItem {
  href: string;
  label: string;
  badge?: string;
  children?: SubLink[];
}

const ARTIKEL_SUB: SubLink[] = [
  { href: "/articles", label: "Semua artikel" },
  { href: "/alam", label: "Alam" },
  { href: "/sejarah", label: "Sejarah" },
  { href: "/investigasi", label: "Investigasi" },
];

const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/articles", label: "Artikel", children: ARTIKEL_SUB },
  { href: "/peta-eksplorasi", label: "Jelajah", badge: "Interactive" },
  { href: "/misi", label: "Misi Warga", badge: "Citizen Science" },
  { href: "/tentang", label: "Tentang" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [artikelOpen, setArtikelOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setArtikelOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkBase =
    "whitespace-nowrap font-display text-[0.82rem] font-semibold uppercase tracking-[0.08em] transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-paper">
      <nav className="relative mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5">
        {/* brand, doubles as home link */}
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 text-ink"
          aria-label="NaLI, Nature Life Intelligence, beranda"
        >
          <NaliMark className="h-7 w-auto shrink-0" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink-black">NaLI</span>
            <span className="mt-0.5 hidden truncate font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ink/70 min-[400px]:block lg:hidden xl:block">
              Nature Life Intelligence
            </span>
          </span>
        </Link>

        {/* desktop nav */}
        <ul className="hidden flex-1 items-center justify-center gap-4 lg:flex xl:gap-6">
          {PRIMARY_NAV.map((item) =>
            item.children ? (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`${linkBase} inline-flex items-center gap-1 ${
                    isActive(item.href)
                      ? "text-ink-black underline decoration-2 underline-offset-4"
                      : "text-ink hover:text-ink-deep link-underline"
                  }`}
                >
                  {item.label}
                  <span aria-hidden className="text-[0.6rem]">▾</span>
                </Link>
                {/* hover/focus dropdown */}
                <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="min-w-[13rem] border border-ink/50 bg-paper p-2 shadow-lg">
                    {item.children.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          className="block px-3 py-2 font-mono text-[0.78rem] text-ink transition-colors hover:bg-ink-wash hover:text-ink-deep"
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={item.href} className="flex items-center gap-1.5">
                <Link
                  href={item.href}
                  className={`${linkBase} ${
                    isActive(item.href)
                      ? "text-ink-black underline decoration-2 underline-offset-4"
                      : "text-ink hover:text-ink-deep link-underline"
                  }`}
                >
                  {item.label}
                </Link>
                {item.badge && (
                  <span className="hidden border border-ink/40 px-1 py-px font-mono text-[0.5rem] uppercase tracking-[0.1em] text-ink/60 xl:inline">
                    {item.badge}
                  </span>
                )}
              </li>
            ),
          )}
        </ul>

        {/* desktop: search + theme */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <SearchTrigger />
          <ThemeToggle />
        </div>

        {/* mobile: search + theme + hamburger */}
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

      {/* signature dashed rule */}
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="hairline" />
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[4.05rem] z-40 animate-fade-in overflow-y-auto bg-paper lg:hidden">
          <div className="mx-auto max-w-[1240px] px-5 py-4">
            {/* prominent search inside the drawer */}
            <SearchTrigger variant="bar" />

            <ul className="mt-4">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href} className="border-b border-dashed border-ink/40">
                  {item.children ? (
                    <div>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={`flex-1 py-4 font-display text-lg font-semibold uppercase tracking-[0.06em] ${
                            isActive(item.href) ? "text-ink-black" : "text-ink"
                          }`}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setArtikelOpen((v) => !v)}
                          className="flex h-12 w-12 items-center justify-center text-ink/70"
                          aria-label={artikelOpen ? "Tutup submenu Artikel" : "Buka submenu Artikel"}
                          aria-expanded={artikelOpen}
                        >
                          <span aria-hidden className={`transition-transform ${artikelOpen ? "rotate-180" : ""}`}>▾</span>
                        </button>
                      </div>
                      {artikelOpen && (
                        <ul className="pb-3 pl-3">
                          {item.children.map((sub) => (
                            <li key={sub.href}>
                              <Link
                                href={sub.href}
                                className="block py-2.5 font-mono text-[0.84rem] text-ink-charcoal hover:text-ink-deep"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between py-4 font-display text-lg font-semibold uppercase tracking-[0.06em] ${
                        isActive(item.href) ? "text-ink-black" : "text-ink"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.badge && (
                          <span className="border border-ink/40 px-1 py-px font-mono text-[0.52rem] uppercase tracking-[0.1em] text-ink/60">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs text-ink/50" aria-hidden>→</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* more links so nothing is lost from the leaner top nav */}
            <p className="label mt-6 text-ink-deep">Lainnya</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4">
              {[
                { href: "/jurnal", label: "Jurnal" },
                { href: "/pustaka", label: "Pustaka" },
                { href: "/arsip-sumber", label: "Arsip Sumber" },
                { href: "/seri", label: "Seri" },
                { href: "/ruang-kendali", label: "Ruang Kendali" },
                { href: "/kontak", label: "Kontak" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2 font-mono text-[0.8rem] text-ink hover:text-ink-deep"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <GlobalSearch />
    </header>
  );
}
