import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Users, Leaf } from "lucide-react";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.home.title,
  description: siteMetadata.routes.home.description,
  alternates: {
    canonical: siteMetadata.canonicalBase,
  },
};

const painPoints = [
  {
    icon: "📓",
    title: "Catatan tersebar",
    description:
      "Data di buku lapangan, foto di HP, referensi di laptop. Susah disatukan jadi laporan yang koheren.",
  },
  {
    icon: "📐",
    title: "Format yang membingungkan",
    description:
      "IMRaD, APA, atau format kampus? Mahasiswa semester akhir pun masih bingung struktur yang benar.",
  },
  {
    icon: "🔍",
    title: "Klaim tanpa bukti",
    description:
      "Laporan ditolak dosen karena klaim tidak didukung data. NaLI menandai ini sebelum kamu kirim.",
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
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#4a6455]">
              NaLI Learn &amp; Report
            </p>
            <h1 className="mb-4 font-serif text-[clamp(28px,4.5vw,48px)] font-semibold leading-[1.15] text-[#1e3525]">
              Ubah catatan lapangan jadi laporan ilmiah
            </h1>
            <p className="mb-3 max-w-[560px] text-sm sm:text-base leading-relaxed text-[#4a6455] font-medium">
              NaLI membantu mahasiswa biologi, ranger, dan peneliti lapangan menyusun laporan berbasis bukti — bukan template kosong.
            </p>
            <p className="mb-8 text-xs text-[#4a6455]/70">
              Tidak perlu kartu kredit &middot; 3 laporan gratis per bulan
            </p>

            <HomeQueryBox />

            <Link
              href="/create-report"
              className="mt-4 inline-flex min-h-[48px] w-full max-w-[420px] items-center justify-center gap-2 rounded-xl bg-[#1e3525] px-6 text-sm font-semibold text-white transition hover:bg-[#162d1d]"
            >
              Buat Laporan Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Agentic Work Plan Preview */}
            <div className="mt-8 w-full max-w-[620px] rounded-2xl border border-[#1e3525]/12 bg-white/50 p-5 text-left shadow-[0_4px_20px_rgba(30,53,37,0.04)] backdrop-blur-sm">
              <h3 className="mb-3.5 font-serif text-xs font-bold uppercase tracking-wider text-[#1e3525]">
                Rencana Kerja NaLI
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  "Membaca konteks input",
                  "Mengidentifikasi jenis laporan",
                  "Memetakan klaim dan bukti",
                  "Menandai bukti yang kurang",
                  "Menyusun struktur laporan",
                  "Membuat draft awal",
                  "Mengecek batas klaim",
                  "Menyiapkan hasil",
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#4a6455]">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1e3525]/10 text-[9px] font-bold text-[#1e3525]">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside
              aria-label="Batas bukti"
              className="mt-6 w-full max-w-[620px] border-t border-[#1e3525]/10 pt-5 text-center text-xs leading-6 text-[#4a6455]"
            >
              <p className="font-medium text-[#1e3525]/80">
                NaLI membedakan bukti pengguna, inferensi AI, dan bukti yang belum tersedia.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/learn-report">
                  Cara kerja lengkap
                </Link>
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/field-intelligence">
                  Field Intelligence (roadmap)
                </Link>
                <Link className="font-medium text-[#1e3525] underline-offset-4 hover:underline" href="/pricing">
                  Harga
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="border-t border-[#1e3525]/10 bg-white/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <h2 className="text-center font-serif text-2xl font-bold text-[#1e3525] mb-12 tracking-tight">
              Kenapa laporan lapangan selalu jadi beban?
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {painPoints.map((p) => (
                <div
                  key={p.title}
                  className="rounded-2xl border border-[#1e3525]/12 bg-white/60 p-6 shadow-[0_4px_20px_rgba(30,53,37,0.02)]"
                >
                  <span className="text-2xl mb-3 block">{p.icon}</span>
                  <h3 className="font-serif text-base font-bold text-[#1e3525] mb-2">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-[#4a6455]">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="border-t border-[#1e3525]/10 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px]">
            <h2 className="text-center font-serif text-2xl font-bold text-[#1e3525] mb-12 tracking-tight">
              Cara kerja NaLI
            </h2>
            <div className="grid gap-10 md:grid-cols-3 text-center">
              {howItWorks.map((h) => (
                <div key={h.num} className="space-y-3">
                  <span className="block font-serif text-5xl font-extrabold text-[#1e3525]/15">
                    {h.num}
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#1e3525]">{h.title}</h3>
                  <p className="text-sm leading-relaxed text-[#4a6455] max-w-[280px] mx-auto">
                    {h.description}
                  </p>
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
            <h2 className="text-center font-serif text-2xl font-bold text-[#1e3525] mb-12 tracking-tight">
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
                    <Icon className="h-5 w-5 text-[#1e3525] mb-3" />
                    <h3 className="font-serif text-sm font-bold text-[#1e3525] mb-1">{card.title}</h3>
                    <p className="text-xs leading-relaxed text-[#4a6455]">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* STATUS SECTION */}
        <section id="status" className="border-t border-[#1e3525]/10 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[620px] text-center">
            <h2 className="font-serif text-2xl font-bold text-[#1e3525] tracking-tight mb-4">
              Status Sistem NaLI
            </h2>
            <p className="mb-8 text-xs text-[#4a6455]">
              Pemantauan status kesiapan operasional fitur publik NaLI (Public Alpha).
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              {[
                { label: "Public Alpha", status: "aktif", desc: "Akses publik gratis" },
                { label: "AI engine", status: "kapasitas bisa terbatas", desc: "Kapasitas AI sedang terbatas" },
                { label: "Pembayaran", status: "belum aktif", desc: "Checkout ditangguhkan" },
                { label: "PDF publik", status: "terkunci", desc: "Unduh laporan lokal saja" },
                { label: "Upload", status: "belum aktif", desc: "Materi input via teks/form" },
                { label: "Source verification", status: "belum aktif", desc: "Klaim rujukan diverifikasi manual" },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-[#1e3525]/8 bg-white/80 p-4 shadow-[0_2px_12px_rgba(30,53,37,0.02)]">
                  <span className="block text-xs font-semibold text-[#4a6455] uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#1e3525]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        item.status === "aktif"
                          ? "bg-emerald-500"
                          : item.status === "kapasitas bisa terbatas"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-zinc-400"
                      }`}
                    />
                    {item.status}
                  </span>
                  <span className="mt-1 block text-[11px] text-[#4a6455]/70">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
