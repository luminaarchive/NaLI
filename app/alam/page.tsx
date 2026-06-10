import type { Metadata } from "next";
import { CategoryView } from "@/components/CategoryView";

export const metadata: Metadata = {
  title: "Alam",
  description:
    "Ekologi, satwa, dan fenomena lanskap Indonesia — diceritakan dari lapangan, dirujuk ke jurnal.",
  openGraph: {
    title: "Alam | NaLI by NatIve",
    description:
      "Ekologi, satwa, dan fenomena lanskap Indonesia — diceritakan dari lapangan.",
    type: "website",
  },
};

export default function AlamPage() {
  return (
    <CategoryView
      category="alam"
      index="01"
      title="Alam"
      description="Ekologi, satwa, dan fenomena lanskap Indonesia — diceritakan dari lapangan, dirujuk ke jurnal."
    />
  );
}
