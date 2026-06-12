import "server-only";
import { createSupabaseServerClient } from "./supabase/server";

export interface DayBucket {
  key: string;
  label: string;
  count: number;
}

export interface AnalyticsSummary {
  total: number;
  last7: number;
  last30: number;
  days: DayBucket[];
  maxDay: number;
  topPaths: [string, number][];
  recent: { path: string; created_at: string }[];
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Aggregated self-hosted page-view analytics. Reads `page_views` via the
 * authenticated server client (admin RLS). Returns zeros if unreachable.
 */
export async function getAnalyticsSummary(dayWindow = 14): Promise<AnalyticsSummary> {
  const empty: AnalyticsSummary = {
    total: 0,
    last7: 0,
    last30: 0,
    days: [],
    maxDay: 1,
    topPaths: [],
    recent: [],
  };

  try {
    const supabase = createSupabaseServerClient();

    const { count: total } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true });

    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data } = await supabase
      .from("page_views")
      .select("path, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(10000);

    const rows = (data ?? []) as { path: string; created_at: string }[];
    const now = Date.now();

    const last7 = rows.filter((r) => now - new Date(r.created_at).getTime() < 7 * 864e5).length;
    const last30 = rows.length;

    const byPath = new Map<string, number>();
    for (const r of rows) byPath.set(r.path, (byPath.get(r.path) ?? 0) + 1);
    const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);

    const days: DayBucket[] = [];
    for (let i = dayWindow - 1; i >= 0; i--) {
      const d = new Date(now - i * 864e5);
      days.push({
        key: dayKey(d),
        label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        count: 0,
      });
    }
    const dayMap = new Map(days.map((d) => [d.key, d]));
    for (const r of rows) {
      const d = dayMap.get(dayKey(new Date(r.created_at)));
      if (d) d.count += 1;
    }
    const maxDay = Math.max(1, ...days.map((d) => d.count));

    return {
      total: total ?? 0,
      last7,
      last30,
      days,
      maxDay,
      topPaths,
      recent: rows.slice(0, 8),
    };
  } catch {
    return empty;
  }
}
