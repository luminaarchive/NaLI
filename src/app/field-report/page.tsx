import type { Metadata } from "next";
import { FileText, MapPin, Camera, Thermometer, ClipboardList, BookMarked, BarChart2, Map } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: "Field Report Builder | NaLI Wildlife Intelligence",
  description: "Susun laporan survei biodiversitas terstruktur dari catatan lapangan multiple observasi satwa liar Indonesia secara bertahap.",
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/field-report`,
  },
};

const INPUT_ITEMS = [
  { icon: FileText, text: "Observasi spesies individual" },
  { icon: MapPin, text: "Koordinat GPS dan elevasi" },
  { icon: Camera, text: "Deskripsi habitat dan kondisi" },
  { icon: Thermometer, text: "Tanggal, waktu, cuaca" },
  { icon: ClipboardList, text: "Metode survey yang digunakan" },
];

const OUTPUT_ITEMS = [
  { icon: BookMarked, text: "Executive summary biodiversitas" },
  { icon: ClipboardList, text: "Tabel spesies teridentifikasi" },
  { icon: BarChart2, text: "Analisis habitat dan ancaman" },
  { icon: Map, text: "Rekomendasi konservasi" },
  { icon: BookMarked, text: "Referensi ilmiah relevan" },
];

const COMING_SOON = [
  "Multi-observasi dalam satu sesi survey",
  "Export ke format standar survey lapangan",
  "Template survey untuk 5 gunung pilot",
  "Tabel spesies otomatis dari catatan lapangan",
  "Integrasi koordinat GPS ke peta distribusi",
];

export default function FieldReportPage() {
  return (
    <PublicAppShell>
      <main className="flex-1 px-4 pt-20 pb-16 sm:px-6 lg:px-8 bg-[#060b08]">
        <div className="mx-auto max-w-[1040px]">

          {/* Hero */}
          <div className="text-center mb-10">
            <Badge tone="teal" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 mb-4">
              Segera Hadir
            </Badge>
            <h1 className="mt-4 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
              Field Report Builder
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[#a1b3a8]">
              Susun laporan survei biodiversitas dari catatan lapangan multiple observasi menjadi dokumen ilmiah terstruktur.
            </p>
          </div>

          {/* Alpha alert */}
          <Alert className="mb-12 border-[#00FFB3]/25 bg-[#00FFB3]/8 p-5 text-[#f5f0e8] max-w-[760px] mx-auto">
            <AlertDescription className="text-xs leading-6 text-[#a1b3a8]/80">
              Fitur ini dalam <span className="text-[#00FFB3] font-medium">pengembangan aktif</span>. Saat ini tersedia preview konsep. Fungsionalitas penuh menyusul setelah public alpha.
            </AlertDescription>
          </Alert>

          {/* Input vs Output */}
          <div className="grid gap-6 md:grid-cols-2 max-w-[960px] mx-auto">
            {/* Input Card */}
            <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#f5f0e8] mb-4">Catatan Lapangan Kamu</h3>
                <div className="flex flex-col gap-3">
                  {INPUT_ITEMS.map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-[#a1b3a8] flex-shrink-0" />
                      <span className="text-sm text-[#a1b3a8]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Card */}
            <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-8 flex flex-col justify-between ring-1 ring-[#00FFB3]/20">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Laporan Terstruktur NaLI</h3>
                  <Badge tone="teal" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                    Preview
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  {OUTPUT_ITEMS.map(item => (
                    <div key={item.text} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                      <span className="text-sm text-[#a1b3a8]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview CTA */}
          <div className="mt-12 text-center max-w-[600px] mx-auto">
            <ButtonLink
              href="/"
              className="w-full bg-[#1e3525] border border-[#14261c] text-[#f5f0e8] hover:bg-[#162d1d] hover:text-[#00FFB3] transition-colors"
            >
              Mulai dari Chat →
            </ButtonLink>
            <p className="mt-3 text-xs text-[#a1b3a8]/50">
              Gunakan composer di beranda untuk memulai laporan field survey kamu sekarang.
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-24 border-t border-[#14261c] pt-16">
            <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] sm:text-3xl mb-10">
              Segera Hadir
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-[1040px] mx-auto">
              {COMING_SOON.map(item => (
                <div key={item} className="rounded-2xl border border-[#14261c] bg-[#08100c] p-5 opacity-60">
                  <Badge tone="glass" className="text-[9px] px-1.5 py-0 mb-2">Segera Hadir</Badge>
                  <p className="text-sm text-[#a1b3a8]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </PublicAppShell>
  );
}
