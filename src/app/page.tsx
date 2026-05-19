import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { NaLIIconTile } from "@/components/ui/NaLIIconTile";
import { CodexProductPreview } from "@/components/ui/CodexProductPreview";

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-screen flex-col items-center px-4 pt-[28vh] sm:px-6 sm:pt-[25vh] lg:px-8 lg:pt-[22vh]">
          <div className="mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
            {/* App icon tile — unique NaLI icon */}
            <NaLIIconTile />

            {/* Title — large black, premium */}
            <h1
              className="text-5xl font-bold tracking-[-0.03em] sm:text-6xl lg:text-[80px]"
              style={{
                color: "#0a0a0a",
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              NaLI
            </h1>

            {/* Subtitle */}
            <p
              className="mt-5 max-w-[540px] text-lg leading-[1.6] sm:text-xl sm:leading-[1.65]"
              style={{ color: "#475569" }}
            >
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            {/* Supporting line */}
            <p className="mt-3 text-sm" style={{ color: "#94a3b8" }}>
              Turn notes, files, sources, and observations into structured drafts.
            </p>

            {/* CTA pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create-report"
                className="inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-all duration-200 hover:shadow-xl"
                style={{
                  backgroundColor: "#0f172a",
                  boxShadow: "0 4px 14px rgba(15,23,42,0.15)",
                }}
              >
                Start a report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/field-intelligence"
                className="inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-semibold transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: "rgba(255,255,255,0.65)",
                  color: "#334155",
                  border: "1px solid rgba(0,0,0,0.08)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Explore NaLI for work
              </Link>
            </div>

            {/* Small line */}
            <p className="mt-6 text-xs" style={{ color: "#94a3b8" }}>
              Public reports. Professional field intelligence. One evidence engine.
            </p>
          </div>

          {/* Product preview rising from bottom */}
          <CodexProductPreview />
        </section>

        {/* Below-fold: Feature cards */}
        <section
          className="px-4 py-24 sm:px-6 lg:px-8"
          style={{
            background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)",
            borderTop: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <div className="mx-auto max-w-[960px]">
            <p
              className="text-center text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#94a3b8" }}
            >
              How it works
            </p>
            <h2
              className="mt-4 text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
              style={{ color: "#0f172a" }}
            >
              Review first. Export when ready.
            </h2>

            {/* Feature cards */}
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Learn & Report",
                  desc: "Upload notes, files, sources, or field context. NaLI structures everything into evidence-based drafts.",
                  icon: "📝",
                },
                {
                  title: "Field Intelligence",
                  desc: "Professional field observations, patrol logs, and species data — structured and exportable.",
                  icon: "🌿",
                },
                {
                  title: "Evidence Engine",
                  desc: "Every claim backed by evidence tables, uncertainty notes, and source attribution you can verify.",
                  icon: "⚡",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group relative rounded-2xl p-7 transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-lg">
                    {card.icon}
                  </div>
                  <h3
                    className="mb-2 text-[15px] font-semibold"
                    style={{ color: "#0f172a" }}
                  >
                    {card.title}
                  </h3>
                  <p className="text-sm leading-[1.6]" style={{ color: "#64748b" }}>
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Academic integrity */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[680px]">
            <div
              className="rounded-2xl p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(0,0,0,0.05)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="text-sm leading-6" style={{ color: "#64748b" }}>
                NaLI creates evidence-based drafts. Users remain responsible for final review,
                verification, and submission.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="px-4 py-10 sm:px-6 lg:px-8"
          style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: "#0f172a" }}>
                NaLI
              </span>
              <p style={{ color: "#94a3b8" }}>
                Evidence-based drafts. Final review remains human.
              </p>
            </div>
            <div className="flex flex-wrap gap-5 text-[13px] font-medium" style={{ color: "#94a3b8" }}>
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
