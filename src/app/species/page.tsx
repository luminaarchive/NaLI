import type { Metadata } from "next";
import { SpeciesClient } from "@/components/report/SpeciesClient";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: "Inteligensi Spesies | NaLI Wildlife Intelligence",
  description: "Riset mendalam untuk satwa liar Indonesia. Dapatkan data status konservasi IUCN, sebaran habitat, ancaman, dan rekomendasi aksi.",
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/species`,
  },
};

export default function SpeciesPage() {
  return (
    <PublicAppShell>
      <main className="flex-1 px-4 pt-20 pb-16 sm:px-6 lg:px-8 bg-[#060b08]">
        <div className="mx-auto max-w-[1040px] text-center">
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#00FFB3] uppercase">
            Intelligence Fusion
          </span>
          <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
            Inteligensi Spesies
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[#a1b3a8] mb-12">
            Riset mendalam untuk satwa liar Indonesia. Masukkan nama spesies, kawasan, atau topik konservasi.
          </p>

          <SpeciesClient />
        </div>
      </main>
    </PublicAppShell>
  );
}
