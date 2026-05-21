import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileText,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { purgeExpiredReports } from "@/lib/maintenance/purge";
import { getDailyUsageSummary } from "@/lib/usage/logging";
import { getSystemReadiness } from "@/lib/system/readiness";
import { getCostProtectionStatus } from "@/lib/usage/costProtection";

export const dynamic = "force-dynamic";

type ReadinessStatus = "configured" | "missing" | "inactive" | "prepared" | "disabled";

const statusStyles: Record<ReadinessStatus, string> = {
  configured: "border-[#315f45]/20 bg-[#e8efe4] text-[#173d2b]",
  disabled: "border-[#cfc6b7] bg-[#fcfaf4] text-[#5f6b62]",
  inactive: "border-[#cfc6b7] bg-[#fcfaf4] text-[#5f6b62]",
  missing: "border-[#9a5b35]/20 bg-[#fff4e8] text-[#9a5b35]",
  prepared: "border-[#315f45]/15 bg-white text-[#173d2b]",
};

function statusLabel(status: ReadinessStatus) {
  const labels: Record<ReadinessStatus, string> = {
    configured: "configured",
    disabled: "disabled",
    inactive: "inactive",
    missing: "missing env",
    prepared: "prepared",
  };

  return labels[status];
}

export default async function SystemReadinessPage({
  searchParams,
}: {
  searchParams?: Promise<{ purgeDryRun?: string }>;
}) {
  const params = await searchParams;
  const readiness = getSystemReadiness();
  const usage = await getDailyUsageSummary();
  const costProtection = await getCostProtectionStatus();
  const purgeDryRun = params?.purgeDryRun === "1" ? await purgeExpiredReports({ dryRun: true }) : null;

  const checks = [
    {
      detail: "Server-side policy blocks unsafe academic integrity requests before model/provider calls.",
      label: "NaLI Lock",
      status: readiness.naliLockPrepared ? "prepared" : "missing",
    },
    {
      detail: readiness.supabaseConfigured
        ? "Server runtime has the required Supabase values."
        : "Persistence code is ready, but this environment is missing Supabase values.",
      label: "Supabase persistence",
      status: readiness.supabaseConfigured ? "configured" : "missing",
    },
    {
      detail: readiness.openRouterConfigured
        ? "Provider path can be used by server code."
        : "NaLI will keep using safe DEMO/MOCK fallback when provider access is absent.",
      label: "AI provider",
      status: readiness.openRouterConfigured ? "configured" : "missing",
    },
    {
      detail: readiness.midtransConfigured
        ? readiness.midtransProductionMode
          ? "Payment route can create Midtrans one-time export transactions in production mode."
          : "Payment route can create Midtrans one-time export transactions in sandbox/default mode."
        : "Payment route remains honest and returns not-configured responses.",
      label: "Midtrans payment",
      status: readiness.midtransConfigured ? "configured" : "missing",
    },
    {
      detail: readiness.adminViewEnabled
        ? "Founder order view can read operational metadata when Supabase is configured."
        : "Order data view is disabled by ADMIN_VIEW_ENABLED.",
      label: "Admin order view",
      status: readiness.adminViewEnabled ? "configured" : "disabled",
    },
    {
      detail:
        readiness.exportGateStatus === "active"
          ? "Export gate can check payment records."
          : "Export gate is prepared but locked until persistence and payment are configured.",
      label: "Export gate",
      status: readiness.exportGateStatus === "active" ? "configured" : "prepared",
    },
    {
      detail: readiness.rateLimitPrepared
        ? "Abuse-limit code is prepared and uses hashed keys when persistence is configured."
        : "Rate limit foundation is missing.",
      label: "Rate Limit Foundation",
      status: readiness.rateLimitPrepared ? "prepared" : "missing",
    },
    {
      detail: costProtection.active
        ? "Heavy generation is temporarily limited by the daily NaLI Energy threshold."
        : costProtection.configured
          ? "Daily NaLI Energy threshold is configured and checked before heavy generation."
          : "Cost protection is prepared, but usage logging or daily threshold is not configured here.",
      label: "Cost Protection",
      status: costProtection.active || costProtection.configured ? "configured" : "prepared",
    },
    {
      detail: "Source verification remains intentionally inactive in Sprint 0.",
      label: "Source verification",
      status: "inactive",
    },
    {
      detail: readiness.uploadConfigured
        ? "PDF upload foundation can request private direct upload URLs."
        : "PDF upload foundation is prepared, but Supabase Storage is not configured here.",
      label: "File upload",
      status: readiness.uploadConfigured ? "configured" : "prepared",
    },
    {
      detail: readiness.maintenanceSecretConfigured
        ? "Cleanup route has an internal maintenance secret configured."
        : "Cleanup code is prepared, but the maintenance secret is missing.",
      label: "Purge/Cleanup Foundation",
      status: readiness.purgeConfigured ? "configured" : readiness.purgePrepared ? "prepared" : "missing",
    },
    {
      detail: "Professional Field Intelligence remains positioning only for this sprint.",
      label: "Field Intelligence",
      status: "inactive",
    },
  ] satisfies Array<{ detail: string; label: string; status: ReadinessStatus }>;

  return (
    <div className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-[#111814] sm:px-6 lg:px-8">
      <main className="mx-auto max-w-6xl">
        <header className="border-b border-[#ddd5c7] pb-6">
          <p className="text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">Internal Sprint 0</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">System Readiness</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6b62]">
                Pemeriksaan internal tanpa menampilkan nilai rahasia. Halaman ini hanya menunjukkan apakah fondasi
                Sprint 0 siap, terkunci, atau belum dikonfigurasi.
              </p>
            </div>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#173d2b]/20 bg-white px-4 text-sm font-semibold text-[#173d2b] transition hover:bg-[#e8efe4]"
              href="/system/orders"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Founder Order View
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {checks.map((check) => (
            <ReadinessCard key={check.label} {...check} />
          ))}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-[#ddd5c7] bg-[#fcfaf4] p-5">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#315f45]" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Usage and Cost Protection</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric
                label="NaLI Energy today"
                value={usage.ready ? String(usage.summary.estimatedEnergy) : "not active"}
              />
              <Metric
                label="Usage events today"
                value={usage.ready ? String(usage.summary.eventCount) : "not active"}
              />
              <Metric
                label="Protection mode"
                value={costProtection.active ? "active" : costProtection.configured ? "monitoring" : "prepared"}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#5f6b62]">
              Cost logging is non-blocking. If Supabase is not configured in this environment, report generation still
              works through the existing fallback path.
            </p>
          </div>

          <aside className="rounded-lg border border-[#ddd5c7] bg-white p-5">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-[#315f45]" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Purge/Cleanup Foundation</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm leading-6 text-[#5f6b62]">
              <SystemMeta label="Prepared" value={readiness.purgePrepared ? "yes" : "no"} />
              <SystemMeta
                label="Configured"
                value={readiness.purgeConfigured ? "configured" : "missing secret or Supabase env"}
              />
              <SystemMeta label="Last run" value="not implemented" />
              <SystemMeta label="Mode" value="dry-run route available" />
            </dl>
            <form className="mt-4" method="GET">
              <input name="purgeDryRun" type="hidden" value="1" />
              <button
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#173d2b]/20 bg-[#fcfaf4] px-4 text-sm font-semibold text-[#173d2b] transition hover:bg-[#e8efe4]"
                type="submit"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Run Cleanup Dry Run
              </button>
            </form>
            {purgeDryRun ? (
              <div className="mt-4 rounded-md border border-[#ddd5c7] bg-[#fcfaf4] p-3 text-sm leading-6 text-[#5f6b62]">
                {"skipped" in purgeDryRun ? (
                  <p>Dry run skipped: {purgeDryRun.reason}.</p>
                ) : (
                  <dl className="grid grid-cols-2 gap-2">
                    <SystemMeta label="Scanned" value={String(purgeDryRun.scanned)} />
                    <SystemMeta label="Would delete reports" value={String(purgeDryRun.wouldDeleteReports)} />
                    <SystemMeta label="Would delete storage" value={String(purgeDryRun.wouldDeleteStorageObjects)} />
                    <SystemMeta label="Would mark failed" value={String(purgeDryRun.wouldMarkFailed)} />
                    <SystemMeta label="Errors" value={String(purgeDryRun.errors.length)} />
                  </dl>
                )}
              </div>
            ) : null}
          </aside>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-[#ddd5c7] bg-white p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#315f45]" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Sprint 0 Boundaries</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[#5f6b62]">
              <BoundaryItem>Guest Mode first.</BoundaryItem>
              <BoundaryItem>No AI PDF extraction or source verification in this step.</BoundaryItem>
              <BoundaryItem>Export premium stays locked until payment is actually configured.</BoundaryItem>
              <BoundaryItem>No provider keys or secret values are printed here.</BoundaryItem>
              <BoundaryItem>Purge cleanup starts in dry-run mode and avoids paid/export-ready reports.</BoundaryItem>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function ReadinessCard({ detail, label, status }: { detail: string; label: string; status: ReadinessStatus }) {
  const Icon = status === "configured" ? CheckCircle2 : status === "missing" ? AlertTriangle : LockKeyhole;

  return (
    <article className="rounded-lg border border-[#ddd5c7] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{label}</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f6b62]">{detail}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-[#6f8057]" aria-hidden="true" />
      </div>
      <span
        className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
      >
        {statusLabel(status)}
      </span>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#ddd5c7] bg-white p-3">
      <p className="text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">{label}</p>
      <p className="mt-2 text-xl font-semibold text-[#111814]">{value}</p>
    </div>
  );
}

function SystemMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">{label}</dt>
      <dd className="mt-1 font-semibold text-[#111814]">{value}</dd>
    </div>
  );
}

function BoundaryItem({ children }: { children: string }) {
  return (
    <li className="flex gap-2">
      <WifiOff className="mt-1 h-4 w-4 shrink-0 text-[#6f8057]" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
