import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Users, Leaf } from "lucide-react";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { buildJsonLdGraph } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "NaLI",
  description:
    "Ubah catatan lapangan jadi laporan ilmiah dalam menit. Gratis untuk mahasiswa, ranger, dan peneliti Indonesia.",
  alternates: {
    canonical: "https://naliai.vercel.app",
  },
};

const painPoints = [
  {
    icon: "📓",
    title: "Catatan tersebar",
    description: "Data di buku lapangan, foto di HP, referensi di laptop. Susah disatukan jadi laporan yang koheren.",
  },
  {
    icon: "📐",
    title: "Format yang membingungkan",
    description: "IMRaD, APA, atau format kampus? Mahasiswa semester akhir pun masih bingung struktur yang benar.",
  },
  {
    icon: "🔍",
    title: "Klaim tanpa bukti",
    description: "Laporan ditolak dosen karena klaim tidak didukung data. NaLI menandai ini sebelum kamu kirim.",
  },
];

const howItWorks = [
  {
    num: "01",
    title: "Input catatan lapangan",
    description: "Tempel catatan, data praktikum, atau hasil survei. Tidak perlu format khusus.",
  },
  {
    num: "02",
    title: "NaLI analisis bukti",
    description: "Klaim dipetakan, bukti diidentifikasi, bagian yang kurang ditandai secara transparan.",
  },
  {
    num: "03",
    title: "Draft laporan siap",
    description: "Laporan terstruktur dengan tabel bukti, catatan inferensi, dan disclaimer integritas.",
  },
];

const userCards = [
  {
    icon: BookOpen,
    title: "Mahasiswa Biologi",
    description: "Laporan praktikum dan skripsi berbasis bukti",
  },
  {
    icon: Leaf,
    title: "Ranger & Petugas KLHK",
    description: "Dokumentasi satwa liar yang terstruktur",
  },
  {
    icon: FileText,
    title: "Peneliti Lapangan",
    description: "Draft jurnal dari data observasi",
  },
  {
    icon: Users,
    title: "Tim KKN Lingkungan",
    description: "Laporan dampak lingkungan dari data survei",
  },
];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <PublicAppShell isHomepage>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <main className="flex flex-1 flex-col bg-[#f5f0e8]">
        {/* HERO SECTION */}
        <section className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 py-12">
          <div className="flex w-full max-w-[680px] flex-col items-center text-center">
            <h1 className="mb-4 font-serif text-[clamp(28px,4.5vw,48px)] leading-[1.15] font-semibold text-[#1e3525]">
              Ubah catatan lapangan jadi laporan ilmiah
            </h1>
            <p className="mb-3 max-w-[560px] text-sm leading-relaxed font-medium text-[#4a6455] sm:text-base">
              NaLI membantu mahasiswa biologi, ranger, dan peneliti lapangan menyusun laporan berbasis bukti — bukan
              template kosong.
            </p>
            <p className="mb-8 text-xs text-[#4a6455]/70">
              Public Alpha &middot; AI aktif &middot; Laporan gratis tersedia
            </p>

            <HomeQueryBox />

            <Link
              href="/create-report"
              className="mt-4 inline-flex min-h-[48px] w-full max-w-[420px] items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-6 text-sm font-semibold text-white transition hover:bg-[#162d1d]"
            >
              Buat Laporan Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-4 text-xs text-[#4a6455]/60">
              Tidak perlu kartu kredit &middot; 3 laporan gratis per bulan
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#4a6455]">
              <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/learn-report">
                Cara kerja
              </Link>
              <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/pricing">
                Harga
              </Link>
              <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/field-notes">
                Catatan lapangan
              </Link>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="border-t border-[#1e3525]/10 bg-white/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <h2 className="mb-12 text-center font-serif text-2xl font-bold tracking-tight text-[#1e3525]">
              Kenapa laporan lapangan selalu jadi beban?
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {painPoints.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-[#1e3525]/12 bg-white/60 p-6 shadow-[0_4px_20px_rgba(30,53,37,0.02)]"
                >
                  <span className="mb-3 block text-2xl">{p.icon}</span>
                  <h3 className="mb-2 font-serif text-base font-bold text-[#1e3525]">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-[#4a6455]">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="border-t border-[#1e3525]/10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <h2 className="mb-12 text-center font-serif text-2xl font-bold tracking-tight text-[#1e3525]">
              Cara kerja NaLI
            </h2>
            <div className="grid gap-10 text-center md:grid-cols-3">
              {howItWorks.map((h) => (
                <div key={h.num} className="space-y-3">
                  <span className="block font-serif text-5xl font-extrabold text-[#1e3525]/15">{h.num}</span>
                  <h3 className="font-serif text-base font-bold text-[#1e3525]">{h.title}</h3>
                  <p className="mx-auto max-w-[280px] text-sm leading-relaxed text-[#4a6455]">{h.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center">
              <Link
                href="/learn-report"
                className="text-sm font-medium text-[#1e3525] underline-offset-4 hover:underline"
              >
                Lihat panduan lengkap &rarr;
              </Link>
            </p>
          </div>
        </section>

        {/* WHO IS IT FOR SECTION */}
        <section className="border-t border-[#1e3525]/10 bg-white/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <h2 className="mb-12 text-center font-serif text-2xl font-bold tracking-tight text-[#1e3525]">
              Untuk siapa NaLI dibuat?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {userCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-[#1e3525]/12 bg-white/60 p-5 shadow-[0_4px_20px_rgba(30,53,37,0.02)]"
                  >
                    <Icon className="mb-3 h-5 w-5 text-[#1e3525]" />
                    <h3 className="mb-1 font-serif text-sm font-bold text-[#1e3525]">{card.title}</h3>
                    <p className="text-xs leading-relaxed text-[#4a6455]">{card.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/create-report"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-8 text-sm font-semibold text-white transition hover:bg-[#162d1d]"
              >
                Mulai Sekarang — Gratis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
