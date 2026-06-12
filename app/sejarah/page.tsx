import type { Metadata } from "next";
import { CategoryView } from "@/components/CategoryView";

export const metadata: Metadata = {
  title: "Sejarah",
  description:
    "Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang, dibaca ulang dengan hati-hati.",
  openGraph: {
    title: "Sejarah | NaLI by NatIve",
    description:
      "Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function SejarahPage() {
  return (
    <CategoryView
      category="sejarah"
      index="02"
      title="Sejarah"
      description="Jejak kota tua, arsip kolonial, dan ingatan yang nyaris hilang, dibaca ulang dengan hati-hati terhadap sumber."
    />
  );
}
