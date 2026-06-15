import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageBackdrop } from "@/components/PageBackdrop";
import { DynamicWaveBackground } from "@/components/ui/dynamic-wave-canvas-background";
import { TentangSection, type TentangStat } from "@/components/TentangSection";
import { getAllArticles, getAllSources, getAllFieldNotes } from "@/lib/content";
import { SERIES } from "@/lib/series";
import { SITE } from "@/lib/site";

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
  const articles = await getAllArticles();
  const stats: TentangStat[] = [
    { value: articles.length, label: "Artikel terbit" },
    { value: getAllSources().length, label: "Sumber terverifikasi" },
    { value: SERIES.length, label: "Seri editorial" },
    { value: getAllFieldNotes().length, label: "Catatan riset" },
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
      <TentangSection stats={stats} author={SITE.author} />
    </div>
  );
}
