"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link className="flex items-center gap-2" href="/">
            <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
              <Image src="/nali-logo.png" alt="NaLI" fill className="object-cover p-0.5" sizes="28px" unoptimized />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">NaLI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-[13px] font-medium md:flex">
            {links.map((link) => (
              <Link
                className="text-white/50 transition-colors duration-200 hover:text-white"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/create-report"
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-[#09090b] transition-all duration-200 hover:bg-white/90"
            >
              Start
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-white/60 transition-colors hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-[#09090b]/98 pt-14 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="flex flex-col gap-1 px-4 pt-4">
              {links.map((link) => (
                <Link
                  className="rounded-xl px-4 py-3 text-base font-medium text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white"
                  href={link.href}
                  key={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <Link
                  href="/create-report"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-[#09090b]"
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

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#09090b]/80 px-4 py-10 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02]">
            <Image src="/nali-logo.png" alt="NaLI" fill className="object-cover p-0.5" sizes="28px" unoptimized />
          </span>
          <p className="text-white/40">
            Evidence-based drafts. Final review remains human.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-[13px] font-medium text-white/40">
          <Link href="/learn-report" className="transition-colors hover:text-white/70">Learn & Report</Link>
          <Link href="/field-intelligence" className="transition-colors hover:text-white/70">Field Intelligence</Link>
          <Link href="/pricing" className="transition-colors hover:text-white/70">Pricing</Link>
          <Link href="/create-report" className="transition-colors hover:text-white/70">Create Report</Link>
        </div>
      </div>
    </footer>
  );
}
