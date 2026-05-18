import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ClipboardCheck, Fingerprint, ShieldCheck, type LucideIcon } from "lucide-react";
import { ReviewActionForm } from "@/components/review/ReviewActionForm";
import { getOperationalRole } from "@/lib/auth/roles";
import { getServerTranslations } from "@/lib/i18n/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ReviewQueueRow = {
  id: string;
  scientific_name: string | null;
  local_name: string | null;
  conservation_status: string | null;
  confidence_level: number | null;
  review_status: string | null;
  observation_status: string | null;
  anomaly_flag: boolean | null;
  is_anomaly: boolean | null;
  reasoning_snapshot: Record<string, unknown> | null;
  signal_snapshot: Record<string, unknown> | null;
  created_at: string | null;
};

export default async function ReviewPage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const role = await getOperationalRole(supabase, session.user.id);
  if (!role.canReview) {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white">
        <section className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">
            {t("reviewQueue.roleKicker")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{t("reviewQueue.roleTitle")}</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">{t("reviewQueue.roleDescription")}</p>
        </section>
      </main>
    );
  }

  const { data } = await supabase
    .from("observations")
    .select(
      "id, scientific_name, local_name, conservation_status, confidence_level, review_status, observation_status, anomaly_flag, is_anomaly, reasoning_snapshot, signal_snapshot, created_at",
    )
    .or("qa_flag.eq.true,review_status.eq.unreviewed,observation_status.eq.pending_review")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as ReviewQueueRow[];

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{t("reviewQueue.kicker")}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t("reviewQueue.title")}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/50">{t("reviewQueue.description")}</p>

        <div className="mt-6 grid gap-4">
          {rows.length ? (
            rows.map((row) => {
              const reasoning = row.reasoning_snapshot ?? {};
              const signals = row.signal_snapshot ?? {};
              return (
                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm" key={row.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">
                        {row.observation_status || t("reviewQueue.pendingReview")}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold italic">
                        {row.scientific_name || t("reviewQueue.speciesPending")}
                      </h2>
                      <p className="text-sm text-white/50">{row.local_name || t("reviewQueue.commonNamePending")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ReviewBadge icon={ShieldCheck} label={row.conservation_status || "NE"} />
                      <ReviewBadge icon={ClipboardCheck} label={row.review_status || t("reviewQueue.unreviewed")} />
                      {row.anomaly_flag || row.is_anomaly ? (
                        <ReviewBadge icon={AlertTriangle} label={t("reviewQueue.anomaly")} />
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <Metric
                      label={t("reviewQueue.confidence")}
                      value={
                        row.confidence_level ? `${Math.round(row.confidence_level * 100)}%` : t("reviewQueue.pending")
                      }
                    />
                    <Metric label={t("reviewQueue.evidenceHash")} value={t("reviewQueue.openDetailForHash")} />
                    <Metric
                      label={t("reviewQueue.reasoningSnapshot")}
                      value={Object.keys(reasoning).length ? t("reviewQueue.persisted") : t("reviewQueue.pending")}
                    />
                    <Metric
                      label={t("reviewQueue.signalSnapshot")}
                      value={Object.keys(signals).length ? t("reviewQueue.persisted") : t("reviewQueue.pending")}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08]"
                      href={`/observation/${row.id}`}
                    >
                      <Fingerprint className="h-4 w-4" />
                      {t("reviewQueue.openAuditDetail")}
                    </Link>
                  </div>

                  <ReviewActionForm observationId={row.id} />
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm leading-6 text-white/50 backdrop-blur-sm">
              {t("reviewQueue.empty")}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ReviewBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white/60">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white/70">{value}</p>
    </div>
  );
}
