import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export const REPORT_EVENT_TYPES = [
  "REPORT_CREATED",
  "PREVIEW_GENERATED",
  "PAYMENT_CREATED",
  "PAYMENT_CONFIRMED",
  "EXPORT_ATTEMPTED",
  "EXPORT_UNLOCKED",
  "FEEDBACK_SUBMITTED",
] as const;

export type ReportEventType = (typeof REPORT_EVENT_TYPES)[number];
export type ApiUsageLogStatus = "success" | "failed" | "skipped";

type JsonSafeValue = boolean | number | string | null | JsonSafeValue[] | { [key: string]: JsonSafeValue };

type ReportEventInput = {
  eventType: ReportEventType;
  metadata?: Record<string, unknown>;
  reportId?: string | null;
  status?: string;
};

type ApiUsageLogInput = {
  estimatedCost?: number | null;
  estimatedInputTokens?: number | null;
  estimatedOutputTokens?: number | null;
  modelAlias?: string | null;
  operation: string;
  providerAlias?: string | null;
  reportId?: string | null;
  status: ApiUsageLogStatus;
};

const SENSITIVE_KEY_PATTERN =
  /(?:guest|session|access|token|hash|secret|service[_-]?role|signature|authorization|cookie|snap|midtrans|checkout|url|reference|raw[_-]?notification|provider|model|key)/i;

const SECRET_VALUE_PATTERNS = [
  /guest-session-[a-z0-9-]+/i,
  /\b[a-f0-9]{64}\b/i,
  /service_role/i,
  /MIDTRANS_SERVER_KEY/i,
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /OPENROUTER_API_KEY/i,
  /signature_key/i,
  /[A-Za-z0-9_-]{48,}/,
];

function isSecretLikeString(value: string) {
  return SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

function sanitizeString(value: string) {
  const trimmed = value.trim();
  if (isSecretLikeString(trimmed)) return "[redacted]";
  return trimmed.length > 500 ? `${trimmed.slice(0, 500)}...` : trimmed;
}

function sanitizeValue(value: unknown, depth: number): JsonSafeValue {
  if (value == null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return sanitizeString(value);
  if (Array.isArray(value)) {
    if (depth >= 3) return "[redacted]";
    return value.slice(0, 20).map((item) => sanitizeValue(item, depth + 1));
  }
  if (typeof value === "object") {
    if (depth >= 3) return "[redacted]";
    return sanitizeOperationalMetadata(value as Record<string, unknown>, depth + 1);
  }

  return String(value);
}

export function sanitizeOperationalMetadata(input: Record<string, unknown> = {}, depth = 0): Record<string, JsonSafeValue> {
  const sanitized: Record<string, JsonSafeValue> = {};
  const entries = Object.entries(input).slice(0, 50);

  for (const [key, value] of entries) {
    const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 80) || "field";
    sanitized[safeKey] = SENSITIVE_KEY_PATTERN.test(safeKey) ? "[redacted]" : sanitizeValue(value, depth);
  }

  return sanitized;
}

function sanitizeAlias(value: string | null | undefined, fallback: string) {
  if (!value?.trim()) return fallback;
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_").slice(0, 60);

  if (!normalized || /openrouter|gpt|gemini|claude|midtrans|secret|token|key|server/.test(normalized)) {
    return fallback;
  }

  return normalized;
}

function positiveIntegerOrNull(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return Math.round(value);
}

function costOrNull(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return value;
}

export function estimateTokenCountFromText(value: string | null | undefined) {
  if (!value) return null;
  return Math.max(1, Math.ceil(value.length / 4));
}

export async function logReportEvent(input: ReportEventInput) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { logged: false as const, reason: "supabase_unconfigured" as const };
  }

  const { error } = await supabase.from("report_events").insert({
    event_type: input.eventType,
    metadata: sanitizeOperationalMetadata(input.metadata),
    report_id: input.reportId ?? null,
    status: input.status ?? "recorded",
  });

  if (error) {
    console.warn("NaLI report event logging skipped", {
      code: error.code,
      message: error.message,
    });
    return { logged: false as const, reason: "insert_failed" as const };
  }

  return { logged: true as const };
}

export async function logApiUsage(input: ApiUsageLogInput) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { logged: false as const, reason: "supabase_unconfigured" as const };
  }

  const { error } = await supabase.from("api_usage_logs").insert({
    estimated_cost: costOrNull(input.estimatedCost),
    estimated_input_tokens: positiveIntegerOrNull(input.estimatedInputTokens),
    estimated_output_tokens: positiveIntegerOrNull(input.estimatedOutputTokens),
    model_alias: sanitizeAlias(input.modelAlias, "mvp_flow"),
    operation: sanitizeAlias(input.operation, "unknown_operation"),
    provider_alias: sanitizeAlias(input.providerAlias, "nali_internal"),
    report_id: input.reportId ?? null,
    status: input.status,
  });

  if (error) {
    console.warn("NaLI API usage logging skipped", {
      code: error.code,
      message: error.message,
    });
    return { logged: false as const, reason: "insert_failed" as const };
  }

  return { logged: true as const };
}
