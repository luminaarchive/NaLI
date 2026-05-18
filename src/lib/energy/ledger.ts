import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getGuestSessionIdHash, isUsableGuestSessionId } from "@/lib/reports/access";
import type { ReportResult } from "@/lib/reports/reportGenerator";

export type EnergyLedgerType = "credit" | "debit" | "deposit" | "refund";

export type EnergyLedgerEntryInput = {
  amount: number;
  guestSessionId?: unknown;
  guestSessionIdHash?: string;
  reason: string;
  reportId?: string;
  type: EnergyLedgerType;
};

export function calculateEnergyBalance(entries: Array<{ amount: number }>) {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}

export function isValidEnergyLedgerAmount(type: EnergyLedgerType, amount: number) {
  if (!Number.isInteger(amount) || amount === 0) {
    return false;
  }

  return type === "credit" || type === "refund" ? amount > 0 : amount < 0;
}

export function estimateEnergyForReport(report: ReportResult) {
  return report.mode === "start_from_zero" ? 2 : 5;
}

function resolveGuestHash(input: Pick<EnergyLedgerEntryInput, "guestSessionId" | "guestSessionIdHash">) {
  if (input.guestSessionIdHash) {
    return input.guestSessionIdHash;
  }

  if (!isUsableGuestSessionId(input.guestSessionId)) {
    return "";
  }

  return getGuestSessionIdHash(input.guestSessionId);
}

export async function getEnergyBalance(guestSessionId: unknown) {
  if (!isUsableGuestSessionId(guestSessionId)) {
    return { balance: 0, ready: false as const, reason: "missing_guest_session" as const };
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { balance: 0, ready: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data, error } = await supabase
    .from("energy_ledger")
    .select("amount")
    .eq("guest_session_id_hash", getGuestSessionIdHash(guestSessionId));

  if (error) {
    console.warn("NaLI Energy balance lookup skipped", {
      code: error.code,
      message: error.message,
    });
    return { balance: 0, ready: false as const, reason: "lookup_failed" as const };
  }

  return {
    balance: calculateEnergyBalance((data ?? []) as Array<{ amount: number }>),
    ready: true as const,
  };
}

export async function createEnergyLedgerEntry(input: EnergyLedgerEntryInput) {
  if (!isValidEnergyLedgerAmount(input.type, input.amount)) {
    return { recorded: false as const, reason: "invalid_amount" as const };
  }

  const guestSessionIdHash = resolveGuestHash(input);

  if (!guestSessionIdHash) {
    return { recorded: false as const, reason: "missing_guest_session" as const };
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { recorded: false as const, reason: "supabase_unconfigured" as const };
  }

  const { error } = await supabase.from("energy_ledger").insert({
    amount: input.amount,
    guest_session_id_hash: guestSessionIdHash,
    reason: input.reason,
    report_id: input.reportId ?? null,
    type: input.type,
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

export function recordPreviewUsage({
  guestSessionIdHash,
  report,
}: {
  guestSessionIdHash: string;
  report: ReportResult;
}) {
  return createEnergyLedgerEntry({
    amount: -estimateEnergyForReport(report),
    guestSessionIdHash,
    reason: "preview_generation_estimate",
    reportId: report.id,
    type: "debit",
  });
}
