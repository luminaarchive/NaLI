import type { Metadata } from "next";
import Link from "next/link";
import { Database, Fingerprint, Archive, Layers3, ClipboardCheck, Route } from "lucide-react";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { REPORT_PACKAGES } from "@/lib/billing/reportPackages";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.home.title,
  description: siteMetadata.routes.home.description,
  alternates: {
    canonical: siteMetadata.canonicalBase,
  },
};

const features = [
  {
    icon: Database,
    title: "Intelligence Fusion",
    description: "Gabungkan temuan lapangan dengan data ilmiah untuk kredibilitas optimal.",
  },
  {
    icon: Fingerprint,
    title: "Laporan Biodiversitas",
    description: "Generate laporan terstruktur dari catatan lapanganmu secara instan.",
  },
  {
    icon: Archive,
    title: "Laporan Tersimpan",
    description: "Semua laporanmu tersimpan aman secara lokal dan bisa diakses kapan saja.",
  },
  {
    icon: Layers3,
    title: "Dual Mode",
    description: "Mode Publik untuk belajar mandiri, Mode Profesional untuk riset mendalam.",
  },
  {
    icon: ClipboardCheck,
    title: "13 Profil Pengguna",
    description: "Disesuaikan untuk berbagai peran, dari ranger kehutanan hingga fotografer satwa liar.",
  },
  {
    icon: Route,
    title: "Pilot Mountains",
    description: "Mulai dari 5 gunung prioritas konservasi tinggi di Indonesia.",
  },
] as const;

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <PublicAppShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 pt-20 pb-16 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto flex max-w-[800px] flex-col items-center text-center relative z-10">
            <h1 className="text-[44px] leading-[1.1] font-serif font-bold text-[#f5f0e8] sm:text-[60px] tracking-tight">
              Mau bikin laporan apa?
            </h1>
            <p className="mt-5 max-w-[610px] text-xs leading-6 text-[#a1b3a8]">
              Draf belajar penulisan laporan berbasis bukti dengan batas bukti yang jelas.
              Bukti yang belum tersedia tetap ditandai, bukan dibuat-buat.
            </p>

            {/* Composer Card Box */}
            <HomeQueryBox />

            {/* Social Proof Strip */}
            <p className="mt-8 text-xs text-[#a1b3a8]/60 font-medium tracking-wide">
              5 gunung pilot: Semeru &middot; Merbabu &middot; Lawu &middot; Sindoro-Sumbing &middot; Rinjani
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-t border-[#14261c] bg-[#030604]/20 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <div className="text-center max-w-[600px] mx-auto mb-16">
              <h2 className="text-3xl font-serif font-bold text-[#f5f0e8] tracking-tight">
                Fitur Utama Sistem NaLI
              </h2>
              <p className="mt-4 text-sm text-[#a1b3a8]">
                Menggabungkan data lapangan dengan kaidah integritas akademik untuk penulisan ilmiah yang valid.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    className="border border-[#14261c] bg-[#08100c] text-[#f5f0e8] rounded-2xl p-6 transition-all duration-300 hover:border-[#00FFB3]/30 hover:bg-[#0b1a12] group hover:shadow-[0_0_24px_rgba(0,255,179,0.12)]"
                  >
                    <CardHeader className="p-0 mb-4 flex flex-row items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#14261c]/40 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#00FFB3]/10">
                        <Icon className="h-5 w-5 text-[#00FFB3]" />
                      </div>
                      <CardTitle className="font-serif text-lg font-bold text-[#f5f0e8]">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className="text-xs leading-6 text-[#a1b3a8]">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works & Limits */}
        <section className="border-t border-[#14261c] bg-[#08100c]/40 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px] grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex min-h-8 items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#00FFB3] uppercase">
                Alur Sistem
              </span>
              <h2 className="mt-6 text-3xl font-serif font-bold text-[#f5f0e8] tracking-tight">
                Cara kerja singkat
              </h2>
              <p className="mt-4 text-xs leading-6 text-[#a1b3a8]">
                NaLI menyusun draft penulisan yang jujur dan transparan untuk membantu penulisan akademik dan lapangan.
              </p>
              
              <ol className="mt-8 space-y-4 text-xs leading-6 text-[#a1b3a8]">
                {[
                  "Pengguna menginput deskripsi topik atau materi observasi awal.",
                  "NaLI menyusun draft laporan yang memetakan bukti serta ketidakpastian.",
                  "Pengguna melakukan verifikasi mandiri, pengeditan, dan penyempurnaan draft.",
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#14261c] text-[10px] font-bold text-[#00FFB3] border border-[#14261c]">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-xs leading-6 text-amber-200">
                <p>NaLI tidak membuat data atau sitasi palsu. AI inference bukan bukti lapangan.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 sm:p-8">
              <h3 className="text-lg font-serif font-bold text-[#f5f0e8]">Batas Sistem & Status Fitur (CP1)</h3>
              <p className="mt-2 text-xs text-[#a1b3a8]/60">
                Dalam rilis MVP CP1, beberapa fitur operasional masih dibatasi demi menjaga keamanan data dan biaya.
              </p>
              
              <ul className="mt-6 space-y-4 text-xs text-[#a1b3a8]">
                {[
                  { label: "CP1: pembayaran belum aktif", desc: "Tidak ada transaksi pembayaran uang riil yang diproses di sistem." },
                  { label: "Upload belum aktif", desc: "Unggah dokumen PDF/Foto dinonaktifkan sementara untuk validasi input terstruktur." },
                  { label: "Source verification belum aktif", desc: "Verifikasi referensi otomatis via API luar masih dikunci." },
                ].map((item) => (
                  <li key={item.label} className="border-b border-[#14261c] pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-[#f5f0e8] block">{item.label}</span>
                    <span className="text-xs text-[#a1b3a8]/70 mt-1 block">{item.desc}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-6 border-t border-[#14261c]">
                <Link
                  href="/pricing"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#14261c] bg-transparent px-5 text-xs font-bold text-[#a1b3a8] hover:text-[#00FFB3] hover:border-[#00FFB3]/40 transition-all duration-200"
                >
                  Lihat Harga &amp; Aturan
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="border-t border-[#14261c] bg-[#060b08] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-8 sm:p-10 relative overflow-hidden group shadow-[0_0_40px_rgba(0,255,179,0.02)]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFB3]/5 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
              <div className="relative z-10">
                <p className="text-xs font-bold tracking-[0.15em] text-[#00FFB3] uppercase">
                  Mulai gratis. Paket berbayar segera hadir.
                </p>
                <h2 className="mt-4 text-3xl font-serif font-bold text-[#f5f0e8] tracking-tight">
                  Fleksibilitas untuk Kebutuhan Konservasi
                </h2>
                
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {REPORT_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="rounded-xl border border-[#14261c] bg-[#0b1a12]/50 p-5 text-left flex flex-col justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#f5f0e8]">{pkg.label}</p>
                        <p className="mt-2 text-[11px] leading-relaxed text-[#a1b3a8]">
                          {pkg.publicCopy}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#14261c]">
                        <p className="text-xs text-[#a1b3a8]/60">Harga</p>
                        <p className="text-base font-bold text-[#00FFB3] mt-1">
                          Rp{new Intl.NumberFormat("id-ID").format(pkg.priceIdr)}
                        </p>
                        <span className="mt-3 block w-full rounded-lg bg-[#14261c] py-2 text-center text-[10px] font-bold text-[#a1b3a8]/50 select-none">
                          Belum dapat dibeli
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-8 text-xs leading-6 text-[#a1b3a8]/50">
                  Pembayaran dan checkout belum aktif di CP1. Semua pengguna mendapatkan akses preview draft gratis secara lokal.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
