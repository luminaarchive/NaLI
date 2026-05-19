import type { PaymentRecord } from "@/lib/payments/store";
import { REPORT_MACRO_STATUSES, type ReportMacroStatus } from "@/lib/reports/persistence";
import { REPORT_UPLOAD_BUCKET, REPORT_UPLOAD_PATH_PREFIX } from "@/lib/reports/uploads";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export type PurgeAction = "delete_report_and_storage" | "delete_storage_only" | "keep" | "mark_failed" | "skip";

export type PurgeReportRecord = {
  created_at?: string | null;
  id: string;
  processing_metadata?: Record<string, unknown> | null;
  status: ReportMacroStatus | string;
  storage_path?: string | null;
  updated_at?: string | null;
};

export type PurgePaymentRecord = Pick<PaymentRecord, "id" | "payment_expires_at" | "report_id" | "status">;

export type PurgeCandidate = {
  action: PurgeAction;
  reason: string;
  storage_path?: string;
};

export type PurgeStore = {
  deleteReport(reportId: string): Promise<{ ok: true } | { ok: false; error: string }>;
  deleteStorageObject(storagePath: string): Promise<{ ok: true } | { ok: false; error: string }>;
  listCandidateReports(limit: number): Promise<{ ok: true; reports: PurgeReportRecord[] } | { ok: false; error: string }>;
  listPaymentsForReports(
    reportIds: string[],
  ): Promise<{ ok: true; payments: PurgePaymentRecord[] } | { ok: false; error: string }>;
  markReportFailed(reportId: string, details: string): Promise<{ ok: true } | { ok: false; error: string }>;
};

export type PurgeSummary =
  | {
      configured: false;
      reason: "Supabase not configured";
      skipped: true;
    }
  | {
      configured: true;
      deletedReports: number;
      deletedStorageObjects: number;
      dryRun: boolean;
      errors: string[];
      kept: number;
      markedFailed: number;
      scanned: number;
      wouldDeleteReports: number;
      wouldDeleteStorageObjects: number;
      wouldMarkFailed: number;
    };

type PurgeOptions = {
  dryRun?: boolean;
  limit?: number;
  now?: Date;
  store?: PurgeStore | null;
};

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWO_HOURS_MS = 2 * ONE_HOUR_MS;
const ONE_DAY_MS = 24 * ONE_HOUR_MS;

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getPurgeReadiness() {
  const maintenanceSecretConfigured = Boolean(hasValue(process.env.CRON_SECRET) || hasValue(process.env.MAINTENANCE_SECRET));
  const supabaseConfigured = Boolean(
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) && hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );

  return {
    maintenanceSecretConfigured,
    purgeConfigured: maintenanceSecretConfigured && supabaseConfigured,
    purgePrepared: true as const,
  };
}

function dateValue(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function ageMs(value: string | null | undefined, now: Date) {
  const date = dateValue(value);
  return date ? now.getTime() - date.getTime() : 0;
}

function storageCandidate(storagePath: string | null | undefined) {
  return storagePath ? { storage_path: storagePath } : {};
}

function paymentExpiresAt(payment: PurgePaymentRecord | undefined) {
  return dateValue(payment?.payment_expires_at ?? null);
}

function isAllowedReportStatus(status: string): status is ReportMacroStatus {
  return (REPORT_MACRO_STATUSES as readonly string[]).includes(status);
}

export function isSafePurgeStoragePath(storagePath: string | null | undefined) {
  if (!storagePath) return false;
  if (storagePath.includes("..")) return false;
  if (storagePath.includes("//")) return false;
  return storagePath.startsWith(`${REPORT_UPLOAD_PATH_PREFIX}/`) && storagePath.length > REPORT_UPLOAD_PATH_PREFIX.length + 1;
}

export function classifyPurgeCandidate(
  report: PurgeReportRecord,
  payment?: PurgePaymentRecord,
  options: { now?: Date } = {},
): PurgeCandidate {
  const now = options.now ?? new Date();
  const status = String(report.status);
  const createdAgeMs = ageMs(report.created_at, now);
  const updatedAgeMs = ageMs(report.updated_at ?? report.created_at, now);

  if (!isAllowedReportStatus(status)) {
    return {
      action: "skip",
      reason: "Unknown report macro-status.",
    };
  }

  if (status === "pending_upload") {
    if (createdAgeMs > ONE_HOUR_MS) {
      return {
        action: "delete_report_and_storage",
        reason: "Pending upload exceeded 60 minute retention.",
        ...storageCandidate(report.storage_path),
      };
    }

    return { action: "keep", reason: "Pending upload still within retention window." };
  }

  if (status === "verifying") {
    if (createdAgeMs > ONE_HOUR_MS || updatedAgeMs > ONE_HOUR_MS) {
      return {
        action: "delete_report_and_storage",
        reason: "Verification job exceeded 60 minute retention.",
        ...storageCandidate(report.storage_path),
      };
    }

    return { action: "keep", reason: "Verification job still within retention window." };
  }

  if (status === "pending_payment") {
    if (createdAgeMs > ONE_DAY_MS) {
      return {
        action: "delete_report_and_storage",
        reason: "Pending payment exceeded 24 hour maximum retention.",
        ...storageCandidate(report.storage_path),
      };
    }

    if (!payment) {
      if (createdAgeMs > TWO_HOURS_MS) {
        return {
          action: "delete_report_and_storage",
          reason: "Pending payment without payment record exceeded 2 hour retention.",
          ...storageCandidate(report.storage_path),
        };
      }

      return { action: "keep", reason: "Pending payment without payment record still within retention window." };
    }

    const expiresAt = paymentExpiresAt(payment);
    if (expiresAt && expiresAt.getTime() > now.getTime()) {
      return { action: "keep", reason: "Pending payment has active payment before expiration." };
    }

    return {
      action: "mark_failed",
      reason: "Pending payment record expired before the 24 hour maximum retention.",
      ...storageCandidate(report.storage_path),
    };
  }

  if (status === "failed") {
    if (report.storage_path) {
      return {
        action: "delete_storage_only",
        reason: "Failed report keeps database metadata but removes the physical pending upload object.",
        storage_path: report.storage_path,
      };
    }

    return { action: "keep", reason: "Failed report has no storage object to clean." };
  }

  if (status === "export_ready") {
    return { action: "keep", reason: "Export-ready report retention is intentionally deferred." };
  }

  return { action: "keep", reason: "Processing report is not purged by default." };
}

function getDefaultPurgeStore(): PurgeStore | null {
  const supabase = getOptionalSupabaseAdminClient();
  if (!supabase) return null;

  return {
    async deleteReport(reportId) {
      const { error } = await supabase.from("reports").delete().eq("id", reportId);
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    async deleteStorageObject(storagePath) {
      if (!isSafePurgeStoragePath(storagePath)) {
        return { ok: false, error: "Unsafe storage path rejected." };
      }

      const { error } = await supabase.storage.from(REPORT_UPLOAD_BUCKET).remove([storagePath]);
      return error ? { ok: false, error: error.message } : { ok: true };
    },
    async listCandidateReports(limit) {
      const { data, error } = await supabase
        .from("reports")
        .select("id,status,storage_path,created_at,updated_at,processing_metadata")
        .in("status", ["pending_upload", "verifying", "pending_payment", "processing", "failed"])
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) return { ok: false, error: error.message };
      return { ok: true, reports: (data ?? []) as PurgeReportRecord[] };
    },
    async listPaymentsForReports(reportIds) {
      if (reportIds.length === 0) return { ok: true, payments: [] };

      const { data, error } = await supabase
        .from("payments")
        .select("id,report_id,status,payment_expires_at")
        .in("report_id", reportIds)
        .order("payment_expires_at", { ascending: false });

      if (error) return { ok: false, error: error.message };
      return { ok: true, payments: (data ?? []) as PurgePaymentRecord[] };
    },
    async markReportFailed(reportId, details) {
      const { error } = await supabase
        .from("reports")
        .update({
          failure_details: details,
          failure_reason: "PURGE_PAYMENT_EXPIRED",
          failure_stage: "purge_cleanup",
          status: "failed",
        })
        .eq("id", reportId);

      return error ? { ok: false, error: error.message } : { ok: true };
    },
  };
}

function getPurgeStore(options: PurgeOptions) {
  if ("store" in options) return options.store ?? null;
  return getDefaultPurgeStore();
}

function normalizeLimit(limit: number | undefined) {
  if (!Number.isFinite(limit) || !limit) return 50;
  return Math.min(Math.max(Math.trunc(limit), 1), 200);
}

function paymentMap(payments: PurgePaymentRecord[]) {
  const map = new Map<string, PurgePaymentRecord>();

  for (const payment of payments) {
    if (!map.has(payment.report_id)) {
      map.set(payment.report_id, payment);
    }
  }

  return map;
}

export async function purgeExpiredReports(options: PurgeOptions = {}): Promise<PurgeSummary> {
  const store = getPurgeStore(options);

  if (!store) {
    return {
      configured: false,
      reason: "Supabase not configured",
      skipped: true,
    };
  }

  const dryRun = options.dryRun ?? true;
  const limit = normalizeLimit(options.limit);
  const now = options.now ?? new Date();
  const summary: Extract<PurgeSummary, { configured: true }> = {
    configured: true,
    deletedReports: 0,
    deletedStorageObjects: 0,
    dryRun,
    errors: [],
    kept: 0,
    markedFailed: 0,
    scanned: 0,
    wouldDeleteReports: 0,
    wouldDeleteStorageObjects: 0,
    wouldMarkFailed: 0,
  };

  const reportsResult = await store.listCandidateReports(limit);
  if (!reportsResult.ok) {
    summary.errors.push(`report_lookup_failed:${reportsResult.error}`);
    return summary;
  }

  const reports = reportsResult.reports;
  summary.scanned = reports.length;

  const paymentResult = await store.listPaymentsForReports(reports.map((report) => report.id));
  if (!paymentResult.ok) {
    summary.errors.push(`payment_lookup_failed:${paymentResult.error}`);
    return summary;
  }

  const paymentsByReport = paymentMap(paymentResult.payments);

  for (const report of reports) {
    const candidate = classifyPurgeCandidate(report, paymentsByReport.get(report.id), { now });

    if (candidate.action === "keep" || candidate.action === "skip") {
      summary.kept += 1;
      continue;
    }

    const storagePath = candidate.storage_path;
    if (
      (candidate.action === "delete_report_and_storage" || candidate.action === "delete_storage_only") &&
      storagePath
    ) {
      if (!isSafePurgeStoragePath(storagePath)) {
        summary.errors.push(`unsafe_storage_path:${report.id}`);
        continue;
      }

      if (dryRun) {
        summary.wouldDeleteStorageObjects += 1;
      } else {
        const deletedStorage = await store.deleteStorageObject(storagePath);
        if (!deletedStorage.ok) {
          summary.errors.push(`storage_delete_failed:${report.id}:${deletedStorage.error}`);
          continue;
        }
        summary.deletedStorageObjects += 1;
      }
    }

    if (candidate.action === "delete_report_and_storage") {
      if (dryRun) {
        summary.wouldDeleteReports += 1;
      } else {
        const deletedReport = await store.deleteReport(report.id);
        if (!deletedReport.ok) {
          summary.errors.push(`report_delete_failed:${report.id}:${deletedReport.error}`);
          continue;
        }
        summary.deletedReports += 1;
      }
      continue;
    }

    if (candidate.action === "mark_failed") {
      if (dryRun) {
        summary.wouldMarkFailed += 1;
      } else {
        const marked = await store.markReportFailed(report.id, candidate.reason);
        if (!marked.ok) {
          summary.errors.push(`mark_failed_failed:${report.id}:${marked.error}`);
          continue;
        }
        summary.markedFailed += 1;
      }
      continue;
    }

    summary.kept += 1;
  }

  return summary;
}
