import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ExportType, MidtransNotification, PaymentStatus } from "@/lib/payments/midtrans";
import { isSuccessfulPaymentStatus } from "@/lib/payments/midtrans";

export type PaymentRecord = {
  amount: number;
  export_type?: ExportType;
  id: string;
  midtrans_order_id: string;
  payment_expires_at?: string | null;
  payment_type?: string | null;
  report_id: string;
  status: PaymentStatus | string;
};

export async function getSuccessfulPaymentForReport(reportId: string) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { found: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data, error } = await supabase
    .from("payments")
    .select("id, report_id, midtrans_order_id, amount, status, payment_type, payment_expires_at, export_type")
    .eq("report_id", reportId)
    .in("status", ["paid", "success"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("NaLI payment lookup skipped", {
      code: error.code,
      message: error.message,
    });
    return { found: false as const, reason: "lookup_failed" as const };
  }

  if (!data || !isSuccessfulPaymentStatus(data.status)) {
    return { found: false as const, reason: "not_found" as const };
  }

  return { found: true as const, payment: data as PaymentRecord };
}

export async function createPaymentRecord({
  amount,
  exportType,
  midtransOrderId,
  paymentExpiresAt,
  reportId,
  status = "pending",
}: {
  amount: number;
  exportType: ExportType;
  midtransOrderId: string;
  paymentExpiresAt: Date;
  reportId: string;
  status?: PaymentStatus;
}) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { created: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data, error } = await supabase
    .from("payments")
    .insert({
      amount,
      export_type: exportType,
      midtrans_order_id: midtransOrderId,
      payment_expires_at: paymentExpiresAt.toISOString(),
      report_id: reportId,
      status,
    })
    .select("id, report_id, midtrans_order_id, amount, status, payment_type, payment_expires_at, export_type")
    .single();

  if (error) {
    console.warn("NaLI payment record create failed", {
      code: error.code,
      message: error.message,
    });
    return { created: false as const, reason: "insert_failed" as const };
  }

  return { created: true as const, payment: data as PaymentRecord };
}

export async function updatePaymentFromNotification({
  midtransOrderId,
  notification,
  status,
}: {
  midtransOrderId: string;
  notification: MidtransNotification;
  status: PaymentStatus;
}) {
  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { updated: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data, error } = await supabase
    .from("payments")
    .update({
      payment_type: typeof notification.payment_type === "string" ? notification.payment_type : null,
      raw_notification: notification,
      status,
    })
    .eq("midtrans_order_id", midtransOrderId)
    .select("id, report_id, midtrans_order_id, amount, status, payment_type, payment_expires_at, export_type")
    .maybeSingle();

  if (error) {
    console.warn("NaLI payment notification update failed", {
      code: error.code,
      message: error.message,
    });
    return { updated: false as const, reason: "update_failed" as const };
  }

  if (!data) {
    return { updated: false as const, reason: "not_found" as const };
  }

  return { payment: data as PaymentRecord, updated: true as const };
}
