import type { Metadata } from "next";
import { siteMetadata } from "@/lib/seo/siteMetadata";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: siteMetadata.routes.pricing.title,
  description: siteMetadata.routes.pricing.description,
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/pricing`,
  },
};
import { SiteFooter } from "@/components/ui/SiteNav";
import { PricingShell } from "@/components/ui/PricingShell";
import { PricingCards } from "@/components/report/PricingCards";
import { Clock3 } from "lucide-react";

export default function PricingPage() {
  return (
    <PricingShell>
      <main className="relative z-10">
        {/* Header */}
        <section className="border-b border-white/[0.06] px-4 pt-28 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <Badge tone="green">Beta pricing</Badge>
            <h1 className="mt-4 max-w-[720px] text-4xl font-bold tracking-tight text-white sm:text-5xl">
              NaLI Monetization
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/50">
              Paket kredit dan top-up instan untuk menyusun draf laporan terstruktur secara akademis dan berbasis bukti.
            </p>
            <p className="mt-3 text-xs text-white/35 max-w-[720px]">
              Export unlocks after confirmed payment. If confirmation is delayed, the order stays pending until automated verification succeeds.
            </p>
            <div className="mt-4 rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-3 max-w-[720px]">
              <p className="text-xs leading-5 text-amber-300/70">
                Pembayaran otomatis belum aktif di fase testing ini. Paket kredit ditampilkan untuk simulasi harga dan persiapan rilis berbayar.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards Component */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <PricingCards />
          </div>
        </section>

        {/* One-Time Value Anchors */}
        <section className="border-t border-white/[0.06] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px]">
            <h3 className="text-xl font-semibold text-white text-center">Mulai dari pembayaran kecil</h3>
            <p className="mt-2 text-xs text-white/40 text-center">
              Target harga rilis berbayar — belum aktif di fase testing ini.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Export Markdown", price: "Rp5.000–9.000", credits: "5–10 kredit" },
                { label: "Export PDF laporan pendek", price: "Rp9.000", credits: "15 kredit" },
                { label: "Laporan praktikum / observasi rapi", price: "Rp19.000", credits: "~20 kredit" },
                { label: "Report + evidence check", price: "Rp29.000", credits: "~30 kredit" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white/80">{item.label}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{item.credits}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400/80">{item.price}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/30 text-center">
              Rencana harga CP1. Harga final dapat berubah sebelum rilis berbayar.
            </p>
          </div>
        </section>

        {/* Segment Copy */}
        <section className="border-t border-white/[0.06] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <h3 className="text-xl font-semibold text-white">Cocok untuk</h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Mahasiswa praktikum dan observasi lapangan",
                "Mahasiswa lingkungan, geografi, biologi",
                "Laporan KKN / kegiatan kampus",
                "Staf NGO/CSR junior yang butuh draft laporan cepat",
              ].map((segment) => (
                <div key={segment} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 text-left">
                  {segment}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Try MVP */}
        <section className="border-t border-white/[0.06] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Clock3 className="h-6 w-6 text-white/30" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-semibold text-white">Coba workspace NaLI terlebih dahulu.</h2>
              <p className="mt-3 max-w-[720px] text-sm leading-7 text-white/40">
                Penyusunan kerangka awal dan draf laporan berbasis bukti memerlukan material observasi pengguna yang sesungguhnya. Coba secara gratis hari ini.
              </p>
            </div>
            <ButtonLink href="/create-report">Buka Workspace</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PricingShell>
  );
}
