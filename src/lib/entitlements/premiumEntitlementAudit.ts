import { createHash } from "node:crypto";
import type { JournalModelId } from "@/lib/reports/journalModelCapabilities";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export const PREMIUM_ENTITLEMENT_AUDIT_EVENT_TYPE = "PREMIUM_ENTITLEMENT_ATTEMPT";

export type PremiumEntitlementAuditDecision =
  | "allowed_peregrine_default"
  | "denied_missing_entitlement"
  | "denied_invalid_entitlement"
  | "allowed_internal_qa"
  | "denied_public_premium_inactive";

export type PremiumEntitlementAuditSource = "api_generate" | "readiness_check" | "founder_monitoring";
export type PremiumEntitlementAuditGuardStatus = "allowed" | "blocked" | "not_evaluated";

type RequestedTier = "starter" | "evidence_audit" | "premium_journal";
type NormalizedAuditPath = "/api/reports/generate" | "/api/system/readiness" | "/founder";
type UserAgentClass = "automation" | "browser" | "unknown";

export type PremiumEntitlementAuditEvent = {
  timestamp: string;
  modelId: JournalModelId;
  requestedTier: RequestedTier;
  decision: PremiumEntitlementAuditDecision;
  routeSource: PremiumEntitlementAuditSource;
  method: string;
  normalizedPath: NormalizedAuditPath;
  userAgentClass: UserAgentClass;
  userAgentHash?: string;
  rateStatus: PremiumEntitlementAuditGuardStatus;
  integrityStatus: PremiumEntitlementAuditGuardStatus;
};

type RecordPremiumEntitlementAttemptInput = {
  decision: PremiumEntitlementAuditDecision;
  integrityStatus?: PremiumEntitlementAuditGuardStatus;
  modelId: string;
  now?: Date;
  rateStatus?: PremiumEntitlementAuditGuardStatus;
  request: Request;
  routeSource?: PremiumEntitlementAuditSource;
};

const tierByModel: Record<JournalModelId, RequestedTier> = {
  peregrine: "starter",
  obsidian: "evidence_audit",
  zephyr: "premium_journal",
};

function normalizeModelId(modelId: string): JournalModelId {
  return modelId === "obsidian" || modelId === "zephyr" ? modelId : "peregrine";
}

function normalizePath(routeSource: PremiumEntitlementAuditSource): NormalizedAuditPath {
  if (routeSource === "readiness_check") return "/api/system/readiness";
  if (routeSource === "founder_monitoring") return "/founder";
  return "/api/reports/generate";
}

function classifyUserAgent(userAgent: string): UserAgentClass {
  if (!userAgent) return "unknown";
  return /bot|curl|headless|playwright|postman/i.test(userAgent) ? "automation" : "browser";
}

function shortHash(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function buildPremiumEntitlementAuditEvent({
  decision,
  integrityStatus = "not_evaluated",
  modelId,
  now = new Date(),
  rateStatus = "not_evaluated",
  request,
  routeSource = "api_generate",
}: RecordPremiumEntitlementAttemptInput): PremiumEntitlementAuditEvent {
  const normalizedModelId = normalizeModelId(modelId);
  const userAgent = request.headers.get("user-agent")?.trim() ?? "";

  return {
    decision,
    integrityStatus,
    method: request.method.toUpperCase(),
    modelId: normalizedModelId,
    normalizedPath: normalizePath(routeSource),
    rateStatus,
    requestedTier: tierByModel[normalizedModelId],
    routeSource,
    timestamp: now.toISOString(),
    userAgentClass: classifyUserAgent(userAgent),
    ...(userAgent ? { userAgentHash: shortHash(userAgent) } : {}),
  };
}

export async function recordPremiumEntitlementAttempt(input: RecordPremiumEntitlementAttemptInput) {
  const event = buildPremiumEntitlementAuditEvent(input);

  try {
    const supabase = getOptionalSupabaseAdminClient();
    if (!supabase) return { event, logged: false, reason: "supabase_unconfigured" as const };

    const { error } = await supabase.from("report_events").insert({
      event_type: PREMIUM_ENTITLEMENT_AUDIT_EVENT_TYPE,
      metadata: {
        decision: event.decision,
        integrity_status: event.integrityStatus,
        method: event.method,
        model_id: event.modelId,
        normalized_path: event.normalizedPath,
        rate_status: event.rateStatus,
        requested_tier: event.requestedTier,
        route_source: event.routeSource,
        timestamp: event.timestamp,
        user_agent_class: event.userAgentClass,
        ...(event.userAgentHash ? { user_agent_hash: event.userAgentHash } : {}),
      },
      report_id: null,
      status: event.decision === "allowed_internal_qa" ? "allowed_internal_qa" : "blocked",
    });

    if (error) return { event, logged: false, reason: "insert_failed" as const };
    return { event, logged: true as const };
  } catch {
    return { event, logged: false, reason: "logging_failed" as const };
  }
}
