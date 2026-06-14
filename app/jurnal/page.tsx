import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PublicationCatalog } from "@/components/PublicationCatalog";
import { Callout } from "@/components/Callout";
import { PageBackdrop } from "@/components/PageBackdrop";
import { SmokeBackground } from "@/components/ui/spooky-smoke-animation";
import { getAllPublications } from "@/lib/jurnal";

export const metadata: Metadata = {
  title: "Jurnal",
  description:
    "Katalog jurnal dan publikasi ilmiah terbuka yang dikumpulkan NaLI: jurnal, laporan lembaga, dataset, dan arsip nyata tentang alam, konservasi, geologi, dan Indonesia. Tiap entri menampilkan publikasi asli dengan sinopsis Indonesia.",
  alternates: { canonical: "/jurnal" },
  openGraph: {
    title: "Jurnal | NaLI by NatIve",
    description:
      "Katalog jurnal dan publikasi ilmiah terbuka tentang alam, konservasi, geologi, dan Indonesia, dengan sinopsis Indonesia tiap publikasi.",
    type: "website",
  },
};

export default function JurnalPage() {
  const items = getAllPublications().map((p) => ({
    slug: p.slug,
    title: p.title,
    publisherOrInstitution: p.publisherOrInstitution,
    journalOrCollection: p.journalOrCollection,
    publicationType: p.publicationType,
    year: p.year,
    doi: p.doi,
    synopsis: p.synopsis,
    topics: p.topics,
    geography: p.geography,
    accessType: p.accessType,
    sourceUrl: p.sourceUrl,
    pdfAvailable: Boolean(p.pdfUrl),
    downloadLabel: p.download.label,
    downloadUrl: p.download.primaryUrl,
    coverImage: p.cover.localPath ?? p.cover.imageUrl ?? null,
    coverAlt: p.cover.alt,
    // Academic metadata
    authors: p.authors,
    language: p.language,
    peerReviewed: p.peerReviewed,
    volume: p.volume,
    issue: p.issue,
    pages: p.pages,
    fileSize: p.download.fileSize,
    license: p.license,
    cover: p.cover,
  }));

  return (
    <div className="theme-jurnal relative">
      <PageBackdrop light="opacity-[0.42]">
        <SmokeBackground smokeColor="#5C40A8" />
      </PageBackdrop>
      <PageHeader
        eyebrow="Katalog jurnal dan publikasi ilmiah terbuka"
        title="Jurnal"
        description="Kumpulan jurnal, laporan lembaga, dataset, dan arsip ilmiah nyata tentang alam, sejarah, dan Indonesia. Tiap entri adalah publikasi asli dari penerbitnya, dengan sinopsis Indonesia dari NaLI."
      />

      <div className="container-editorial relative bg-paper/88 py-12">
        {items.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">Katalog jurnal masih kosong.</p>
        ) : (
          <>
            <Callout title="Cara membaca katalog ini" className="mb-8">
              Tiap entri adalah publikasi asli dari penerbitnya — NaLI hanya menambahkan
              sinopsis Indonesia, bukan menulis ulang. Pakai tampilan <strong>Tabel</strong> untuk
              memindai cepat, atau <strong>Kartu</strong> untuk membaca sinopsis tiap entri.
            </Callout>
            <PublicationCatalog items={items} />
          </>
        )}
      </div>
    </div>
  );
}
