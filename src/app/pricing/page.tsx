import type { Metadata } from "next";
import { PricingContent } from "./PricingContent";

export const metadata: Metadata = {
  title: "NaLI — Harga",
  description:
    "Mulai gratis dengan 3 laporan per bulan. Upgrade ke Sapling Rp 45.000 atau Forest Keeper Rp 149.000 untuk laporan tak terbatas dan ekspor PDF.",
};

export default function PricingPage() {
  return <PricingContent />;
}
