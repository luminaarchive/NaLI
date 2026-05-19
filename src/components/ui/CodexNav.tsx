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
 * CodexNav — Scroll-aware nav that switches from transparent/light text
 * (on dark atmospheric hero) to white bg/dark text (on white sections).
 * Uses IntersectionObserver on scroll for GPU-friendly performance.
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
        // Switch to white bg when scrolled past ~70% of viewport
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
          backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? "1px solid rgba(15,23,42,0.08)"
            : "1px solid rgba(255,255,255,0.06)",
          boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
        }}
      >
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Wordmark */}
          <Link
            href="/"
            className="text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-500"
            style={{ color: scrolled ? "#0f172a" : "rgba(255,255,255,0.95)" }}
          >
            NaLI
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium transition-colors duration-500"
                style={{
                  color: scrolled ? "#64748b" : "rgba(255,255,255,0.65)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = scrolled ? "#0f172a" : "rgba(255,255,255,0.95)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = scrolled ? "#64748b" : "rgba(255,255,255,0.65)")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/create-report"
              className="inline-flex h-[34px] items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-all duration-500"
              style={{
                background: scrolled ? "#0f172a" : "rgba(255,255,255,0.12)",
                color: scrolled ? "#ffffff" : "rgba(255,255,255,0.9)",
                border: scrolled ? "1px solid #0f172a" : "1px solid rgba(255,255,255,0.15)",
              }}
            >
              Start
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-500 md:hidden"
            style={{ color: scrolled ? "#0f172a" : "rgba(255,255,255,0.8)" }}
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
            backgroundColor: "rgba(20,16,50,0.97)",
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/15 text-sm font-semibold text-white/95 transition-all hover:bg-white/22"
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
