import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateReportForm } from "@/components/report/CreateReportForm";
import { Badge } from "@/components/ui/Badge";
import { CreateReportShell } from "@/components/ui/CreateReportShell";

export default function CreateReportPage() {
  return (
    <CreateReportShell>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[#DDD5C7] bg-[#F7F3EA]/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-[#5F6B62] transition-colors hover:text-[#111814]"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Beranda
          </Link>
          <span className="text-sm font-medium text-[#5F6B62]">Learn & Report</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[960px] px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-[720px]">
          <Badge tone="green">Mulai Laporan</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-[#111814] sm:text-4xl lg:text-5xl">
            Mulai Laporan
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#5F6B62]">
            Masukkan bahan yang kamu punya, atau mulai dari nol. NaLI menyusun struktur tanpa membuat data palsu.
          </p>
        </div>

        <CreateReportForm />
      </main>
    </CreateReportShell>
  );
}
