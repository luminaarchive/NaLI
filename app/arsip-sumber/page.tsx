import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { SourceArchive } from "@/components/SourceArchive";
import { getAllSources } from "@/lib/content";

export const metadata: Metadata = {
  title: "Arsip Sumber",
  description:
    "Sumber terverifikasi yang dipakai NaLI, jurnal, laporan lembaga, arsip, dataset, buku, dan media. Setiap entri punya metadata, catatan keandalan, dan batasannya sendiri.",
  alternates: { canonical: "/arsip-sumber" },
  openGraph: {
    title: "Arsip Sumber | NaLI by NatIve",
    description:
      "Sumber terverifikasi yang dipakai NaLI, jurnal, laporan lembaga, arsip, dataset, buku, dan media.",
    type: "website",
  },
};

export default function ArsipSumberPage() {
  const sources = getAllSources();

  return (
    <div className="theme-arsip relative">
      <PageHeader
        eyebrow="Transparansi"
        title="Arsip Sumber"
        description="Rujukan yang menopang tulisan kami, terbuka untuk diperiksa, dengan catatan keandalan dan batasan tiap sumber. Saring berdasarkan tipe, topik, atau tingkat keandalan."
      />

      <div className="container-editorial py-12">
        {sources.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">Arsip sumber masih kosong.</p>
        ) : (
          <SourceArchive sources={sources} />
        )}
      </div>
    </div>
  );
}
