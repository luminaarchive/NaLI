import { env } from "@/lib/config/env";
import { isSuccessfulPaymentStatus } from "@/lib/payments/midtrans";
import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";

export type FounderOrderRow = {
  createdAt: string | null;
  estimatedEnergy: number | null;
  exportReadiness: "export_ready" | "export_locked" | "unknown";
  failureReason: string | null;
  hasOutput: boolean;
  id: string;
  mode: string | null;
  paymentStatus: string | null;
  status: string;
};

export type FounderOrderSummary = {
  exportLockedCount: number;
  exportReadyCount: number;
  feedbackCount: number | null;
  manualPendingPaymentCount: number;
  paymentCount: number | null;
  paymentStatusCounts: Record<string, number>;
  recentReportCount: number;
  reportCount: number | null;
  reportStatusCounts: Record<string, number>;
};

type ReportRow = {
  created_at: string | null;
  failure_reason: string | null;
  id: string;
  mode: string | null;
  output: unknown | null;
  status: string;
};

type PaymentRow = {
  midtrans_order_id?: string | null;
  payment_type?: string | null;
  report_id: string;
  status: string;
};

type UsageRow = {
  estimated_energy: number | null;
  report_id: string | null;
};

export async function listFounderOrders(limit = 50) {
  if (!env.admin.viewEnabled) {
    return { ready: false as const, reason: "admin_view_disabled" as const };
  }

  const supabase = getOptionalSupabaseAdminClient();

  if (!supabase) {
    return { ready: false as const, reason: "supabase_unconfigured" as const };
  }

  const { data: reports, error } = await supabase
    .from("reports")
    .select("id, created_at, mode, status, failure_reason, output")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("NaLI founder order lookup skipped", {
      code: error.code,
      message: error.message,
    });
    return { ready: false as const, reason: "lookup_failed" as const };
  }

  const reportRows = (reports ?? []) as ReportRow[];
  const reportIds = reportRows.map((report) => report.id);
  const [reportsCount, paymentsCount, feedbackCount] = await Promise.all([
    countTableRows(supabase, "reports"),
    countTableRows(supabase, "payments"),
    countTableRows(supabase, "report_feedback"),
  ]);

  if (reportIds.length === 0) {
    return {
      orders: [] as FounderOrderRow[],
      ready: true as const,
      summary: summarizeFounderOrders({
        feedbackCount,
        orders: [],
        paymentRows: [],
        paymentsCount,
        reportRows,
        reportsCount,
      }),
    };
  }

  const [{ data: payments }, { data: usageEvents }] = await Promise.all([
    supabase.from("payments").select("report_id, status, midtrans_order_id, payment_type").in("report_id", reportIds),
    supabase.from("usage_events").select("report_id, estimated_energy").in("report_id", reportIds),
  ]);

  const paymentByReport = new Map<string, string>();
  for (const payment of (payments ?? []) as PaymentRow[]) {
    if (!paymentByReport.has(payment.report_id) || isSuccessfulPaymentStatus(payment.status)) {
      paymentByReport.set(payment.report_id, payment.status);
    }
  }

  const energyByReport = new Map<string, number>();
  for (const event of (usageEvents ?? []) as UsageRow[]) {
    if (!event.report_id || event.estimated_energy == null) continue;
    energyByReport.set(event.report_id, (energyByReport.get(event.report_id) ?? 0) + event.estimated_energy);
  }

  const orders = reportRows.map((report) => {
    const paymentStatus = paymentByReport.get(report.id) ?? null;
    return {
      createdAt: report.created_at,
      estimatedEnergy: energyByReport.get(report.id) ?? null,
      exportReadiness: isSuccessfulPaymentStatus(paymentStatus) ? "export_ready" : "export_locked",
      failureReason: report.failure_reason,
      hasOutput: Boolean(report.output),
      id: report.id,
      mode: report.mode,
      paymentStatus,
      status: report.status,
    } satisfies FounderOrderRow;
  });

  return {
    orders,
    ready: true as const,
    summary: summarizeFounderOrders({
      feedbackCount,
      orders,
      paymentRows: (payments ?? []) as PaymentRow[],
      paymentsCount,
      reportRows,
      reportsCount,
    }),
  };
}

async function countTableRows(
  supabase: NonNullable<ReturnType<typeof getOptionalSupabaseAdminClient>>,
  table: "payments" | "report_feedback" | "reports",
) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });

  if (error) {
    console.warn("NaLI founder summary count skipped", {
      code: error.code,
      message: error.message,
      table,
    });
    return null;
  }

  return count ?? null;
}

function increment(counts: Record<string, number>, status: string | null | undefined) {
  const key = status?.trim() || "unknown";
  counts[key] = (counts[key] ?? 0) + 1;
}

function summarizeFounderOrders({
  feedbackCount,
  orders,
  paymentRows,
  paymentsCount,
  reportRows,
  reportsCount,
}: {
  feedbackCount: number | null;
  orders: FounderOrderRow[];
  paymentRows: PaymentRow[];
  paymentsCount: number | null;
  reportRows: ReportRow[];
  reportsCount: number | null;
}): FounderOrderSummary {
  const reportStatusCounts: Record<string, number> = {};
  const paymentStatusCounts: Record<string, number> = {};

  for (const report of reportRows) increment(reportStatusCounts, report.status);
  for (const payment of paymentRows) increment(paymentStatusCounts, payment.status);

  return {
    exportLockedCount: orders.filter((order) => order.exportReadiness === "export_locked").length,
    exportReadyCount: orders.filter((order) => order.exportReadiness === "export_ready").length,
    feedbackCount,
    manualPendingPaymentCount: paymentRows.filter(
      (payment) => payment.status === "pending" && payment.midtrans_order_id?.startsWith("manual-"),
    ).length,
    paymentCount: paymentsCount,
    paymentStatusCounts,
    recentReportCount: orders.length,
    reportCount: reportsCount,
    reportStatusCounts,
  };
}
