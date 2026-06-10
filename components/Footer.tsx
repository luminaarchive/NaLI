import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";

const SECONDARY = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/peta-eksplorasi", label: "Peta Eksplorasi" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule bg-white">
      <div className="container-editorial grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold text-ink-black">
            NaLI <span className="text-gray">by NatIve</span>
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray">
            Nature · Archive · Lore · Investigation. Jurnal lapangan dan publikasi
            riset berbasis AI tentang Indonesia.
          </p>
          <p className="label mt-5">Setiap klaim diberi label keyakinan</p>
        </div>

        <nav aria-label="Jelajah">
          <p className="label mb-4">Jelajah</p>
          <ul className="space-y-2.5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray transition-colors hover:text-teal-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Publikasi">
          <p className="label mb-4">Publikasi</p>
          <ul className="space-y-2.5">
            {SECONDARY.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray transition-colors hover:text-teal-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-rule">
        <div className="container-editorial flex flex-col gap-2 py-6 text-xs text-gray-light sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Disusun oleh {SITE.author}.
          </p>
          <p className="font-mono uppercase tracking-label">
            Field journal · research publication · AI-assisted
          </p>
        </div>
      </div>
    </footer>
  );
}
