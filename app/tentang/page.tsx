import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageBackdrop } from "@/components/PageBackdrop";
import { DynamicWaveBackground } from "@/components/ui/dynamic-wave-canvas-background";
import { TentangSection, type TentangStat } from "@/components/TentangSection";
import { getSiteStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Tentang NaLI by NatIve dan pendirinya, jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia.",
  alternates: { canonical: "/tentang" },
  openGraph: {
    title: "Tentang | NaLI by NatIve",
    description:
      "Tentang NaLI by NatIve, jurnal riset terbuka tentang Indonesia.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function TentangPage() {
  const site = await getSiteStats();
  const stats: TentangStat[] = [
    { value: site.artikel, label: "Artikel terbit" },
    { value: site.sumber, label: "Sumber terverifikasi" },
    { value: site.seri, label: "Seri editorial aktif" },
    { value: site.catatanRiset, label: "Catatan riset" },
  ];

  return (
    <div className="theme-tentang relative">
      <PageBackdrop light="opacity-[0.42]">
        <DynamicWaveBackground colorLow={[40, 20, 12]} colorHigh={[180, 92, 56]} />
      </PageBackdrop>
      <PageHeader
        eyebrow="Tentang"
        title="Satu orang, banyak yang belum diceritakan."
        description="NaLI by NatIve adalah jurnal riset terbuka tentang alam, sejarah, dan investigasi Indonesia, disusun dari sumber publik yang dapat ditelusuri."
      />
      <TentangSection stats={stats} />
    </div>
  );
}
