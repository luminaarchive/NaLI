import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { LivingDashboard } from "@/components/dashboard/LivingDashboard";
import { DiscoveryScore } from "@/components/DiscoveryScore";
import { getLivingStats } from "@/lib/living-engine";
import { PILLARS } from "@/lib/site";

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

const V2_LINKS: { href: string; title: string; blurb: string }[] = [
  { href: "/linimasa", title: "Linimasa", blurb: "Garis waktu peristiwa yang tahunnya tertulis pasti, tertaut ke artikel dan sumber." },
  { href: "/peta-indonesia", title: "Peta Indonesia", blurb: "Peta skematis lokasi liputan, diplot dari koordinat nyata. Ringan, tanpa pelacak." },
  { href: "/koneksi", title: "Koneksi", blurb: "Entitas paling terhubung di basis pengetahuan. Everything connects." },
  { href: "/bukti-dicari", title: "Bukti Dicari", blurb: "Tulisan yang buktinya masih perlu diperkuat, beserta batasannya yang kami akui." },
  { href: "/misi", title: "Misi Riset", blurb: "Celah riset terbuka dan bukti yang masih dibutuhkan. Tanpa akun." },
  { href: "/aktivitas", title: "Aktivitas", blurb: "Apa yang bergerak di basis bukti tiap hari, dari data nyata." },
  { href: "/banding", title: "Banding Sumber", blurb: "Sandingkan dua sumber berdampingan dan nilai sendiri." },
  { href: "/peta-eksplorasi", title: "Peta Eksplorasi", blurb: "Graf hubungan antar topik, sumber, dan tulisan." },
  { href: "/jurnal", title: "Jurnal", blurb: "Katalog publikasi nyata dengan DOI dan tautan unduh resmi." },
];

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

        <div className="mt-10">
          <DiscoveryScore
            totalArsip={stats.totalArsip}
            topics={PILLARS.map((p) => ({ slug: p.key, label: p.title }))}
          />
        </div>

        <h2 className="mt-12 font-display text-2xl text-ink-black">Modul NaLI V2</h2>
        <p className="mt-2 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
          Setiap modul adalah cara berbeda untuk menjelajah bukti yang sama. Semua
          dibangun dari data nyata, bukan angka karangan.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {V2_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="border border-dashed border-ink/40 p-5 transition-colors hover:bg-ink-wash"
            >
              <p className="label text-ink">{l.title}</p>
              <p className="mt-2 font-mono text-[0.78rem] leading-relaxed text-gray">{l.blurb}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 max-w-2xl font-mono text-[0.78rem] leading-relaxed text-gray">
          Modul dibangun satu per satu agar tiap bagian matang. Graf hubungan penuh
          ada di Peta Eksplorasi; modul berikutnya menyusul.
        </p>
      </div>
    </div>
  );
}
