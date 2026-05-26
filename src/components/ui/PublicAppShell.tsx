import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

const navigation = [
  { href: "/create-report", label: "Buat Laporan" },
  { href: "/pricing", label: "Harga" },
  { href: "/learn-report", label: "Panduan" },
  { href: "/#status", label: "Status" },
] as const;

export function PublicAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f5ee] text-[#10231b]">
      <PublicAppNav />
      {children}
      <PublicAppFooter />
    </div>
  );
}

export function PublicAppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e1d5] bg-[#f7f5ee]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link aria-label="NaLI beranda" className="flex min-h-[44px] items-center gap-2.5" href="/">
          <span className="relative h-7 w-7 overflow-hidden rounded-md border border-[#e7e1d5]">
            <Image alt="NaLI" className="object-cover" fill src="/images/nali-logo-mark.png" unoptimized />
          </span>
          <span className="text-[17px] font-semibold text-[#10231b]">NaLI</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              className="inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-[#315f45] transition-colors hover:bg-[#e7e1d5]/55 hover:text-[#10231b]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            className="inline-flex min-h-[44px] items-center px-2.5 text-sm font-medium text-[#315f45] md:hidden"
            href="/pricing"
          >
            Harga
          </Link>
          <Link
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-[#315f45] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#274d38]"
            href="/create-report"
          >
            <span className="sm:hidden">Buat</span>
            <span className="hidden sm:inline">Buat Laporan</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicAppFooter() {
  return (
    <footer className="border-t border-[#e7e1d5] bg-[#f1eee5] px-4 py-9 sm:px-6">
      <div className="mx-auto grid max-w-[1120px] gap-8 text-sm sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="font-semibold text-[#10231b]">NaLI</p>
          <p className="mt-2 max-w-[270px] leading-6 text-[#536259]">
            Draft laporan berbasis bahan pengguna. Batas bukti tetap terlihat dan pemeriksaan akhir tetap milik
            pengguna.
          </p>
        </div>
        <FooterGroup
          label="Produk"
          links={[
            { href: "/create-report", label: "Buat Laporan" },
            { href: "/pricing", label: "Harga" },
            { href: "/learn-report", label: "Panduan" },
          ]}
        />
        <FooterGroup
          label="NaLI"
          links={[
            { href: "/learn-report", label: "Evidence Boundary" },
            { href: "/learn-report", label: "Integritas Akademik" },
            { href: "/privacy", label: "Privacy" },
          ]}
        />
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-[#536259] uppercase">Status CP1</p>
          <ul className="mt-3 space-y-2 text-[#536259]">
            <li>Payment belum aktif</li>
            <li>Upload belum aktif</li>
            <li>Source verification belum aktif</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ label, links }: { label: string; links: ReadonlyArray<{ href: string; label: string }> }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-[#536259] uppercase">{label}</p>
      <nav aria-label={label} className="mt-3 flex flex-col gap-1">
        {links.map((link) => (
          <Link
            className="inline-flex min-h-[44px] items-center text-[#315f45] transition-colors hover:text-[#10231b]"
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
