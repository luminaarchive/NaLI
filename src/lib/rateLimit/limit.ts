import { getGuestSessionIdHash, hashSecret, isUsableGuestSessionId } from "@/lib/reports/access";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export type RateLimitActionType =
  | "generate_report"
  | "create_upload"
  | "confirm_upload"
  | "payment_create"
  | "feedback_submit"
  | "maintenance_purge";

export type RateLimitRow = {
  action_type: RateLimitActionType | string;
  attempts: number;
  key_hash: string;
  last_attempt_at?: string | null;
  locked_until?: string | null;
  updated_at?: string | null;
};

export type RateLimitStore = {
  get(keyHash: string, actionType: RateLimitActionType): Promise<{ ok: true; row: RateLimitRow | null } | { ok: false; error: string }>;
  upsert(row: RateLimitRow): Promise<{ ok: true } | { ok: false; error: string }>;
};

export type RateLimitResult = {
  actionType: RateLimitActionType;
  allowed: boolean;
  configured: boolean;
  limit: number;
  reason?: "supabase_unconfigured" | "lookup_failed" | "update_failed" | "locked" | "limit_exceeded";
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitOptions = {
  actionType: RateLimitActionType;
  guestSessionId?: unknown;
  lockMs?: number;
  maxAttempts?: number;
  now?: Date;
  request?: Request;
  store?: RateLimitStore | null;
  windowMs?: number;
};

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

const defaultLimits: Record<RateLimitActionType, { lockMs: number; maxAttempts: number; windowMs: number }> = {
  confirm_upload: { lockMs: ONE_DAY_MS, maxAttempts: 20, windowMs: ONE_DAY_MS },
  create_upload: { lockMs: ONE_DAY_MS, maxAttempts: 10, windowMs: ONE_DAY_MS },
  feedback_submit: { lockMs: ONE_DAY_MS, maxAttempts: 20, windowMs: ONE_DAY_MS },
  generate_report: { lockMs: ONE_DAY_MS, maxAttempts: 10, windowMs: ONE_DAY_MS },
  maintenance_purge: { lockMs: ONE_HOUR_MS, maxAttempts: 3, windowMs: ONE_HOUR_MS },
  payment_create: { lockMs: ONE_HOUR_MS, maxAttempts: 10, windowMs: ONE_HOUR_MS },
};

function dateValue(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function retryAfterSeconds(untilMs: number, nowMs: number) {
  return Math.max(Math.ceil((untilMs - nowMs) / 1000), 0);
}

function headerValue(request: Request | undefined, key: string) {
  return request?.headers.get(key) ?? "";
}

export function resolveRateLimitKey({
  guestSessionId,
  request,
}: {
  guestSessionId?: unknown;
  request?: Request;
}) {
  if (isUsableGuestSessionId(guestSessionId)) {
    return {
      keyHash: getGuestSessionIdHash(guestSessionId),
      source: "guest_session_hash" as const,
    };
  }

  const forwardedFor = headerValue(request, "x-forwarded-for").split(",")[0]?.trim();
  const realIp = headerValue(request, "x-real-ip").trim();
  const userAgent = headerValue(request, "user-agent").trim();
  const rawFingerprint = `request:${forwardedFor || realIp || "unknown"}:${userAgent || "unknown"}`;

  return {
    keyHash: hashSecret(rawFingerprint),
    source: "request_fingerprint_hash" as const,
  };
}

function getDefaultRateLimitStore(): RateLimitStore | null {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) return null;

  return {
    async get(keyHash, actionType) {
      const { data, error } = await supabase
        .from("rate_limits")
        .select("key_hash,action_type,attempts,locked_until,last_attempt_at,updated_at")
        .eq("key_hash", keyHash)
        .eq("action_type", actionType)
        .maybeSingle();

      if (error) return { ok: false, error: error.message };
      return { ok: true, row: data as RateLimitRow | null };
    },
    async upsert(row) {
      const { error } = await supabase.from("rate_limits").upsert(row, { onConflict: "key_hash,action_type" });
      return error ? { ok: false, error: error.message } : { ok: true };
    },
  };
}

function getRateLimitStore(options: RateLimitOptions) {
  if ("store" in options) return options.store ?? null;
  return getDefaultRateLimitStore();
}

export function createMemoryRateLimitStore(initialRows: RateLimitRow[] = []) {
  const rows = new Map<string, RateLimitRow>();
  const keyFor = (keyHash: string, actionType: string) => `${keyHash}:${actionType}`;

  for (const row of initialRows) {
    rows.set(keyFor(row.key_hash, row.action_type), { ...row });
  }

  return {
    dump() {
      return Array.from(rows.values()).map((row) => ({ ...row }));
    },
    async get(keyHash: string, actionType: RateLimitActionType) {
      return { ok: true as const, row: rows.get(keyFor(keyHash, actionType)) ?? null };
    },
    async upsert(row: RateLimitRow) {
      rows.set(keyFor(row.key_hash, row.action_type), { ...row });
      return { ok: true as const };
    },
  } satisfies RateLimitStore & { dump(): RateLimitRow[] };
}

export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const defaults = defaultLimits[options.actionType];
  const maxAttempts = options.maxAttempts ?? defaults.maxAttempts;
  const windowMs = options.windowMs ?? defaults.windowMs;
  const lockMs = options.lockMs ?? defaults.lockMs;
  const store = getRateLimitStore(options);

  if (!store) {
    return {
      actionType: options.actionType,
      allowed: true,
      configured: false,
      limit: maxAttempts,
      reason: "supabase_unconfigured",
      remaining: maxAttempts,
      retryAfterSeconds: 0,
    };
  }

  const now = options.now ?? new Date();
  const nowMs = now.getTime();
  const { keyHash } = resolveRateLimitKey(options);
  const existing = await store.get(keyHash, options.actionType);

  if (!existing.ok) {
    return {
      actionType: options.actionType,
      allowed: true,
      configured: true,
      limit: maxAttempts,
      reason: "lookup_failed",
      remaining: maxAttempts,
      retryAfterSeconds: 0,
    };
  }

  const lockedUntil = dateValue(existing.row?.locked_until);
  if (lockedUntil && lockedUntil.getTime() > nowMs) {
    return {
      actionType: options.actionType,
      allowed: false,
      configured: true,
      limit: maxAttempts,
      reason: "locked",
      remaining: 0,
      retryAfterSeconds: retryAfterSeconds(lockedUntil.getTime(), nowMs),
    };
  }

  const lastAttempt = dateValue(existing.row?.last_attempt_at);
  const insideWindow = Boolean(lastAttempt && nowMs - lastAttempt.getTime() < windowMs);
  const attempts = insideWindow ? (existing.row?.attempts ?? 0) + 1 : 1;
  const lockUntil = attempts > maxAttempts ? new Date(nowMs + lockMs) : null;

  const updated = await store.upsert({
    action_type: options.actionType,
    attempts,
    key_hash: keyHash,
    last_attempt_at: now.toISOString(),
    locked_until: lockUntil?.toISOString() ?? null,
    updated_at: now.toISOString(),
  });

  if (!updated.ok) {
    return {
      actionType: options.actionType,
      allowed: true,
      configured: true,
      limit: maxAttempts,
      reason: "update_failed",
      remaining: maxAttempts,
      retryAfterSeconds: 0,
    };
  }

  if (lockUntil) {
    return {
      actionType: options.actionType,
      allowed: false,
      configured: true,
      limit: maxAttempts,
      reason: "limit_exceeded",
      remaining: 0,
      retryAfterSeconds: retryAfterSeconds(lockUntil.getTime(), nowMs),
    };
  }

  return {
    actionType: options.actionType,
    allowed: true,
    configured: true,
    limit: maxAttempts,
    remaining: Math.max(maxAttempts - attempts, 0),
    retryAfterSeconds: 0,
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "Retry-After": String(result.retryAfterSeconds),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
}

export const RATE_LIMITED_MESSAGE = "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
