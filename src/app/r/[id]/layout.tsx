import type { Metadata } from "next";

// Shared reports may contain sensitive species-location data — never index them.
// Applies to the report page AND the not-found page rendered within this segment.
export const metadata: Metadata = {
  title: "Laporan NaLI (Hanya-baca)",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function PublicReportLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0A0A0A] text-[#f5f0e8]">{children}</div>;
}
