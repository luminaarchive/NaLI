import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { CreateReportForm } from "@/components/report/CreateReportForm";

export default function CreateReportPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-forest-950">
      <header className="border-stone-200 bg-white border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link className="text-forest-700 hover:text-forest-950 inline-flex items-center gap-2 text-sm font-semibold" href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Link>
          <span className="text-sm font-semibold">NaLI Learn & Report</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-7">
          <p className="text-olive-700 text-xs font-semibold tracking-[0.08em] uppercase">Create Report MVP</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0] sm:text-4xl">Mulai Susun Laporan</h1>
          <p className="text-forest-800 mt-4 max-w-3xl text-base leading-7">
            Pilih template, masukkan bahan yang benar-benar kamu punya, lalu NaLI akan menyusun draft berbasis bahan.
            Empty prompt ditolak karena NaLI tidak membuat laporan tanpa bukti awal.
          </p>
          <div className="border-data-cyan/40 bg-data-cyan/10 text-forest-900 mt-5 flex gap-3 border p-4 text-sm leading-6">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              Draft bantuan belajar/penulisan berbasis bukti. Source verification otomatis belum aktif di MVP ini.
            </p>
          </div>
        </div>

        <CreateReportForm />
      </main>
    </div>
  );
}
