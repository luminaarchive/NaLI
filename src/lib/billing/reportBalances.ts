import type { PaidReportType, ReportPackageId } from "@/lib/billing/reportPackages";

export type PublicReportType = "starter_free" | PaidReportType;
export type ReportBalanceAction =
  | "generate_new"
  | "regenerate_from_scratch"
  | "manual_edit"
  | "copy_existing"
  | "download_existing";

export const REPORT_LEDGER_EVENT_TYPES = [
  "purchase_basic",
  "purchase_pro",
  "purchase_pro_bundle",
  "consume_basic_report",
  "consume_pro_report",
  "refund_report",
  "generation_failed_no_charge",
] as const;

export type ReportLedgerEventType = (typeof REPORT_LEDGER_EVENT_TYPES)[number];

export type ReportBalanceSnapshot = {
  basicReportsRemaining: number;
  paidBalanceVerified: boolean;
  proReportsRemaining: number;
};

export type ReportGenerationAccess = {
  allowed: boolean;
  packageSuggestion: ReportPackageId | null;
  reason: "starter_free_report_available_rate_limited" | "paid_report_balance_unavailable" | "paid_report_available";
  reportType: PublicReportType;
  reportsRemaining: number;
  requiresPurchase: boolean;
};

export function getSafeDefaultReportBalance(): ReportBalanceSnapshot {
  return {
    basicReportsRemaining: 0,
    paidBalanceVerified: false,
    proReportsRemaining: 0,
  };
}

export function evaluateReportGenerationAccess({
  balance = getSafeDefaultReportBalance(),
  reportType,
}: {
  balance?: ReportBalanceSnapshot;
  reportType: PublicReportType;
}): ReportGenerationAccess {
  if (reportType === "starter_free") {
    return {
      allowed: true,
      packageSuggestion: null,
      reason: "starter_free_report_available_rate_limited",
      reportType,
      reportsRemaining: 0,
      requiresPurchase: false,
    };
  }

  const reportsRemaining = reportType === "basic" ? balance.basicReportsRemaining : balance.proReportsRemaining;
  const packageSuggestion: ReportPackageId = reportType === "basic" ? "basic" : "pro";

  if (!balance.paidBalanceVerified || reportsRemaining < 1) {
    return {
      allowed: false,
      packageSuggestion,
      reason: "paid_report_balance_unavailable",
      reportType,
      reportsRemaining: 0,
      requiresPurchase: true,
    };
  }

  return {
    allowed: true,
    packageSuggestion,
    reason: "paid_report_available",
    reportType,
    reportsRemaining,
    requiresPurchase: false,
  };
}

export function consumeReportForAction({
  action,
  balance,
  blockedByGuard = false,
  generationSucceeded,
  reportType,
}: {
  action: ReportBalanceAction;
  balance: ReportBalanceSnapshot;
  blockedByGuard?: boolean;
  generationSucceeded: boolean;
  reportType: PaidReportType;
}): {
  balance: ReportBalanceSnapshot;
  consumed: boolean;
  ledgerEvent: ReportLedgerEventType | null;
} {
  const noCharge = { balance: { ...balance }, consumed: false };

  if (blockedByGuard || !generationSucceeded) {
    return { ...noCharge, ledgerEvent: "generation_failed_no_charge" };
  }

  if (action !== "generate_new" && action !== "regenerate_from_scratch") {
    return { ...noCharge, ledgerEvent: null };
  }

  if (!balance.paidBalanceVerified) {
    return { ...noCharge, ledgerEvent: null };
  }

  if (reportType === "basic" && balance.basicReportsRemaining > 0) {
    return {
      balance: { ...balance, basicReportsRemaining: balance.basicReportsRemaining - 1 },
      consumed: true,
      ledgerEvent: "consume_basic_report",
    };
  }

  if (reportType === "pro" && balance.proReportsRemaining > 0) {
    return {
      balance: { ...balance, proReportsRemaining: balance.proReportsRemaining - 1 },
      consumed: true,
      ledgerEvent: "consume_pro_report",
    };
  }

  return { ...noCharge, ledgerEvent: null };
}
