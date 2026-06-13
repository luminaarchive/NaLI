import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PublicationCatalog } from "@/components/PublicationCatalog";
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
    <>
      <PageHeader
        eyebrow="Katalog jurnal dan publikasi ilmiah terbuka"
        title="Jurnal"
        description="Kumpulan jurnal, laporan lembaga, dataset, dan arsip ilmiah nyata tentang alam, konservasi, geologi, dan Indonesia. Tiap entri adalah publikasi asli dari penerbitnya, ditampilkan dengan sampul, judul, dan sinopsis Indonesia dari NaLI. NaLI tidak menulis ulang publikasinya; sinopsis hanya merangkum."
      />

      <div className="mx-auto w-full max-w-[1480px] px-5 sm:px-8 py-12">
        {items.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">Katalog jurnal masih kosong.</p>
        ) : (
          <PublicationCatalog items={items} />
        )}
      </div>
    </>
  );
}
