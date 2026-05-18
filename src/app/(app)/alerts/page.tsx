import { AlertTriangle, ArrowUpRight, Link2, ShieldAlert } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type AlertRow = {
  id: string;
  alert_type: string;
  severity: string;
  region_key: string;
  evidence_pattern_ids: unknown;
  evidence_observation_ids: unknown;
  operational_summary: string;
  generated_at: string;
};

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

export default async function EcologicalAlertsPage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ecological_alerts")
    .select(
      "id, alert_type, severity, region_key, evidence_pattern_ids, evidence_observation_ids, operational_summary, generated_at",
    )
    .is("resolved_at", null)
    .order("generated_at", { ascending: false })
    .limit(50);

  const alerts = (data ?? []) as AlertRow[];
  const hasAlerts = alerts.length > 0;

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-white/[0.06] pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">{t("alerts.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("alerts.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{t("alerts.context")}</p>
        </header>

        {error ? <EmptyState eyebrow={t("alerts.noEvidence")} title={t("alerts.loadErrorTitle")} detail={t("alerts.loadErrorDetail")} /> : null}

        {!error && !hasAlerts ? <EmptyState eyebrow={t("alerts.noEvidence")} title={t("alerts.emptyTitle")} detail={t("alerts.emptyDetail")} /> : null}

        {!error && hasAlerts ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {alerts.map((alert) => {
              const evidence = [...asStrings(alert.evidence_pattern_ids), ...asStrings(alert.evidence_observation_ids)];
              return (
                <article key={alert.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                        {alert.severity === "high" || alert.severity === "critical" ? (
                          <ShieldAlert className="h-5 w-5 text-red-400/60" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-400/60" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-sm text-white/40">{alert.id}</p>
                        <h2 className="mt-1 text-xl font-semibold capitalize">{formatStatus(alert.alert_type)}</h2>
                        <p className="mt-1 text-sm text-white/50">{alert.region_key}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-300">
                      {alert.severity}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Metric label="Generated" value={new Date(alert.generated_at).toLocaleString()} />
                    <Metric label="Alert type" value={formatStatus(alert.alert_type)} />
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-6 text-white/60">
                    {alert.operational_summary}
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
                      <Link2 className="h-3.5 w-3.5" />
                      {t("alerts.linkedEvidence")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evidence.length ? (
                        evidence.map((item) => (
                          <span key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-xs text-white/50">{item}</span>
                        ))
                      ) : (
                        <span className="rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-white/40">{t("alerts.evidencePending")}</span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ detail, eyebrow, title }: { detail: string; eyebrow: string; title: string }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{detail}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
        <ArrowUpRight className="h-3.5 w-3.5 text-white/20" />
      </div>
      <p className="mt-2 break-all text-sm text-white/60">{value}</p>
    </div>
  );
}
