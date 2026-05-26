import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PaidReportType, ReportPackageId } from "@/lib/billing/reportPackages";

export const REPORT_PERSISTED_LEDGER_EVENT_TYPES = [
  "purchase_basic",
  "purchase_pro",
  "purchase_pro_bundle",
  "consume_basic_report",
  "consume_pro_report",
  "refund_report",
  "generation_failed_no_charge",
  "admin_adjustment_internal",
  "test_seed_internal",
] as const;

export type PersistedReportLedgerEventType = (typeof REPORT_PERSISTED_LEDGER_EVENT_TYPES)[number];
export type ReportOwnerType = "guest" | "user" | "internal";
export type ReportOwner = { ownerId: string; ownerType: ReportOwnerType };
export type PersistedReportType = PaidReportType | "starter" | "unknown" | null;
export type LedgerSource = "api_generate" | "payment_webhook_future" | "internal_admin_future" | "test" | "system";
export type PersistedBalance = { basicReportsRemaining: number; proReportsRemaining: number };

type LedgerMetadataValue = boolean | string;
type SafeLedgerMetadata = Record<string, LedgerMetadataValue>;

type StoredLedgerEvent = {
  amount: number;
  balanceAfter: number | null;
  balanceBefore: number | null;
  createdAt: string;
  eventType: PersistedReportLedgerEventType;
  idempotencyKey: string | null;
  metadata: SafeLedgerMetadata;
  owner: ReportOwner;
  paymentId: string | null;
  reportId: string | null;
  reportType: PersistedReportType;
  source: LedgerSource;
};

type ConsumeStoreResult = {
  balance: PersistedBalance;
  balanceAfter: number | null;
  balanceBefore: number | null;
  consumed: boolean;
  duplicate: boolean;
};

export type ReportBalanceLedgerStore = {
  consumeOne: (input: {
    idempotencyKey: string;
    metadata: SafeLedgerMetadata;
    owner: ReportOwner;
    reportId: string | null;
    reportType: PaidReportType;
    source: LedgerSource;
  }) => Promise<ConsumeStoreResult>;
  ensureBalance: (owner: ReportOwner) => Promise<PersistedBalance>;
  getBalance: (owner: ReportOwner) => Promise<PersistedBalance | null>;
  insertEvent: (event: Omit<StoredLedgerEvent, "createdAt">) => Promise<void>;
  listEvents: (owner: ReportOwner) => Promise<StoredLedgerEvent[]>;
};

type LedgerDependencies = { store?: ReportBalanceLedgerStore | null };

const ZERO_BALANCE: PersistedBalance = {
  basicReportsRemaining: 0,
  proReportsRemaining: 0,
};

const SAFE_METADATA_TEXT_VALUES: Readonly<Record<string, ReadonlySet<string>>> = {
  action: new Set(["copy_existing", "download_existing", "generate_new", "manual_edit", "regenerate_from_scratch"]),
  blockedBy: new Set(["balance_required", "integrity", "payment_inactive", "rate_limit", "server_failure"]),
  packageId: new Set(["basic", "pro", "pro_bundle"]),
  paymentStatus: new Set(["future_verified", "not_active"]),
  reportType: new Set(["basic", "pro", "starter", "unknown"]),
  result: new Set(["allowed", "blocked", "consumed", "duplicate", "failed_no_charge"]),
  route: new Set(["api_generate", "system"]),
  trigger: new Set(["failure", "future_payment", "generation", "internal_adjustment", "regeneration", "test"]),
};

function cloneBalance(balance: PersistedBalance): PersistedBalance {
  return { ...balance };
}

function ownerKey(owner: ReportOwner) {
  return `${owner.ownerType}:${owner.ownerId}`;
}

export function sanitizeReportLedgerMetadata(metadata: unknown): SafeLedgerMetadata {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};

  const sanitized: SafeLedgerMetadata = {};
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (key === "internalQa" && typeof value === "boolean") {
      sanitized[key] = value;
      continue;
    }
    if (typeof value === "string" && SAFE_METADATA_TEXT_VALUES[key]?.has(value)) sanitized[key] = value;
  }
  return sanitized;
}

export function normalizeReportOwner(input: { ownerId?: unknown; ownerType?: unknown }): ReportOwner | null {
  if (input.ownerType !== "guest" && input.ownerType !== "user" && input.ownerType !== "internal") return null;
  if (typeof input.ownerId !== "string") return null;
  const ownerId = input.ownerId.trim().toLowerCase();
  if (/token|secret|cookie|authorization|bearer/i.test(ownerId)) return null;

  if (input.ownerType === "guest" && !/^[a-f0-9]{64}$/.test(ownerId)) return null;
  if (
    input.ownerType === "user" &&
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(ownerId)
  ) {
    return null;
  }
  if (input.ownerType === "internal" && !/^[a-z0-9][a-z0-9_-]{7,63}$/.test(ownerId)) return null;

  return { ownerId, ownerType: input.ownerType };
}

function createSupabaseLedgerStore(): ReportBalanceLedgerStore | null {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) return null;

  const getBalance = async (owner: ReportOwner): Promise<PersistedBalance | null> => {
    const { data, error } = await supabase
      .from("report_balances")
      .select("basic_reports_remaining, pro_reports_remaining")
      .eq("owner_type", owner.ownerType)
      .eq("owner_id", owner.ownerId)
      .maybeSingle();
    if (error) throw new Error("report_balance_lookup_failed");
    if (!data) return null;
    return {
      basicReportsRemaining: data.basic_reports_remaining,
      proReportsRemaining: data.pro_reports_remaining,
    };
  };

  return {
    async consumeOne(input) {
      const { data, error } = await supabase.rpc("consume_report_balance", {
        p_idempotency_key: input.idempotencyKey,
        p_metadata: input.metadata,
        p_owner_id: input.owner.ownerId,
        p_owner_type: input.owner.ownerType,
        p_report_id: input.reportId,
        p_report_type: input.reportType,
        p_source: input.source,
      });
      if (error) throw new Error("report_balance_consume_failed");
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("report_balance_consume_missing_result");
      return {
        balance: {
          basicReportsRemaining: row.basic_reports_remaining,
          proReportsRemaining: row.pro_reports_remaining,
        },
        balanceAfter: row.balance_after,
        balanceBefore: row.balance_before,
        consumed: row.consumed === true,
        duplicate: row.duplicate === true,
      };
    },
    async ensureBalance(owner) {
      const { error } = await supabase.from("report_balances").upsert(
        {
          basic_reports_remaining: 0,
          owner_id: owner.ownerId,
          owner_type: owner.ownerType,
          pro_reports_remaining: 0,
        },
        { ignoreDuplicates: true, onConflict: "owner_type,owner_id" },
      );
      if (error) throw new Error("report_balance_ensure_failed");
      return (await getBalance(owner)) ?? cloneBalance(ZERO_BALANCE);
    },
    getBalance,
    async insertEvent(event) {
      const { error } = await supabase.from("report_ledger_events").insert({
        amount: event.amount,
        balance_after: event.balanceAfter,
        balance_before: event.balanceBefore,
        event_type: event.eventType,
        idempotency_key: event.idempotencyKey,
        metadata: event.metadata,
        owner_id: event.owner.ownerId,
        owner_type: event.owner.ownerType,
        payment_id: event.paymentId,
        report_id: event.reportId,
        report_type: event.reportType,
        source: event.source,
      });
      if (error && error.code !== "23505") throw new Error("report_ledger_event_insert_failed");
    },
    async listEvents(owner) {
      const { data, error } = await supabase
        .from("report_ledger_events")
        .select(
          "event_type, amount, balance_before, balance_after, report_type, report_id, payment_id, idempotency_key, source, created_at",
        )
        .eq("owner_type", owner.ownerType)
        .eq("owner_id", owner.ownerId)
        .order("created_at", { ascending: false });
      if (error) throw new Error("report_ledger_summary_failed");
      return (data ?? []).map((row) => ({
        amount: row.amount,
        balanceAfter: row.balance_after,
        balanceBefore: row.balance_before,
        createdAt: row.created_at,
        eventType: row.event_type as PersistedReportLedgerEventType,
        idempotencyKey: row.idempotency_key,
        metadata: {},
        owner,
        paymentId: row.payment_id,
        reportId: row.report_id,
        reportType: row.report_type as PersistedReportType,
        source: row.source as LedgerSource,
      }));
    },
  };
}

function resolveStore(dependencies: LedgerDependencies): ReportBalanceLedgerStore | null {
  return Object.prototype.hasOwnProperty.call(dependencies, "store")
    ? (dependencies.store ?? null)
    : createSupabaseLedgerStore();
}

export function createDeterministicReportLedgerStore(
  seeds: Array<{ balance: PersistedBalance; owner: ReportOwner }> = [],
): ReportBalanceLedgerStore {
  const balances = new Map<string, PersistedBalance>(
    seeds.map(({ balance, owner }) => [ownerKey(owner), cloneBalance(balance)]),
  );
  const events: StoredLedgerEvent[] = [];

  return {
    async consumeOne(input) {
      const key = ownerKey(input.owner);
      const balance = balances.get(key) ?? cloneBalance(ZERO_BALANCE);
      balances.set(key, balance);
      const duplicate = events.some(
        (event) =>
          event.owner.ownerId === input.owner.ownerId &&
          event.owner.ownerType === input.owner.ownerType &&
          event.idempotencyKey === input.idempotencyKey,
      );
      if (duplicate) {
        return {
          balance: cloneBalance(balance),
          balanceAfter: null,
          balanceBefore: null,
          consumed: false,
          duplicate: true,
        };
      }
      const balanceBefore = input.reportType === "basic" ? balance.basicReportsRemaining : balance.proReportsRemaining;
      if (balanceBefore < 1) {
        return {
          balance: cloneBalance(balance),
          balanceAfter: balanceBefore,
          balanceBefore,
          consumed: false,
          duplicate: false,
        };
      }
      const balanceAfter = balanceBefore - 1;
      if (input.reportType === "basic") balance.basicReportsRemaining = balanceAfter;
      else balance.proReportsRemaining = balanceAfter;
      events.push({
        amount: -1,
        balanceAfter,
        balanceBefore,
        createdAt: new Date().toISOString(),
        eventType: input.reportType === "basic" ? "consume_basic_report" : "consume_pro_report",
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata,
        owner: input.owner,
        paymentId: null,
        reportId: input.reportId,
        reportType: input.reportType,
        source: input.source,
      });
      return { balance: cloneBalance(balance), balanceAfter, balanceBefore, consumed: true, duplicate: false };
    },
    async ensureBalance(owner) {
      const key = ownerKey(owner);
      if (!balances.has(key)) balances.set(key, cloneBalance(ZERO_BALANCE));
      return cloneBalance(balances.get(key) ?? ZERO_BALANCE);
    },
    async getBalance(owner) {
      const balance = balances.get(ownerKey(owner));
      return balance ? cloneBalance(balance) : null;
    },
    async insertEvent(event) {
      if (
        event.idempotencyKey &&
        events.some(
          (stored) =>
            stored.owner.ownerId === event.owner.ownerId &&
            stored.owner.ownerType === event.owner.ownerType &&
            stored.idempotencyKey === event.idempotencyKey,
        )
      ) {
        return;
      }
      events.push({ ...event, createdAt: new Date().toISOString() });
    },
    async listEvents(owner) {
      return events.filter((event) => ownerKey(event.owner) === ownerKey(owner));
    },
  };
}

export async function getReportBalance(owner: ReportOwner | null, dependencies: LedgerDependencies = {}) {
  const store = resolveStore(dependencies);
  if (!owner || !store) {
    return {
      balance: cloneBalance(ZERO_BALANCE),
      errorCode: "ledger_unavailable",
      ok: false as const,
      source: "unavailable" as const,
    };
  }
  try {
    const balance = await store.getBalance(owner);
    return balance
      ? { balance, ok: true as const, source: "database" as const }
      : { balance: cloneBalance(ZERO_BALANCE), ok: true as const, source: "default_zero" as const };
  } catch {
    return {
      balance: cloneBalance(ZERO_BALANCE),
      errorCode: "ledger_unavailable",
      ok: false as const,
      source: "unavailable" as const,
    };
  }
}

export async function ensureReportBalance(owner: ReportOwner | null, dependencies: LedgerDependencies = {}) {
  const store = resolveStore(dependencies);
  if (!owner || !store) {
    return { balance: cloneBalance(ZERO_BALANCE), errorCode: "ledger_unavailable", ok: false as const };
  }
  try {
    return { balance: await store.ensureBalance(owner), ok: true as const };
  } catch {
    return { balance: cloneBalance(ZERO_BALANCE), errorCode: "ledger_unavailable", ok: false as const };
  }
}

export async function canConsumeReport(
  owner: ReportOwner | null,
  reportType: PaidReportType,
  dependencies: LedgerDependencies = {},
) {
  const result = await getReportBalance(owner, dependencies);
  const reportsRemaining =
    reportType === "basic" ? result.balance.basicReportsRemaining : result.balance.proReportsRemaining;
  return { allowed: result.ok && reportsRemaining > 0, reportsRemaining, source: result.source };
}

export async function consumeReport(
  owner: ReportOwner | null,
  reportType: PaidReportType,
  context: {
    idempotencyKey: string;
    metadata?: unknown;
    reportId?: string;
    reason: string;
    source: LedgerSource;
  },
  dependencies: LedgerDependencies = {},
) {
  const store = resolveStore(dependencies);
  if (!owner || !store || !context.idempotencyKey.trim()) {
    return { balance: cloneBalance(ZERO_BALANCE), consumed: false, duplicate: false, errorCode: "ledger_unavailable" };
  }
  try {
    return await store.consumeOne({
      idempotencyKey: context.idempotencyKey,
      metadata: sanitizeReportLedgerMetadata(context.metadata),
      owner,
      reportId: context.reportId ?? null,
      reportType,
      source: context.source,
    });
  } catch {
    return { balance: cloneBalance(ZERO_BALANCE), consumed: false, duplicate: false, errorCode: "ledger_unavailable" };
  }
}

export async function recordPurchaseLedgerEvent(
  owner: ReportOwner | null,
  input: {
    amount: number;
    idempotencyKey: string;
    packageId: ReportPackageId;
    paymentId: string;
    reportType: PaidReportType;
    source: "payment_webhook_future" | "internal_admin_future" | "test";
  },
  dependencies: LedgerDependencies = {},
) {
  const store = resolveStore(dependencies);
  if (!owner || !store) return { balanceGranted: false as const, recorded: false as const };
  const eventType: PersistedReportLedgerEventType =
    input.packageId === "basic" ? "purchase_basic" : input.packageId === "pro" ? "purchase_pro" : "purchase_pro_bundle";
  try {
    await store.insertEvent({
      amount: input.amount,
      balanceAfter: null,
      balanceBefore: null,
      eventType,
      idempotencyKey: input.idempotencyKey,
      metadata: sanitizeReportLedgerMetadata({ packageId: input.packageId, reportType: input.reportType }),
      owner,
      paymentId: input.paymentId,
      reportId: null,
      reportType: input.reportType,
      source: input.source,
    });
    return { balanceGranted: false as const, recorded: true as const };
  } catch {
    return { balanceGranted: false as const, recorded: false as const };
  }
}

export async function recordGenerationFailedNoCharge(
  owner: ReportOwner | null,
  input: {
    idempotencyKey?: string;
    metadata?: unknown;
    reportId?: string;
    reportType: PersistedReportType;
    source: LedgerSource;
  },
  dependencies: LedgerDependencies = {},
) {
  const store = resolveStore(dependencies);
  if (!owner || !store) return { recorded: false as const };
  try {
    await store.insertEvent({
      amount: 0,
      balanceAfter: null,
      balanceBefore: null,
      eventType: "generation_failed_no_charge",
      idempotencyKey: input.idempotencyKey ?? null,
      metadata: sanitizeReportLedgerMetadata(input.metadata),
      owner,
      paymentId: null,
      reportId: input.reportId ?? null,
      reportType: input.reportType,
      source: input.source,
    });
    return { recorded: true as const };
  } catch {
    return { recorded: false as const };
  }
}

export async function recordRefundOrAdjustment(
  owner: ReportOwner | null,
  input: {
    amount: number;
    eventType: "admin_adjustment_internal" | "refund_report" | "test_seed_internal";
    idempotencyKey: string;
    reportType: PaidReportType;
    source: "internal_admin_future" | "test";
  },
  dependencies: LedgerDependencies = {},
) {
  const store = resolveStore(dependencies);
  if (!owner || !store) return { balanceChanged: false as const, recorded: false as const };
  try {
    await store.insertEvent({
      amount: input.amount,
      balanceAfter: null,
      balanceBefore: null,
      eventType: input.eventType,
      idempotencyKey: input.idempotencyKey,
      metadata: sanitizeReportLedgerMetadata({ reportType: input.reportType }),
      owner,
      paymentId: null,
      reportId: null,
      reportType: input.reportType,
      source: input.source,
    });
    return { balanceChanged: false as const, recorded: true as const };
  } catch {
    return { balanceChanged: false as const, recorded: false as const };
  }
}

export async function getLedgerSummary(owner: ReportOwner | null, dependencies: LedgerDependencies = {}) {
  const balance = await getReportBalance(owner, dependencies);
  const store = resolveStore(dependencies);
  if (!owner || !store) {
    return {
      ...balance.balance,
      consumedBasicReports: 0,
      consumedProReports: 0,
      latestSafeEventTimestamp: null,
      noChargeFailures: 0,
      purchasesBasic: 0,
      purchasesPro: 0,
      purchasesProBundle: 0,
    };
  }
  try {
    const events = await store.listEvents(owner);
    return {
      ...balance.balance,
      consumedBasicReports: events.filter((event) => event.eventType === "consume_basic_report").length,
      consumedProReports: events.filter((event) => event.eventType === "consume_pro_report").length,
      latestSafeEventTimestamp:
        events
          .map((event) => event.createdAt)
          .sort()
          .at(-1) ?? null,
      noChargeFailures: events.filter((event) => event.eventType === "generation_failed_no_charge").length,
      purchasesBasic: events.filter((event) => event.eventType === "purchase_basic").length,
      purchasesPro: events.filter((event) => event.eventType === "purchase_pro").length,
      purchasesProBundle: events.filter((event) => event.eventType === "purchase_pro_bundle").length,
    };
  } catch {
    return {
      ...balance.balance,
      consumedBasicReports: 0,
      consumedProReports: 0,
      latestSafeEventTimestamp: null,
      noChargeFailures: 0,
      purchasesBasic: 0,
      purchasesPro: 0,
      purchasesProBundle: 0,
    };
  }
}
