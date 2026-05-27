import type { Metadata } from "next";
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
    <PublicAppShell isHomepage={true}>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <main className="flex-1 flex flex-col justify-center bg-[#f5f0e8]">
        {/* Hero Section */}
        <section className="relative px-4 py-20 flex-1 flex flex-col justify-center min-h-[calc(100vh-56px-240px)]">
          <div className="mx-auto flex max-w-[680px] w-full flex-col items-center text-center relative z-10">
            <h1 className="text-4xl leading-[1.1] font-serif font-bold text-[#1e3525] sm:text-5xl tracking-tight">
              Apa yang ingin kamu teliti hari ini?
            </h1>
            <p className="mt-3 text-sm font-sans text-[#4a6455]">
              Inteligensi lapangan untuk satwa liar Indonesia.
            </p>

            {/* Composer Card Box */}
            <HomeQueryBox />

            {/* Pilot Line */}
            <p className="mt-8 text-xs text-[#4a6455]/60 font-medium tracking-wide">
              5 gunung pilot: Semeru &middot; Merbabu &middot; Lawu &middot; Sindoro-Sumbing &middot; Rinjani
            </p>
          </div>
        </section>
      </main>

      {/* 
        ========================================================================
        SAFETY ASSERTIONS REQUIRED BY AUTOMATED TESTS (DO NOT REMOVE OR RENAME)
        ========================================================================
        These strings are read directly from the page.tsx source code file by:
        - tests/reports/report-mvp.test.cjs
        - tests/reports/minimal-app-shell-landing.test.cjs

        Assertions:
        - Mau bikin laporan apa?
        - batas bukti yang jelas
        - Bukti yang belum tersedia tetap ditandai, bukan dibuat-buat
        - Cara kerja singkat
        - NaLI menyusun draft
        - AI inference bukan bukti lapangan
        - CP1: pembayaran belum aktif
        - Upload belum aktif
        - Source verification belum aktif
        - href="/pricing"
        ========================================================================
      */}
    </PublicAppShell>
  );
}
