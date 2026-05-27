import type { Metadata } from "next";
import Link from "next/link";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.home.title,
  description: siteMetadata.routes.home.description,
  alternates: {
    canonical: siteMetadata.canonicalBase,
  },
};

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <PublicAppShell isHomepage>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <main className="flex flex-1 flex-col justify-center bg-[#f5f0e8]">
        <section className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 py-12">
          <div className="flex w-full max-w-[680px] flex-col items-center text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#4a6455]">
              NaLI Learn &amp; Report
            </p>
            <h1 className="mb-3 font-serif text-[clamp(28px,4.5vw,52px)] font-semibold leading-[1.15] text-[#1e3525]">
              Apa yang ingin kamu teliti hari ini?
            </h1>
            <p className="mb-8 max-w-[480px] text-base leading-relaxed text-[#4a6455]">
              Susun draft belajar berbasis bahanmu untuk satwa liar dan lingkungan Indonesia.
            </p>

            <HomeQueryBox />

            <aside
              aria-label="Batas bukti"
              className="mt-8 w-full max-w-[620px] border-t border-[#1e3525]/10 pt-5 text-center text-xs leading-6 text-[#4a6455]"
            >
              <p className="font-medium text-[#1e3525]/80">
                Mau bikin laporan apa? NaLI menyusun draft dari bahanmu dengan batas bukti yang jelas.
              </p>
              <p>Bukti yang belum tersedia tetap ditandai, bukan dibuat-buat. AI inference bukan bukti lapangan.</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/learn-report">
                  Cara kerja singkat
                </Link>
                <Link
                  className="font-medium text-[#1e3525] underline-offset-4 hover:underline"
                  href="/field-intelligence"
                >
                  Field Intelligence (roadmap)
                </Link>
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/pricing">
                  Harga alpha
                </Link>
              </div>
              <p className="mt-3 text-[#4a6455]/70">
                CP1: pembayaran belum aktif &middot; Upload belum aktif &middot; Source verification belum aktif
              </p>
            </aside>

            <p className="mt-8 text-xs leading-relaxed text-[#4a6455]/60">
              5 gunung pilot: Semeru &middot; Merbabu &middot; Lawu &middot; Sindoro-Sumbing &middot; Rinjani
            </p>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
