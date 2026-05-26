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
      <main>
        <section className="px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-12">
          <div className="mx-auto max-w-[1040px]">
            <span className="inline-flex min-h-8 items-center rounded-full border border-[#c9dccb] bg-[#edf5e9] px-3 py-1 text-xs font-semibold text-[#326043]">
              Paket Laporan CP1
            </span>
            <h1 className="mt-5 max-w-[680px] text-4xl font-semibold tracking-tight text-[#10231b] sm:text-5xl">
              Paket Laporan NaLI
            </h1>
            <p className="mt-4 max-w-[680px] text-base leading-7 text-[#53675e] sm:text-lg">
              Siapkan kapasitas untuk laporan cepat atau laporan lengkap. NaLI menggunakan satu unit yang mudah
              dipahami: Laporan.
            </p>
            <div className="mt-6 max-w-[680px] rounded-2xl border border-[#eadab6] bg-[#fff9eb] p-4">
              <p className="text-sm leading-6 text-[#725522]">
                Pembayaran dan checkout belum aktif di CP1. Paket Laporan ditampilkan untuk persiapan pricing, tanpa
                membuat pembelian atau saldo laporan.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6">
          <div className="mx-auto max-w-[1040px]">
            <PricingCards />
          </div>
        </section>

        <section className="border-t border-[#dbe5da] px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-[760px]">
            <h2 className="text-center text-xl font-semibold text-[#10231b]">Aturan penggunaan Laporan</h2>
            <p className="mt-2 text-center text-sm text-[#64786f]">
              Disiapkan sekarang untuk peluncuran mendatang, tetap tidak aktif di CP1.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Buat laporan baru", detail: "Menggunakan 1 laporan setelah berhasil dibuat" },
                { label: "Buat ulang dari awal", detail: "Menggunakan 1 laporan setelah berhasil dibuat" },
                { label: "Edit manual hasil", detail: "Tidak menggunakan laporan tambahan" },
                { label: "Salin hasil yang sama", detail: "Tidak menggunakan laporan tambahan" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#dbe5da] bg-white px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#10231b]">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[#64786f]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-[#64786f]">
              Kegagalan server atau blok integritas/rate limit tidak memotong laporan.
            </p>
          </div>
        </section>

        <section className="border-t border-[#dbe5da] px-4 py-12 sm:px-6">
          <div className="mx-auto flex max-w-[1040px] flex-col gap-5 rounded-3xl border border-[#dbe5da] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <ShieldCheck className="h-6 w-6 text-[#326043]" aria-hidden="true" />
              <h2 className="mt-3 text-2xl font-semibold text-[#10231b]">Mulai dengan jalur starter gratis.</h2>
              <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#64786f]">
                Draf awal membutuhkan materi pengguna dan selalu menampilkan batas bukti. Tidak ada pembelian yang
                diproses di CP1.
              </p>
            </div>
            <Link
              href="/create-report"
              className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[#163929] px-6 text-sm font-semibold text-white transition hover:bg-[#214b38]"
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
