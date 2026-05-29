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
              className={`flex flex-col rounded-3xl border bg-white p-6 shadow-[0_4px_24px_rgba(30,53,37,0.03)] transition-all duration-300 hover:bg-[#1e3525]/2 group relative overflow-hidden ${
                isPro ? "border-[#1e3525] shadow-[0_4px_24px_rgba(30,53,37,0.06)]" : "border-[#1e3525]/12"
              }`}
            >
              {/* Highlight background glow for Pro */}
              {isPro && (
                <div className="absolute -inset-0.5 bg-gradient-to-b from-[#1e3525]/5 to-transparent opacity-100 transition duration-500" />
              )}
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <CardHeader className="p-0 mb-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg font-serif font-bold text-[#1e3525]">{reportPackage.label}</CardTitle>
                      <CardDescription className="mt-1.5 text-xs text-[#4a6455]">{reportPackage.publicCopy}</CardDescription>
                    </div>
                    <Badge tone={isPro ? "teal" : "glass"}>Laporan</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-[#1e3525]">
                      Rp{new Intl.NumberFormat("id-ID").format(reportPackage.priceIdr)}
                    </p>

                    <ul className="mt-6 space-y-3.5 text-xs leading-5 text-[#4a6455]">
                      <li className="flex gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1e3525]" aria-hidden="true" />
                        <span>{reportPackage.reportsIncluded} Laporan termasuk dalam paket</span>
                      </li>
                      <li className="flex gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1e3525]" aria-hidden="true" />
                        <span>PDF ekspor publik belum aktif</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="p-0 mt-8 border-t border-[#1e3525]/12 pt-4 bg-transparent">
                  <Button
                    className="h-11 w-full text-xs font-bold border-[#1e3525]/12 text-[#4a6455]/60 cursor-not-allowed hover:bg-transparent"
                    disabled
                    type="button"
                    variant="outline"
                  >
                    <LockKeyhole className="h-3.5 w-3.5 text-[#4a6455]/40 mr-1.5" aria-hidden="true" />
                    Checkout belum aktif  {/* Belum aktif */}
                  </Button>
                </CardFooter>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="rounded-2xl border border-[#1e3525]/12 bg-white/50 p-5 text-xs leading-6 text-[#4a6455]">
        Laporan kamu habis. Pilih paket untuk lanjut. Paket ini adalah konfigurasi harga, belum bisa dibeli. Pembayaran dan checkout belum aktif . PDF ekspor publik belum aktif. Draf laporan dapat disalin atau diunduh secara lokal sebagai Markdown/TXT.
      </p>
    </div>
  );
}
