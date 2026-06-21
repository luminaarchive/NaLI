import type { Metadata } from "next";
import { CategoryView } from "@/components/CategoryView";

export const metadata: Metadata = {
  title: "Investigasi",
  description:
    "Penelusuran berbasis sumber publik. Tanpa tuduhan tanpa bukti, tanpa kepastian palsu.",
  openGraph: {
    title: "Investigasi | NaLI",
    description:
      "Penelusuran berbasis sumber publik. Tanpa tuduhan tanpa bukti, tanpa kepastian palsu.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function InvestigasiPage() {
  return (
    <CategoryView
      category="investigasi"
      index="03"
      title="Investigasi"
      description="Penelusuran berbasis sumber publik. Tanpa tuduhan tanpa bukti, tanpa kepastian palsu, klaim yang belum kuat diberi label jelas."
    />
  );
}
