import type { Metadata } from "next";
import { CategoryView } from "@/components/CategoryView";

export const metadata: Metadata = {
  title: "Alam",
  description:
    "Ekologi, satwa, dan fenomena lanskap Indonesia, dibaca dari jurnal, laporan lembaga, dan observasi peneliti.",
  openGraph: {
    title: "Alam | NaLI by NatIve",
    description:
      "Ekologi, satwa, dan fenomena lanskap Indonesia, dibaca dari rujukan terbuka.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function AlamPage() {
  return (
    <CategoryView
      category="alam"
      index="01"
      title="Alam"
      description="Ekologi, satwa, dan fenomena lanskap Indonesia, dibaca dari jurnal, laporan lembaga, dan observasi peneliti."
    />
  );
}
