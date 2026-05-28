import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { PublicAppShell } from "@/components/ui/PublicAppShell";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      {/* ALPHA WARNING BANNER */}
      <Alert className="rounded-none border-t-0 border-x-0 border-b border-[#00FFB3]/15 bg-[#00FFB3]/5 py-2 px-4 text-center">
        <AlertDescription className="text-xs sm:text-sm font-bold text-[#00FFB3] leading-none">
          NaLI dalam public alpha non-paid &middot; Pembayaran dan checkout belum aktif di CP1
        </AlertDescription>
      </Alert>

      <main className="flex-1 px-4 pt-16 pb-24 sm:px-6 lg:px-8 bg-[#060b08]">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-[1040px] text-center mb-16">
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#00FFB3]/25 bg-[#00FFB3]/5 px-3.5 py-1 text-xs font-bold tracking-wider text-[#00FFB3] uppercase">
            Pricing
          </span>
          <h1 className="mt-6 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
            Paket Laporan NaLI
          </h1>
          <p className="sr-only">Aturan penggunaan Laporan</p>
          <p className="mx-auto mt-4 max-w-[620px] text-sm leading-6 text-[#a1b3a8]">
            Mulai gratis. Tingkatkan saat kamu siap.
          </p>
        </section>

        {/* PRICING CARDS */}
        <section className="mx-auto max-w-[1040px] grid gap-6 md:grid-cols-3 mb-24">
          {/* FREE: Seeds */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#14261c] bg-[#08100c] p-6 shadow-lg transition-all duration-300 hover:border-[#00FFB3]/20 relative overflow-hidden">
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-[#00FFB3] uppercase tracking-wider">Free</span>
                <Badge tone="teal" className="text-[10px] uppercase px-2 py-0.5">
                  Sekarang Aktif
                </Badge>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#f5f0e8] mb-2">Seeds</h3>
              <p className="text-xs text-[#a1b3a8]/70 leading-relaxed mb-6">
                Untuk belajar mandiri, mahasiswa, dan observasi lapangan cepat.
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-extrabold text-[#f5f0e8]">Rp0</span>
                <span className="text-xs text-[#a1b3a8]/60 ml-1">/bulan</span>
              </div>
              <p className="text-xs font-bold text-[#00FFB3] mb-4">3 laporan cepat/bulan</p>
              
              <ul className="space-y-3.5 text-xs text-[#a1b3a8] border-t border-[#14261c] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Laporan Cepat (Quick Mode)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Chat session tersimpan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Akses spesies database</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <X className="h-4 w-4 text-white/60 flex-shrink-0" />
                  <span className="line-through">Laporan Lengkap</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <X className="h-4 w-4 text-white/60 flex-shrink-0" />
                  <span className="line-through">Export PDF/DOCX</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <X className="h-4 w-4 text-white/60 flex-shrink-0" />
                  <span className="line-through">Prioritas antrian</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-[#14261c] pt-4">
              <Link
                href="/"
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#1e3525] text-xs font-bold text-[#f5f0e8] hover:bg-[#162d1d] transition-all"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>

          {/* HIGHLIGHTED: Sapling */}
          <div className="flex flex-col justify-between rounded-2xl border bg-[#08100c] p-6 shadow-xl relative overflow-hidden ring-1 ring-[#00FFB3]/30">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-[#00FFB3]/5 to-transparent opacity-100" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-[#00FFB3] uppercase tracking-wider">Pro</span>
                <Badge tone="teal" className="text-[10px] uppercase px-2 py-0.5">
                  Direkomendasikan
                </Badge>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#f5f0e8] mb-2">Sapling</h3>
              <p className="text-xs text-[#a1b3a8]/70 leading-relaxed mb-6">
                Untuk peneliti, ranger, dan pembuat laporan terstruktur penuh.
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-extrabold text-[#f5f0e8]">Rp45.000</span>
                <span className="text-xs text-[#a1b3a8]/60 ml-1">/bulan</span>
              </div>
              <p className="text-xs font-bold text-[#00FFB3] mb-4">Laporan Lengkap unlimited</p>
              
              <ul className="space-y-3.5 text-xs text-[#a1b3a8] border-t border-[#14261c] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span className="font-medium text-[#f5f0e8]">Semua fitur Seeds</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Laporan Lengkap (Deep Mode)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Export PDF/DOCX</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Prioritas antrian</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Species Intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Field Report Builder</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-[#14261c] pt-4 relative z-10">
              <button
                type="button"
                disabled
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#0b1a12] border border-[#14261c] text-xs font-bold text-[#a1b3a8]/40 cursor-not-allowed"
              >
                Belum dapat dibeli
              </button>
            </div>
          </div>

          {/* ORGANIZATIONAL: Forest Keeper */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#14261c] bg-[#08100c] p-6 shadow-lg transition-all duration-300 hover:border-[#00FFB3]/20 relative overflow-hidden">
            <div>
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-bold text-[#00FFB3] uppercase tracking-wider">Enterprise</span>
                <Badge tone="glass" className="text-[10px] uppercase px-2 py-0.5">
                  Untuk Tim & NGO
                </Badge>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#f5f0e8] mb-2">Forest Keeper</h3>
              <p className="text-xs text-[#a1b3a8]/70 leading-relaxed mb-6">
                Untuk lembaga survei biodiversitas, kelompok konservasi, dan kelompok KKN.
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-extrabold text-[#f5f0e8]">Rp149.000</span>
                <span className="text-xs text-[#a1b3a8]/60 ml-1">/bulan</span>
              </div>
              <p className="text-xs font-bold text-[#00FFB3] mb-4">Unlimited + tim</p>
              
              <ul className="space-y-3.5 text-xs text-[#a1b3a8] border-t border-[#14261c] pt-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span className="font-medium text-[#f5f0e8]">Semua fitur Sapling</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Hingga 5 anggota tim</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Shared session history</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#00FFB3] flex-shrink-0" />
                  <span>Custom pilot mountain data</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 border-t border-[#14261c] pt-4">
              <button
                type="button"
                disabled
                className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#0b1a12] border border-[#14261c] text-xs font-bold text-[#a1b3a8]/40 cursor-not-allowed"
              >
                Belum dapat dibeli
              </button>
            </div>
          </div>
        </section>

        {/* FEATURE COMPARISON TABLE */}
        <section className="mx-auto max-w-[840px] mb-24">
          <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] tracking-tight mb-8">
            Perbandingan Detail Fitur
          </h2>
          <div className="overflow-x-auto rounded-xl border border-[#14261c] bg-[#08100c]/40">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#14261c] bg-[#0b1a12]">
                  <th className="p-4 font-bold text-[#f5f0e8]">Fitur</th>
                  <th className="p-4 font-bold text-[#f5f0e8]">Seeds</th>
                  <th className="p-4 font-bold text-[#f5f0e8]">Sapling</th>
                  <th className="p-4 font-bold text-[#f5f0e8]">Forest Keeper</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14261c]">
                {[
                  { name: "Laporan Cepat (Quick Mode)", seeds: true, sapling: true, keeper: true },
                  { name: "Laporan Lengkap (Deep Mode)", seeds: false, sapling: true, keeper: true },
                  { name: "Export PDF/DOCX", seeds: false, sapling: true, keeper: true },
                  { name: "Chat Session Tersimpan", seeds: true, sapling: true, keeper: true },
                  { name: "Akses Spesies Database", seeds: true, sapling: true, keeper: true },
                  { name: "Fitur Kolaborasi Tim", seeds: false, sapling: false, keeper: true },
                  { name: "Kustomisasi Pilot Mountain", seeds: false, sapling: false, keeper: true },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-[#0b1a12]/30">
                    <td className="p-4 font-semibold text-[#f5f0e8]">{row.name}</td>
                    <td className="p-4">
                      {row.seeds ? (
                        <Check className="h-4 w-4 text-[#00FFB3]" />
                      ) : (
                        <X className="h-4 w-4 text-[#a1b3a8]/25" />
                      )}
                    </td>
                    <td className="p-4">
                      {row.sapling ? (
                        <Check className="h-4 w-4 text-[#00FFB3]" />
                      ) : (
                        <X className="h-4 w-4 text-[#a1b3a8]/25" />
                      )}
                    </td>
                    <td className="p-4">
                      {row.keeper ? (
                        <Check className="h-4 w-4 text-[#00FFB3]" />
                      ) : (
                        <X className="h-4 w-4 text-[#a1b3a8]/25" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mx-auto max-w-[760px]">
          <h2 className="text-center font-serif text-2xl font-bold text-[#f5f0e8] tracking-tight mb-8">
            Pertanyaan Umum
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="faq-1" className="border border-[#14261c] bg-[#08100c]/40 rounded-xl px-4">
              <AccordionTrigger className="text-[#f5f0e8] hover:text-[#00FFB3] py-4">
                Kapan paket berbayar dibuka?
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-[#a1b3a8] pb-4">
                Setelah fase public alpha selesai. Kamu akan diberitahu terlebih dahulu melalui email sebelum pembayaran diaktifkan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border border-[#14261c] bg-[#08100c]/40 rounded-xl px-4">
              <AccordionTrigger className="text-[#f5f0e8] hover:text-[#00FFB3] py-4">
                Apakah data lapangan saya aman?
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-[#a1b3a8] pb-4">
                Ya. Semua data tersimpan di Supabase dengan enkripsi. Batas bukti tetap milik pengguna — NaLI tidak mengklaim kepemilikan atas observasi lapangan kamu.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border border-[#14261c] bg-[#08100c]/40 rounded-xl px-4">
              <AccordionTrigger className="text-[#f5f0e8] hover:text-[#00FFB3] py-4">
                Apa perbedaan Laporan Cepat dan Laporan Lengkap?
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-[#a1b3a8] pb-4">
                Laporan Cepat menghasilkan ringkasan singkat dalam hitungan detik. Laporan Lengkap melakukan analisis mendalam dengan referensi ilmiah, konteks habitat, dan rekomendasi konservasi.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border border-[#14261c] bg-[#08100c]/40 rounded-xl px-4">
              <AccordionTrigger className="text-[#f5f0e8] hover:text-[#00FFB3] py-4">
                Apakah ada diskon untuk peneliti dan NGO?
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-[#a1b3a8] pb-4">
                Kami sedang merancang program khusus untuk institusi penelitian dan NGO konservasi Indonesia. Hubungi kami untuk informasi lebih lanjut.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="border border-[#14261c] bg-[#08100c]/40 rounded-xl px-4">
              <AccordionTrigger className="text-[#f5f0e8] hover:text-[#00FFB3] py-4">
                Bagaimana cara kerja paket tim Forest Keeper?
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-[#a1b3a8] pb-4">
                Forest Keeper memungkinkan hingga 5 anggota tim berbagi workspace, session history, dan data pilot mountain. Cocok untuk tim ranger, peneliti lapangan, atau NGO kecil.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CALL TO ACTION */}
        <section className="mx-auto max-w-[1040px] mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-[#14261c] bg-[#08100c] p-8 text-center sm:p-12">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFB3]/5 to-transparent opacity-30" />
            <h2 className="relative z-10 text-3xl font-serif font-bold text-[#f5f0e8] tracking-tight mb-4">
              Siap menyusun laporan lapangan?
            </h2>
            <p className="relative z-10 mx-auto max-w-[540px] text-xs text-[#a1b3a8] leading-relaxed mb-8">
              Mulai secara gratis di fase public alpha ini. Draf awal menyertakan disclaimers dan batas bukti secara transparan.
            </p>
            <div className="relative z-10 flex justify-center">
              <Link
                href="/create-report"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#00FFB3] px-6 text-xs font-bold text-[#060b08] hover:bg-[#00e6a1] transition-all"
              >
                Buat Laporan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}
