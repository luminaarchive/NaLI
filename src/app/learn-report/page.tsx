import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { LearnReportShell } from "@/components/ui/LearnReportShell";

const users = ["siswa SMP/SMA", "mahasiswa", "guru/dosen muda", "pekerja lapangan", "NGO/CSR junior", "peneliti junior", "komunitas alam"];

const templates = [
  "Laporan Praktikum Biologi",
  "Laporan Observasi Lingkungan",
  "Laporan Kegiatan / KKN Lingkungan",
];

const outputs = [
  "laporan praktikum",
  "laporan observasi lingkungan",
  "laporan field trip",
  "laporan kegiatan proyek",
  "panduan observasi awal",
  "evidence checklist",
  "draft berbasis bahan",
];

export default function LearnReportPage() {
  return (
    <LearnReportShell>
      <main className="relative z-10">
        {/* Hero */}
        <section className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <Badge tone="green">Public Mode</Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              NaLI Learn & Report
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-base leading-7 text-white/50 sm:text-lg">
              Build evidence-based reports from your materials — or get guided when starting from scratch.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <PathCard
                cta="Build Draft"
                href="/create-report"
                icon={ClipboardList}
                title="I have materials"
                text="Enter notes, URLs, locations, lab results, or field notes. NaLI builds a draft from your materials."
              />
              <PathCard
                cta="Start from Scratch"
                href="/create-report?mode=start_from_zero"
                icon={Compass}
                title="Starting from scratch"
                text="NaLI creates an observation guide, evidence checklist, source search checklist, and initial outline."
              />
            </div>
          </div>
        </section>

        {/* Report templates */}
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-medium tracking-widest text-white/30 uppercase">
              Report Templates
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {templates.map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-center backdrop-blur-sm"
                >
                  <FileText className="mx-auto h-5 w-5 text-indigo-400/60" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-white/80">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-medium tracking-widest text-white/30 uppercase">
              Workflow
            </p>
            <h2 className="mt-4 text-center text-2xl font-semibold text-white sm:text-3xl">
              From notes to structured report
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ["Bring notes, sources, files, or context", "Upload your raw materials or start with a topic."],
                ["NaLI structures the evidence", "Evidence tables, uncertainty notes, and structured sections."],
                ["Review, verify, and export", "Check the draft, mark confidence, then export."],
              ].map(([title, text], i) => (
                <div key={title} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/60">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/40">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NaLI Energy & Export Gate */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[600px] flex-wrap justify-center gap-3">
            <Badge tone="cyan" className="px-4 py-2 text-sm">
              NaLI Energy
            </Badge>
            <Badge tone="amber" className="px-4 py-2 text-sm">
              Export Gate
            </Badge>
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <p className="text-xs font-medium tracking-widest text-white/30 uppercase">
              Built for
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Users who need structured, reviewable reports.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {users.map((user) => (
                <Badge className="min-h-9 px-4 text-sm" key={user} tone="glass">
                  {user}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Outputs */}
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1000px]">
            <p className="text-center text-xs font-medium tracking-widest text-white/30 uppercase">
              Outputs
            </p>
            <h2 className="mt-3 text-center text-2xl font-semibold text-white sm:text-3xl">
              What NaLI can build without exceeding the evidence.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {outputs.map((item) => (
                <div
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
                  key={item}
                >
                  <FileText className="h-5 w-5 text-white/30" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Academic Integrity */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-xl">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <ShieldCheck className="h-6 w-6 text-indigo-400/60" aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-semibold text-white">
                    Academic integrity stays upfront.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/40">
                    NaLI creates evidence-based drafts. Users remain responsible for final review,
                    verification, and submission.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Not final work", "No fake citations", "No fabricated data", "Human review required"].map(
                    (item) => (
                      <p
                        className="flex gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm font-semibold leading-6 text-white/70"
                        key={item}
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/60" aria-hidden="true" />
                        <span>{item}</span>
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/create-report">
                  Build Draft
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/create-report?mode=start_from_zero" variant="glass">
                  Start from Scratch
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </LearnReportShell>
  );
}

function PathCard({
  cta,
  href,
  icon: Icon,
  text,
  title,
}: {
  cta: string;
  href: string;
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
        <Icon className="h-5 w-5 text-white/60" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-white/40">{text}</p>
      <ButtonLink className="mt-5" href={href}>
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </div>
  );
}
