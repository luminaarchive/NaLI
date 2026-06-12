import Link from "next/link";
import { NAV_LINKS, SECONDARY_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="hairline" />
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold text-ink-black">
              NaLI <span className="text-ink">by NatIve</span>
            </p>
            <p className="mt-3 max-w-sm font-mono text-[0.8rem] leading-relaxed text-gray">
              Nature · Archive · Lore · Investigation. Jurnal riset terbuka
              berbasis AI tentang Indonesia — setiap klaim bersumber.
            </p>
            <p className="label mt-5">Setiap klaim diberi label keyakinan</p>
          </div>

          <nav aria-label="Jelajah">
            <p className="label mb-4 text-ink-deep">Jelajah</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-mono text-[0.8rem] text-ink transition-colors hover:text-ink-deep hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Publikasi">
            <p className="label mb-4 text-ink-deep">Publikasi</p>
            <ul className="space-y-2.5">
              {SECONDARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-mono text-[0.8rem] text-ink transition-colors hover:text-ink-deep hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hairline" />
        <div className="flex flex-col gap-2 py-6 font-mono text-[0.7rem] text-gray-light sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Disusun oleh {SITE.author}.
          </p>
          <p className="uppercase tracking-label text-ink/70">
            Open-source evidence journal · AI-assisted · bersumber
          </p>
        </div>
      </div>
    </footer>
  );
}
