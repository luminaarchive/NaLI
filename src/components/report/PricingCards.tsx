import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { REPORT_PACKAGES } from "@/lib/billing/reportPackages";

export function PricingCards() {
  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white">Paket Laporan</h3>
        <p className="mt-1.5 text-xs leading-5 text-white/50">
          Harga persiapan CP1. Pembayaran dan checkout belum aktif di CP1.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {REPORT_PACKAGES.map((reportPackage) => (
          <article
            key={reportPackage.id}
            className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-bold text-white">{reportPackage.label}</h4>
                <p className="mt-1 text-sm leading-5 text-white/55">{reportPackage.publicCopy}</p>
              </div>
              <Badge tone="glass">Laporan</Badge>
            </div>

            <p className="mt-5 text-2xl font-extrabold text-white">
              Rp{new Intl.NumberFormat("id-ID").format(reportPackage.priceIdr)}
            </p>

            <ul className="mt-5 flex-1 space-y-2 text-xs text-white/55">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/60" aria-hidden="true" />
                <span>{reportPackage.reportsIncluded} laporan termasuk dalam paket</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/60" aria-hidden="true" />
                <span>Unduhan publik PDF/DOCX tetap terkunci di CP1</span>
              </li>
            </ul>

            <div className="mt-6 border-t border-white/[0.04] pt-4">
              <Button className="h-11 w-full text-xs font-semibold" disabled type="button" variant="outline">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Belum aktif
              </Button>
            </div>
          </article>
        ))}
      </div>

      <p className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4 text-xs leading-6 text-amber-200/70">
        Laporan kamu habis. Pilih paket untuk lanjut. Pesan ini disiapkan untuk peluncuran mendatang; tidak ada
        pembelian atau saldo laporan yang diberikan saat ini.
      </p>
    </div>
  );
}
