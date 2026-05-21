import { CheckCircle2, Clock3, CreditCard, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SiteFooter } from "@/components/ui/SiteNav";
import { PricingShell } from "@/components/ui/PricingShell";

const tiers = [
  {
    access: ["Limited drafts", "Basic outline", "Basic source check placeholder"],
    fit: "New users wanting to try the Learn & Report flow.",
    name: "Free",
    price: "Rp0",
    status: "Active for MVP",
  },
  {
    access: ["Report drafts", "Markdown/PDF paid export", "Source review warning"],
    fit: "Students who frequently assemble short reports.",
    name: "Student",
    price: "Rp29.000-49.000/mo",
    status: "Beta, manual fallback",
  },
  {
    access: ["Deeper source review tools", "Literature matrix later", "Scholar field mode later"],
    fit: "Senior students, junior researchers, or teachers needing stronger source structure.",
    name: "Scholar",
    price: "Rp99.000-149.000/mo",
    status: "Planned",
  },
  {
    access: ["Report polishing", "Evidence gap review", "Professional writing support"],
    fit: "NGO/CSR juniors, field staff, or project report writers.",
    name: "Professional Writer",
    price: "Beta only",
    status: "Planned",
  },
];

const oneTime = [
  {
    name: "Short report",
    price: "Rp9.000-29.000",
    text: "For short drafts based on notes or user-provided sources.",
  },
  {
    name: "College/practicum report",
    price: "Rp29.000-99.000",
    text: "For course or practicum reports needing more structured review checklists.",
  },
];

export default function PricingPage() {
  return (
    <PricingShell>
      <main className="relative z-10">
        <section className="border-b border-white/[0.06] px-4 pt-28 pb-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px]">
            <Badge tone="green">Beta pricing</Badge>
            <h1 className="mt-4 max-w-[720px] text-4xl font-bold tracking-tight text-white sm:text-5xl">
              NaLI pricing structure
            </h1>
            <p className="mt-5 max-w-[720px] text-lg leading-8 text-white/50">
              Paid export is active after confirmed payment. During beta, checkout may use manual confirmation until
              production automatic checkout is enabled and verified.
            </p>
            <div className="mt-6">
              <Badge tone="amber" className="px-4 py-2 text-sm">
                Markdown/PDF export is active after confirmation. Automatic checkout is not claimed live yet.
              </Badge>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
                key={tier.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{tier.name}</h2>
                    <p className="mt-2 text-lg font-semibold text-white/70">{tier.price}</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-white/30" aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  <span className="font-semibold text-white/70">Fit: </span>
                  {tier.fit}
                </p>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">Core access</p>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-white/50">
                    {tier.access.map((feature) => (
                      <li className="flex gap-2" key={feature}>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400/50" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-6">
                  <Badge tone={tier.name === "Free" ? "green" : "glass"}>{tier.status}</Badge>
                  <ButtonLink
                    className="mt-4 w-full"
                    href="/create-report"
                    variant={tier.name === "Free" ? "primary" : "glass"}
                  >
                    {tier.name === "Free" ? "Start Free" : "Coming soon"}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/[0.06] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <Badge tone="glass">One-Time Report</Badge>
              <h2 className="mt-4 text-3xl font-semibold text-white">One-time options for beta validation.</h2>
              <p className="mt-4 text-sm leading-7 text-white/40">
                Paid export can be unlocked after confirmed payment. Manual confirmation remains the fallback while
                automatic checkout credentials are inactive.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {oneTime.map((item) => (
                <div
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm"
                  key={item.name}
                >
                  <FileText className="h-5 w-5 text-white/30" aria-hidden="true" />
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.name}</h3>
                  <p className="mt-2 text-lg font-semibold text-white/70">{item.price}</p>
                  <p className="mt-3 text-sm leading-7 text-white/40">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1160px] gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Clock3 className="h-6 w-6 text-white/30" aria-hidden="true" />
              <h2 className="mt-4 text-3xl font-semibold text-white">Try the MVP first, validate pricing later.</h2>
              <p className="mt-3 max-w-[720px] text-sm leading-7 text-white/40">
                The safest step now is to test whether NaLI helps from a single note or from scratch without
                fabricating data.
              </p>
            </div>
            <ButtonLink href="/create-report">Try MVP</ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </PricingShell>
  );
}
