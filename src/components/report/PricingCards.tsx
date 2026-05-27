import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { REPORT_PACKAGES } from "@/lib/billing/reportPackages";

export function PricingCards() {
  return (
    <div className="w-full space-y-8">
      {/* Paket Laporan */}
      <div className="grid gap-6 sm:grid-cols-3">
        {REPORT_PACKAGES.map((reportPackage) => {
          const isPro = reportPackage.id === "pro";
          return (
            <Card
              key={reportPackage.id}
              className={`flex flex-col rounded-3xl border bg-[#08100c]/40 p-6 shadow-[0_6px_28px_rgba(0,0,0,0.3)] transition-all duration-300 hover:bg-[#0b1a12]/30 group relative overflow-hidden ${
                isPro ? "border-[#00FFB3] shadow-[0_0_24px_rgba(0,255,179,0.1)]" : "border-[#14261c]"
              }`}
            >
              {/* Highlight background glow for Pro */}
              {isPro && (
                <div className="absolute -inset-0.5 bg-gradient-to-b from-[#00FFB3]/5 to-transparent opacity-100 transition duration-500" />
              )}
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-serif font-bold text-[#f5f0e8]">{reportPackage.label}</CardTitle>
                      <CardDescription className="mt-1.5 text-xs text-[#a1b3a8]">{reportPackage.publicCopy}</CardDescription>
                    </div>
                    <Badge tone={isPro ? "teal" : "glass"}>Laporan</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-[#f5f0e8]">
                      Rp{new Intl.NumberFormat("id-ID").format(reportPackage.priceIdr)}
                    </p>

                    <ul className="mt-6 space-y-3.5 text-xs leading-5 text-[#a1b3a8]">
                      <li className="flex gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00FFB3]" aria-hidden="true" />
                        <span>{reportPackage.reportsIncluded} laporan termasuk dalam paket</span>
                      </li>
                      <li className="flex gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00FFB3]" aria-hidden="true" />
                        <span>Unduhan publik PDF/DOCX tetap terkunci di CP1</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-0 mt-8 border-t border-[#14261c] pt-4 bg-transparent">
                  <Button
                    className="h-11 w-full text-xs font-bold border-[#14261c] text-[#a1b3a8]/60 cursor-not-allowed hover:bg-transparent"
                    disabled
                    type="button"
                    variant="outline"
                  >
                    <LockKeyhole className="h-3.5 w-3.5 text-[#a1b3a8]/40 mr-1.5" aria-hidden="true" />
                    Belum dapat dibeli {/* Belum aktif */}
                  </Button>
                </CardFooter>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="rounded-2xl border border-[#14261c] bg-[#14261c]/20 p-5 text-xs leading-6 text-[#a1b3a8]">
        Laporan kamu habis. Pilih paket untuk lanjut. Pesan ini disiapkan untuk peluncuran mendatang; tidak ada
        pembelian atau saldo laporan yang diberikan saat ini. Pembayaran dan checkout belum aktif di CP1.
      </p>
    </div>
  );
}
