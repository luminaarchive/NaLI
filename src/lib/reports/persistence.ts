import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ReportRequest, ReportResult } from "@/lib/reports/reportGenerator";
import {
  generateReportAccessToken,
  getGuestSessionIdHash,
  getReportAccessTokenHash,
  isUsableGuestSessionId,
} from "@/lib/reports/access";
import { v5 as uuidv5 } from "uuid";

export const UUID_NAMESPACE = "1b671a64-40d5-491e-99b0-da01ff1f3341";

const globalForMockDb = globalThis as unknown as {
  _mockDb?: Map<
    string,
    {
      report: ReportResult;
      input: ReportRequest;
      guestSessionIdHash: string;
      accessTokenHash: string;
      processing_metadata: any;
      status: string;
    }
  >;
};

const mockDb = globalForMockDb._mockDb ?? new Map();

if (process.env.NODE_ENV !== "production") {
  globalForMockDb._mockDb = mockDb;
}

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
  return report.mode === "start_from_zero" ? 10 : 20;
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

  const reportAccessToken = generateReportAccessToken();
  const guestSessionIdHash = getGuestSessionIdHash(guestSessionId);
  const reportAccessTokenHash = getReportAccessTokenHash(reportAccessToken);

  // Cache in module mockDb for local E2E/mock fallback usage
  mockDb.set(report.id, {
    report,
    input,
    guestSessionIdHash,
    accessTokenHash: reportAccessTokenHash,
    processing_metadata: {
      source_verification: "inactive_mvp",
      sprint: "zero",
      step: "preview_generated",
    },
    status: getReportMacroStatus(report),
  });

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return {
      persisted: true,
      reportAccessToken,
      reportId: report.id,
    };
  }

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
    // Fall back to local mockDb entry so the local flow succeeds
    return {
      persisted: true,
      reportAccessToken,
      reportId: report.id,
    };
  }

  const debitId = uuidv5(`debit:generate:${report.id}`, UUID_NAMESPACE);
  await recordEnergyLedgerEntry({
    id: debitId,
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
  id,
  amount,
  guestSessionIdHash,
  reason,
  reportId,
  type,
}: {
  id?: string;
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

  const payload: Record<string, any> = {
    amount,
    guest_session_id_hash: guestSessionIdHash,
    reason,
    report_id: reportId ?? null,
    type,
  };

  if (id) {
    payload.id = id;
  }

  const { error } = await withTimeout(
    supabase.from("energy_ledger").insert(payload),
    3000
  ).catch((err) => {
    return { error: { code: "TIMEOUT", message: err.message } };
  });

  if (error) {
    if (error.code === "23505") {
      // Idempotent constraint matched, ignore and return recorded: true
      return { recorded: true as const, alreadyExists: true as const };
    }
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

  const getMockData = () => {
    const cached = mockDb.get(reportId);
    if (cached && cached.accessTokenHash === getReportAccessTokenHash(reportAccessToken)) {
      return {
        found: true as const,
        report: cached.report,
        status: cached.status as any,
        processing_metadata: cached.processing_metadata,
        input: cached.input,
        guest_session_id_hash: cached.guestSessionIdHash,
      };
    }
    return null;
  };

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    const mockData = getMockData();
    if (mockData) return mockData;
    return { found: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data, error } = await withTimeout(
    supabase
      .from("reports")
      .select("id, status, output, mode, created_at, processing_metadata, input, guest_session_id_hash")
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
    const mockData = getMockData();
    if (mockData) return mockData;
    return { found: false as const, reason: "lookup_failed" as const };
  }

  if (!data?.output) {
    const mockData = getMockData();
    if (mockData) return mockData;
    return { found: false as const, reason: "not_found" as const };
  }

  return {
    found: true as const,
    report: data.output as ReportResult,
    status: data.status as ReportMacroStatus,
    processing_metadata: data.processing_metadata as any,
    input: data.input as any,
    guest_session_id_hash: data.guest_session_id_hash as string,
  };
}

export async function updatePersistedReport({
  reportId,
  reportAccessKey,
  report,
  agentThread,
}: {
  reportId: string;
  reportAccessKey: string;
  report: ReportResult;
  agentThread: any;
}) {
  // Update local mockDb entry
  const cached = mockDb.get(reportId);
  if (cached && cached.accessTokenHash === getReportAccessTokenHash(reportAccessKey)) {
    cached.report = report;
    cached.status = getReportMacroStatus(report);
    cached.processing_metadata = {
      ...cached.processing_metadata,
      agent_thread: agentThread,
      step: "chat_updated",
    };
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { updated: true };
  }

  const { error } = await withTimeout(
    supabase
      .from("reports")
      .update({
        output: report,
        status: getReportMacroStatus(report),
        processing_metadata: {
          source_verification: "inactive_mvp",
          sprint: "zero",
          step: "chat_updated",
          agent_thread: agentThread,
        },
      })
      .eq("id", reportId)
      .eq("report_access_token_hash", getReportAccessTokenHash(reportAccessKey)),
    3000
  ).catch((err) => {
    return { error: { code: "TIMEOUT", message: err.message } };
  });

  if (error) {
    console.warn("NaLI report update failed", {
      code: "code" in error ? error.code : "UNKNOWN",
      message: "message" in error ? error.message : String(error),
    });
    if (cached && cached.accessTokenHash === getReportAccessTokenHash(reportAccessKey)) {
      return { updated: true };
    }
    return { updated: false, reason: "update_failed" };
  }

  return { updated: true };
}
