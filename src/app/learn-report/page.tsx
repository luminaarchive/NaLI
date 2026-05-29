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
    <PublicAppShell isHomepage={true}>
      <main className="flex-1 px-4 pt-20 pb-24 sm:px-6 lg:px-8 bg-[#f5f0e8] text-[#1e3525]">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-[1040px] text-center mb-20">
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#1e3525]/12 bg-[#1e3525]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#1e3525] uppercase">
            Panduan
          </span>
          <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight text-[#1e3525] sm:text-5xl">
            Cara Kerja NaLI
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[#4a6455]">
            Sistem penyusunan laporan berbasis bukti yang transparan, jujur, dan berintegritas. Mulai dari satu topik.
          </p>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="mx-auto max-w-[960px] mb-24">
          <div className="grid gap-10 md:grid-cols-3 text-center">
            {/* Step 1 */}
            <div className="space-y-4">
              <span className="block font-serif text-6xl font-extrabold text-[#1e3525]/20">
                01
              </span>
              <h3 className="font-serif text-lg font-bold text-[#1e3525]">Input Catatan & Bahan</h3>
              <p className="text-xs leading-6 text-[#4a6455] max-w-[280px] mx-auto">
                Paste text materials or start with one topic. Tempel catatan lapangan, lokasi, spesies, atau bahan mentah Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <span className="block font-serif text-6xl font-extrabold text-[#1e3525]/20">
                02
              </span>
              <h3 className="font-serif text-lg font-bold text-[#1e3525]">Penyusunan Terstruktur</h3>
              <p className="text-xs leading-6 text-[#4a6455] max-w-[280px] mx-auto">
                NaLI menyusun input Anda dengan struktur laporan, peta klaim-bukti, dan batasan inferensi. Integrasi data eksternal akan dibuka bertahap.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <span className="block font-serif text-6xl font-extrabold text-[#1e3525]/20">
                03
              </span>
              <h3 className="font-serif text-lg font-bold text-[#1e3525]">Analisis Batas Bukti</h3>
              <p className="text-xs leading-6 text-[#4a6455] max-w-[280px] mx-auto">
                Terima draf laporan yang memisahkan bukti nyata dari inferensi AI, lengkap dengan ceklis bukti yang masih kurang.
              </p>
            </div>
          </div>
        </section>

        {/* EVIDENCE LADDER SECTION */}
        <section className="mx-auto max-w-[840px] mb-24">
          <h2 className="text-center font-serif text-2xl font-bold text-[#1e3525] tracking-tight mb-8">
            Tangga Kualitas Bukti (Evidence Quality Ladder)
          </h2>
          <p className="text-center text-xs text-[#4a6455] mb-12 max-w-[540px] mx-auto leading-relaxed">
            NaLI memetakan seberapa kuat klaim laporan Anda berdasarkan kelengkapan bukti yang disediakan secara bertahap.
          </p>
          <div className="relative border-l border-[#1e3525]/12 ml-4 md:ml-8 pl-6 md:pl-10 space-y-12">
            {[
              {
                step: "Level 1: Ide Awal / Start From Zero",
                desc: "Hanya berupa pertanyaan, topik umum, atau request penulisan. NaLI hanya memberikan panduan awal belajar dan struktur penelitian, belum berupa draf laporan berbasis bukti.",
                badge: "Hanya Panduan"
              },
              {
                step: "Level 2: Draf Berbasis Konteks",
                desc: "Pengguna memberikan catatan/bahan mentah minimal. NaLI menyusun draf awal tetapi menandai batasan klaim yang belum didukung bukti kuat.",
                badge: "Draf Awal"
              },
              {
                step: "Level 3: Draf Dengan Bukti Pengguna",
                desc: "Bahan yang diinput menyertakan bukti spesifik (nama spesies, lokasi, elevasi). NaLI memetakan bukti tersebut ke dalam bab laporan terkait.",
                badge: "Bukti Pengguna"
              },
              {
                step: "Level 4: Draf Dengan Bukti Lebih Kuat",
                desc: "Bukti pengguna diperkuat oleh literatur atau data pendukung lainnya. Status verifikasi ditandai: 'Source verification belum aktif di MVP ini'.",
                badge: "Bukti Kuat"
              },
              {
                step: "Level 5: Field-Grade / Terverifikasi Ahli",
                desc: "Laporan draf telah divalidasi secara manual oleh tim lapangan atau ahli ekologi profesional. (Fitur ini belum aktif di fase CP1).",
                badge: "Coming Soon"
              }
            ].map((ladder, idx) => (
              <div key={idx} className="relative">
                <span className="absolute -left-[35px] md:-left-[51px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-[#1e3525]/12 text-[10px] font-bold text-[#1e3525]">
                  {idx + 1}
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="font-serif text-base font-bold text-[#1e3525]">{ladder.step}</h4>
                  <span className="inline-flex items-center rounded-full bg-[#1e3525]/5 border border-[#1e3525]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#1e3525] w-max">
                    {ladder.badge}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#4a6455]">{ladder.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EVIDENCE BOUNDARY SECTION */}
        <section className="mx-auto max-w-[760px] mb-24">
          <div className="rounded-2xl border border-[#1e3525]/12 bg-white/50 p-6 sm:p-8 shadow-[0_4px_24px_rgba(30,53,37,0.02)]">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="h-6 w-6 text-[#1e3525] flex-shrink-0" />
              <h2 className="font-serif text-xl font-bold text-[#1e3525]">Batas Bukti NaLI</h2>
            </div>
            
            <Alert className="border-[#1e3525]/10 bg-[#1e3525]/3 p-5 text-left mb-6">
              <AlertDescription className="space-y-4 text-xs leading-6 text-[#4a6455]">
                <p>
                  Dokumen ini adalah draf bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa,
                  mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh
                  digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya
                  AI sebagai karya final tanpa revision.
                </p>
                <p>
                  Panduan ini belum menjadi draf laporan berbasis bukti karena bahan observasi atau sumber belum
                  tersedia. Pengguna perlu mengumpulkan data, catatan, foto, sumber, atau hasil pengamatan terlebih
                  dahulu sebelum NaLI dapat menyusun draf laporan.
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
                <div key={item} className="flex gap-2 items-center text-xs text-[#4a6455] bg-white/70 rounded-xl px-4 py-3.5 border border-[#1e3525]/10 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3525] flex-shrink-0" />
                  <span className="font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHAT NALI DOES NOT DO SECTION */}
        <section className="mx-auto max-w-[760px] mb-24">
          <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="h-6 w-6 text-red-700 flex-shrink-0" />
              <h2 className="font-serif text-xl font-bold text-red-700">Yang NaLI Tidak Lakukan di CP1</h2>
            </div>
            <ul className="space-y-4 text-xs text-[#4a6455]">
              <li className="flex gap-3">
                <span className="text-red-700 font-bold select-none">&bull;</span>
                <div>
                  <strong className="text-[#1e3525] block mb-0.5 font-bold">Tidak melakukan verifikasi lapangan otomatis</strong>
                  NaLI tidak memverifikasi keberadaan spesies di lapangan secara fisik. Semua klaim berbasis data sepenuhnya bergantung pada kebenaran catatan yang diinput oleh pengguna.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-700 font-bold select-none">&bull;</span>
                <div>
                  <strong className="text-[#1e3525] block mb-0.5 font-bold">Tidak memfabrikasi atau mengarang bukti</strong>
                  NaLI dilarang keras mengarang koordinat geografis, statistik satwa, tanggal observasi, atau bukti ilmiah palsu. Jika bukti tidak disediakan, NaLI akan mencatatnya sebagai &ldquo;bukti yang masih kurang&rdquo;.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-700 font-bold select-none">&bull;</span>
                <div>
                  <strong className="text-[#1e3525] block mb-0.5 font-bold">Tidak mengklaim validitas literatur secara mutlak</strong>
                  Sistem verifikasi literatur (Crossref/NCBI) belum diaktifkan secara otomatis. Pengguna wajib memverifikasi secara mandiri setiap sitasi dan DOI yang tercantum dalam draf.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-red-700 font-bold select-none">&bull;</span>
                <div>
                  <strong className="text-[#1e3525] block mb-0.5 font-bold">Bukan alat joki tugas atau plagiarisme</strong>
                  NaLI tidak dirancang untuk memotong proses akademik atau mengelabui sistem deteksi plagiarisme. Hasil generator adalah draf bantuan belajar/penulisan berbasis bukti yang wajib diperbaiki dan ditelaah secara kritis oleh pengguna.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="mx-auto max-w-[760px] text-center">
          <h2 className="font-serif text-2xl font-bold text-[#1e3525] mb-4">Siap Memulai?</h2>
          <p className="text-xs text-[#4a6455] mb-8 max-w-[480px] mx-auto leading-relaxed">
            Mulai draf laporan biodiversitas pertamamu sekarang menggunakan input catatan lapangan atau topik observasi.
          </p>
          <div className="flex justify-center">
            <Link
              href="/create-report"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-6 text-xs font-bold text-white hover:bg-[#162d1d] transition-all"
            >
              Mulai Susun Laporan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
