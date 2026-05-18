import { getSuccessfulPaymentForReport } from "@/lib/payments/store";
import { isSupportedExportType, type ExportType } from "@/lib/payments/midtrans";

export type ExportState = "preview_available" | "export_locked" | "export_ready";

export function getExportState({ hasSuccessfulPayment }: { hasSuccessfulPayment: boolean }): ExportState {
  return hasSuccessfulPayment ? "export_ready" : "export_locked";
}

export function getExportType(value: unknown): ExportType | null {
  return isSupportedExportType(value) ? value : null;
}

export async function getReportExportEligibility(reportId: string) {
  const payment = await getSuccessfulPaymentForReport(reportId);

  if (!payment.found) {
    return {
      eligible: false as const,
      reason: payment.reason === "supabase_unconfigured" ? "export_unconfigured" : "payment_required",
      state: "export_locked" as ExportState,
    };
  }

  return {
    eligible: true as const,
    payment: payment.payment,
    state: "export_ready" as ExportState,
  };
}
