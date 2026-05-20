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
        <section className="relative isolate min-h-[100svh] px-4 pt-[11vh] sm:px-6 sm:pt-[18vh] lg:px-8 lg:pt-[20vh]">
          {/* Hero content — above product preview */}
          <div className="relative z-20 mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
            <NaLIIconTile />

            <h1
              className="text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-[78px]"
              style={{ lineHeight: 1.02 }}
            >
              NaLI
            </h1>

            <p className="mt-4 max-w-[650px] text-[17px] leading-8 text-balance text-white/85 sm:text-xl sm:leading-8 sm:mt-6">
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            <p className="mt-2 text-sm text-balance text-white/55 sm:text-[15px] sm:mt-3">
              Turn notes, files, sources, and observations into structured drafts.
            </p>

            {/* Evidence Micro-details Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-[640px] sm:mt-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] sm:text-[11.5px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Evidence Hash: SHA-256</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[10px] sm:text-[11.5px] font-mono text-cyan-400">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span>Source Coverage: Verified</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/5 px-3 py-1 text-[10px] sm:text-[11.5px] font-mono text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                <span>Review: Required</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] sm:text-[11.5px] font-mono text-white/50">
                <span>Export Gate: Active</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
              <Link
                href="/create-report"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#1a1040] transition-all duration-200 hover:-translate-y-px hover:shadow-xl hover:shadow-white/20"
                style={{
                  boxShadow: "0 12px 30px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                Start a report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/field-intelligence"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-7 text-sm font-semibold text-white/90 backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-white/18"
              >
                Explore NaLI for work
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/45 sm:text-[13px] sm:mt-6">
              Public reports. Professional field intelligence. One evidence engine.
            </p>
          </div>

          {/* Product preview — rising from the bottom of the viewport */}
          <CodexProductPreview />
        </section>

        {/* ═══════ ATMOSPHERIC → DARK BASE TRANSITION ═══════ */}
        <div
          className="relative z-20 h-10 sm:h-16"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(7,9,14,0.4) 25%, rgba(7,9,14,0.75) 50%, rgba(7,9,14,0.93) 75%, #07090e 100%)",
          }}
        />

        {/* ═══════ SECTION HEADER ═══════ */}
        <section className="relative z-20 bg-[#07090e] px-4 pt-8 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px] text-center">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40"
            >
              Cara terbaik untuk
            </p>
            <h2
              className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl lg:text-[44px]"
              style={{ lineHeight: 1.15 }}
            >
              Review first. Export when ready.
            </h2>
            <p
              className="mx-auto mt-4 max-w-[560px] text-[16px] leading-7 text-white/60"
            >
              Dari upload hingga export, setiap langkah dilacak, setiap sumber
              tercatat, dan setiap draft siap direview.
            </p>
          </div>
        </section>

        {/* ═══════ FEATURE SHOWCASES (Codex-style with mockups) ═══════ */}
        <section className="relative z-20 bg-[#07090e]">
          <CodexFeatureShowcase />
        </section>

        {/* ═══════ DISCLAIMER ═══════ */}
        <section className="relative z-20 bg-[#07090e] px-4 pb-20 sm:px-6 lg:px-8">
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
          className="relative z-20 bg-[#07090e] px-4 py-10 sm:px-6 lg:px-8"
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
