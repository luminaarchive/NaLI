import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Database, Leaf, ShieldAlert, FileSearch, FileText, GraduationCap, CheckCircle2 } from "lucide-react";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.learnReport.title,
  description: siteMetadata.routes.learnReport.description,
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/learn-report`,
  },
};

const capabilities = [
  {
    icon: Leaf,
    title: "Identifikasi Spesies",
    desc: "Nama ilmiah, famili, status konservasi IUCN",
  },
  {
    icon: Database,
    title: "Analisis Habitat",
    desc: "Tipe vegetasi, elevasi, kawasan perlindungan",
  },
  {
    icon: ShieldAlert,
    title: "Konteks Ancaman",
    desc: "Tekanan deforestasi, perburuan, perdagangan ilegal",
  },
  {
    icon: FileSearch,
    title: "Referensi Ilmiah",
    desc: "Sitasi dari literatur yang relevan dengan caveats",
  },
  {
    icon: FileText,
    title: "Laporan Lapangan",
    desc: "Format standar untuk dokumentasi survey",
  },
  {
    icon: GraduationCap,
    title: "Integritas Akademik",
    desc: "Gate khusus untuk penggunaan pendidikan",
  },
] as const;

export default function LearnReportPage() {
  return (
    <PublicAppShell>
      <main className="flex-1 px-4 pt-20 pb-24 sm:px-6 lg:px-8 bg-[#060b08]">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-[1040px] text-center mb-20">
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#00FFB3] uppercase">
            Panduan
          </span>
          <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
            Cara Kerja NaLI
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[#a1b3a8]">
            Intelligence Fusion Logic untuk laporan satwa liar yang akurat dan terpercaya. Mulai dari satu topik.
          </p>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="mx-auto max-w-[960px] mb-24">
          <div className="grid gap-10 md:grid-cols-3 text-center">
            {/* Step 1 */}
            <div className="space-y-4">
              <span className="block font-serif text-6xl font-extrabold text-[#00FFB3]">
                01
              </span>
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Input Observasi</h3>
              <p className="text-xs leading-6 text-[#a1b3a8] max-w-[280px] mx-auto">
                Paste text materials or start with one topic. Deskripsikan spesies yang ditemukan, lokasi, kondisi habitat, dan konteks observasi.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <span className="block font-serif text-6xl font-extrabold text-[#00FFB3]">
                02
              </span>
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Intelligence Fusion</h3>
              <p className="text-xs leading-6 text-[#a1b3a8] max-w-[280px] mx-auto">
                Intelligence Fusion Logic menggabungkan input kamu dengan database spesies, literatur ilmiah, dan konteks lokal Indonesia.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <span className="block font-serif text-6xl font-extrabold text-[#00FFB3]">
                03
              </span>
              <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">Terima Laporan</h3>
              <p className="text-xs leading-6 text-[#a1b3a8] max-w-[280px] mx-auto">
                Laporan biodiversitas dengan batas bukti yang jelas. AI inference dibedakan dari observasi lapangan.
              </p>
            </div>
          </div>
        </section>

        {/* EVIDENCE BOUNDARY SECTION */}
        <section className="mx-auto max-w-[760px] mb-24">
          <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-[#00FFB3] flex-shrink-0" />
              <h2 className="font-serif text-xl font-bold text-[#f5f0e8]">Batas Bukti NaLI</h2>
            </div>
            
            <Alert className="border-[#14261c] bg-[#0b1a12] p-5 text-left mb-6">
              <AlertDescription className="space-y-4 text-xs leading-6 text-[#a1b3a8]">
                <p>
                  Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa,
                  mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh
                  digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya
                  AI sebagai karya final tanpa revisi.
                </p>
                <p>
                  Panduan ini belum menjadi draft laporan berbasis bukti karena bahan observasi atau sumber belum
                  tersedia. Pengguna perlu mengumpulkan data, catatan, foto, sumber, atau hasil pengamatan terlebih
                  dahulu sebelum NaLI dapat menyusun draft laporan.
                </p>
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Bukan hasil akhir",
                "Tanpa referensi buatan",
                "Tanpa fabrikasi data",
                "Verifikasi manusia mutlak",
              ].map((item) => (
                <div key={item} className="flex gap-2 items-center text-xs text-[#a1b3a8] bg-[#0b1a12]/40 rounded-xl px-4 py-3.5 border border-[#14261c]">
                  <CheckCircle2 className="h-4 w-4 text-[#00FFB3]/80 flex-shrink-0" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CAPABILITY CARDS */}
        <section className="mx-auto max-w-[1040px] mb-24">
          <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] tracking-tight mb-12">
            Kemampuan Inteligensi NaLI
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] group"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#14261c]/40 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#00FFB3]/10 mb-4">
                    <Icon className="h-5 w-5 text-[#00FFB3]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#a1b3a8]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="mx-auto max-w-[760px] text-center">
          <h2 className="font-serif text-2xl font-bold text-[#f5f0e8] mb-4">Siap Memulai?</h2>
          <p className="text-xs text-[#a1b3a8] mb-8 max-w-[480px] mx-auto leading-relaxed">
            Mulai draf laporan biodiversitas pertamamu sekarang menggunakan input catatan lapangan atau topik observasi.
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00FFB3] px-6 text-xs font-bold text-[#060b08] hover:bg-[#00e6a1] transition-all"
            >
              Buat Laporan Pertamamu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
