import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { IndonesiaMap } from "@/components/IndonesiaMap";
import { getGeoMarkers } from "@/lib/geo";
import { CATEGORY_LABEL, type Category } from "@/lib/types";

export const metadata: Metadata = {
  title: "Peta Indonesia",
  description:
    "Peta skematis lokasi liputan NaLI di Indonesia, diplot dari koordinat nyata tempat yang dikenal. Tanpa pelacak, tanpa pustaka peta berat.",
  alternates: { canonical: "/peta-indonesia" },
  openGraph: {
    title: "Peta Indonesia | NaLI",
    description: "Peta skematis lokasi liputan NaLI, privacy-first dan ringan.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const LEGEND: { cat: Category; color: string }[] = [
  { cat: "alam", color: "#2DD4A7" },
  { cat: "sejarah", color: "#3B82F6" },
  { cat: "investigasi", color: "#F97316" },
];

export default async function PetaIndonesiaPage() {
  const markers = await getGeoMarkers();

  return (
    <div className="theme-alam relative">
      <PageHeader
        eyebrow="Modul 3"
        title="Peta Indonesia"
        description="Di mana bukti itu berpijak. Tiap titik adalah tulisan yang tertambat ke tempat nyata, diplot tanpa pustaka peta berat dan tanpa melacak siapa pun."
      />

      <div className="container-editorial py-12 sm:py-16">
        <div className="mb-5 flex flex-wrap gap-4">
          {LEGEND.map((l) => (
            <span key={l.cat} className="inline-flex items-center gap-2 font-mono text-[0.74rem] text-ink/80">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: l.color }} aria-hidden="true" />
              {CATEGORY_LABEL[l.cat]}
            </span>
          ))}
          <span className="font-mono text-[0.74rem] text-gray">{markers.length} titik terplot</span>
        </div>

        <IndonesiaMap markers={markers} />
      </div>
    </div>
  );
}
