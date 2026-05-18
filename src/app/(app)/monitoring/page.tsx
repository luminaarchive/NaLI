import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Leaf,
  MapPinned,
  Route,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ObservationRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  scientific_name: string | null;
  conservation_status: string | null;
  conservation_priority_category: string | null;
  conservation_priority_score: number | null;
  confidence_level: number | null;
  is_anomaly: boolean | null;
  anomaly_flag: boolean | null;
  created_at: string | null;
};

type PatternRow = {
  id: string;
  region_key: string;
  pattern_type: string;
  severity: string;
  confidence: number;
  evidence_summary: string[] | null;
};

type AlertRow = {
  id: string;
  severity: string;
  region_key: string;
  operational_summary: string;
};

type CaseRow = {
  id: string;
  case_type: string | null;
  status: string | null;
  priority_score: number | null;
};

function percent(value: number) {
  return `${Math.round(Math.max(0, Math.min(value, 1)) * 100)}%`;
}

function regionKey(observation: ObservationRow) {
  if (typeof observation.latitude !== "number" || typeof observation.longitude !== "number") return "region:unknown";
  return `region:${observation.latitude.toFixed(1)}:${observation.longitude.toFixed(1)}`;
}

function formatStatus(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "pending";
}

export default async function MonitoringPage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [observationsResult, patternsResult, alertsResult, casesResult, driftResult] = await Promise.all([
    user
      ? supabase
          .from("observations")
          .select(
            "id, latitude, longitude, scientific_name, conservation_status, conservation_priority_category, conservation_priority_score, confidence_level, is_anomaly, anomaly_flag, created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("longitudinal_patterns")
      .select("id, region_key, pattern_type, severity, confidence, evidence_summary")
      .order("detected_at", { ascending: false })
      .limit(8),
    supabase
      .from("ecological_alerts")
      .select("id, severity, region_key, operational_summary")
      .is("resolved_at", null)
      .order("generated_at", { ascending: false })
      .limit(6),
    supabase
      .from("field_cases")
      .select("id, case_type, status, priority_score")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase.from("confidence_evolution_events").select("drift").order("created_at", { ascending: false }).limit(25),
  ]);

  const observations = (observationsResult.data ?? []) as ObservationRow[];
  const patterns = (patternsResult.data ?? []) as PatternRow[];
  const alerts = (alertsResult.data ?? []) as AlertRow[];
  const cases = (casesResult.data ?? []) as CaseRow[];
  const drifts = ((driftResult.data ?? []) as Array<{ drift: number | null }>).map((row) => row.drift ?? 0);
  const averageDrift = drifts.length ? drifts.reduce((total, drift) => total + drift, 0) / drifts.length : 0;
  const hasMonitoringData = observations.length > 0 || patterns.length > 0 || alerts.length > 0 || cases.length > 0;

  const regionMap = new Map<string, ObservationRow[]>();
  observations.forEach((observation) => {
    const key = regionKey(observation);
    regionMap.set(key, [...(regionMap.get(key) ?? []), observation]);
  });
  const regions = [...regionMap.entries()].map(([key, entries]) => {
    const endangered = entries.filter((entry) => ["CR", "EN"].includes(entry.conservation_status ?? "")).length;
    const anomalies = entries.filter((entry) => entry.is_anomaly || entry.anomaly_flag).length;
    const priorities = entries.map((entry) => entry.conservation_priority_score ?? 0).filter(Boolean);
    const confidence = entries.map((entry) => entry.confidence_level ?? 0).filter(Boolean);

    return {
      code: key,
      name: key === "region:unknown" ? "Unlocated observation region" : key,
      observationCount: entries.length,
      endangeredDensity: endangered / entries.length,
      anomalyPressure: anomalies / entries.length,
      priorityPressure: priorities.length
        ? priorities.reduce((total, value) => total + value, 0) / priorities.length
        : 0,
      confidenceAverage: confidence.length
        ? confidence.reduce((total, value) => total + value, 0) / confidence.length
        : 0,
    };
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <section className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_390px] lg:px-8">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
              {t("monitoring.eyebrow")}
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
              {t("monitoring.title")}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 md:text-base">{t("monitoring.context")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Metric icon={ShieldAlert} label="Escalation Regions" value={String(regions.length)} />
            <Metric icon={AlertTriangle} label="Active Alerts" value={String(alerts.length)} />
            <Metric icon={Leaf} label="Field Cases" value={String(cases.length)} />
            <Metric icon={Route} label="Confidence Drift" value={averageDrift.toFixed(2)} />
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        {!hasMonitoringData ? (
          <div className="lg:col-span-2">
            <EmptyState title={t("monitoring.emptyTitle")} detail={t("monitoring.emptyDetail")} />
          </div>
        ) : (
          <>
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
                    {t("monitoring.regionalWatchGrid")}
                  </p>
                  <h2 className="text-xl font-semibold text-white">
                    {t("monitoring.ecologicalPressureRegions")}
                  </h2>
                </div>
                <MapPinned className="h-5 w-5 shrink-0 text-white/30" />
              </div>

              {regions.length ? (
                <div className="space-y-4">
                  {regions.map((region) => (
                    <article key={region.code} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white/80">{region.name}</h3>
                          <p className="mt-1 text-xs text-white/30">
                            {region.observationCount} persisted observations
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <SignalBar label="Endangered density" value={region.endangeredDensity} />
                        <SignalBar label="Anomaly pressure" value={region.anomalyPressure} />
                        <SignalBar label="Priority pressure" value={region.priorityPressure} />
                        <SignalBar label="Confidence average" value={region.confidenceAverage} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title={t("monitoring.noLocatedRegions")} detail={t("monitoring.noLocatedRegionsDetail")} />
              )}
            </section>

            <section className="space-y-5">
              <Panel icon={Activity} title="Anomaly clusters">
                {patterns.length ? (
                  <div className="space-y-3">
                    {patterns.map((pattern) => (
                      <div key={pattern.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-white/80">
                            {formatStatus(pattern.pattern_type)}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">
                            {pattern.severity}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-white/50">
                          {pattern.evidence_summary?.[0] ?? pattern.region_key}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-white/50">No persisted anomaly clusters yet.</p>
                )}
              </Panel>

              <Panel icon={AlertTriangle} title="Ecological alerts">
                {alerts.length ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Link
                        className="flex items-start justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/60 transition hover:border-white/[0.12]"
                        href="/alerts"
                        key={alert.id}
                      >
                        <span>{alert.operational_summary}</span>
                        <ArrowRight className="mt-1 h-4 w-4 shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-white/50">No active ecological alerts are persisted.</p>
                )}
              </Panel>

              <Panel icon={Briefcase} title="Linked field cases">
                {cases.length ? (
                  <div className="space-y-3 text-sm leading-6 text-white/60">
                    {cases.map((fieldCase) => (
                      <Link
                        className="block rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:border-white/[0.12]"
                        href="/cases"
                        key={fieldCase.id}
                      >
                        {fieldCase.id}: {formatStatus(fieldCase.case_type)} ({formatStatus(fieldCase.status)})
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-white/50">No linked field cases have been created.</p>
                )}
              </Panel>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SignalBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
        <span>{label}</span>
        <span className="shrink-0">{percent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-indigo-500/60" style={{ width: percent(value) }} />
      </div>
    </div>
  );
}

function EmptyState({ detail, title }: { detail: string; title: string }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">Waiting for field data</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{detail}</p>
    </section>
  );
}

function Panel({ children, icon: Icon, title }: { children: ReactNode; icon: LucideIcon; title: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-white/40" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 backdrop-blur-sm">
      <Icon className="mb-3 h-5 w-5 text-white/40" />
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
    </div>
  );
}
