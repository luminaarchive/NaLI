import Link from "next/link";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { NaLIIconTile } from "@/components/ui/NaLIIconTile";
import { CodexProductPreview } from "@/components/ui/CodexProductPreview";
import { CodexFeatureShowcase } from "@/components/ui/CodexFeatureShowcase";

const chips = [
  { label: "Evidence Hash: SHA-256", color: "#10b981" },
  { label: "Source Coverage: Verified", color: "#14b8a6" },
  { label: "Review: Required", color: "#6366f1" },
  { label: "Export Gate: Active", color: "#7c3aed" },
];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10 overflow-x-hidden">
        <section className="relative isolate bg-transparent px-5 md:px-8">
          <div className="mx-auto flex w-full max-w-[680px] flex-col items-center pt-[96px] text-center md:pt-[168px]">
            <NaLIIconTile />

            <h1
              className="mt-4 text-[56px] font-bold tracking-normal text-white lg:text-[80px]"
              style={{ lineHeight: 1.05 }}
            >
              NaLI
            </h1>

            <p className="mt-3 max-w-[560px] text-[19px] leading-[1.5] text-white/80 lg:text-[22px]">
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            <p className="mt-2 max-w-[560px] text-[15px] leading-6 text-white/50 lg:text-[16px]">
              Turn notes, files, sources, and observations into structured drafts.
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

            <div className="mt-6 flex w-full max-w-[350px] flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-xl px-8 text-[16px] font-medium text-white transition duration-200 hover:-translate-y-px hover:brightness-110 sm:w-auto"
                href="/create-report"
                style={{
                  background: "linear-gradient(135deg, #10b981, #7c3aed)",
                  boxShadow: "0 16px 36px rgba(16,185,129,0.18), 0 6px 18px rgba(0,0,0,0.28)",
                }}
              >
                Start a report →
              </Link>
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 px-8 text-[16px] font-medium text-white transition duration-200 hover:-translate-y-px hover:bg-white/[0.05] hover:border-white/30 sm:w-auto"
                href="/field-intelligence"
              >
                Explore NaLI for work
              </Link>
            </div>
          </div>

          <div aria-hidden="true" className="h-12 lg:h-20" />

          <CodexProductPreview />

          <div aria-hidden="true" className="h-20 md:h-24" />
        </section>

        <section className="relative z-20 bg-[#07090e] pb-24">
          <CodexFeatureShowcase />
        </section>

        <section className="relative z-20 bg-[#07090e] px-5 pb-20 md:px-8">
          <div className="mx-auto max-w-[680px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
            <p className="text-sm leading-6 text-white/50">
              NaLI creates evidence-based drafts. Users remain responsible for final review,
              verification, and submission.
            </p>
          </div>
        </section>

        <footer
          className="relative z-20 bg-[#07090e] px-5 py-10 md:px-8"
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
