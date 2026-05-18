import { PatrolPlanExport } from "@/components/patrol/PatrolPlanExport";
import { getServerTranslations } from "@/lib/i18n/server";
import { buildDeterministicPatrolPlan, patrolPlannerDisclaimer } from "@/lib/patrol-planner";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function countRows(query: PromiseLike<{ count: number | null }>) {
  const result = await query;
  return result.count ?? 0;
}

export default async function PatrolPlanPage() {
  const { language, t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const [latestObservationCount, unresolvedAnomalyCount, threatEventCount, highPriorityCaseCount] = session
    ? await Promise.all([
        countRows(
          supabase
            .from("observations")
            .select("id", { count: "exact", head: true })
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ),
        countRows(
          supabase
            .from("observation_anomaly_flags")
            .select("id", { count: "exact", head: true })
            .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        ),
        countRows(
          supabase
            .from("threat_events")
            .select("id", { count: "exact", head: true })
            .gte("timestamp", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        ),
        countRows(supabase.from("field_cases").select("id", { count: "exact", head: true }).gte("priority_score", 0.7)),
      ])
    : [0, 0, 0, 0];

  const priorities = buildDeterministicPatrolPlan(
    {
      latestObservationCount,
      unresolvedAnomalyCount,
      threatEventCount,
      staleGridCount: Math.max(0, 6 - latestObservationCount),
      highPriorityCaseCount,
    },
    language,
  );

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{t("patrolPlan.kicker")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("patrolPlan.title")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">{t("patrolPlan.description")}</p>

        <div className="mt-6 grid gap-4">
          {priorities.map((priority, index) => (
            <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm" key={priority.targetArea}>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{priority.targetArea}</h2>
              <dl className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label={t("patrolPlan.reason")} value={priority.reason} />
                <Field label={t("patrolPlan.window")} value={priority.bestTimeWindow} />
                <Field label={t("patrolPlan.caution")} value={priority.cautionNotes} />
              </dl>
            </article>
          ))}
        </div>

        <p className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm leading-6 text-white/50 backdrop-blur-sm">
          {patrolPlannerDisclaimer[language]}
        </p>
        <PatrolPlanExport priorities={priorities} />
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-white/60">{value}</dd>
    </div>
  );
}
