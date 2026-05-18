import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateReportForm } from "@/components/report/CreateReportForm";
import { Badge } from "@/components/ui/Badge";

export default function CreateReportPage() {
  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#111814]">
      <header className="border-b border-[#DDD5C7] bg-[#F7F3EA]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#5F6B62] hover:text-[#111814]" href="/">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </Link>
          <span className="text-sm font-semibold text-[#5F6B62]">Learn & Report</span>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-[720px]">
          <Badge tone="paper">Create Report MVP</Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-[0] sm:text-5xl">Mulai Susun Laporan</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5F6B62]">
            Masukkan bahan yang kamu punya, atau mulai dari nol. NaLI menyusun struktur tanpa membuat data palsu.
          </p>
        </div>

        <CreateReportForm />
      </main>
    </div>
  );
}
