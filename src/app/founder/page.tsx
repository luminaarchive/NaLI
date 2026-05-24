import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Database,
  HelpCircle,
  Key,
  Lock,
  LogOut,
  ShieldCheck,
  Star,
  Terminal,
  Info,
} from "lucide-react";
import { getFounderMonitoringData } from "@/lib/system/monitoring";
import { computeReportQualityMemory } from "@/lib/quality/reportQualityMemory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "NaLI Founder Console",
  robots: {
    index: false,
    follow: false,
  },
};

async function loginFounderAction(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;
  const adminToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;

  if (adminToken && token === adminToken) {
    const cookieStore = await cookies();
    cookieStore.set("founder_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }
  redirect("/founder");
}

async function logoutFounderAction() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("founder_token");
  redirect("/founder");
}

export default async function FounderPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const adminToken = process.env.NALI_FOUNDER_ADMIN_TOKEN;

  // 1. Check if founder console configured
  if (!adminToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white/90 p-6">
        <div className="max-w-md w-full text-center border border-red-500/20 bg-red-950/20 p-6 rounded-2xl backdrop-blur-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-4">Founder Console Not Configured</h1>
          <p className="mt-2 text-sm text-white/60">
            The internal founder monitoring console is not configured in this environment (missing NALI_FOUNDER_ADMIN_TOKEN).
          </p>
        </div>
      </div>
    );
  }

  // 2. Perform authentication check
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("founder_token")?.value;
  const queryToken = params.token;

  const isAuthorized = (queryToken === adminToken) || (cookieToken === adminToken);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white/90 p-6">
        <div className="max-w-md w-full border border-white/[0.08] bg-white/[0.02] p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] mx-auto">
            <Lock className="h-6 w-6 text-[#6f8057]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-center mt-4">Founder Admin Console</h1>
          <p className="mt-2 text-sm text-center text-white/50">
            Please enter your NALI_FOUNDER_ADMIN_TOKEN to access health metrics and feedback.
          </p>
          <form action={loginFounderAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="token" className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057]">
                Access Token
              </label>
              <input
                type="password"
                id="token"
                name="token"
                required
                className="mt-2 block w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-[#6f8057] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-[#6f8057] text-sm font-semibold text-white transition hover:bg-[#5b6a48]"
            >
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Load data
  const data = await getFounderMonitoringData();
  const qualityMemory = computeReportQualityMemory(data);

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-8 text-white/90 sm:px-6 lg:px-8">
      <main className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="border-b border-white/[0.08] pb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.08em] text-[#6f8057] uppercase">Internal Ops Console</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl mt-1">NaLI Founder Console</h1>
            <p className="mt-2 text-sm text-white/50">
              Monitoring system health, user friction themes, API cost protection, and readiness metrics.
            </p>
          </div>
          <form action={logoutFounderAction}>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </header>

        {/* LOCKED/DEFERRED STATUS CARDS */}
        <section className="mt-6 grid gap-4 grid-cols-2 md:grid-cols-5">
          <StatusIndicator label="Human Testing" value="PAUSED" status="warning" />
          <StatusIndicator label="Midtrans Payment" value="DEFERRED" status="inactive" />
          <StatusIndicator label="Paid Launch" value="NO-GO" status="error" />
          <StatusIndicator label="PDF Upload Gate" value="DORMANT" status="inactive" />
          <StatusIndicator label="Field Intelligence" value="POSITIONING_ONLY" status="info" />
        </section>

        {/* MAIN BODY GRID */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px]">
          
          {/* LEFT COLUMN: SYSTEM READINESS & REPORT HEALTH */}
          <div className="space-y-6">
            
            {/* SYSTEM READINESS */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <ShieldCheck className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">System Readiness Status</h2>
              </div>
              <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <ReadinessItem label="Supabase DB" active={data.readiness.supabaseConfigured} />
                <ReadinessItem label="OpenRouter AI" active={data.readiness.openRouterConfigured} />
                <ReadinessItem label="Midtrans Setup" active={data.readiness.midtransConfigured} detail={data.readiness.midtransEnvironment} />
                <ReadinessItem label="Paid Checkout" active={data.readiness.paidCheckoutActive} />
                <ReadinessItem label="Paid Export" active={data.readiness.paidExportActive} />
                <ReadinessItem label="Credit Purchase" active={data.readiness.creditPurchaseActive} />
                <ReadinessItem label="Upload Active" active={data.readiness.uploadActive} />
                <ReadinessItem label="File Upload" active={data.readiness.fileUploadActive} />
                <ReadinessItem label="Source Verifier" active={data.readiness.sourceVerificationActive} />
              </div>
            </section>

            {/* REPORT SUMMARY METRICS */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Database className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">Report Generation Health</h2>
              </div>
              <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-4">
                <MetricCard label="Total Reports" value={data.reportsSummary.total} />
                <MetricCard label="Created Today" value={data.reportsSummary.createdToday} />
                <MetricCard label="Last 7 Days" value={data.reportsSummary.createdLast7Days} />
                <MetricCard label="Generation Failures" value={data.reportsSummary.failedCount} status={data.reportsSummary.failedCount > 0 ? "error" : "success"} />
              </div>

              {/* Mode & Evidence Distribution */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057]">Report Mode</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Draft from Materials:</span>
                      <span className="font-semibold">{data.reportsSummary.draftFromMaterialsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Start from Zero (Guidance):</span>
                      <span className="font-semibold">{data.reportsSummary.startFromZeroCount}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057]">Evidence Strength</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    {Object.entries(data.reportsSummary.evidenceStrength).length === 0 ? (
                      <p className="text-white/40">No evidence classifications available.</p>
                    ) : (
                      Object.entries(data.reportsSummary.evidenceStrength).map(([key, val]) => (
                        <div key={key} className="flex justify-between capitalize">
                          <span className="text-white/60">{key}:</span>
                          <span className="font-semibold">{val}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT FAILURES TABLE */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057] mb-3">Recent Failures</h3>
                {data.reportsSummary.recentFailures.length === 0 ? (
                  <p className="text-sm text-white/40 p-4 border border-dashed border-white/[0.08] rounded-xl text-center">
                    No report generation failures logged.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                      <thead className="bg-white/[0.02] text-white/50 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2">Report ID</th>
                          <th className="px-4 py-2">Stage</th>
                          <th className="px-4 py-2">Reason</th>
                          <th className="px-4 py-2 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {data.reportsSummary.recentFailures.map((r) => (
                          <tr key={r.id} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-2 font-mono text-xs max-w-[120px] truncate">{r.id}</td>
                            <td className="px-4 py-2 text-orange-400 font-semibold">{r.failure_stage || "unknown"}</td>
                            <td className="px-4 py-2 text-white/70 max-w-[200px] truncate">{r.failure_reason || "unknown"}</td>
                            <td className="px-4 py-2 text-right text-white/45">{new Date(r.created_at).toLocaleTimeString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* USAGE AND COST PROTECTION */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Activity className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">API Usage & Cost Analysis</h2>
              </div>
              <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3">
                <MetricCard label="Total API Calls" value={data.usageSummary.apiLogsCount} />
                <MetricCard label="Success Rate" value={data.usageSummary.apiLogsCount > 0 ? `${Math.round((data.usageSummary.successApiLogsCount / data.usageSummary.apiLogsCount) * 100)}%` : "0%"} />
                <MetricCard label="Est. Cost (USD)" value={`$${data.usageSummary.totalCostUsd.toFixed(4)}`} />
              </div>

              {/* RATE LIMITING SIGNALS */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057] mb-3">Active Rate Limits ({data.usageSummary.rateLimitsCount} logs)</h3>
                {data.usageSummary.activeRateLimits.length === 0 ? (
                  <p className="text-sm text-white/40 p-4 border border-dashed border-white/[0.08] rounded-xl text-center">
                    No active user blocks / rate limits.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                    <table className="min-w-full divide-y divide-white/[0.08] text-sm text-left">
                      <thead className="bg-white/[0.02] text-white/50 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-4 py-2">Hash</th>
                          <th className="px-4 py-2">Action</th>
                          <th className="px-4 py-2">Attempts</th>
                          <th className="px-4 py-2 text-right">Locked Until</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {data.usageSummary.activeRateLimits.map((rl, index) => (
                          <tr key={index} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-2 font-mono text-xs max-w-[120px] truncate">{rl.key_hash}</td>
                            <td className="px-4 py-2 text-white/80">{rl.action_type}</td>
                            <td className="px-4 py-2">{rl.attempts}</td>
                            <td className="px-4 py-2 text-right text-orange-400 font-semibold">{rl.locked_until ? new Date(rl.locked_until).toLocaleTimeString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* REPORT QUALITY SNAPSHOT */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <ShieldCheck className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">Report Quality Snapshot</h2>
              </div>
              {qualityMemory.qualityScore === -1 ? (
                <p className="mt-4 text-sm text-white/40 p-4 border border-dashed border-white/[0.08] rounded-xl text-center">
                  No quality memory signals collected yet.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Score display */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-white/40">Report Quality Score</h3>
                        <p className={`mt-2 text-4xl font-bold tracking-tight ${
                          qualityMemory.qualityScore >= 80 ? "text-green-400" :
                          qualityMemory.qualityScore >= 50 ? "text-amber-400" : "text-red-400"
                        }`}>
                          {qualityMemory.qualityScore}<span className="text-sm font-normal text-white/40">/100</span>
                        </p>
                      </div>
                      <p className="text-xs text-white/50 mt-4 leading-relaxed">
                        Deterministic composite score based on evidence quality (40%), failure rate (25%), feedback sentiment (20%), and friction absence (15%).
                      </p>
                    </div>

                    {/* Risk & Evidence */}
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-3">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-white/40">Risk Level</h3>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            qualityMemory.riskLevel === "P0" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                            qualityMemory.riskLevel === "P1" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                            qualityMemory.riskLevel === "P2" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                            qualityMemory.riskLevel === "P3" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            "bg-green-500/10 border-green-500/30 text-green-400"
                          }`}>
                            {qualityMemory.riskLevel === "none" ? "No Active Risk" : `Risk: ${qualityMemory.riskLevel}`}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/[0.06] pt-3">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-white/40 mb-2">Evidence Summary</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Strong/High Evidence:</span>
                            <span className="font-semibold text-green-400">{qualityMemory.strongEvidenceCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Weak/Missing Evidence:</span>
                            <span className="font-semibold text-red-400">{qualityMemory.weakEvidenceCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Total Evaluated:</span>
                            <span className="font-semibold">{qualityMemory.totalReportsScored}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#6f8057]/20 bg-[#1e2a22]/10 p-4">
                    <p className="text-xs text-white/85 leading-relaxed font-mono">
                      {qualityMemory.safeSummary}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Founder Attention Queue */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <AlertTriangle className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">Founder Attention Queue</h2>
              </div>
              {qualityMemory.qualityScore === -1 || qualityMemory.attentionQueue.length === 0 ? (
                <p className="mt-4 text-sm text-white/40 p-4 border border-dashed border-white/[0.08] rounded-xl text-center">
                  All signals clear. No items in the attention queue.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {qualityMemory.attentionQueue.map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            item.severity === "P0" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                            item.severity === "P1" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                            item.severity === "P2" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                            item.severity === "P3" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            "bg-green-500/10 border-green-500/30 text-green-400"
                          }`}>
                            {item.severity}
                          </span>
                          <span className="font-semibold text-white/95">{item.title}</span>
                        </div>
                        <p className="text-xs text-white/60">{item.detail}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-mono text-white/40">Metric:</span>
                        <span className="block font-bold text-white/95">{item.metric}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Suggested Next Fixes */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Terminal className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">Suggested Next Fixes</h2>
              </div>
              {qualityMemory.qualityScore === -1 || qualityMemory.suggestedFixes.length === 0 ? (
                <p className="mt-4 text-sm text-white/40 p-4 border border-dashed border-white/[0.08] rounded-xl text-center">
                  No suggested fixes compiled.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {qualityMemory.suggestedFixes.map((fix, index) => (
                    <div key={index} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 text-sm">
                      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2 mb-2">
                        <span className="font-semibold text-white/90">{fix.title}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                          fix.priority === "P0" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                          fix.priority === "P1" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                          fix.priority === "P2" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                          fix.priority === "P3" ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                          "bg-green-500/10 border-green-500/30 text-green-400"
                        }`}>
                          {fix.priority}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{fix.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: FEEDBACK INTELLIGENCE & ACTIONS */}
          <div className="space-y-6">
            
            {/* FEEDBACK INTELLIGENCE */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Star className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">Feedback Intelligence</h2>
              </div>
              <div className="mt-4 grid gap-4 grid-cols-2">
                <MetricCard label="Helpful 👍" value={data.feedbackSummary.helpfulCount} status="success" />
                <MetricCard label="Not Helpful 👎" value={data.feedbackSummary.notHelpfulCount} status={data.feedbackSummary.notHelpfulCount > 0 ? "warning" : "neutral"} />
              </div>

              {/* Keyword Flag Metrics */}
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057] mb-3">Friction Keywords detected</h3>
                <FrictionMetric label="Bug/Error" value={data.feedbackSummary.keywords.bugError} />
                <FrictionMetric label="Confusing Wording" value={data.feedbackSummary.keywords.confusing} />
                <FrictionMetric label="Mobile UX Issues" value={data.feedbackSummary.keywords.mobile} />
                <FrictionMetric label="Evidence Unclear" value={data.feedbackSummary.keywords.evidenceUnclear} />
                <FrictionMetric label="Export/Payment Gate" value={data.feedbackSummary.keywords.exportPaymentConfusion} />
                <FrictionMetric label="Rate Limit Warnings" value={data.feedbackSummary.keywords.rateLimit} />
                <FrictionMetric label="Output Quality Issues" value={data.feedbackSummary.keywords.outputNotUseful} />
              </div>

              {/* LATEST FEEDBACK SNIPPETS */}
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f8057] mb-3">Latest User Comments</h3>
                {data.feedbackSummary.latestComments.length === 0 ? (
                  <p className="text-sm text-white/40 p-4 border border-dashed border-white/[0.08] rounded-xl text-center">
                    No comments submitted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.feedbackSummary.latestComments.map((c, index) => (
                      <div key={index} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 text-sm">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${c.rating === "helpful" ? "bg-green-400/10 text-green-300" : "bg-red-400/10 text-red-300"}`}>
                            {c.rating}
                          </span>
                          <span className="text-white/40">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-white/80 mt-1 italic">&quot;{c.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* FOUNDER DECISION CHECKLIST & ACTIONS */}
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Terminal className="h-5 w-5 text-[#6f8057]" />
                <h2 className="text-lg font-semibold">Founder Operations List</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6">
                <ActionItem checked={true} text="Fix P0/P1 only (No Payment activations)" />
                <ActionItem checked={true} text="Human testing remains PAUSED" />
                <ActionItem checked={true} text="Midtrans payment remains DEFERRED" />
                <ActionItem checked={true} text="Paid launch status stays locked at NO-GO" />
                <ActionItem checked={false} text="Address any bug/error friction keywords from user feedback" />
                <ActionItem checked={false} text="Review generation failure stages in logs" />
              </ul>
              <div className="mt-6 rounded-xl border border-[#6f8057]/20 bg-[#1e2a22]/20 p-4">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-[#6f8057] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#9db2a3] leading-relaxed">
                    <strong>Ops Notice:</strong> NaLI Sprint 0 is limited to Guests and non-payment checks. Live payment sandbox or automatic exports will be unlocked on the next phase once Midtrans env keys are set.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusIndicator({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "error" | "inactive" | "info" }) {
  const statusColors = {
    success: "border-green-500/20 bg-green-500/10 text-green-400",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    error: "border-red-500/20 bg-red-500/10 text-red-400",
    inactive: "border-white/[0.08] bg-white/[0.02] text-white/40",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  };

  return (
    <article className={`rounded-xl border p-4 text-center ${statusColors[status]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50">{label}</p>
      <p className="mt-1.5 text-sm font-bold tracking-wider">{value}</p>
    </article>
  );
}

function ReadinessItem({ label, active, detail }: { label: string; active: boolean; detail?: string }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 text-sm ${active ? "border-green-500/20 bg-green-500/[0.02] text-green-300" : "border-white/[0.08] bg-white/[0.01] text-white/40"}`}>
      <span className="font-semibold">{label}</span>
      <div className="flex items-center gap-1.5 text-xs font-mono">
        <span>{active ? "ON" : "OFF"}</span>
        {detail && <span className="opacity-50">({detail})</span>}
        <div className={`h-2 w-2 rounded-full ${active ? "bg-green-500 animate-pulse" : "bg-white/20"}`} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, status = "neutral" }: { label: string; value: string | number; status?: "success" | "warning" | "error" | "neutral" }) {
  const colors = {
    success: "text-green-400",
    warning: "text-amber-400",
    error: "text-red-400",
    neutral: "text-white",
  };

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.01] p-4 text-center">
      <p className="text-xs font-semibold tracking-[0.08em] text-white/40 uppercase">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${colors[status]}`}>{value}</p>
    </div>
  );
}

function FrictionMetric({ label, value }: { label: string; value: number }) {
  const active = value > 0;
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${active ? "bg-red-950/20 border border-red-500/25 text-red-300" : "bg-white/[0.01] border border-white/[0.04] text-white/50"}`}>
      <span>{label}</span>
      <span className={`font-semibold ${active ? "text-red-400 font-bold" : ""}`}>{value}</span>
    </div>
  );
}

function ActionItem({ checked, text }: { checked: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <input
        type="checkbox"
        readOnly
        checked={checked}
        className="mt-1 h-4 w-4 shrink-0 rounded border-white/[0.08] bg-white/[0.02] text-[#6f8057] focus:ring-0"
      />
      <span className={checked ? "line-through text-white/30" : "text-white/80"}>{text}</span>
    </li>
  );
}
