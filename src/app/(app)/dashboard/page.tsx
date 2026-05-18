import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Filter,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listFieldLogs } from "@/lib/repositories/observation.repository";
import type { FieldLogSummary } from "@/lib/repositories/observation.repository";

type DashboardSearchParams = Promise<{
  q?: string;
  status?: string;
  review?: string;
  sync?: string;
}>;

const conservationFilters = ["all", "CR", "EN", "VU", "NT", "LC", "DD"];
const reviewFilters = ["all", "unreviewed", "verified", "rejected"];
const syncFilters = ["all", "synced", "pending_sync", "failed_sync"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: DashboardSearchParams;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, role, institution")
    .eq("id", session.user.id)
    .single();

  const logsResult = await listFieldLogs(session.user.id, {
    search: params.q,
    conservationStatus: params.status,
    reviewStatus: params.review,
    syncState: params.sync,
  });

  const logs = logsResult.success ? logsResult.data : [];

  return (
    <div className="min-h-screen bg-[#09090b] pb-24 text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">
              Protected field archive
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">Observation Field Logs</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Structured wildlife records for identification, review, sync tracking, and
              conservation handoff.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-[#09090b]"
              href="/observe"
            >
              <Plus className="h-4 w-4" />
              New Observation
            </Link>
            <LogoutButton />
          </div>
        </header>

        <section className="mb-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-white">
                {profile?.full_name || session.user.email}
              </p>
              <p className="text-sm capitalize text-white/50">
                {profile?.role || "field user"}
                {profile?.institution ? ` - ${profile.institution}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <ArchiveState icon={<ClipboardList className="h-4 w-4" />} label={`${logs.length} logs`} />
              <ArchiveState
                icon={<AlertTriangle className="h-4 w-4" />}
                label={`${logs.filter((log) => log.anomalyFlag).length} anomaly flags`}
              />
              <ArchiveState
                icon={<WifiOff className="h-4 w-4" />}
                label={`${logs.filter((log) => log.syncState !== "synced").length} pending sync`}
              />
            </div>
          </div>
        </section>

        <form className="mb-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
            <Filter className="h-4 w-4" />
            Search and filter field logs
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                className="field-input pl-10"
                defaultValue={params.q || ""}
                name="q"
                placeholder="Search scientific name, local name, or notes"
                type="search"
              />
            </label>
            <SelectFilter defaultValue={params.status || "all"} name="status" values={conservationFilters} />
            <SelectFilter defaultValue={params.review || "all"} name="review" values={reviewFilters} />
            <SelectFilter defaultValue={params.sync || "all"} name="sync" values={syncFilters} />
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#09090b]"
              type="submit"
            >
              Apply
            </button>
          </div>
        </form>

        {logsResult.success ? null : (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            Could not load field logs: {logsResult.error.message}
          </div>
        )}

        {logs.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-white/30" />
            <h2 className="text-xl font-semibold text-white">No matching field logs</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">
              Capture an observation or loosen filters to review archived records.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#09090b]"
              href="/observe"
            >
              Start Observation
            </Link>
          </section>
        ) : (
          <div className="grid gap-3">
            {logs.map((log) => (
              <FieldLogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldLogRow({ log }: { log: FieldLogSummary }) {
  return (
    <Link
      className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-all hover:border-white/[0.15] hover:bg-white/[0.05]"
      href={`/observation/${log.id}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold italic text-white">{log.scientificName}</h2>
            <StatusBadge status={log.conservationStatus} />
            {log.anomalyFlag ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" />
                anomaly
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-white/50">{log.localName}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/40">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(log.timestamp).toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs sm:min-w-56">
          <StatePill label="sync" value={log.syncState.replace("_", " ")} />
          <StatePill label="review" value={log.reviewStatus} />
          <StatePill label="status" value={log.status.replace("_", " ")} />
          <StatePill
            label="confidence"
            value={log.confidenceLevel === null ? "pending" : `${Math.round(log.confidenceLevel * 100)}%`}
          />
        </div>
      </div>
    </Link>
  );
}

function SelectFilter({
  defaultValue,
  name,
  values,
}: {
  defaultValue: string;
  name: string;
  values: string[];
}) {
  return (
    <select className="field-input capitalize" defaultValue={defaultValue} name={name}>
      {values.map((value) => (
        <option key={value} value={value} className="bg-[#18181b] text-white">
          {value.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}

function ArchiveState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 font-medium text-white/60">
      {icon}
      {label}
    </span>
  );
}

function StatePill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-1">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">
        {label}
      </span>
      <span className="capitalize text-white/70">{value}</span>
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "CR"
      ? "bg-red-500/80 text-white"
      : status === "EN"
        ? "bg-amber-500/80 text-white"
        : status === "VU"
          ? "bg-yellow-500/80 text-white"
          : "bg-white/[0.08] text-white/60";

  return <span className={`rounded-full px-2 py-1 text-xs font-bold ${className}`}>{status}</span>;
}
