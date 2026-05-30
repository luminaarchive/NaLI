"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NaLILogo } from "@/components/ui/NaLILogo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { UserProfileButton } from "@/components/UserProfileButton";

interface PublicAppShellProps {
  children: ReactNode;
  isHomepage?: boolean;
}

const NAV_LINKS = [
  { href: "/create-report", label: "Buat Laporan" },
  { href: "/field-notes", label: "Catatan" },
  { href: "/learn-report", label: "Panduan" },
  { href: "/pricing", label: "Harga" },
] as const;

export function PublicAppShell({ children, isHomepage = false }: PublicAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoVariant = isHomepage ? "dark" : "light";

  return (
    <div
      className={cn(
        "min-h-screen font-sans antialiased selection:bg-[#00FFB3]/20",
        isHomepage
          ? "bg-[#f5f0e8] text-[#1e3525] selection:text-[#1e3525]"
          : "dark bg-[#060b08] text-[#f5f0e8] selection:text-[#00FFB3]",
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 flex h-14 items-center border-b backdrop-blur-sm",
          isHomepage ? "border-[#1e3525]/10 bg-[#f5f0e8]/95" : "border-[#14261c] bg-[#060b08]/95",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[1120px] items-center justify-between px-4 sm:px-6">
          <NaLILogo size={30} variant={logoVariant} />

          {/* Desktop nav */}
          <nav aria-label="Navigasi utama" className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isHomepage ? "text-[#1e3525]/65 hover:text-[#1e3525]" : "text-[#f5f0e8]/65 hover:text-[#f5f0e8]",
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right: profile + CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <UserProfileButton />
            <Link
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#1e3525] px-4 text-sm font-semibold text-[#f5f0e8] transition-colors hover:bg-[#162d1d]"
              href="/create-report"
            >
              Mulai Gratis
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Buka menu navigasi"
                className={cn("md:hidden", isHomepage ? "text-[#1e3525]" : "text-[#f5f0e8]")}
                size="icon-lg"
                variant="ghost"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              className={cn(
                "w-[280px] border-l",
                isHomepage ? "border-[#1e3525]/10 bg-[#f5f0e8]" : "border-[#14261c] bg-[#060b08]",
              )}
              side="right"
            >
              <SheetHeader className="border-b border-current/10">
                <SheetTitle>
                  <NaLILogo href={null} size={28} variant={logoVariant} />
                </SheetTitle>
                <SheetDescription className="sr-only">Navigasi halaman publik NaLI</SheetDescription>
              </SheetHeader>
              <nav aria-label="Navigasi seluler" className="flex flex-col gap-1 px-4 pt-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    className={cn(
                      "flex min-h-[44px] items-center rounded-lg px-2 text-sm font-medium transition-colors",
                      isHomepage ? "text-[#1e3525] hover:bg-[#1e3525]/5" : "text-[#f5f0e8] hover:bg-white/5",
                    )}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-5 flex flex-col gap-2 border-t border-current/10 pt-5">
                  <UserProfileButton />
                  <Link
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-4 text-sm font-semibold text-[#f5f0e8]"
                    href="/create-report"
                    onClick={() => setMobileOpen(false)}
                  >
                    Mulai Gratis
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#f5f0e8]/10 bg-[#1e3525] px-4 py-12 text-[#f5f0e8] sm:px-6">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 border-b border-[#f5f0e8]/10 pb-8">
            <NaLILogo size={30} variant="light" />
            <p className="mt-3 max-w-[380px] text-sm leading-6 text-[#f5f0e8]/60">
              Laporan lapangan berbasis bukti untuk Indonesia. Draft berbasis bahan pengguna, batas bukti transparan,
              pemeriksaan akhir milik pengguna.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterGroup
              label="Produk"
              links={[
                { href: "/create-report", label: "Buat Laporan" },
                { href: "/field-notes", label: "Catatan Lapangan" },
                { href: "/pricing", label: "Harga" },
                { href: "/learn-report", label: "Panduan" },
              ]}
            />
            <FooterGroup
              label="NaLI"
              links={[
                { href: "/learn-report", label: "Cara Kerja" },
                { href: "/privacy", label: "Kebijakan Privasi" },
              ]}
            />
            <div>
              <p className="mb-3 text-xs font-semibold tracking-widest text-[#00FFB3]/80 uppercase">Status</p>
              <div className="flex flex-col gap-2 text-sm text-[#f5f0e8]/60">
                <span>Pembayaran dalam proses</span>
                <span>Source verification segera hadir</span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold tracking-widest text-[#00FFB3]/80 uppercase">NatIve</p>
              <p className="text-sm leading-6 text-[#f5f0e8]/60">
                Mendorong keadilan bukti di ekosistem konservasi Indonesia.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-[#f5f0e8]/10 pt-6 text-xs text-[#f5f0e8]/45 sm:flex-row sm:justify-between">
            <span>&copy; 2026 NatIve</span>
            <span>@hellonali</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterGroup({ label, links }: { label: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold tracking-widest text-[#00FFB3]/80 uppercase">{label}</p>
      <nav aria-label={label} className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            className="inline-flex min-h-[44px] items-center text-sm text-[#f5f0e8]/60 transition-colors hover:text-[#f5f0e8]"
            href={link.href}
            key={`${label}-${link.label}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default PublicAppShell;
