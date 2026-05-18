import { AlertTriangle, ClipboardList, Link2, UserCheck, type LucideIcon } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getServerTranslations } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type FieldCase = {
  id: string;
  case_type: string | null;
  status: string | null;
  priority_score: number | null;
  linked_observation_ids: unknown;
  linked_ecological_patterns: unknown;
  linked_anomaly_cluster_ids: unknown;
  reviewer_assignment_ids: unknown;
  operational_notes: unknown;
  updated_at: string | null;
};

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function formatStatus(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "pending";
}

function percent(value: number | null) {
  if (typeof value !== "number") return "Pending";
  return `${Math.round(value * 100)}%`;
}

export default async function FieldCasesPage() {
  const { t } = await getServerTranslations();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("field_cases")
    .select(
      "id, case_type, status, priority_score, linked_observation_ids, linked_ecological_patterns, linked_anomaly_cluster_ids, reviewer_assignment_ids, operational_notes, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(50);

  const cases = (data ?? []) as FieldCase[];
  const hasCases = cases.length > 0;

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 border-b border-white/[0.06] pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">{t("cases.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("cases.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{t("cases.context")}</p>
        </header>

        {error ? <EmptyState eyebrow={t("cases.noRecords")} title={t("cases.loadErrorTitle")} detail={t("cases.loadErrorDetail")} /> : null}

        {!error && !hasCases ? <EmptyState eyebrow={t("cases.noRecords")} title={t("cases.emptyTitle")} detail={t("cases.emptyDetail")} /> : null}

        {!error && hasCases ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((fieldCase) => {
              const observations = asStrings(fieldCase.linked_observation_ids);
              const clusters = [...asStrings(fieldCase.linked_ecological_patterns), ...asStrings(fieldCase.linked_anomaly_cluster_ids)];
              const reviewers = asStrings(fieldCase.reviewer_assignment_ids);
              const notes = asStrings(fieldCase.operational_notes);

              return (
                <article key={fieldCase.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm text-white/40">{fieldCase.id}</p>
                      <h2 className="mt-1 text-xl font-semibold capitalize">{formatStatus(fieldCase.case_type)}</h2>
                      <p className="mt-1 text-sm text-white/50">
                        Updated {fieldCase.updated_at ? new Date(fieldCase.updated_at).toLocaleString() : "time unavailable"}
                      </p>
                    </div>
                    <span className="rounded-full border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-green-300">
                      {formatStatus(fieldCase.status)}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Fact icon={AlertTriangle} label="Severity" value={percent(fieldCase.priority_score)} />
                    <Fact icon={ClipboardList} label="Case Confidence" value={percent(fieldCase.priority_score)} />
                    <Fact icon={UserCheck} label="Reviewer" value={reviewers[0] ?? "Unassigned"} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <LinkedList title={t("cases.linkedObservations")} items={observations} empty={t("cases.noLinkedObservations")} />
                    <LinkedList title={t("cases.linkedClusters")} items={clusters} empty={t("cases.noLinkedClusters")} />
                  </div>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-6 text-white/60">
                    {notes[0] ?? t("cases.notesPending")}
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

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <Icon className="mb-2 h-4 w-4 text-white/30" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-white/70">{value}</p>
    </div>
  );
}

function LinkedList({ empty, items, title }: { empty: string; items: string[]; title: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/30">
        <Link2 className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-xs text-white/50">{item}</div>
          ))
        ) : (
          <div className="rounded-lg border border-white/[0.06] px-3 py-2 text-xs text-white/40">{empty}</div>
        )}
      </div>
    </div>
  );
}
