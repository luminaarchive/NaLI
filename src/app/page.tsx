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
        <section className="relative isolate min-h-[100svh] px-4 pt-[15vh] sm:px-6 sm:pt-[18vh] lg:px-8 lg:pt-[20vh]">
          {/* Hero content — above product preview */}
          <div className="relative z-20 mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
            <NaLIIconTile />

            <h1
              className="text-5xl font-semibold tracking-normal text-white sm:text-6xl lg:text-[78px]"
              style={{ lineHeight: 1.02 }}
            >
              NaLI
            </h1>

            <p className="mt-6 max-w-[650px] text-[17px] leading-8 text-balance text-white/85 sm:text-xl sm:leading-8">
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            <p className="mt-3 text-sm text-balance text-white/55 sm:text-[15px]">
              Turn notes, files, sources, and observations into structured drafts.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

            <p className="mt-6 text-xs text-white/45 sm:text-[13px]">
              Public reports. Professional field intelligence. One evidence engine.
            </p>
          </div>

          {/* Product preview — rising from the bottom of the viewport */}
          <CodexProductPreview />
        </section>

        {/* ═══════ ATMOSPHERIC → WHITE TRANSITION ═══════ */}
        <div
          className="relative z-20 h-24 sm:h-32"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 25%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.93) 75%, #ffffff 100%)",
          }}
        />

        {/* ═══════ SECTION HEADER ═══════ */}
        <section className="relative z-20 bg-white px-4 pt-16 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[960px] text-center">
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: "#94a3b8" }}
            >
              Cara terbaik untuk
            </p>
            <h2
              className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl lg:text-[44px]"
              style={{ color: "#0f172a", lineHeight: 1.15 }}
            >
              Review first. Export when ready.
            </h2>
            <p
              className="mx-auto mt-4 max-w-[560px] text-[16px] leading-7"
              style={{ color: "#64748b" }}
            >
              Dari upload hingga export — setiap langkah dilacak, setiap sumber
              tercatat, dan setiap draft siap direview.
            </p>
          </div>
        </section>

        {/* ═══════ FEATURE SHOWCASES (Codex-style with mockups) ═══════ */}
        <section className="relative z-20">
          <CodexFeatureShowcase />
        </section>

        {/* ═══════ DISCLAIMER ═══════ */}
        <section className="relative z-20 bg-white px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[680px]">
            <div
              className="rounded-xl p-6 text-center"
              style={{
                background: "#f8fafc",
                border: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              <p className="text-sm leading-6" style={{ color: "#64748b" }}>
                NaLI creates evidence-based drafts. Users remain responsible for final review,
                verification, and submission.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer
          className="relative z-20 bg-white px-4 py-10 sm:px-6 lg:px-8"
          style={{ borderTop: "1px solid rgba(15,23,42,0.06)" }}
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                NaLI
              </span>
              <p style={{ color: "#94a3b8" }}>Evidence-based drafts. Final review remains human.</p>
            </div>
            <div
              className="flex flex-wrap gap-5 text-[13px] font-medium"
              style={{ color: "#94a3b8" }}
            >
              <Link href="/learn-report" className="transition-colors hover:text-[#475569]">
                Learn & Report
              </Link>
              <Link href="/field-intelligence" className="transition-colors hover:text-[#475569]">
                Field Intelligence
              </Link>
              <Link href="/pricing" className="transition-colors hover:text-[#475569]">
                Pricing
              </Link>
              <Link href="/create-report" className="transition-colors hover:text-[#475569]">
                Create Report
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </HomepageShell>
  );
}
