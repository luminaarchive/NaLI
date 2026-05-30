import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { PublicAppShell } from "@/components/ui/PublicAppShell";

export const metadata: Metadata = {
  title: "Inteligensi Spesies | NaLI",
  description:
    "Database spesies satwa liar Indonesia dengan status konservasi IUCN, distribusi habitat, dan konteks lokal. Sedang dalam pengembangan.",
  robots: { index: false, follow: false },
};

export default function SpeciesPage() {
  return (
    <PublicAppShell>
      <main className="flex flex-1 flex-col items-center justify-center bg-[#060b08] px-4 py-24 text-[#f5f0e8]">
        <div className="mx-auto max-w-[480px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00FFB3]/20 bg-[#00FFB3]/5">
            <Leaf className="h-8 w-8 text-[#00FFB3]/70" />
          </div>

          <span className="mb-6 inline-flex items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3 py-1 text-xs font-semibold tracking-wider text-[#00FFB3] uppercase">
            Segera Hadir
          </span>

          <h1 className="mb-4 font-serif text-3xl font-bold text-[#f5f0e8]">Inteligensi Spesies</h1>

          <p className="mb-8 text-sm leading-relaxed text-[#a1b3a8]">
            Database spesies satwa liar Indonesia dengan status konservasi IUCN, distribusi habitat, dan konteks lokal.
            Sedang dalam pengembangan aktif.
          </p>

          <p className="mb-8 text-xs text-[#a1b3a8]/70">
            Sementara, gunakan NaLI untuk riset spesies via laporan berbasis catatan lapangan kamu.
          </p>

          <Link
            href="/create-report"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#00FFB3] px-6 text-sm font-semibold text-[#060b08] transition hover:bg-[#00e6a1]"
          >
            Buat Laporan Riset Spesies
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </PublicAppShell>
  );
}
