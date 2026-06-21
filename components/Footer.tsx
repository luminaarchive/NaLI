import Link from "next/link";
import { NaliMark } from "@/components/brand/NaliMark";
import { NAV_LINKS, SECONDARY_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="hairline" />
        <div className="grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 text-ink">
              <NaliMark className="h-9 w-auto" />
              <div className="leading-none">
                <p className="font-display text-xl font-semibold text-ink-black">NaLI</p>
                <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ink/70">
                  Nature Life Intelligence
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm font-mono text-[0.8rem] leading-relaxed text-gray">
              Nature · Life · Intelligence. Jurnal riset terbuka tentang
              Indonesia. Setiap klaim membawa sumber dan batasan.
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
            © {new Date().getFullYear()} {SITE.name}.
          </p>
          <p className="uppercase tracking-label text-ink/70">
            Open-source evidence journal · AI-assisted · bersumber
          </p>
        </div>
      </div>
    </footer>
  );
}
