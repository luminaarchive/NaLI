import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateReportForm } from "@/components/report/CreateReportForm";
import { Badge } from "@/components/ui/Badge";
import { CreateReportShell } from "@/components/ui/CreateReportShell";

export default function CreateReportPage() {
  return (
    <CreateReportShell>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <span className="text-sm font-medium text-white/30">Learn & Report</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-[960px] px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-[720px]">
          <Badge tone="glass">Create Report</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Start Building a Report
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/45">
            Enter your materials or start from scratch. NaLI structures the evidence without fabricating data.
          </p>
        </div>

        <CreateReportForm />
      </main>
    </CreateReportShell>
  );
}
