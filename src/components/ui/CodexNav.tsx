"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * CodexNav — Light, transparent nav for atmospheric landing pages.
 * OpenAI-like refinement: transparent background, subtle backdrop blur,
 * slate/black text, less bold links, dark pill CTA, almost invisible border.
 */
export function CodexNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-50"
        style={{
          backgroundColor: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.03)",
        }}
      >
        <div className="mx-auto flex h-[56px] max-w-[1200px] items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Wordmark */}
          <Link href="/" className="text-[15px] font-semibold tracking-[-0.01em] text-[#111827]">
            NaLI
          </Link>

          {/* Desktop nav — center links */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-[#334155] transition-colors duration-200 hover:text-[#111827]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA — dark pill */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/create-report"
              className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-[#0f172a] px-4 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[#1e293b]"
            >
              Start
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#334155] md:hidden"
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
            backgroundColor: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <nav className="flex flex-col gap-1 px-5 pt-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#334155] transition-colors hover:bg-gray-50 hover:text-[#111827]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Link
                href="/create-report"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0f172a] text-sm font-semibold text-white"
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
