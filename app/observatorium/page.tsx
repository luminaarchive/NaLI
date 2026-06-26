import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { buildKnowledgeGraph } from "@/lib/graph";
import { ObservatoryListingWrapper } from "@/components/observatory/ObservatoryListingWrapper";

export const metadata: Metadata = {
  title: "Observatorium",
  description:
    "Hub riset terverifikasi, linimasa klaim keyakinan, dan peta bukti ilmiah di seluruh Nusantara.",
  openGraph: {
    title: "Observatorium | NaLI",
    description:
      "Hub riset terverifikasi, linimasa klaim keyakinan, dan peta bukti ilmiah di seluruh Nusantara.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function ObservatoriumPage() {
  const graph = await buildKnowledgeGraph();

  return (
    <>
      <PageHeader
        eyebrow="Arsip"
        title="Observatorium"
        description="Jelajahi hubungan epistemik antara tulisan, seri, dan sumber ilmiah terverifikasi di seluruh Nusantara."
      />

      <div className="container-editorial py-12">
        <section className="mb-14">
          <h2 className="font-display text-2xl text-ink-black">Observatorium Riset</h2>
          <p className="mt-2 max-w-2xl font-mono text-[0.82rem] leading-relaxed text-gray">
            Saring dokumen berdasarkan pilar bahasan atau wilayah geografis. Klik simpul untuk membatasi visualisasi
            ke relasi lokal yang terhubung dengannya.
          </p>
          <div className="mt-5">
            <ObservatoryListingWrapper graph={graph} />
          </div>
        </section>
      </div>
    </>
  );
}
