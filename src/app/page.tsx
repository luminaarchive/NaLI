import { ArrowRight, Sparkles } from "lucide-react";
import { HomeCommandBox } from "@/components/report/HomeCommandBox";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { NaLIHero } from "@/components/ui/NaLIHero";
import { FeatureBento } from "@/components/ui/FeatureBento";
import { HomepageShell } from "@/components/ui/HomepageShell";

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-4 pb-20 pt-32 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[680px] flex-col items-center text-center">
            <NaLIHero />

            {/* Command prompt surface */}
            <div className="mt-10 w-full">
              <HomeCommandBox />
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href="/create-report" variant="primary">
                Start a Report
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/field-intelligence" variant="glass">
                Explore Field Intelligence
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Below-the-fold feature cards */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1000px]">
            <p className="mb-6 text-center text-xs font-medium tracking-widest text-white/30 uppercase">
              One evidence engine
            </p>
            <FeatureBento />
          </div>
        </section>

        {/* Workflow section */}
        <section className="border-t border-white/[0.06] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-medium tracking-widest text-white/30 uppercase">
              How it works
            </p>
            <h2 className="mt-4 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Review first. Export when ready.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                ["Bring materials", "Upload notes, files, sources, or field context."],
                ["NaLI structures", "Evidence tables, uncertainty notes, and a draft built from your materials."],
                ["Review & export", "Verify the draft, check the evidence, then export."],
              ].map(([title, text], i) => (
                <div key={title} className="relative text-center">
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

        {/* Academic integrity */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[680px]">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-center backdrop-blur-sm">
              <p className="text-sm leading-6 text-white/40">
                NaLI creates evidence-based drafts. Users remain responsible for final review,
                verification, and submission.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </HomepageShell>
  );
}
