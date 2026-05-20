"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * CodexNav — Dark glass navbar.
 * Desktop: 72px height, logo lockup (mark 24px + NaLI text),
 *          center nav links, right Start gradient pill.
 * Mobile: 56px height, logo lockup left, hamburger right.
 * Background: rgba(7,9,14,0.6) + backdrop-blur(16px), bottom border white/6%.
 */
export function CodexNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tickRef = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (tickRef.current) return;
      tickRef.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > window.innerHeight * 0.7);
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
        className="fixed top-0 right-0 left-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(7,9,14,0.88)" : "rgba(7,9,14,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.25)" : "none",
        }}
      >
        {/* Desktop: 72px, Mobile: 56px */}
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-5 sm:px-6 md:h-[72px] lg:px-8">
          {/* Logo lockup: mark + wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-colors duration-500"
          >
            {/* 24px logo mark for nav */}
            <svg
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="nav-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <path
                d="M 144 400 C 144 400, 128 300, 136 240 C 144 180, 152 160, 156 128 C 160 108, 156 96, 160 88"
                stroke="url(#nav-grad)" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
              <path
                d="M 168 112 C 192 160, 228 240, 264 296 C 300 352, 332 380, 348 400"
                stroke="url(#nav-grad)" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
              <path
                d="M 352 400 C 352 392, 356 340, 360 280 C 364 220, 368 160, 364 120 C 362 100, 358 92, 356 84"
                stroke="url(#nav-grad)" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" fill="none"
              />
              <circle cx="356" cy="76" r="10" fill="url(#nav-grad)" />
            </svg>
            <span className="text-[16px] font-semibold tracking-[-0.01em] text-white md:text-[18px]">
              NaLI
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[15px] font-medium text-white/70 transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA — gradient pill */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/create-report"
              className="inline-flex h-[36px] items-center gap-1.5 rounded-full px-5 text-[14px] font-medium text-white transition-all duration-300 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #10b981, #7c3aed)",
              }}
            >
              Start
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors duration-300 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-[56px] md:hidden"
          style={{
            backgroundColor: "rgba(7,9,14,0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <nav className="flex flex-col gap-1 px-5 pt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3.5 text-[15px] font-medium text-white/75 transition-colors hover:bg-white/[0.06] hover:text-white/95"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link
                href="/create-report"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #10b981, #7c3aed)",
                }}
                onClick={() => setMobileOpen(false)}
              >
                Start a Report
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
