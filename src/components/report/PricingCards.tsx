import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { REPORT_PACKAGES } from "@/lib/billing/reportPackages";

export function PricingCards() {
  return (
    <div className="w-full space-y-7">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#10231b]">Paket Laporan</h2>
        <p className="mt-2 text-sm leading-6 text-[#64786f]">
          Harga persiapan CP1. Pembayaran dan checkout belum aktif di CP1.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {REPORT_PACKAGES.map((reportPackage) => (
          <article
            key={reportPackage.id}
            className="flex flex-col rounded-3xl border border-[#dbe5da] bg-white p-5 shadow-[0_6px_28px_rgba(23,48,37,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#10231b]">{reportPackage.label}</h3>
                <p className="mt-1 text-sm leading-5 text-[#64786f]">{reportPackage.publicCopy}</p>
              </div>
              <Badge className="border-[#d4e4d5] bg-[#edf5e9] text-[#326043]">Laporan</Badge>
            </div>

            <p className="mt-5 text-2xl font-bold text-[#10231b]">
              Rp{new Intl.NumberFormat("id-ID").format(reportPackage.priceIdr)}
            </p>

            <ul className="mt-5 flex-1 space-y-3 text-xs leading-5 text-[#64786f]">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3b8058]" aria-hidden="true" />
                <span>{reportPackage.reportsIncluded} laporan termasuk dalam paket</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3b8058]" aria-hidden="true" />
                <span>Unduhan publik PDF/DOCX tetap terkunci di CP1</span>
              </li>
            </ul>

            <div className="mt-6 border-t border-[#edf1eb] pt-4">
              <Button className="h-11 w-full text-xs font-semibold" disabled type="button" variant="outline">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Belum aktif
              </Button>
            </div>
          </article>
        ))}
      </div>

      <p className="rounded-2xl border border-[#eadab6] bg-[#fff9eb] p-4 text-sm leading-6 text-[#725522]">
        Laporan kamu habis. Pilih paket untuk lanjut. Pesan ini disiapkan untuk peluncuran mendatang; tidak ada
        pembelian atau saldo laporan yang diberikan saat ini.
      </p>
    </div>
  );
}
