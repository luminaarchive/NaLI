import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { NaLIIconTile } from "@/components/ui/NaLIIconTile";
import { CodexProductPreview } from "@/components/ui/CodexProductPreview";
import { CodexFeatureShowcase } from "@/components/ui/CodexFeatureShowcase";

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10">
        {/* ═══════ HERO SECTION ═══════ */}
        <section className="relative isolate px-5 sm:px-6 lg:px-8">
          {/* Hero content — max-width 680px, centered, strict spacing */}
          <div
            className="relative z-20 mx-auto flex w-full max-w-[680px] flex-col items-center text-center"
            style={{ paddingTop: "calc(72px + 96px)" }} /* nav height + 96px gap */
          >
            <NaLIIconTile />

            <h1
              className="text-[56px] font-bold tracking-normal text-white sm:text-[68px] lg:text-[80px]"
              style={{ lineHeight: 1.05 }}
            >
              NaLI
            </h1>

            <p className="mt-3 max-w-[560px] text-[17px] leading-[1.6] text-white/80 sm:text-[19px] lg:text-[22px] lg:leading-[1.5]">
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            <p className="mt-2 max-w-[480px] text-[14px] text-white/50 sm:text-[15px] lg:text-[16px]">
              Turn notes, files, sources, and observations into structured drafts.
            </p>

            {/* Evidence Micro-detail Chips — 20px gap from supporting text */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-[600px]">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] sm:text-[11px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Evidence Hash: SHA-256</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[10px] sm:text-[11px] font-mono text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span>Source Coverage: Verified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-[10px] sm:text-[11px] font-mono text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                <span>Review: Required</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] sm:text-[11px] font-mono text-white/50">
                <span>Export Gate: Active</span>
              </div>
            </div>

            {/* CTA Buttons — 24px gap from chips */}
            <div className="mt-6 flex w-full max-w-[420px] flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/create-report"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:brightness-110 sm:w-auto sm:px-8"
                style={{
                  background: "linear-gradient(135deg, #10b981, #7c3aed)",
                  boxShadow: "0 12px 30px rgba(16,185,129,0.2), 0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                Start a report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/field-intelligence"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] text-[15px] font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.1] sm:w-auto sm:px-8"
              >
                Explore NaLI for work
              </Link>
            </div>
          </div>

          {/* ═══════ MANDATORY 80px GAP ═══════ */}
          <div className="h-12 sm:h-16 lg:h-20" aria-hidden="true" />

          {/* Product preview — NORMAL FLOW, below hero, no overlap */}
          <CodexProductPreview />

          {/* Bottom spacing */}
          <div className="h-8 sm:h-12" aria-hidden="true" />
        </section>

        {/* ═══════ ATMOSPHERIC → DARK BASE TRANSITION ═══════ */}
        <div
          className="relative z-20 h-16 sm:h-24"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(7,9,14,0.5) 30%, rgba(7,9,14,0.85) 60%, #07090e 100%)",
          }}
        />

        {/* ═══════ SECTION HEADER ═══════ */}
        <section className="relative z-20 bg-[#07090e] px-5 pt-8 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px] text-center">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40"
            >
              Cara terbaik untuk
            </p>
            <h2
              className="mt-4 text-[28px] font-semibold tracking-[-0.02em] text-white sm:text-[36px] lg:text-[44px]"
              style={{ lineHeight: 1.15 }}
            >
              Review first. Export when ready.
            </h2>
            <p
              className="mx-auto mt-4 max-w-[560px] text-[15px] leading-7 text-white/60 sm:text-[16px]"
            >
              Dari upload hingga export, setiap langkah dilacak, setiap sumber
              tercatat, dan setiap draft siap direview.
            </p>
          </div>
        </section>

        {/* ═══════ FEATURE SHOWCASES ═══════ */}
        <section className="relative z-20 bg-[#07090e]">
          <CodexFeatureShowcase />
        </section>

        {/* ═══════ DISCLAIMER ═══════ */}
        <section className="relative z-20 bg-[#07090e] px-5 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[680px]">
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="text-sm leading-6 text-white/50">
                NaLI creates evidence-based drafts. Users remain responsible for final review,
                verification, and submission.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer
          className="relative z-20 bg-[#07090e] px-5 py-10 sm:px-6 lg:px-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">
                NaLI
              </span>
              <p className="text-white/50">Evidence-based drafts. Final review remains human.</p>
            </div>
            <div
              className="flex flex-wrap gap-5 text-[13px] font-medium text-white/60"
            >
              <Link href="/learn-report" className="transition-colors hover:text-white">
                Learn & Report
              </Link>
              <Link href="/field-intelligence" className="transition-colors hover:text-white">
                Field Intelligence
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-white">
                Pricing
              </Link>
              <Link href="/create-report" className="transition-colors hover:text-white">
                Create Report
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </HomepageShell>
  );
}
