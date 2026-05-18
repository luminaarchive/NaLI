import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Database,
  Download,
  Fingerprint,
  FileImage,
  Link2,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type JsonObject = Record<string, unknown>;

type ObservationRecord = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  latitude: number | null;
  longitude: number | null;
  text_description: string | null;
  confidence_level: number | null;
  conservation_status: string | null;
  conservation_priority_category: string | null;
  conservation_priority_score: number | null;
  observation_status: string | null;
  review_status: string | null;
  processing_stage: string | null;
  verified_by_human: boolean | null;
  is_anomaly: boolean | null;
  anomaly_flag: boolean | null;
  reasoning_trace_id: string | null;
  reasoning_snapshot: JsonObject | null;
  signal_snapshot: JsonObject | null;
  created_at: string | null;
  timestamp: string | null;
};

type MediaRecord = {
  media_type: string;
  storage_url: string;
  checksum: string | null;
  captured_at: string | null;
};

type AnalysisRun = {
  tool_name: string | null;
  tool_version: string | null;
  status: string | null;
  latency_ms: number | null;
  score_breakdown: JsonObject | null;
  raw_output: string | null;
  error: string | null;
  completed_at: string | null;
};

type ObservationEvent = {
  event_type: string;
  severity: string | null;
  reasoning_trace_id: string | null;
  payload: JsonObject | null;
  event_timestamp: string | null;
};

type FieldCase = {
  id: string;
  case_type: string | null;
  status: string | null;
  priority_score: number | null;
  linked_observation_ids: unknown;
  linked_anomaly_cluster_ids: unknown;
  operational_notes: unknown;
};

type ObservationHashRecord = {
  hash: string;
  hash_algorithm: string;
  created_at: string | null;
};

type AnomalyFlagRecord = {
  flag_type: string;
  severity: string;
  reason: string;
  h3_cell: string | null;
  created_at: string | null;
};

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : {};
}

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function textValue(value: unknown, fallback = "Not available") {
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "yes" : "no";
  return fallback;
}

function formatStatus(value: unknown) {
  return textValue(value, "pending").replaceAll("_", " ");
}

function percent(value: number | null) {
  if (typeof value !== "number") return "Pending";
  return `${Math.round(value * 100)}%`;
}

async function signedMediaUrl(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>, path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const { data } = await supabase.storage.from("observation_media").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export default async function ObservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!id || !user) return <Unavailable title="Observation record unavailable" />;

  const { data: observationData, error: observationError } = await supabase
    .from("observations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (observationError || !observationData) {
    return (
      <Unavailable
        title="Observation record unavailable"
        detail="NaLI could not load this field observation. Confirm the observation exists in the archive and belongs to the current workspace."
      />
    );
  }

  const observation = observationData as ObservationRecord;
  const [mediaResult, runsResult, eventsResult, casesResult, hashResult, anomalyFlagsResult] = await Promise.all([
    supabase
      .from("observation_media")
      .select("media_type, storage_url, checksum, captured_at")
      .eq("observation_id", id),
    supabase
      .from("analysis_runs")
      .select("tool_name, tool_version, status, latency_ms, score_breakdown, raw_output, error, completed_at")
      .eq("observation_id", id)
      .order("completed_at", { ascending: true }),
    supabase
      .from("observation_events")
      .select("event_type, severity, reasoning_trace_id, payload, event_timestamp")
      .eq("observation_id", id)
      .order("event_timestamp", { ascending: true }),
    supabase
      .from("field_cases")
      .select(
        "id, case_type, status, priority_score, linked_observation_ids, linked_anomaly_cluster_ids, operational_notes",
      )
      .eq("observation_id", id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("observation_hashes")
      .select("hash, hash_algorithm, created_at")
      .eq("observation_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("observation_anomaly_flags")
      .select("flag_type, severity, reason, h3_cell, created_at")
      .eq("observation_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const mediaRows = (mediaResult.data ?? []) as MediaRecord[];
  const mediaUrls = await Promise.all(mediaRows.map((media) => signedMediaUrl(supabase, media.storage_url)));
  const runs = (runsResult.data ?? []) as AnalysisRun[];
  const events = (eventsResult.data ?? []) as ObservationEvent[];
  const linkedCases = (casesResult.data ?? []) as FieldCase[];
  const observationHash = ((hashResult.data ?? []) as ObservationHashRecord[])[0];
  const anomalyFlags = (anomalyFlagsResult.data ?? []) as AnomalyFlagRecord[];
  const reasoning = asObject(observation.reasoning_snapshot);
  const signals = asObject(observation.signal_snapshot);
  const review = asObject(reasoning.review_recommendation);
  const habitat = asObject(reasoning.habitat_context);
  const temporal = asObject(reasoning.temporal_context);
  const agreement = asObject(signals.agreement_metrics);
  const providerConflicts = asStrings(reasoning.provider_conflicts);

  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-white">
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-white/[0.06] bg-[#09090b]/80 px-4 backdrop-blur-xl sm:px-6">
        <Link
          href="/archive"
          className="flex items-center gap-2 text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Back to Archive</span>
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-8">
        <section className="space-y-6 lg:col-span-7">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            {mediaUrls[0] ? (
              <Image
                src={mediaUrls[0]}
                alt="Observation media"
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/30">
                <FileImage className="h-8 w-8" />
                <span className="text-sm">No media preview available</span>
              </div>
            )}
            {observation.is_anomaly || observation.anomaly_flag ? (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white shadow-lg">
                <AlertTriangle className="h-3 w-3" />
                Anomaly detected
              </div>
            ) : null}
          </div>

          <div>
            <h1 className="break-words text-3xl font-bold text-white sm:text-4xl">
              {observation.scientific_name || "Species pending"}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/40">
              <span>{observation.local_name || "Common name pending"}</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {observation.latitude?.toFixed(4) ?? "--"}, {observation.longitude?.toFixed(4) ?? "--"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(observation.created_at || observation.timestamp || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Fact
              label="Conservation"
              value={observation.conservation_status || observation.conservation_priority_category || "Pending"}
            />
            <Fact label="Confidence" value={percent(observation.confidence_level)} />
            <Fact label="Review" value={formatStatus(review.recommendation || observation.review_status)} />
          </div>

          {observation.review_status === "verified" || observation.verified_by_human ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08]"
                href={`/api/observations/${observation.id}/darwin-core`}
              >
                <Download className="h-4 w-4" />
                Export Darwin Core CSV
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08]"
                href={`/api/observations/${observation.id}/darwin-core?format=dwca`}
              >
                <Download className="h-4 w-4" />
                Export DwC-A ZIP
              </Link>
            </div>
          ) : null}

          <AuditCard icon={ShieldCheck} title="Reasoning Snapshot">
            <div className="grid gap-4 md:grid-cols-2">
              <ReasoningList title="Confidence strengthened by" items={asStrings(reasoning.confidence_contributors)} empty="No positive contributors persisted yet." />
              <ReasoningList title="Confidence reduced by" items={asStrings(reasoning.confidence_penalties)} empty="No confidence penalties persisted yet." />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ContextBlock label="Habitat context" value={textValue(habitat.summary || habitat.biome, "Habitat context pending")} />
              <ContextBlock label="Temporal context" value={textValue(temporal.summary || temporal.seasonal_alignment, "Temporal context pending")} />
            </div>
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Priority Explanation">
            <p className="mb-3 text-sm font-semibold text-white/70">
              {observation.conservation_priority_category || "Priority pending"}
            </p>
            <ReasoningList title="Why this observation matters" items={asStrings(reasoning.priority_explanation)} empty="Priority explanation will appear after ecological reasoning completes." />
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="H3 Anomaly Flags">
            {anomalyFlags.length ? (
              <div className="space-y-3">
                {anomalyFlags.map((flag) => (
                  <div key={`${flag.flag_type}-${flag.created_at}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white/70">{formatStatus(flag.flag_type)}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{flag.severity}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-white/50">{flag.reason}</p>
                    {flag.h3_cell ? <p className="mt-2 break-all font-mono text-xs text-white/30">{flag.h3_cell}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/50">No H3 anomaly flags are stored for this observation.</p>
            )}
            <p className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs leading-5 text-white/40">
              Flags are based on NaLI&apos;s available records. Accuracy improves as more observations are submitted.
            </p>
          </AuditCard>

          <AuditCard icon={Link2} title="Linked Field Cases">
            {linkedCases.length ? (
              <div className="space-y-3">
                {linkedCases.map((fieldCase) => (
                  <div key={fieldCase.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white/70">{fieldCase.id}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{formatStatus(fieldCase.status)}</span>
                    </div>
                    <p className="mt-1 text-sm capitalize text-white/50">{formatStatus(fieldCase.case_type)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/50">No field case has been linked to this observation.</p>
            )}
          </AuditCard>
        </section>

        <aside className="space-y-6 lg:col-span-5">
          <AuditCard icon={Fingerprint} title="Evidence Integrity Hash">
            {observationHash ? (
              <div className="space-y-3">
                <p className="break-all rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-xs text-white/60">{observationHash.hash}</p>
                <p className="text-sm leading-6 text-white/50">NaLI Verification Code: {observationHash.hash}</p>
                <p className="text-xs leading-5 text-white/40">This hash is a digital integrity check, not automatic legal admissibility. Legal use may require forensic IT expert validation.</p>
                <Link className="inline-flex text-sm font-semibold text-indigo-400 underline" href={`/verify?hash=${observationHash.hash}`}>Open verification page</Link>
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/50">No evidence hash has been persisted for this observation yet.</p>
            )}
          </AuditCard>

          <AuditCard icon={Activity} title="Signal Snapshot">
            <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-xs text-white/30">
              Trace {observation.reasoning_trace_id || "pending"}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Agreement score" value={percent(typeof agreement.agreement_score === "number" ? agreement.agreement_score : null)} />
              <Metric label="Anomaly score" value={percent(typeof agreement.anomaly_score === "number" ? agreement.anomaly_score : null)} />
              <Metric label="Provider outputs" value={String(asStrings(signals.provider_outputs).length || runs.length)} />
              <Metric label="Conflict detected" value={textValue(agreement.conflict_detected, "pending")} />
            </div>
          </AuditCard>

          <AuditCard icon={AlertTriangle} title="Provider Conflict Classification">
            <ReasoningList title="Persisted conflicts" items={providerConflicts} empty="No provider conflicts persisted for this observation." />
          </AuditCard>

          <AuditCard icon={Database} title="Analysis Events">
            <div className="space-y-3">
              {events.length ? (
                events.map((event) => (
                  <div key={`${event.event_type}-${event.event_timestamp}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white/70">{event.event_type}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{event.severity || "info"}</span>
                    </div>
                    <p className="mt-1 break-all text-xs text-white/30">{event.reasoning_trace_id || observation.reasoning_trace_id || "trace pending"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-white/50">No analysis events have been persisted yet.</p>
              )}
            </div>
          </AuditCard>

          <AuditCard icon={CheckCircle2} title="Provider Runs">
            <div className="space-y-4">
              {runs.length ? (
                runs.map((run) => (
                  <div key={`${run.tool_name}-${run.completed_at}`} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
                        {run.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-400/60" /> : <AlertTriangle className="h-4 w-4 text-red-400/60" />}
                        {run.tool_name || "Provider"}
                      </div>
                      <span className="font-mono text-[10px] text-white/30">{run.latency_ms ?? "--"}ms</span>
                    </div>
                    <p className="text-sm leading-6 text-white/50">{run.error || run.raw_output || "No provider output persisted."}</p>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.04] pt-3">
                      <span className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-semibold text-white/40">{run.tool_version || "version pending"}</span>
                      {Object.entries(run.score_breakdown ?? {}).map(([key, value]) => (
                        <span key={key} className="rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-1.5 py-0.5 font-mono text-[10px] text-indigo-300">{key}: {textValue(value)}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-white/50">Provider runs will appear after orchestration starts.</p>
              )}
            </div>
          </AuditCard>
        </aside>
      </main>
    </div>
  );
}

function Unavailable({
  detail = "NaLI needs a valid observation identifier before it can load reasoning snapshots, signal evidence, and linked field cases.",
  title,
}: {
  detail?: string;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-10 text-white">
      <section className="mx-auto max-w-xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Observation audit</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">{detail}</p>
        <Link className="mt-5 inline-flex rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#09090b]" href="/archive">
          Return to Archive
        </Link>
      </section>
    </div>
  );
}

function AuditCard({ children, icon: Icon, title }: { children: ReactNode; icon: LucideIcon; title: string }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-white/40">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
      <p className="mt-2 text-sm font-semibold capitalize text-white/70">{value}</p>
    </div>
  );
}

function ReasoningList({ empty, items, title }: { empty: string; items: string[]; title: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{title}</p>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm leading-6 text-white/50">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm leading-6 text-white/50">{empty}</p>
      )}
    </div>
  );
}

function ContextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
      <p className="mt-1 text-sm leading-6 text-white/50">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
      <p className="mt-2 break-all font-mono text-sm text-white/60">{value}</p>
    </div>
  );
}
