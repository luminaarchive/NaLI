"use client";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
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
              Paket langganan kredit bulanan dan top-up energi instan untuk menyusun draf laporan terstruktur secara akademis dan bebas plagiarisme.
            </p>
            <p className="mt-3 text-xs text-white/35 max-w-[720px]">
              Export unlocks after confirmed payment. If confirmation is delayed, the order stays pending until automated verification succeeds.
            </p>
          </div>
        </section>

        {/* Pricing Cards Component */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <PricingCards />
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
