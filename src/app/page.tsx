import { ArrowRight, ClipboardCheck, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { buildJsonLdGraph } from "@/lib/seo/site";
import { HomepageShell } from "@/components/ui/HomepageShell";
import { NaLIIconTile } from "@/components/ui/NaLIIconTile";
import { CodexProductPreview } from "@/components/ui/CodexProductPreview";

const featureCards = [
  {
    title: "Learn & Report",
    desc: "Upload notes, sources, files, or field context. NaLI turns them into evidence-based drafts for human review.",
    icon: ClipboardCheck,
  },
  {
    title: "Field Intelligence",
    desc: "A professional layer for structured observations, patrol logs, and reviewable field records.",
    icon: Compass,
  },
  {
    title: "Evidence Engine",
    desc: "Every draft keeps source limits, uncertainty notes, and next verification steps visible.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  const jsonLd = JSON.stringify(buildJsonLdGraph()).replace(/</g, "\\u003c");

  return (
    <HomepageShell>
      <script dangerouslySetInnerHTML={{ __html: jsonLd }} type="application/ld+json" />

      <main className="relative z-10">
        <section className="relative isolate flex min-h-[100svh] overflow-hidden px-4 pt-[15vh] sm:px-6 sm:pt-[18vh] lg:px-8 lg:pt-[20vh]">
          <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
            <NaLIIconTile />

            <h1
              className="text-5xl font-semibold tracking-normal sm:text-6xl lg:text-[78px]"
              style={{
                color: "#0a0a0a",
                lineHeight: 1.02,
              }}
            >
              NaLI
            </h1>

            <p
              className="mt-6 max-w-[650px] text-[17px] leading-8 text-balance sm:text-xl sm:leading-8"
              style={{ color: "#0f172a" }}
            >
              Evidence-based AI for reports, learning, and field intelligence.
            </p>

            <p className="mt-3 text-sm text-balance sm:text-[15px]" style={{ color: "#64748b" }}>
              Turn notes, files, sources, and observations into structured drafts.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create-report"
                className="inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-xl"
                style={{
                  backgroundColor: "#05070d",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.16)",
                }}
              >
                Start a report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/field-intelligence"
                className="inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-semibold transition-all duration-200 hover:-translate-y-px hover:bg-white/80 hover:shadow-md"
                style={{
                  backgroundColor: "rgba(255,255,255,0.48)",
                  color: "#1e293b",
                  border: "1px solid rgba(15,23,42,0.08)",
                  backdropFilter: "blur(14px)",
                }}
              >
                Explore NaLI for work
              </Link>
            </div>

            <p className="mt-6 text-xs sm:text-[13px]" style={{ color: "#64748b" }}>
              Public reports. Professional field intelligence. One evidence engine.
            </p>
          </div>

          <CodexProductPreview />
        </section>

        <section
          className="relative z-20 px-4 py-24 sm:px-6 lg:px-8"
          style={{
            background: "linear-gradient(180deg, rgba(248,251,255,0.96) 0%, #ffffff 100%)",
            borderTop: "1px solid rgba(15,23,42,0.04)",
          }}
        >
          <div className="mx-auto max-w-[960px]">
            <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: "#94a3b8" }}>
              How it works
            </p>
            <h2
              className="mt-4 text-center text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
              style={{ color: "#0f172a" }}
            >
              Review first. Export when ready.
            </h2>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {featureCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="group relative rounded-lg p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef4ff] text-[#2563eb]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-semibold" style={{ color: "#0f172a" }}>
                      {card.title}
                    </h3>
                    <p className="text-sm leading-[1.6]" style={{ color: "#64748b" }}>
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative z-20 bg-white px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[680px]">
            <div
              className="rounded-lg p-6 text-center"
              style={{
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(15,23,42,0.06)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p className="text-sm leading-6" style={{ color: "#64748b" }}>
                NaLI creates evidence-based drafts. Users remain responsible for final review, verification, and
                submission.
              </p>
            </div>
          </div>
        </section>

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
