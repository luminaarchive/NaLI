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
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { FieldIntelligenceShell } from "@/components/ui/FieldIntelligenceShell";

const capabilities = [
  {
    icon: Database,
    title: "Observation Memory",
    text: "Observation history, materials, review status, and auditable field work change logs.",
    accent: "from-indigo-500/20",
  },
  {
    icon: Fingerprint,
    title: "Evidence Hash",
    text: "Digital integrity markers for file integrity — not legal proof or academic validation.",
    accent: "from-violet-500/20",
  },
  {
    icon: ClipboardCheck,
    title: "Review Queue",
    text: "Human review workflow before notes become professional records for team use.",
    accent: "from-cyan-500/15",
  },
  {
    icon: FileCheck2,
    title: "Darwin Core Export",
    text: "Biodiversity data export with coordinate obfuscation and clear review status.",
    accent: "from-emerald-500/15",
  },
  {
    icon: Layers3,
    title: "Threat Layer",
    text: "Threat layers that only become meaningful after data integration and source governance.",
    accent: "from-amber-500/15",
  },
  {
    icon: Route,
    title: "Patrol Planner",
    text: "Observation route planning based on priorities, evidence, and field safety boundaries.",
    accent: "from-rose-500/15",
  },
  {
    icon: Archive,
    title: "Living Species Vault",
    text: "Species knowledge space with evidence trails, reviews, and controlled updates.",
    accent: "from-blue-500/15",
  },
];

const workflow = ["Field input", "Digital integrity marker", "Review queue", "Reviewed record", "Vault/export"];

export default function FieldIntelligencePage() {
  return (
    <FieldIntelligenceShell>
      <main className="relative z-10">
        {/* Hero */}
        <section className="px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[800px] text-center">
            <Badge tone="glass">Professional Mode</Badge>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              NaLI Field Intelligence
            </h1>
            <p className="mx-auto mt-5 max-w-[600px] text-base leading-7 text-white/50 sm:text-lg">
              Field intelligence for observations, conservation, data structuring, and evidence-based
              decision support.
            </p>
            <div className="mt-6">
              <Badge tone="amber" className="px-4 py-2 text-sm">
                Built incrementally. Public MVP focuses on Learn & Report.
              </Badge>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <ButtonLink href="/learn-report">
                See Learn & Report
              </ButtonLink>
              <ButtonLink href="/create-report" variant="glass">
                Start Building a Report
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Professional workflow preview */}
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1000px] gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-medium tracking-widest text-white/30 uppercase">
                Professional workflow preview
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                Serious, but not claimed as fully operational.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/40">
                This page describes the Professional Layer direction. NaLI does not show maps,
                alerts, or verified records as if an operational system is already running.
              </p>
            </div>
            <div className="grid gap-3">
              {workflow.map((step, index) => (
                <div
                  className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
                  key={step}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/60">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{step}</p>
                    <p className="mt-1 text-sm leading-6 text-white/40">
                      Concept workflow. Not a fully operational feature in the public MVP.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1000px]">
            <div className="flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
              <div>
                <p className="text-xs font-medium tracking-widest text-white/30 uppercase">
                  Future capabilities
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                  Built after product signal is sufficient.
                </h2>
              </div>
              <Badge tone="glass">Not yet fully active</Badge>
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
        <section className="border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8">
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
      <SiteFooter />
    </FieldIntelligenceShell>
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
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]">
      {/* Accent glow */}
      <div
        className={`pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} to-transparent opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-80`}
      />
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
          <Icon className="h-5 w-5 text-white/50" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/40">{text}</p>
      </div>
    </div>
  );
}

function BoundaryCard({ icon: Icon, text, title }: { icon: LucideIcon; text: string; title: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-6 backdrop-blur-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
        <Icon className="h-5 w-5 text-white/30" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white/80">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/35">{text}</p>
    </div>
  );
}
