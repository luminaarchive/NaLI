import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { CompareSources, type CompareSource } from "@/components/CompareSources";
import { getAllSources } from "@/lib/content";
import { SOURCE_TYPE_LABEL, type SourceType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Banding Sumber",
  description:
    "Ruang kerja terbuka: sandingkan dua sumber berdampingan dan baca sendiri. NaLI hanya menyejajarkan bukti, tidak menyimpulkan untukmu.",
  alternates: { canonical: "/banding" },
  openGraph: {
    title: "Banding Sumber | NaLI",
    description: "Sandingkan dua sumber otentik berdampingan, analisis ada di tanganmu.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function BandingPage() {
  const sources = getAllSources();
  const items: CompareSource[] = sources
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => ({
      id: s.slug,
      title: s.title,
      type: SOURCE_TYPE_LABEL[(s.type ?? "lainnya") as SourceType] ?? "Sumber",
      reliability: s.reliability,
      url: s.url || s.archiveUrl || (s.doi ? `https://doi.org/${s.doi}` : undefined),
      body: (s.content ?? "").trim().slice(0, 900),
    }));

  return (
    <div className="theme-metodologi relative">
      <PageHeader
        eyebrow="Modul 12"
        title="Banding Sumber"
        description="Letakkan dua dokumen berdampingan, misalnya catatan resmi dan narasi lokal, lalu nilai sendiri. Mesin tidak menyimpulkan fakta di sini, matamu yang bekerja."
      />

      <div className="container-editorial py-12 sm:py-16">
        <CompareSources sources={items} />
      </div>
    </div>
  );
}
