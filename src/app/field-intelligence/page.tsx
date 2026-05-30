import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicAppShell } from "@/components/ui/PublicAppShell";

export const metadata: Metadata = {
  title: "Field Intelligence | NaLI",
  description: "Layer profesional NaLI untuk ranger, peneliti, dan tim konservasi. Dalam pengembangan aktif.",
};

export default function FieldIntelligencePage() {
  return (
    <PublicAppShell>
      <main className="flex flex-1 flex-col items-center justify-center bg-[#060b08] px-4 py-24 text-[#f5f0e8]">
        <div className="mx-auto max-w-[560px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00FFB3]/20 bg-[#00FFB3]/5">
            <MapPin className="h-8 w-8 text-[#00FFB3]/70" />
          </div>

          <span className="mb-6 inline-flex items-center rounded-full border border-amber-500/25 bg-amber-500/5 px-3 py-1 text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Roadmap &mdash; Belum Aktif
          </span>

          <h1 className="mb-4 font-serif text-3xl font-bold text-[#f5f0e8]">Field Intelligence</h1>

          <p className="mb-6 text-sm leading-relaxed text-[#a1b3a8]">
            Layer profesional untuk ranger, peneliti lapangan, dan tim konservasi. Field Intelligence dirancang untuk
            mendukung dokumentasi observasi terstruktur, manajemen bukti lapangan, dan ekspor data ilmiah berbasis
            standar Darwin Core.
          </p>

          <p className="mb-6 text-sm leading-relaxed text-[#a1b3a8]">
            Fitur ini mencakup antrian review manusia, penanda integritas data, dan perencanaan rute patroli berbasis
            prioritas. Semua dalam tahap pengembangan aktif setelah sinyal produk dari pengguna publik cukup terkumpul.
          </p>

          <p className="mb-10 text-sm leading-relaxed text-[#a1b3a8]/70">
            Untuk kebutuhan dokumentasi lapangan saat ini, gunakan fitur Buat Laporan yang sudah aktif.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/create-report"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#00FFB3] px-6 text-sm font-semibold text-[#060b08] transition hover:bg-[#00e6a1] sm:w-auto"
            >
              Buat Laporan Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/learn-report"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#14261c] px-6 text-sm font-medium text-[#a1b3a8] transition hover:border-[#00FFB3]/30 hover:text-[#f5f0e8] sm:w-auto"
            >
              Pelajari Cara Kerja NaLI
            </Link>
          </div>
        </div>
      </main>
    </PublicAppShell>
  );
}
