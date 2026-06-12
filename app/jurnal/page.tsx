import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { JurnalList } from "@/components/JurnalList";
import { getAllJournalEntries } from "@/lib/jurnal";

export const metadata: Metadata = {
  title: "Jurnal",
  description:
    "Perpustakaan pengetahuan alam NaLI: catatan ringkas tentang satwa, geologi, laut, hutan, dan iklim Indonesia. Setiap entri pendek, bersumber, dan menyebut batasannya.",
  alternates: { canonical: "/jurnal" },
  openGraph: {
    title: "Jurnal | NaLI by NatIve",
    description:
      "Perpustakaan pengetahuan alam NaLI: catatan ringkas tentang satwa, geologi, laut, hutan, dan iklim Indonesia, masing-masing bersumber.",
    type: "website",
  },
};

export default function JurnalPage() {
  const entries = getAllJournalEntries().map((e) => ({
    slug: e.slug,
    title: e.title,
    dek: e.dek,
    category: e.category,
    topics: e.topics,
    geography: e.geography,
    confidence: e.confidence,
    readingMinutes: e.readingMinutes,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Perpustakaan pengetahuan alam"
        title="Jurnal"
        description="Catatan pendek tentang alam Indonesia dan dunia: satwa, geologi, laut, hutan, dan iklim. Lebih ringkas daripada artikel, tetapi tetap menumpang pada arsip sumber yang dapat diperiksa."
      />

      <div className="container-editorial py-12">
        {entries.length === 0 ? (
          <p className="font-mono text-[0.85rem] text-gray">Jurnal masih kosong.</p>
        ) : (
          <JurnalList entries={entries} />
        )}
      </div>
    </>
  );
}
