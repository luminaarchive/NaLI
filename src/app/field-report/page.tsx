import type { Metadata } from "next";
import { AlertCircle, FileText, ArrowRight, Shield, Layers, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: "Field Report Builder | NaLI Wildlife Intelligence",
  description: "Susun laporan survei biodiversitas terstruktur dari catatan lapangan multiple observasi satwa liar Indonesia secara bertahap.",
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/field-report`,
  },
};

export default function FieldReportPage() {
  return (
    <PublicAppShell>
      <main className="flex-1 px-4 pt-20 pb-16 sm:px-6 lg:px-8 bg-[#060b08]">
        <div className="mx-auto max-w-[1040px]">
          {/* Hero */}
          <div className="text-center mb-10">
            <span className="inline-flex min-h-8 items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#00FFB3] uppercase">
              Report Builder
            </span>
            <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
              Field Report Builder
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[#a1b3a8]">
              Susun laporan survei biodiversitas dari catatan lapangan multiple observasi.
            </p>
          </div>

          {/* Status Banner */}
          <Alert className="mb-12 border-[#00FFB3]/25 bg-[#00FFB3]/8 p-5 text-[#f5f0e8] max-w-[760px] mx-auto">
            <AlertCircle className="h-5 w-5 text-[#00FFB3] mt-0.5" />
            <div className="ml-3">
              <AlertTitle className="text-sm font-bold text-[#f5f0e8]">Informasi Preview</AlertTitle>
              <AlertDescription className="text-xs leading-6 text-[#a1b3a8]/80 mt-1">
                Fitur ini dalam pengembangan aktif. Saat ini tersedia dalam mode preview terbatas.
              </AlertDescription>
            </div>
          </Alert>

          {/* What it does grid */}
          <div className="grid gap-6 md:grid-cols-2 max-w-[960px] mx-auto">
            {/* Input Card */}
            <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-8 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#f5f0e8] mb-4">Catatan Lapangan Kamu</h3>
                <ul className="space-y-3.5 text-xs text-[#a1b3a8] leading-5">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Observasi spesies individual</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Koordinat GPS dan elevasi</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Foto dan deskripsi habitat</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Tanggal, waktu, dan kondisi cuaca</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Metode survey yang digunakan</span>
                  </li>
                </ul>
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
                <ul className="space-y-3.5 text-xs text-[#a1b3a8] leading-5">
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Executive summary biodiversitas</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Tabel spesies teridentifikasi</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Analisis habitat dan ancaman</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Rekomendasi konservasi</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-[#00FFB3] mt-0.5">•</span>
                    <span>Referensi ilmiah relevan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview CTA */}
          <div className="mt-12 text-center max-w-[600px] mx-auto">
            <ButtonLink
              href="/"
              className="w-full bg-[#1e3525] border border-[#14261c] text-[#f5f0e8] hover:bg-[#162d1d] hover:text-[#00FFB3] transition-colors"
            >
              Mulai dari Chat
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <p className="mt-3 text-xs text-[#a1b3a8]/50">
              Gunakan composer di beranda untuk memulai laporan field survey kamu.
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-24 border-t border-[#14261c] pt-16">
            <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] sm:text-3xl mb-10">
              Segera Hadir
            </h2>
            <div className="grid gap-6 sm:grid-cols-3 max-w-[1040px] mx-auto">
              {/* Card 1 */}
              <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 opacity-60 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Layers className="h-5 w-5 text-[#00FFB3]" />
                    <Badge tone="glass" className="text-[9px] px-1.5 py-0">Segera Hadir</Badge>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#f5f0e8]">Multi-observasi dalam satu sesi</h4>
                  <p className="mt-2 text-xs leading-5 text-[#a1b3a8]">
                    Kombinasikan beberapa temuan lapangan yang berbeda menjadi satu dokumen survei yang komprehensif.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 opacity-60 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="h-5 w-5 text-[#00FFB3]" />
                    <Badge tone="glass" className="text-[9px] px-1.5 py-0">Segera Hadir</Badge>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#f5f0e8]">Export ke format standar survey</h4>
                  <p className="mt-2 text-xs leading-5 text-[#a1b3a8]">
                    Ekspor otomatis ke format lembar data standar yang kompatibel dengan database keanekaragaman hayati.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 opacity-60 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Shield className="h-5 w-5 text-[#00FFB3]" />
                    <Badge tone="glass" className="text-[9px] px-1.5 py-0">Segera Hadir</Badge>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-[#f5f0e8]">Template survey untuk 5 gunung pilot</h4>
                  <p className="mt-2 text-xs leading-5 text-[#a1b3a8]">
                    Gunakan struktur formulir khusus untuk kawasan prioritas Semeru, Merbabu, Lawu, Sindoro, dan Rinjani.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PublicAppShell>
  );
}
