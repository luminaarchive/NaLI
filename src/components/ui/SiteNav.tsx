import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/learn-report", label: "Learn & Report" },
  { href: "/field-intelligence", label: "Field Intelligence" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav({ dark = false }: { dark?: boolean }) {
  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        dark ? "border-[#27382f] bg-[#07100B]/95 text-stone-50" : "border-[#DDD5C7] bg-[#F7F3EA]/92 text-[#111814]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-baseline gap-2" href="/">
          <span className="min-w-0">
            <span className="block text-lg font-semibold leading-none tracking-[0]">NaLI</span>
          </span>
          <span className={`hidden text-xs sm:block ${dark ? "text-stone-400" : "text-[#5F6B62]"}`}>by NatIve</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold md:flex">
          {links.map((link) => (
            <Link
              className={dark ? "text-stone-300 hover:text-white" : "text-forest-700 hover:text-forest-950"}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ButtonLink className="hidden sm:inline-flex" href="/create-report" variant={dark ? "dark" : "primary"}>
          Mulai
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#DDD5C7] bg-[#F5F1E8] px-4 py-8 text-[#5F6B62] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p>
          <span className="font-semibold text-[#111814]">NaLI</span> menyusun draft berbasis bahan. Validasi akhir
          tetap manusia.
        </p>
        <div className="flex flex-wrap gap-4 font-semibold">
          <Link href="/learn-report">Learn & Report</Link>
          <Link href="/field-intelligence">Field Intelligence</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/create-report">Create Report</Link>
        </div>
      </div>
    </footer>
  );
}
