"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * CodexNav — Light, transparent nav for atmospheric landing pages.
 * Dark text on light background. Minimal. Apple/OpenAI spacing.
 */
export function CodexNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 bg-white/40 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Wordmark */}
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-gray-900">
            NaLI
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-[13px] font-medium md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/create-report"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gray-900 px-4 text-xs font-semibold text-white transition-all hover:bg-gray-800"
            >
              Start
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Mobile menu */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-white/95 pt-14 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1 px-4 pt-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Link
                  href="/create-report"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-900 text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Start a Report
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
