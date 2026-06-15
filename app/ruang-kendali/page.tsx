import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { LivingDashboard } from "@/components/dashboard/LivingDashboard";
import { getLivingStats } from "@/lib/living-engine";

export const metadata: Metadata = {
  title: "Ruang Kendali",
  description:
    "Ruang kendali NaLI, snapshot langsung dari basis bukti: jurnal, arsip sumber, investigasi, dan bukti yang masih kami cari. Angka dihitung dari data nyata.",
  alternates: { canonical: "/ruang-kendali" },
  openGraph: {
    title: "Ruang Kendali | NaLI by NatIve",
    description:
      "Snapshot langsung dari basis bukti NaLI: jurnal, arsip sumber, investigasi, dan bukti yang masih dicari.",
    type: "website",
  },
};

// Match the other data pages: always fresh, no build-time database dependency.
export const dynamic = "force-dynamic";

export default async function RuangKendaliPage() {
  const stats = await getLivingStats();

  return (
    <div className="theme-metodologi relative">
      <PageHeader
        eyebrow="Living Knowledge Engine"
        title="Ruang Kendali"
        description="Bukan beranda berita. Ini panel operasi riset NaLI: berapa bukti yang sudah terkumpul, berapa yang masih kami buru, dan apa yang bergerak hari ini."
      />

      <div className="container-editorial py-12 sm:py-16">
        <LivingDashboard stats={stats} />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Link
            href="/jurnal"
            className="border border-dashed border-ink/40 p-5 transition-colors hover:bg-ink-wash"
          >
            <p className="label text-ink">Telusuri Jurnal</p>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Katalog publikasi nyata dengan DOI, sumber, dan tautan unduh resmi.
            </p>
          </Link>
          <Link
            href="/arsip-sumber"
            className="border border-dashed border-ink/40 p-5 transition-colors hover:bg-ink-wash"
          >
            <p className="label text-ink">Buka Arsip Sumber</p>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Setiap entri bisa ditelusuri, lengkap dengan keandalan dan batasannya.
            </p>
          </Link>
          <Link
            href="/peta-eksplorasi"
            className="border border-dashed border-ink/40 p-5 transition-colors hover:bg-ink-wash"
          >
            <p className="label text-ink">Lihat Peta Eksplorasi</p>
            <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">
              Graf hubungan antar topik, sumber, dan tulisan. Everything connects.
            </p>
          </Link>
        </div>

        <p className="mt-10 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
          Ruang kendali ini adalah modul pertama dari NaLI V2. Modul berikutnya
          (graf interaktif, peta Indonesia, garis waktu, misi riset) dibangun satu
          per satu agar tiap bagian benar-benar matang sebelum yang berikut dimulai.
        </p>
      </div>
    </div>
  );
}
