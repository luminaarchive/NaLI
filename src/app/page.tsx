import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { CodexAppIconTile } from "@/components/ui/CodexAppIconTile";
import { CodexProductPreview } from "@/components/ui/CodexProductPreview";

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-[calc(100vh-56px)] flex-col items-center px-4 pt-32 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
            {/* App icon tile */}
            <CodexAppIconTile />

            {/* Title */}
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              NaLI
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-[520px] text-lg leading-7 text-gray-500 sm:text-xl sm:leading-8">
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            {/* Supporting line */}
            <p className="mt-3 text-sm text-gray-400">
              Turn notes, files, sources, and observations into structured drafts.
            </p>

            {/* CTA pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create-report"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-gray-900 px-6 text-sm font-semibold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-gray-800 hover:shadow-xl"
              >
                Start a report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/field-intelligence"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-6 text-sm font-semibold text-gray-700 backdrop-blur-sm transition-all hover:bg-white hover:shadow-md"
              >
                Explore NaLI for work
              </Link>
            </div>

            {/* Small line */}
            <p className="mt-6 text-xs text-gray-400">
              Public reports. Professional field intelligence. One evidence engine.
            </p>
          </div>

          {/* Product preview rising from bottom */}
          <CodexProductPreview />
        </section>

        {/* Below-fold: How it works */}
        <section className="border-t border-gray-200/60 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px]">
            <p className="text-center text-xs font-medium tracking-widest text-gray-400 uppercase">
              How it works
            </p>
            <h2 className="mt-4 text-center text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Review first. Export when ready.
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                ["Bring materials", "Upload notes, files, sources, or field context."],
                ["NaLI structures", "Evidence tables, uncertainty notes, and a draft built from your materials."],
                ["Review & export", "Verify the draft, check the evidence, then export."],
              ].map(([title, text], i) => (
                <div key={title} className="relative text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {i + 1}
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Academic integrity */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[680px]">
            <div className="rounded-2xl border border-gray-200/60 bg-white/50 p-6 text-center backdrop-blur-sm">
              <p className="text-sm leading-6 text-gray-500">
                NaLI creates evidence-based drafts. Users remain responsible for final review,
                verification, and submission.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200/60 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">NaLI</span>
              <p className="text-gray-400">
                Evidence-based drafts. Final review remains human.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-[13px] font-medium text-gray-400">
              <Link href="/learn-report" className="transition-colors hover:text-gray-600">Learn & Report</Link>
              <Link href="/field-intelligence" className="transition-colors hover:text-gray-600">Field Intelligence</Link>
              <Link href="/pricing" className="transition-colors hover:text-gray-600">Pricing</Link>
              <Link href="/create-report" className="transition-colors hover:text-gray-600">Create Report</Link>
            </div>
          </div>
        </footer>
      </main>
    </HomepageShell>
  );
}
