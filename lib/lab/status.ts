import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/* -------------------------------------------------------------------------- */
/*  Lab live status (drives the /lab operator character).                      */
/*                                                                            */
/*  Reads public.lab_harvest_runs (admin-only RLS) and derives a real, honest  */
/*  machine state from the last run's timestamp. No fabrication: if there are   */
/*  no runs, the state is "sleeping" and counts are zero. NEVER imported by a   */
/*  public route (check-lab-isolation.mjs enforces this).                      */
/* -------------------------------------------------------------------------- */

export type LabState = "working" | "idle" | "sleeping";

export interface LabStatus {
  state: LabState;
  lastRunAt: string | null;
  minutesSinceLastRun: number | null;
  lastStatus: string | null;
  activeSources: string[];
  totalRuns: number;
  successRuns: number;
  leadsTracked: number;
  nextScheduledRun: string; // ISO, next Mon 02:00 UTC (the pg_cron schedule)
}

const WORKING_WINDOW_MIN = 30; // a run finished in the last 30 min = "just worked"
const IDLE_WINDOW_MIN = 24 * 60; // 30 min .. 24h = resting; older = sleeping

const SOURCE_LABEL: Record<string, string> = {
  gbif: "GBIF",
  inat: "iNaturalist",
  iucn: "IUCN",
};

/** Next Monday 02:00 UTC (09:00 WIB), matching the pg_cron schedule. */
function nextMonday0200UTC(from = new Date()): string {
  const d = new Date(from);
  d.setUTCSeconds(0, 0);
  d.setUTCMinutes(0);
  d.setUTCHours(2);
  // 1 = Monday
  const day = d.getUTCDay();
  let add = (1 - day + 7) % 7;
  if (add === 0 && from.getTime() >= d.getTime()) add = 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString();
}

export async function getLabStatus(): Promise<LabStatus> {
  const nextScheduledRun = nextMonday0200UTC();
  const base: LabStatus = {
    state: "sleeping",
    lastRunAt: null,
    minutesSinceLastRun: null,
    lastStatus: null,
    activeSources: [],
    totalRuns: 0,
    successRuns: 0,
    leadsTracked: 0,
    nextScheduledRun,
  };

  try {
    const sb = createSupabaseServerClient();
    const [{ data: runs }, { count: leadCount }] = await Promise.all([
      sb
        .from("lab_harvest_runs")
        .select("ran_at, status, providers")
        .order("ran_at", { ascending: false })
        .limit(200),
      sb.from("lab_leads").select("*", { count: "exact", head: true }),
    ]);

    if (!Array.isArray(runs) || runs.length === 0) return base;

    const totalRuns = runs.length;
    const successRuns = runs.filter((r) => r.status === "success").length;
    const last = runs[0] as { ran_at: string; status: string; providers: unknown };
    const lastRunAt = last.ran_at;
    const minutesSince = Math.max(0, Math.floor((Date.now() - new Date(lastRunAt).getTime()) / 60000));

    const providers = Array.isArray(last.providers) ? (last.providers as { source: string; ok: boolean }[]) : [];
    const activeSources = providers
      .filter((p) => p.ok)
      .map((p) => SOURCE_LABEL[p.source] ?? p.source);

    let state: LabState = "sleeping";
    if (minutesSince <= WORKING_WINDOW_MIN) state = "working";
    else if (minutesSince <= IDLE_WINDOW_MIN) state = "idle";

    return {
      state,
      lastRunAt,
      minutesSinceLastRun: minutesSince,
      lastStatus: last.status ?? null,
      activeSources,
      totalRuns,
      successRuns,
      leadsTracked: leadCount ?? 0,
      nextScheduledRun,
    };
  } catch {
    return base;
  }
}
