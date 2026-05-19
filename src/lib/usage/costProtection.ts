import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export type UsageEnergyRow = {
  created_at?: string | null;
  estimated_energy?: number | null;
};

export type UsageStore = {
  listUsageEvents(startIso: string, endIso: string): Promise<{ ok: true; rows: UsageEnergyRow[] } | { ok: false; error: string }>;
};

export type DailyEstimatedUsage =
  | {
      configured: false;
      estimatedEnergy: 0;
      reason: "Usage logging not configured" | "Usage lookup failed";
    }
  | {
      configured: true;
      estimatedEnergy: number;
    };

export type CostProtectionStatus = {
  active: boolean;
  configured: boolean;
  costProtectionPrepared: true;
  estimatedEnergy?: number;
  limit?: number;
  reason?: "Usage logging not configured" | "Daily energy limit not configured" | "Usage lookup failed" | "Daily energy limit exceeded" | "Within daily energy limit";
};

type UsageOptions = {
  now?: Date;
  store?: UsageStore | null;
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function dailyLimit() {
  const parsed = Number(process.env.NALI_DAILY_ENERGY_LIMIT);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function dayWindow(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    endIso: end.toISOString(),
    startIso: start.toISOString(),
  };
}

function getDefaultUsageStore(): UsageStore | null {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) return null;

  return {
    async listUsageEvents(startIso, endIso) {
      const { data, error } = await supabase
        .from("usage_events")
        .select("estimated_energy,created_at")
        .gte("created_at", startIso)
        .lt("created_at", endIso);

      if (error) return { ok: false, error: error.message };
      return { ok: true, rows: (data ?? []) as UsageEnergyRow[] };
    },
  };
}

function getUsageStore(options: UsageOptions) {
  if ("store" in options) return options.store ?? null;
  return getDefaultUsageStore();
}

export function createMemoryUsageStore(rows: UsageEnergyRow[] = []): UsageStore {
  return {
    async listUsageEvents(startIso, endIso) {
      const start = new Date(startIso).getTime();
      const end = new Date(endIso).getTime();
      return {
        ok: true,
        rows: rows.filter((row) => {
          const createdAt = row.created_at ? new Date(row.created_at).getTime() : start;
          return createdAt >= start && createdAt < end;
        }),
      };
    },
  };
}

export async function getDailyEstimatedUsage(options: UsageOptions = {}): Promise<DailyEstimatedUsage> {
  const store = getUsageStore(options);

  if (!store) {
    return {
      configured: false,
      estimatedEnergy: 0,
      reason: "Usage logging not configured",
    };
  }

  const { startIso, endIso } = dayWindow(options.now ?? new Date());
  const result = await store.listUsageEvents(startIso, endIso);

  if (!result.ok) {
    return {
      configured: false,
      estimatedEnergy: 0,
      reason: "Usage lookup failed",
    };
  }

  return {
    configured: true,
    estimatedEnergy: result.rows.reduce((sum, row) => sum + (row.estimated_energy ?? 0), 0),
  };
}

export async function shouldEnterCostProtectionMode(options: UsageOptions = {}) {
  return getCostProtectionStatus(options);
}

export async function getCostProtectionStatus(options: UsageOptions = {}): Promise<CostProtectionStatus> {
  const limit = dailyLimit();

  if (!limit) {
    return {
      active: false,
      configured: false,
      costProtectionPrepared: true,
      reason: "Daily energy limit not configured",
    };
  }

  const usage = await getDailyEstimatedUsage(options);

  if (!usage.configured) {
    return {
      active: false,
      configured: false,
      costProtectionPrepared: true,
      reason: usage.reason,
    };
  }

  const active = usage.estimatedEnergy >= limit;

  return {
    active,
    configured: true,
    costProtectionPrepared: true,
    estimatedEnergy: usage.estimatedEnergy,
    limit,
    reason: active ? "Daily energy limit exceeded" : "Within daily energy limit",
  };
}

export function getCostProtectionReadiness() {
  const supabaseConfigured = Boolean(
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) && hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
  const configured = supabaseConfigured && Boolean(dailyLimit());

  return {
    costProtectionActive: false,
    costProtectionConfigured: configured,
    costProtectionPrepared: true as const,
  };
}
