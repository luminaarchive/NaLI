import { env } from "@/lib/config/env";
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

type ReportRow = {
  created_at: string | null;
  failure_reason: string | null;
  id: string;
  mode: string | null;
  output: unknown | null;
  status: string;
};

type PaymentRow = {
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

  if (reportIds.length === 0) {
    return { orders: [] as FounderOrderRow[], ready: true as const };
  }

  const [{ data: payments }, { data: usageEvents }] = await Promise.all([
    supabase.from("payments").select("report_id, status").in("report_id", reportIds),
    supabase.from("usage_events").select("report_id, estimated_energy").in("report_id", reportIds),
  ]);

  const paymentByReport = new Map<string, string>();
  for (const payment of ((payments ?? []) as PaymentRow[])) {
    if (!paymentByReport.has(payment.report_id) || payment.status === "paid") {
      paymentByReport.set(payment.report_id, payment.status);
    }
  }

  const energyByReport = new Map<string, number>();
  for (const event of ((usageEvents ?? []) as UsageRow[])) {
    if (!event.report_id || event.estimated_energy == null) continue;
    energyByReport.set(event.report_id, (energyByReport.get(event.report_id) ?? 0) + event.estimated_energy);
  }

  return {
    orders: reportRows.map((report) => {
      const paymentStatus = paymentByReport.get(report.id) ?? null;
      return {
        createdAt: report.created_at,
        estimatedEnergy: energyByReport.get(report.id) ?? null,
        exportReadiness: paymentStatus === "paid" ? "export_ready" : "export_locked",
        failureReason: report.failure_reason,
        hasOutput: Boolean(report.output),
        id: report.id,
        mode: report.mode,
        paymentStatus,
        status: report.status,
      } satisfies FounderOrderRow;
    }),
    ready: true as const,
  };
}
