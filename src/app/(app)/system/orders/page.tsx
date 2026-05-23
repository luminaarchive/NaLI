import Link from "next/link";
import { ArrowLeft, ClipboardList, Eye, ShieldAlert } from "lucide-react";
import { listFounderOrders, type FounderOrderRow, type FounderOrderSummary } from "@/lib/system/adminOrders";
import { listManualFulfillmentJobs } from "@/lib/manualFulfillment/jobs";
import type { ManualFulfillmentJob } from "@/lib/manualFulfillment/jobs";
import { getSystemReadiness } from "@/lib/system/readiness";

export const dynamic = "force-dynamic";

export default async function FounderOrdersPage() {
  const result = await listFounderOrders();
  const fulfillmentJobs = result.ready ? await listManualFulfillmentJobs() : null;
  const readiness = getSystemReadiness();

  return (
    <div className="min-h-screen bg-[#f7f3ea] px-4 py-8 text-[#111814] sm:px-6 lg:px-8">
      <main className="mx-auto max-w-6xl">
        <header className="border-b border-[#ddd5c7] pb-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#5f6b62] hover:text-[#173d2b]"
            href="/system"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            System Readiness
          </Link>
          <p className="mt-5 text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">Internal founder view</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Report Orders</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6b62]">
            Foundation view for Sprint 0 operations. It shows metadata only and never exposes raw guest session values
            or raw report access values.
          </p>
        </header>

        {!result.ready ? (
          <DisabledState reason={result.reason} />
        ) : (
          <>
            <OperationalSummary
              midtransConfigured={readiness.midtransConfigured}
              midtransProductionMode={readiness.midtransProductionMode}
              summary={result.summary}
            />
            <OrdersTable orders={result.orders} />
            <FulfillmentJobsSection jobs={fulfillmentJobs || []} />
          </>
        )}
      </main>
    </div>
  );
}

function OperationalSummary({
  midtransConfigured,
  midtransProductionMode,
  summary,
}: {
  midtransConfigured: boolean;
  midtransProductionMode: boolean;
  summary: FounderOrderSummary;
}) {
  return (
    <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <SummaryMetric label="Reports" value={summary.reportCount == null ? "unknown" : String(summary.reportCount)} />
      <SummaryMetric
        label="Feedback"
        value={summary.feedbackCount == null ? "unknown" : String(summary.feedbackCount)}
      />
      <SummaryMetric label="Payments" value={summary.paymentCount == null ? "unknown" : String(summary.paymentCount)} />
      <SummaryMetric
        label="Report events"
        value={summary.reportEventCount == null ? "unknown" : String(summary.reportEventCount)}
      />
      <SummaryMetric
        label="API usage logs"
        value={summary.apiUsageLogCount == null ? "unknown" : String(summary.apiUsageLogCount)}
      />
      <SummaryMetric
        label="Failed/skipped ops"
        value={
          summary.failedOrSkippedOperationCount == null ? "unknown" : String(summary.failedOrSkippedOperationCount)
        }
      />
      <SummaryMetric label="Manual pending" value={String(summary.manualPendingPaymentCount)} />
      <SummaryMetric label="Export ready" value={String(summary.exportReadyCount)} />
      <SummaryMetric label="Export locked" value={String(summary.exportLockedCount)} />
      <SummaryMetric label="Recent reports" value={String(summary.recentReportCount)} />
      <SummaryMetric
        label="Midtrans"
        value={midtransConfigured ? (midtransProductionMode ? "configured/prod" : "configured/sandbox") : "missing env"}
      />
      <StatusSummary label="Report status" values={summary.reportStatusCounts} />
      <StatusSummary label="Payment status" values={summary.paymentStatusCounts} />
    </section>
  );
}

function FulfillmentJobsSection({ jobs }: { jobs: ManualFulfillmentJob[] }) {
  return (
    <section className="mt-12">
      <header className="border-b border-[#ddd5c7] pb-4">
        <h2 className="text-xl font-semibold">Automated Processing Queue</h2>
        <p className="mt-1 text-sm text-[#5f6b62]">
          Queue of reports flagged for automated review or specialized processing.
        </p>
      </header>

      <div className="mt-4 overflow-hidden rounded-lg border border-[#ddd5c7] bg-white">
        <div className="hidden grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_1fr_auto] gap-3 border-b border-[#ddd5c7] bg-[#fcfaf4] px-4 py-3 text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase lg:grid">
          <span>Job ID</span>
          <span>Report ID</span>
          <span>Complexity</span>
          <span>Status</span>
          <span>Created</span>
          <span>Details</span>
        </div>
        <div className="divide-y divide-[#eee7db]">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.5fr_1.5fr_0.8fr_0.8fr_1fr_auto] lg:items-center"
            >
              <div>
                <p className="font-mono text-xs text-[#5f6b62]">{job.id}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[#5f6b62]">{job.report_id}</p>
              </div>
              <Meta label="Complexity" value={`${job.complexity_score} / 100`} />
              <Meta label="Status" value={job.status} />
              <Meta label="Created" value={job.created_at ? new Date(job.created_at).toLocaleString("id-ID") : "-"} />
              <details className="rounded-md border border-[#ddd5c7] bg-[#fcfaf4] px-3 py-2">
                <summary className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#173d2b]">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Details
                </summary>
                <div className="mt-3 space-y-2 text-xs leading-5 text-[#5f6b62]">
                  <p>Reason: {job.reason ?? "none"}</p>
                  <p>User Scope Note: {job.user_scope_note ?? "none"}</p>
                  <p>Founder Note: {job.founder_note ?? "none"}</p>
                  <p>Turnaround Hours: {job.estimated_turnaround_hours ?? "not set"}</p>
                  <p>Revisions: {job.revision_count}</p>
                </div>
              </details>
            </article>
          ))}
          {jobs.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-[#5f6b62]">No active automated processing jobs.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function DisabledState({ reason }: { reason: "admin_view_disabled" | "lookup_failed" | "supabase_unconfigured" }) {
  const copy = {
    admin_view_disabled: {
      detail:
        "Set ADMIN_VIEW_ENABLED=true later when you intentionally want this internal view to read report metadata.",
      title: "Admin order view is disabled.",
    },
    lookup_failed: {
      detail: "The code path is present, but the database lookup failed. Check server logs after env setup resumes.",
      title: "Order metadata could not be loaded.",
    },
    supabase_unconfigured: {
      detail: "Supabase belum dikonfigurasi di environment ini.",
      title: "Persistence environment is missing.",
    },
  }[reason];

  return (
    <section className="mt-6 rounded-lg border border-[#ddd5c7] bg-white p-6">
      <ShieldAlert className="h-8 w-8 text-[#9a5b35]" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold">{copy.title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f6b62]">{copy.detail}</p>
    </section>
  );
}

function OrdersTable({ orders }: { orders: FounderOrderRow[] }) {
  if (orders.length === 0) {
    return (
      <section className="mt-6 rounded-lg border border-dashed border-[#cfc6b7] bg-white p-8 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-[#6f8057]" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-semibold">No report orders yet.</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5f6b62]">
          When Supabase env is configured and reports are persisted, recent report metadata will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-[#ddd5c7] bg-white">
      <div className="hidden grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_1fr_auto] gap-3 border-b border-[#ddd5c7] bg-[#fcfaf4] px-4 py-3 text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase lg:grid">
        <span>Report</span>
        <span>Created</span>
        <span>Mode</span>
        <span>Status</span>
        <span>Export</span>
        <span>NaLI Energy</span>
        <span>Action</span>
      </div>
      <div className="divide-y divide-[#eee7db]">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#ddd5c7] bg-white p-4">
      <p className="text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#111814]">{value}</p>
    </div>
  );
}

function StatusSummary({ label, values }: { label: string; values: Record<string, number> }) {
  const entries = Object.entries(values);

  return (
    <div className="rounded-lg border border-[#ddd5c7] bg-white p-4 md:col-span-2">
      <p className="text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#5f6b62]">
        {entries.length === 0 ? "No recent rows." : entries.map(([status, count]) => `${status}: ${count}`).join(" · ")}
      </p>
    </div>
  );
}

function OrderRow({ order }: { order: FounderOrderRow }) {
  return (
    <article className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.8fr_0.8fr_1fr_auto] lg:items-center">
      <div>
        <p className="font-mono text-xs text-[#5f6b62]">{order.id}</p>
        <p className="mt-1 text-xs text-[#8a8174]">{order.hasOutput ? "Output exists" : "No output yet"}</p>
      </div>
      <Meta label="Created" value={order.createdAt ? new Date(order.createdAt).toLocaleString("id-ID") : "-"} />
      <Meta label="Mode" value={order.mode ?? "-"} />
      <Meta label="Status" value={order.status} />
      <Meta label="Export" value={order.exportReadiness === "export_ready" ? "ready" : "locked"} />
      <Meta label="NaLI Energy" value={order.estimatedEnergy == null ? "not logged" : String(order.estimatedEnergy)} />
      <details className="rounded-md border border-[#ddd5c7] bg-[#fcfaf4] px-3 py-2">
        <summary className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#173d2b]">
          <Eye className="h-4 w-4" aria-hidden="true" />
          Metadata
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-5 text-[#5f6b62]">
          <p>Payment: {order.paymentStatus ?? "none"}</p>
          <p>Failure: {order.failureReason ?? "none"}</p>
          <p>Automated review action: prepared later, not active.</p>
        </div>
      </details>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.08em] text-[#8a8174] uppercase lg:hidden">{label}</p>
      <p className="mt-1 text-[#111814] lg:mt-0">{value}</p>
    </div>
  );
}
