import Link from "next/link";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { NaLIIconTile } from "@/components/ui/NaLIIconTile";
import { CodexProductPreview } from "@/components/ui/CodexProductPreview";
import { CodexFeatureShowcase } from "@/components/ui/CodexFeatureShowcase";
import { HomeQueryBox } from "@/components/report/HomeQueryBox";
import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Leaf,
  MessageSquareText,
  PenLine,
  Search,
  ShieldCheck,
} from "lucide-react";

const chips = [
  { label: "Evidence Hash: SHA-256", color: "#10b981" },
  { label: "Source Notes: Labeled", color: "#14b8a6" },
  { label: "Review: Required", color: "#6366f1" },
  { label: "Export Gate: Active", color: "#7c3aed" },
];

const useCases = [
  {
    icon: Leaf,
    title: "Laporan Observasi Lingkungan",
    description: "Ubah catatan observasi menjadi draft laporan rapi.",
    color: "#10b981",
  },
  {
    icon: FlaskConical,
    title: "Laporan Praktikum Biologi",
    description: "Susun tujuan, alat-bahan, langkah, hasil, dan pembahasan.",
    color: "#06b6d4",
  },
  {
    icon: PenLine,
    title: "Laporan Kegiatan / KKN",
    description: "Ubah catatan kegiatan menjadi laporan terstruktur.",
    color: "#8b5cf6",
  },
  {
    icon: ClipboardCheck,
    title: "Cek Kualitas Bukti",
    description: "Tandai bagian yang masih lemah, kurang sumber, atau butuh detail tambahan.",
    color: "#f59e0b",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Masukkan bahan",
    description: "Tempel catatan, sumber, URL, tanggal, lokasi, atau instruksi laporan.",
    icon: FileText,
  },
  {
    step: 2,
    title: "NaLI menyusun draft",
    description: "NaLI membantu membuat struktur, ringkasan, dan draft berdasarkan bahan.",
    icon: Search,
  },
  {
    step: 3,
    title: "Periksa dan lanjutkan",
    description: "Kamu bisa meminta revisi, memperkuat bukti, atau melanjutkan percakapan.",
    icon: MessageSquareText,
  },
];

const integrityBullets = [
  "Tidak membuat data palsu.",
  "Tidak membuat sitasi palsu.",
  "Tidak mendorong plagiarisme.",
  "Memberi peringatan jika bahan terlalu lemah.",
  "Output adalah draft bantuan, bukan kebenaran final.",
];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10 overflow-x-hidden">
        {/* ── Hero ── */}
        <section className="relative isolate bg-transparent px-5 md:px-8">
          <div className="mx-auto flex w-full max-w-[680px] flex-col items-center pt-[96px] text-center md:pt-[168px]">
            <NaLIIconTile />

            <h1
              className="mt-4 text-[56px] font-bold tracking-normal text-white lg:text-[80px]"
              style={{ lineHeight: 1.05 }}
            >
              NaLI
            </h1>

            {/* Primary Indonesian conversion headline */}
            <p
              className="mt-4 max-w-[600px] text-[22px] font-semibold leading-[1.3] text-white/90 sm:text-[28px] lg:text-[34px]"
            >
              Ubah catatan berantakan menjadi laporan berbasis bukti.
            </p>

            {/* Supporting English headline */}
            <p className="mt-2 max-w-[560px] text-[15px] leading-[1.5] text-white/55 lg:text-[17px]">
              Turn messy notes into structured evidence-based reports.
            </p>

            {/* Subheadline — Indonesian context */}
            <p className="mt-3 max-w-[560px] text-[13px] leading-[1.7] text-white/40 lg:text-[14px]">
              NaLI membantu menyusun draft laporan, catatan observasi, praktikum, dan kegiatan
              berdasarkan bahan yang kamu berikan — dengan peringatan bukti lemah dan batasan
              integritas akademik.
            </p>

            {/* Existing tested phrase — keep for test compatibility */}
            <p className="mt-2 max-w-[560px] text-[13px] leading-6 text-white/35">
              Turn notes, source URLs, context, and observations into structured drafts.
            </p>

            <div className="mt-5 flex max-w-[600px] flex-wrap items-center justify-center gap-2">
              {chips.map((chip) => (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-medium leading-none text-white/70 lg:px-3 lg:text-[12px]"
                  key={chip.label}
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: chip.color }}
                  />
                  {chip.label}
                </span>
              ))}
            </div>

            <HomeQueryBox />

            {/* CTAs */}
            <div className="mt-6 flex w-full max-w-[350px] flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
              <Link
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-8 text-[16px] font-medium text-white transition duration-200 hover:-translate-y-px hover:brightness-110 sm:w-auto"
                href="/create-report"
                style={{
                  background: "linear-gradient(135deg, #10b981, #7c3aed)",
                  boxShadow: "0 16px 36px rgba(16,185,129,0.18), 0 6px 18px rgba(0,0,0,0.28)",
                }}
              >
                Mulai buat laporan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 px-8 text-[16px] font-medium text-white transition duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:border-white/30 sm:w-auto"
                href="/pricing"
              >
                Lihat paket kredit
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="h-12 lg:h-20" />

          {/* Product Preview */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-[-20px] -top-24 -bottom-28 md:inset-x-[-32px] md:-top-32 md:-bottom-36"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, rgba(6,182,212,0.12), transparent 55%), radial-gradient(circle at 20% 80%, rgba(16,185,129,0.08), transparent 45%), radial-gradient(circle at 80% 70%, rgba(124,58,237,0.08), transparent 45%)",
              }}
            />
            <div className="relative z-10">
              <CodexProductPreview />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="-mx-5 h-[120px] md:-mx-8 md:h-[180px]"
            style={{
              background:
                "radial-gradient(circle at 46% 8%, rgba(6,182,212,0.12), transparent 46%), radial-gradient(circle at 24% 58%, rgba(16,185,129,0.08), transparent 42%), radial-gradient(circle at 82% 54%, rgba(124,58,237,0.08), transparent 44%), linear-gradient(to bottom, rgba(7,9,14,0) 0%, rgba(7,9,14,0.72) 18%, rgba(7,9,14,0.92) 45%, #07090e 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 20%, black 100%)",
            }}
          />
        </section>

        {/* ── Yang bisa kamu lakukan sekarang ── */}
        <section className="relative z-20 bg-[#07090e] px-5 pb-16 pt-4 md:px-8">
          <div className="mx-auto max-w-[960px] text-center">
            <h2 className="text-[28px] font-bold tracking-tight text-white sm:text-[34px]">
              Yang bisa kamu lakukan sekarang
            </h2>
            <p className="mx-auto mt-3 max-w-[540px] text-[14px] leading-6 text-white/45">
              Pilih kebutuhan awalmu, lalu lanjutkan di AgentWorkspace NaLI.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-[960px] gap-4 sm:grid-cols-2">
            {useCases.map((uc) => {
              const Icon = uc.icon;
              return (
                <Link
                  key={uc.title}
                  href="/create-report"
                  className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.05]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${uc.color}15` }}
                    >
                      <Icon className="h-4.5 w-4.5" style={{ color: uc.color }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-semibold text-white">{uc.title}</h3>
                      <p className="mt-1 text-[13px] leading-[1.6] text-white/45">{uc.description}</p>
                    </div>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 self-end text-[13px] font-medium text-emerald-400 opacity-70 transition-opacity group-hover:opacity-100">
                    Coba sekarang
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Cara kerja NaLI ── */}
        <section className="relative z-20 bg-[#07090e] px-5 pb-16 md:px-8">
          <div className="mx-auto max-w-[960px] text-center">
            <h2 className="text-[28px] font-bold tracking-tight text-white sm:text-[34px]">
              Cara kerja NaLI
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-[960px] gap-6 md:grid-cols-3">
            {howItWorks.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 text-[18px] font-bold text-white/80">
                    {step.step}
                  </div>
                  <Icon className="mt-4 h-5 w-5 text-white/40" />
                  <h3 className="mt-3 text-[16px] font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.65] text-white/45">{step.description}</p>
                </div>
              );
            })}
          </div>

          <p className="mx-auto mt-8 max-w-[640px] text-center text-[12px] leading-5 text-white/35">
            NaLI tidak menggantikan tanggung jawab pengguna. Periksa kembali sumber, fakta, dan dokumen akhir.
          </p>
        </section>

        {/* ── Feature Showcase (existing) ── */}
        <section className="homepage-feature-section relative z-20 pb-24">
          <div className="homepage-feature-content relative z-10">
            <CodexFeatureShowcase />
          </div>
        </section>

        {/* ── Dibuat untuk membantu, bukan memalsukan ── */}
        <section className="relative z-20 bg-[#07090e]/90 px-5 pb-16 backdrop-blur-sm md:px-8">
          <div className="mx-auto max-w-[640px] text-center">
            <ShieldCheck className="mx-auto h-7 w-7 text-emerald-400/60" />
            <h2 className="mt-4 text-[24px] font-bold tracking-tight text-white sm:text-[28px]">
              Dibuat untuk membantu, bukan memalsukan.
            </h2>
            <div className="mx-auto mt-6 space-y-3 text-left">
              {integrityBullets.map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/50" />
                  <span className="text-[14px] leading-[1.6] text-white/55">{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Existing disclaimer ── */}
        <section className="relative z-20 bg-[#07090e]/90 px-5 pb-10 backdrop-blur-sm md:px-8">
          <div className="mx-auto max-w-[680px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
            <p className="text-sm leading-6 text-white/50">
              NaLI creates evidence-based drafts. Users remain responsible for final review,
              verification, and submission.
            </p>
          </div>
        </section>

        {/* ── Bantu uji NaLI CP1 ── */}
        <section className="relative z-20 bg-[#07090e]/90 px-5 pb-20 backdrop-blur-sm md:px-8">
          <div className="mx-auto max-w-[680px] rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-6 text-center backdrop-blur-sm">
            <h2 className="text-[20px] font-semibold text-white sm:text-[22px]">
              Bantu uji NaLI CP1
            </h2>
            <p className="mx-auto mt-3 max-w-[500px] text-[13px] leading-6 text-white/45">
              NaLI masih dalam tahap controlled testing. Coba buat laporan, lalu kirim feedback tentang hasilnya.
            </p>
            <Link
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 text-[14px] font-medium text-emerald-300 transition duration-200 hover:bg-emerald-500/15"
              href="/create-report"
            >
              Coba dan beri feedback
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="relative z-20 bg-[#07090e]/90 px-5 py-10 backdrop-blur-sm md:px-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
              <span className="text-sm font-semibold text-white">NaLI</span>
              <p className="text-white/50">Evidence-based drafts. Final review remains human.</p>
            </div>
            <div className="flex flex-wrap gap-5 text-[13px] font-medium text-white/60">
              <Link className="transition-colors hover:text-white" href="/learn-report">
                Learn & Report
              </Link>
              <Link className="transition-colors hover:text-white" href="/field-intelligence">
                Field Intelligence
              </Link>
              <Link className="transition-colors hover:text-white" href="/pricing">
                Pricing
              </Link>
              <Link className="transition-colors hover:text-white" href="/create-report">
                Create Report
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </HomepageShell>
  );
}
