import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CreateReportForm } from "@/components/report/CreateReportForm";
import { AuroraMesh } from "@/components/ui/AuroraMesh";
import { Badge } from "@/components/ui/Badge";

export default function CreateReportPage() {
  return (
    <div className="min-h-screen bg-[#050806] text-stone-50">
      <div className="relative isolate overflow-hidden">
        <AuroraMesh className="opacity-75" />
        <div className="topography-grid absolute inset-0 opacity-35" aria-hidden="true" />

        <header className="relative z-10 border-b border-white/10 bg-[#050806]/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1160px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link className="inline-flex items-center gap-2 text-sm font-semibold text-stone-300 hover:text-white" href="/">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Kembali
            </Link>
            <span className="text-sm font-semibold text-stone-300">NaLI Learn & Report</span>
          </div>
        </header>

        <main className="relative z-10 mx-auto max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-[720px]">
            <Badge tone="cyan">Create Report MVP</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-[0] sm:text-5xl">Mulai Susun Laporan</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
              Masukkan bahan yang kamu punya, atau mulai dari nol. NaLI membantu menyusun struktur tanpa membuat data
              palsu.
            </p>
            <div className="mt-4 hidden gap-3 rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-300 sm:flex">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-data-cyan" aria-hidden="true" />
              <p>
                Masukkan bahan yang kamu punya. NaLI menyusun draft, bukan membuat data. Belum punya bahan? NaLI akan
                membuat panduan observasi, bukan laporan final.
              </p>
            </div>
          </div>

          <CreateReportForm />
        </main>
      </div>
    </div>
  );
}
