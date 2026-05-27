import {
  Archive,
  ClipboardCheck,
  Database,
  FileCheck2,
  Fingerprint,
  Layers3,
  Map,
  Route,
  ShieldCheck,
  Siren,
} from "lucide-react";
import type { Metadata } from "next";
import { siteMetadata } from "@/lib/seo/siteMetadata";

export const metadata: Metadata = {
  title: siteMetadata.routes.fieldIntelligence.title,
  description: siteMetadata.routes.fieldIntelligence.description,
  alternates: {
    canonical: `${siteMetadata.canonicalBase}/field-intelligence`,
  },
};
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PublicAppShell } from "@/components/ui/PublicAppShell";

const capabilities = [
  {
    icon: Database,
    title: "Observation Memory",
    text: "Observation history, materials, review status, and auditable field work change logs.",
    accent: "from-[#00FFB3]/10",
  },
  {
    icon: Fingerprint,
    title: "Evidence Hash",
    text: "Digital integrity markers for file integrity, not legal proof or academic validation.",
    accent: "from-[#00FFB3]/15",
  },
  {
    icon: ClipboardCheck,
    title: "Review Queue",
    text: "Human review workflow before notes become professional records for team use.",
    accent: "from-[#00FFB3]/10",
  },
  {
    icon: FileCheck2,
    title: "Darwin Core Export",
    text: "Roadmap only in CP1: biodiversity export with coordinate obfuscation and clear review status.",
    accent: "from-[#00FFB3]/15",
  },
  {
    icon: Layers3,
    title: "Threat Layer",
    text: "Threat layers that only become meaningful after data integration and source governance.",
    accent: "from-[#00FFB3]/10",
  },
  {
    icon: Route,
    title: "Patrol Planner",
    text: "Observation route planning based on priorities, evidence, and field safety boundaries.",
    accent: "from-[#00FFB3]/15",
  },
  {
    icon: Archive,
    title: "Living Species Vault",
    text: "Species knowledge space with evidence trails, reviews, and controlled updates.",
    accent: "from-[#00FFB3]/10",
  },
];

const workflow = ["Field input", "Digital integrity marker", "Review queue", "Reviewed record", "Vault/export"];

export default function FieldIntelligencePage() {
  return (
    <PublicAppShell>
      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <Badge tone="glass" className="px-3.5 py-1 text-xs">Professional Mode</Badge>
            <h1 className="mt-5 text-4xl font-serif font-bold tracking-tight text-[#f5f0e8] sm:text-5xl">
              NaLI Field Intelligence
            </h1>
            <p className="mx-auto mt-5 max-w-[600px] text-sm leading-6 text-[#a1b3a8]">
              Field intelligence for observations, conservation, data structuring, and evidence-based
              decision support. In CP1 this remains roadmap/manual inquiry only.
            </p>
            <div className="mt-6">
              <Badge tone="amber" className="px-4 py-2 text-xs font-semibold">
                Built incrementally. Public MVP focuses on Learn &amp; Report text/form reports.
              </Badge>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <ButtonLink href="/learn-report" className="bg-[#00FFB3] text-[#060b08] hover:bg-[#00e6a1] hover:shadow-[0_0_15px_rgba(0,255,179,0.25)] border-none">
                See Learn &amp; Report
              </ButtonLink>
              <ButtonLink href="/create-report" variant="glass" className="border-[#14261c] bg-[#14261c]/40 text-[#f5f0e8] hover:bg-[#14261c]/60">
                Start Building a Report
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Professional workflow preview */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8 bg-[#030604]/20">
          <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
                Professional workflow preview
              </p>
              <h2 className="mt-3 text-2xl font-serif font-bold text-[#f5f0e8] sm:text-3xl">
                Serious, but not claimed as fully operational.
              </h2>
              <p className="mt-4 text-xs leading-6 text-[#a1b3a8]">
                This page describes the Professional Layer direction. NaLI does not show maps,
                alerts, F1-F11 workflows, or verified records as if an operational system is already running.
              </p>
            </div>
            <div className="grid gap-3">
              {workflow.map((step, index) => (
                <div
                  className="flex gap-4 rounded-2xl border border-[#14261c] bg-[#08100c] p-4 backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/25 hover:bg-[#0b1a12] group"
                  key={step}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#14261c] bg-[#14261c]/40 text-xs font-bold text-[#00FFB3] group-hover:bg-[#00FFB3]/10">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-[#f5f0e8] text-sm">{step}</p>
                    <p className="mt-1 text-xs leading-6 text-[#a1b3a8]">
                      Concept workflow. Not a fully operational feature in the public MVP.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1000px]">
            <div className="flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
              <div>
                <p className="text-xs font-bold tracking-widest text-[#00FFB3] uppercase">
                  Future capabilities
                </p>
                <h2 className="mt-3 text-2xl font-serif font-bold text-[#f5f0e8] sm:text-3xl">
                  Built after product signal is sufficient.
                </h2>
              </div>
              <Badge tone="glass" className="font-semibold text-xs">Roadmap/manual inquiry only</Badge>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item) => (
                <CapabilityCard
                  accent={item.accent}
                  icon={item.icon}
                  key={item.title}
                  text={item.text}
                  title={item.title}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Boundaries */}
        <section className="border-t border-[#14261c] px-4 py-16 sm:px-6 lg:px-8 bg-[#030604]/20">
          <div className="mx-auto grid max-w-[1000px] gap-4 md:grid-cols-3">
            <BoundaryCard
              icon={Map}
              title="No fake maps"
              text="NaLI doesn't show maps or alerts as if running live without proper backend integration."
            />
            <BoundaryCard
              icon={Siren}
              title="Not an emergency system"
              text="NaLI doesn't replace BMKG, BNPB, KLHK, rangers, reviewers, or field experts."
            />
            <BoundaryCard
              icon={ShieldCheck}
              title="Human review boundary"
              text="Professional records only have value after materials, sources, and review status are checked by humans."
            />
          </div>
        </section>
      </main>
    </PublicAppShell>
  );
}

function CapabilityCard({
  accent,
  icon: Icon,
  text,
  title,
}: {
  accent: string;
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#14261c] bg-[#08100c] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#00FFB3]/35 hover:bg-[#0b1a12] hover:shadow-[0_0_24px_rgba(0,255,179,0.08)]">
      {/* Accent glow */}
      <div
        className={`pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} to-transparent opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60`}
      />
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14261c] to-transparent" />

      <div className="relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#14261c]/40 transition-colors duration-300 group-hover:bg-[#00FFB3]/10">
          <Icon className="h-5 w-5 text-[#00FFB3]" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-bold text-[#f5f0e8]">{title}</h3>
        <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">{text}</p>
      </div>
    </div>
  );
}

function BoundaryCard({ icon: Icon, text, title }: { icon: LucideIcon; text: string; title: string }) {
  return (
    <div className="rounded-2xl border border-[#14261c] bg-[#08100c]/40 p-6 backdrop-blur-sm hover:border-[#00FFB3]/25 transition-all duration-200">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14261c] bg-[#14261c]/40">
        <Icon className="h-5 w-5 text-[#00FFB3]/70" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#f5f0e8]">{title}</h3>
      <p className="mt-3 text-xs leading-6 text-[#a1b3a8]">{text}</p>
    </div>
  );
}
