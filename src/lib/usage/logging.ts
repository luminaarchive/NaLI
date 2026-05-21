import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGuestSessionIdHash, isUsableGuestSessionId } from "@/lib/reports/access";
import type { ReportMode } from "@/lib/reports/reportGenerator";
import { logApiUsage, sanitizeOperationalMetadata } from "@/lib/operations/logging";

export type ProcessingClass = "Peregrine" | "Obsidian" | "Zephyr";

export type UsageActionType =
  | "report_preview"
  | "start_from_zero_guidance"
  | "premium_export_attempt"
  | "feedback_capture";

export type UsageEstimate = {
  estimatedEnergy: number;
  processingClass: ProcessingClass;
};

export type UsageEventInput = {
  actionType: UsageActionType | string;
  estimatedCostIdr?: number | null;
  guestSessionId?: unknown;
  guestSessionIdHash?: string | null;
  inputSize?: number;
  metadata?: Record<string, unknown>;
  mode?: ReportMode;
  reportId?: string | null;
  status?: string;
};

function resolveGuestSessionHash(input: Pick<UsageEventInput, "guestSessionId" | "guestSessionIdHash">) {
  if (input.guestSessionIdHash) {
    return input.guestSessionIdHash;
  }

  if (!isUsableGuestSessionId(input.guestSessionId)) {
    return null;
  }

  return getGuestSessionIdHash(input.guestSessionId);
}

export function estimateEnergyForAction(
  actionType: UsageActionType | string,
  mode?: ReportMode,
  inputSize = 0,
): UsageEstimate {
  if (actionType === "premium_export_attempt") {
    return { estimatedEnergy: 1, processingClass: "Peregrine" };
  }

  if (actionType === "feedback_capture") {
    return { estimatedEnergy: 0, processingClass: "Peregrine" };
  }

  if (mode === "start_from_zero" || actionType === "start_from_zero_guidance") {
    return { estimatedEnergy: inputSize > 3000 ? 4 : 2, processingClass: "Peregrine" };
  }

  if (inputSize > 6000) {
    return { estimatedEnergy: 12, processingClass: "Obsidian" };
  }

  if (inputSize > 2500) {
    return { estimatedEnergy: 8, processingClass: "Obsidian" };
  }

  return { estimatedEnergy: 5, processingClass: "Peregrine" };
}

function getApiUsageStatus(input: UsageEventInput) {
  const status = input.status?.toLowerCase() ?? "";
  const resultKind = typeof input.metadata?.result_kind === "string" ? input.metadata.result_kind : "";

  if (status.includes("fail") || status.includes("error")) return "failed" as const;
  if (resultKind === "provider") return "success" as const;
  return "skipped" as const;
}

function getApiUsageOperation(actionType: UsageActionType | string) {
  if (actionType === "report_preview" || actionType === "start_from_zero_guidance") return "report_generation";
  if (actionType === "premium_export_attempt") return "premium_export_gate";
  if (actionType === "feedback_capture") return "feedback_capture";
  return actionType;
}

export async function logUsageEvent(input: UsageEventInput) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { logged: false as const, reason: "supabase_unconfigured" as const };
  }

  const estimate = estimateEnergyForAction(input.actionType, input.mode, input.inputSize);
  const sanitizedMetadata = sanitizeOperationalMetadata(input.metadata);
  const { error } = await supabase.from("usage_events").insert({
    action_type: input.actionType,
    estimated_cost_idr: input.estimatedCostIdr ?? null,
    estimated_energy: estimate.estimatedEnergy,
    guest_session_id_hash: resolveGuestSessionHash(input),
    metadata: sanitizedMetadata,
    processing_class: estimate.processingClass,
    report_id: input.reportId ?? null,
    status: input.status ?? "recorded",
  });

  void logApiUsage({
    estimatedCost: null,
    estimatedInputTokens: input.inputSize ? Math.ceil(input.inputSize / 4) : null,
    modelAlias: estimate.processingClass.toLowerCase(),
    operation: getApiUsageOperation(input.actionType),
    providerAlias: "nali_internal",
    reportId: input.reportId,
    status: getApiUsageStatus(input),
  });

  if (error) {
    console.warn("NaLI usage event logging skipped", {
      code: error.code,
      message: error.message,
    });
    return { logged: false as const, reason: "insert_failed" as const };
  }

  return {
    estimate,
    logged: true as const,
  };
}

export async function getDailyUsageSummary(date = new Date()) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { ready: false as const, reason: "supabase_unconfigured" as const };
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from("usage_events")
    .select("action_type, estimated_energy, status, processing_class")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) {
    console.warn("NaLI usage summary lookup skipped", {
      code: error.code,
      message: error.message,
    });
    return { ready: false as const, reason: "lookup_failed" as const };
  }

  const events = (data ?? []) as Array<{
    action_type: string;
    estimated_energy: number | null;
    processing_class: ProcessingClass | null;
    status: string | null;
  }>;

  return {
    ready: true as const,
    summary: {
      estimatedEnergy: events.reduce((sum, event) => sum + (event.estimated_energy ?? 0), 0),
      eventCount: events.length,
      processingClasses: Array.from(new Set(events.map((event) => event.processing_class).filter(Boolean))),
    },
  };
}

export function shouldEnterCostProtectionMode() {
  return {
    active: false as const,
    reason: "Sprint 0 cost protection is observational only.",
  };
}
