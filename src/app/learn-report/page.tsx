import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  ShieldCheck,
  Database,
  Fingerprint,
  Archive,
  Layers3,
  ClipboardCheck,
  Route,
} from "lucide-react";
import type { Metadata } from "next";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.learnReport.title,
  description: siteMetadata.routes.learnReport.description,
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/learn-report`,
  },
};
import type { LucideIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PublicAppShell } from "@/components/ui/PublicAppShell";

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

const features = [
  {
    icon: Database,
    title: "Intelligence Fusion",
    description: "Strukturkan temuan lapangan bersama bahan dan sumber yang diberikan pengguna.",
  },
  {
    icon: Fingerprint,
    title: "Laporan Biodiversitas",
    description: "Susun draft laporan terstruktur dari catatan lapanganmu dengan batas bukti.",
  },
  {
    icon: Archive,
    title: "Laporan Tersimpan",
    description: "Semua laporanmu tersimpan aman secara lokal dan bisa diakses kapan saja.",
  },
  {
    icon: Layers3,
    title: "Dual Mode",
    description: "Mode Publik untuk belajar mandiri, Mode Profesional untuk riset mendalam.",
  },
  {
    icon: ClipboardCheck,
    title: "13 Profil Pengguna",
    description: "Disesuaikan untuk berbagai peran, dari ranger kehutanan hingga fotografer satwa liar.",
  },
  {
    icon: Route,
    title: "Pilot Mountains",
    description: "Mulai dari 5 gunung prioritas konservasi tinggi di Indonesia.",
  },
] as const;

export default function LearnReportPage() {
  return (
    <PublicAppShell>
      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <Badge tone="teal" className="px-3.5 py-1 text-xs">Public Mode</Badge>
            <h1 className="mt-5 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
              NaLI Learn &amp; Report
            </h1>
            <p className="mx-auto mt-5 max-w-[560px] text-sm leading-6 text-[#a1b3a8]">
              Build evidence-based reports from your materials, or get guided when starting from scratch.
            </p>
            <p className="mx-auto mt-3 max-w-[560px] text-xs leading-5 text-[#a1b3a8]/60">
              Mulai dari satu topik. NaLI akan memberi label jika bukti masih lemah.
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
            <Alert className="mt-8 border-[#14261c] bg-[#08100c] p-5 text-left">
              <AlertDescription className="space-y-3 text-xs leading-6 text-[#a1b3a8]">
                <p>
                  Dokumen ini adalah draft bantuan belajar/penulisan berbasis bukti. Pengguna wajib memeriksa,
                  mengedit, memverifikasi sumber, dan bertanggung jawab penuh atas dokumen akhir. NaLI tidak boleh
                  digunakan untuk memalsukan data, mengarang referensi, melakukan plagiarisme, atau mengklaim karya
                  AI sebagai karya final tanpa revisi.
                </p>
                <p>
                  Panduan ini belum menjadi draft laporan berbasis bukti karena bahan observasi atau sumber belum
                  tersedia. Pengguna perlu mengumpulkan data, catatan, foto, sumber, atau hasil pengamatan terlebih
                  dahulu sebelum NaLI dapat menyusun draft laporan.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Fitur Utama Sistem NaLI */}
        <section className="border-t border-[#14261c] bg-[#030604]/20 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1000px]">
            <p className="text-center text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
              Fitur Utama
            </p>
            <h2 className="mt-3 text-center text-2xl font-serif font-bold text-[#f5f0e8] sm:text-3xl">
              Kemampuan Inteligensi NaLI
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#14261c]/40 flex items-center justify-center transition-colors duration-300 group-hover:bg-[#00FFB3]/10 mb-4 w-fit">
                      <Icon className="h-5 w-5 text-[#00FFB3]" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#f5f0e8]">{feature.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[#a1b3a8]">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Report templates */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8 bg-[#030604]/20">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
              Report Templates
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {templates.map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/35 hover:bg-[#0b1a12] group"
                >
                  <FileText className="mx-auto h-5 w-5 text-[#00FFB3]/60 transition-transform duration-300 group-hover:scale-105" aria-hidden="true" />
                  <p className="mt-4 text-xs font-bold text-[#f5f0e8]">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
              Workflow
            </p>
            <h2 className="mt-4 text-center text-2xl font-serif font-bold text-[#f5f0e8] sm:text-3xl">
              From notes to structured report
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                ["Bring notes, source URLs, location, or context", "Paste text materials or start with one topic."],
                ["NaLI structures the evidence", "Evidence summary, uncertainty notes, and structured sections."],
                ["Review and verify", "Check the draft and mark confidence before using any result."],
              ].map(([title, text], i) => (
                <div key={title} className="text-center space-y-3">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#14261c] bg-[#08100c] text-sm font-bold text-[#00FFB3] shadow-[0_0_15px_rgba(0,255,179,0.05)]">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-sm font-bold text-[#f5f0e8]">{title}</h3>
                  <p className="text-xs leading-6 text-[#a1b3a8]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Export Gate */}
        <section className="border-t border-[#14261c] px-4 py-12 sm:px-6 lg:px-8 bg-[#030604]/20">
          <div className="mx-auto flex max-w-[600px] flex-wrap justify-center gap-3">
            <Badge tone="teal" className="px-4 py-2 text-xs">
              PDF/DOCX publik terkunci di CP1
            </Badge>
            <Badge tone="amber" className="px-4 py-2 text-xs">
              Export Gate
            </Badge>
          </div>
        </section>

        {/* Who it's for */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <p className="text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
              Built for
            </p>
            <h2 className="mt-3 text-2xl font-serif font-bold text-[#f5f0e8] sm:text-3xl">
              Users who need structured, reviewable reports.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {users.map((user) => (
                <Badge className="min-h-9 px-4 text-xs font-semibold" key={user} tone="glass">
                  {user}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Outputs */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8 bg-[#030604]/20">
          <div className="mx-auto max-w-[1000px]">
            <p className="text-center text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
              Outputs
            </p>
            <h2 className="mt-3 text-center text-2xl font-serif font-bold text-[#f5f0e8] sm:text-3xl">
              What NaLI can build without exceeding the evidence.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {outputs.map((item) => (
                <div
                  className="rounded-2xl border border-[#14261c] bg-[#08100c] p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] group"
                  key={item}
                >
                  <FileText className="h-5 w-5 text-[#00FFB3]/60 group-hover:scale-105 transition-transform" aria-hidden="true" />
                  <p className="mt-4 text-xs font-bold leading-6 text-[#f5f0e8]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Academic Integrity */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-8 backdrop-blur-xl relative overflow-hidden group shadow-[0_0_24px_rgba(0,255,179,0.02)]">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FFB3]/5 to-transparent opacity-0 transition duration-500 group-hover:opacity-100 animate-pulse" />
              <div className="relative z-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <div>
                  <ShieldCheck className="h-6 w-6 text-[#00FFB3]" aria-hidden="true" />
                  <h2 className="mt-4 text-2xl font-serif font-bold text-[#f5f0e8]">
                    Academic integrity stays upfront.
                  </h2>
                  <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">
                    NaLI creates evidence-based drafts. Users remain responsible for final review,
                    verification, and submission.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Not final work", "No fake citations", "No fabricated data", "Human review required"].map(
                    (item) => (
                      <p
                        className="flex gap-2 rounded-xl border border-[#14261c] bg-[#0b1a12] p-4 text-xs font-semibold leading-5 text-[#a1b3a8]"
                        key={item}
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00FFB3]/80" aria-hidden="true" />
                        <span>{item}</span>
                      </p>
                    ),
                  )}
                </div>
              </div>
              <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/create-report" className="bg-[#00FFB3] text-[#060b08] hover:bg-[#00e6a1] hover:shadow-[0_0_15px_rgba(0,255,179,0.25)] border-none">
                  Build Draft
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/create-report?mode=start_from_zero" variant="glass" className="border-[#14261c] bg-[#14261c]/40 text-[#f5f0e8] hover:bg-[#14261c]/60">
                  Start from Scratch
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicAppShell>
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
    <div className="rounded-2xl border border-[#14261c] bg-[#08100c] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/35 hover:bg-[#0b1a12] group hover:shadow-[0_0_20px_rgba(0,255,179,0.08)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#14261c]/40 transition-colors group-hover:bg-[#00FFB3]/10">
        <Icon className="h-5 w-5 text-[#00FFB3]" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl font-serif font-bold text-[#f5f0e8]">{title}</h2>
      <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">{text}</p>
      <ButtonLink className="mt-6 bg-[#00FFB3] text-[#060b08] hover:bg-[#00e6a1] hover:shadow-[0_0_15px_rgba(0,255,179,0.25)] border-none" href={href}>
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </ButtonLink>
    </div>
  );
}
