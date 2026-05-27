import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { PricingCards } from "@/components/report/PricingCards";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.pricing.title,
  description: siteMetadata.routes.pricing.description,
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <PublicAppShell>
      <main className="flex-1">
        {/* Header section */}
        <section className="px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-12 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            {/* Top Warning Banner */}
            <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm leading-6 text-amber-200">
              <p className="font-semibold text-center">
                NaLI saat ini dalam public alpha non-paid. Pembayaran dan checkout belum aktif di CP1. Paket berbayar akan dibuka setelah alpha selesai.
              </p>
            </div>

            <span className="inline-flex min-h-8 items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#00FFB3] uppercase">
              Paket Laporan CP1
            </span>
            <h1 className="mt-6 max-w-[680px] text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
              Paket Laporan NaLI
            </h1>
            <p className="mt-4 max-w-[680px] text-sm leading-6 text-[#a1b3a8]">
              Siapkan kapasitas untuk laporan cepat atau laporan lengkap. NaLI menggunakan satu unit yang mudah
              dipahami: Laporan.
            </p>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1040px]">
            <PricingCards />
          </div>
        </section>

        {/* Usage Rules */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[760px]">
            <h2 className="text-center text-2xl font-serif font-bold text-[#f5f0e8] tracking-tight">Aturan penggunaan Laporan</h2>
            <p className="mt-2 text-center text-xs text-[#a1b3a8]/60">
              Disiapkan sekarang untuk peluncuran mendatang, tetap tidak aktif di CP1.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Buat laporan baru", detail: "Menggunakan 1 laporan setelah berhasil dibuat" },
                { label: "Buat ulang dari awal", detail: "Menggunakan 1 laporan setelah berhasil dibuat" },
                { label: "Edit manual hasil", detail: "Tidak menggunakan laporan tambahan" },
                { label: "Salin hasil yang sama", detail: "Tidak menggunakan laporan tambahan" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#14261c] bg-[#08100c]/40 px-5 py-5 transition-all duration-300 hover:border-[#00FFB3]/25">
                  <div>
                    <p className="text-sm font-bold text-[#f5f0e8]">{item.label}</p>
                    <p className="mt-2 text-xs leading-5 text-[#a1b3a8]/70">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs leading-5 text-[#a1b3a8]/50">
              Kegagalan server atau blok integritas/rate limit tidak memotong laporan.
            </p>
          </div>
        </section>

        {/* Call to action */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1040px] flex-col gap-6 rounded-3xl border border-[#14261c] bg-[#08100c]/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 relative overflow-hidden group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFB3]/5 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            <div className="relative z-10 space-y-2">
              <ShieldCheck className="h-6 w-6 text-[#00FFB3]" aria-hidden="true" />
              <h2 className="text-2xl font-serif font-bold text-[#f5f0e8] tracking-tight">Mulai dengan jalur starter gratis.</h2>
              <p className="max-w-[620px] text-xs leading-5 text-[#a1b3a8]">
                Draf awal membutuhkan materi pengguna dan selalu menampilkan batas bukti. Tidak ada pembelian yang
                diproses di CP1.
              </p>
            </div>
            <Link
              href="/create-report"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00FFB3] px-6 text-xs font-bold text-[#060b08] hover:bg-[#00e6a1] hover:shadow-[0_0_15px_rgba(0,255,179,0.25)] transition-all duration-200 relative z-10"
            >
              Buat Laporan
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
