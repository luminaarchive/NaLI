import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReportRequest, ReportResult } from "@/lib/reports/reportGenerator";
import {
  generateReportAccessToken,
  getGuestSessionIdHash,
  getReportAccessTokenHash,
  isUsableGuestSessionId,
} from "@/lib/reports/access";

export const REPORT_MACRO_STATUSES = [
  "pending_upload",
  "verifying",
  "pending_payment",
  "processing",
  "export_ready",
  "failed",
] as const;

export type ReportMacroStatus = (typeof REPORT_MACRO_STATUSES)[number];

export type PersistReportResult =
  | {
      persisted: true;
      reportAccessToken: string;
      reportId: string;
    }
  | {
      persisted: false;
      reason: "missing_guest_session" | "supabase_unconfigured" | "persist_failed";
    };

export function getReportMacroStatus(report: ReportResult): ReportMacroStatus {
  return report.status.toLowerCase().includes("failed") ? "failed" : "export_ready";
}

export function calculateEnergyBalance(entries: Array<{ amount: number }>) {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number = 3000): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

export function estimatePreviewEnergy(report: ReportResult) {
  return report.mode === "start_from_zero" ? 2 : 5;
}

export async function persistGeneratedReport({
  guestSessionId,
  input,
  report,
}: {
  guestSessionId: unknown;
  input: ReportRequest;
  report: ReportResult;
}): Promise<PersistReportResult> {
  if (!isUsableGuestSessionId(guestSessionId)) {
    return { persisted: false, reason: "missing_guest_session" };
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { persisted: false, reason: "supabase_unconfigured" };
  }

  const reportAccessToken = generateReportAccessToken();
  const guestSessionIdHash = getGuestSessionIdHash(guestSessionId);
  const reportAccessTokenHash = getReportAccessTokenHash(reportAccessToken);

  const { error } = await withTimeout(
    supabase.from("reports").insert({
      guest_session_id_hash: guestSessionIdHash,
      id: report.id,
      input,
      mode: report.mode,
      output: report,
      processing_metadata: {
        source_verification: "inactive_mvp",
        sprint: "zero",
        step: "preview_generated",
      },
      report_access_token_hash: reportAccessTokenHash,
      status: getReportMacroStatus(report),
    }),
    3000
  ).catch((err) => {
    return { error: { code: "TIMEOUT", message: err.message } };
  });

  if (error) {
    console.warn("NaLI report persistence skipped", {
      code: error.code,
      message: error.message,
    });
    return { persisted: false, reason: "persist_failed" };
  }

  await recordEnergyLedgerEntry({
    amount: -estimatePreviewEnergy(report),
    guestSessionIdHash,
    reason: "preview_generation_estimate",
    reportId: report.id,
    type: "debit",
  });

  return {
    persisted: true,
    reportAccessToken,
    reportId: report.id,
  };
}

export async function recordEnergyLedgerEntry({
  amount,
  guestSessionIdHash,
  reason,
  reportId,
  type,
}: {
  amount: number;
  guestSessionIdHash: string;
  reason: string;
  reportId?: string;
  type: "credit" | "debit" | "deposit" | "refund";
}) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { recorded: false as const, reason: "supabase_unconfigured" as const };
  }

  const { error } = await withTimeout(
    supabase.from("energy_ledger").insert({
      amount,
      guest_session_id_hash: guestSessionIdHash,
      reason,
      report_id: reportId ?? null,
      type,
    }),
    3000
  ).catch((err) => {
    return { error: { code: "TIMEOUT", message: err.message } };
  });

  if (error) {
    console.warn("NaLI Energy ledger write skipped", {
      code: error.code,
      message: error.message,
    });
    return { recorded: false as const, reason: "insert_failed" as const };
  }

  return { recorded: true as const };
}

export async function getPersistedReport({
  reportAccessToken,
  reportId,
}: {
  reportAccessToken: unknown;
  reportId: string;
}) {
  if (typeof reportAccessToken !== "string" || !reportAccessToken.trim()) {
    return { found: false as const, reason: "missing_token" as const };
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { found: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data, error } = await withTimeout(
    supabase
      .from("reports")
      .select("id, status, output, mode, created_at")
      .eq("id", reportId)
      .eq("report_access_token_hash", getReportAccessTokenHash(reportAccessToken))
      .maybeSingle(),
    3000
  ).catch((err) => {
    return { data: null, error: { code: "TIMEOUT", message: err.message } };
  });

  if (error) {
    console.warn("NaLI report lookup failed", {
      code: error.code,
      message: error.message,
    });
    return { found: false as const, reason: "lookup_failed" as const };
  }

  if (!data?.output) {
    return { found: false as const, reason: "not_found" as const };
  }

  return {
    found: true as const,
    report: data.output as ReportResult,
    status: data.status as ReportMacroStatus,
  };
}
