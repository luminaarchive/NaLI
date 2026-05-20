"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { NaLIMark } from "@/components/ui/NaLIIconTile";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Pricing" },
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
        setScrolled(window.scrollY > 24);
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
        className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? "rgba(7,9,14,0.85)" : "rgba(7,9,14,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 md:h-[72px] md:px-8">
          <Link
            aria-label="NaLI homepage"
            className="flex items-center gap-2 text-white"
            href="/"
            onClick={() => setMobileOpen(false)}
          >
            <NaLIMark className="h-5 w-5 md:h-6 md:w-6" gradientId="nali-nav-mark-gradient" />
            <span className="text-[16px] font-semibold tracking-normal md:text-[18px]">
              NaLI
            </span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                className="text-[15px] font-medium text-white/70 transition-colors duration-150 hover:text-white"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            className="hidden rounded-full px-5 py-2 text-[14px] font-medium text-white transition duration-200 hover:brightness-110 md:inline-flex"
            href="/create-report"
            style={{
              background: "linear-gradient(135deg, #10b981, #7c3aed)",
            }}
          >
            Start
          </Link>

          <button
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-white/70 transition-colors hover:text-white md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-14 md:hidden"
          style={{
            backgroundColor: "rgba(7,9,14,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <nav className="flex flex-col gap-1 px-5 pt-4" aria-label="Mobile navigation">
            {links.map((link) => (
              <Link
                className="rounded-xl px-4 py-3.5 text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white"
                href={link.href}
                key={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="mt-4 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
              href="/create-report"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "linear-gradient(135deg, #10b981, #7c3aed)",
              }}
            >
              Start
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
