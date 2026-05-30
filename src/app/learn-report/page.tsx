import type { Metadata } from "next";
import { LearnReportContent } from "./LearnReportContent";

export const metadata: Metadata = {
  title: "NaLI — Panduan",
  description:
    "Panduan lengkap cara menggunakan NaLI untuk menyusun laporan lapangan, praktikum biologi, dan laporan KKN berbasis bukti.",
};

export default function LearnReportPage() {
  return <LearnReportContent />;
}
