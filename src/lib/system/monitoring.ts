import { getOptionalSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSystemReadiness } from "./readiness";
export { verifyFounderToken } from "./founderAuthorization";

export interface FounderMonitoringData {
  readiness: ReturnType<typeof getSystemReadiness>;
  reportsSummary: {
    total: number;
    draftFromMaterialsCount: number;
    startFromZeroCount: number;
    failedCount: number;
    createdToday: number;
    createdLast7Days: number;
    failureStages: Record<string, number>;
    evidenceStrength: Record<string, number>;
    recentFailures: Array<{ id: string; failure_reason: string | null; failure_stage: string | null; created_at: string }>;
  };
  feedbackSummary: {
    total: number;
    helpfulCount: number;
    notHelpfulCount: number;
    keywords: {
      confusing: number;
      mobile: number;
      outputNotUseful: number;
      evidenceUnclear: number;
      exportPaymentConfusion: number;
      bugError: number;
      rateLimit: number;
    };
    latestComments: Array<{ rating: string; comment: string; created_at: string; report_id: string }>;
  };
  usageSummary: {
    apiLogsCount: number;
    successApiLogsCount: number;
    failedApiLogsCount: number;
    totalCostUsd: number;
    recentApiLogs: Array<{ operation: string; status: string; estimated_cost: number | null; created_at: string }>;
    rateLimitsCount: number;
    activeRateLimits: Array<{ key_hash: string; action_type: string; attempts: number; locked_until: string | null }>;
  };
  paymentsSummary: {
    total: number;
    paidCount: number;
    pendingCount: number;
    totalAmountIdr: number;
  };
}

export function classifyComment(comment: string) {
  const c = comment.toLowerCase();
  return {
    confusing: c.includes("bingung") || c.includes("confus") || c.includes("kurang jelas") || c.includes("tidak paham") || c.includes("unclear"),
    mobile: c.includes("mobile") || c.includes("hp") || c.includes("tampilan") || c.includes("layar") || c.includes("responsif") || c.includes("responsive"),
    outputNotUseful: c.includes("tidak berguna") || c.includes("kurang lengkap") || c.includes("tidak bermanfaat") || c.includes("jelek") || c.includes("bad") || c.includes("useless"),
    evidenceUnclear: c.includes("bukti") || c.includes("sumber") || c.includes("evidence") || c.includes("referensi") || c.includes("sitasi") || c.includes("citation"),
    exportPaymentConfusion: c.includes("bayar") || c.includes("ekspor") || c.includes("export") || c.includes("payment") || c.includes("kredit") || c.includes("harga") || c.includes("credit"),
    bugError: c.includes("bug") || c.includes("error") || c.includes("crash") || c.includes("gagal") || c.includes("salah") || c.includes("fail"),
    rateLimit: c.includes("rate limit") || c.includes("terlalu banyak") || c.includes("429") || c.includes("limit") || c.includes("kuota"),
  };
}

export async function getFounderMonitoringData(): Promise<FounderMonitoringData> {
  const readiness = getSystemReadiness();
  const supabase = getOptionalSupabaseAdminClient();

  const reportsSummary = {
    total: 0,
    draftFromMaterialsCount: 0,
    startFromZeroCount: 0,
    failedCount: 0,
    createdToday: 0,
    createdLast7Days: 0,
    failureStages: {} as Record<string, number>,
    evidenceStrength: {} as Record<string, number>,
    recentFailures: [] as FounderMonitoringData["reportsSummary"]["recentFailures"],
  };

  const feedbackSummary = {
    total: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    keywords: {
      confusing: 0,
      mobile: 0,
      outputNotUseful: 0,
      evidenceUnclear: 0,
      exportPaymentConfusion: 0,
      bugError: 0,
      rateLimit: 0,
    },
    latestComments: [] as FounderMonitoringData["feedbackSummary"]["latestComments"],
  };

  const usageSummary = {
    apiLogsCount: 0,
    successApiLogsCount: 0,
    failedApiLogsCount: 0,
    totalCostUsd: 0,
    recentApiLogs: [] as FounderMonitoringData["usageSummary"]["recentApiLogs"],
    rateLimitsCount: 0,
    activeRateLimits: [] as FounderMonitoringData["usageSummary"]["activeRateLimits"],
  };

  const paymentsSummary = {
    total: 0,
    paidCount: 0,
    pendingCount: 0,
    totalAmountIdr: 0,
  };

  if (!supabase) {
    return {
      readiness,
      reportsSummary,
      feedbackSummary,
      usageSummary,
      paymentsSummary,
    };
  }

  try {
    // 1. Fetch Reports
    const { data: reports, error: reportsErr } = await supabase
      .from("reports")
      .select("id, status, mode, created_at, failure_reason, failure_stage, input, output");

    if (reports && !reportsErr) {
      reportsSummary.total = reports.length;
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      for (const r of reports) {
        const createdDate = new Date(r.created_at);
        if (createdDate >= oneDayAgo) reportsSummary.createdToday++;
        if (createdDate >= sevenDaysAgo) reportsSummary.createdLast7Days++;

        if (r.mode === "draft_from_materials") reportsSummary.draftFromMaterialsCount++;
        else if (r.mode === "start_from_zero") reportsSummary.startFromZeroCount++;

        if (r.status === "failed") {
          reportsSummary.failedCount++;
          if (r.failure_stage) {
            reportsSummary.failureStages[r.failure_stage] = (reportsSummary.failureStages[r.failure_stage] || 0) + 1;
          }
          reportsSummary.recentFailures.push({
            id: r.id,
            failure_reason: r.failure_reason ?? null,
            failure_stage: r.failure_stage ?? null,
            created_at: r.created_at,
          });
        }

        // Gather evidence strength from structured JSON
        const outputJson = r.output as any;
        if (outputJson && outputJson.evidence_strength) {
          const strength = String(outputJson.evidence_strength);
          reportsSummary.evidenceStrength[strength] = (reportsSummary.evidenceStrength[strength] || 0) + 1;
        }
      }

      // Sort recent failures
      reportsSummary.recentFailures.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      reportsSummary.recentFailures = reportsSummary.recentFailures.slice(0, 10);
    }

    // 2. Fetch Feedback
    const { data: feedback, error: feedbackErr } = await supabase
      .from("report_feedback")
      .select("id, report_id, rating, comment, created_at")
      .order("created_at", { ascending: false });

    if (feedback && !feedbackErr) {
      feedbackSummary.total = feedback.length;
      for (const f of feedback) {
        if (f.rating === "helpful") feedbackSummary.helpfulCount++;
        else if (f.rating === "not_helpful") feedbackSummary.notHelpfulCount++;

        const commentText = f.comment ? String(f.comment).trim() : "";
        if (commentText) {
          const flags = classifyComment(commentText);
          if (flags.confusing) feedbackSummary.keywords.confusing++;
          if (flags.mobile) feedbackSummary.keywords.mobile++;
          if (flags.outputNotUseful) feedbackSummary.keywords.outputNotUseful++;
          if (flags.evidenceUnclear) feedbackSummary.keywords.evidenceUnclear++;
          if (flags.exportPaymentConfusion) feedbackSummary.keywords.exportPaymentConfusion++;
          if (flags.bugError) feedbackSummary.keywords.bugError++;
          if (flags.rateLimit) feedbackSummary.keywords.rateLimit++;

          feedbackSummary.latestComments.push({
            rating: f.rating,
            comment: commentText,
            created_at: f.created_at,
            report_id: f.report_id,
          });
        }
      }
      feedbackSummary.latestComments = feedbackSummary.latestComments.slice(0, 15);
    }

    // 3. Fetch API Usage Logs
    const { data: apiLogs, error: apiErr } = await supabase
      .from("api_usage_logs")
      .select("id, operation, status, estimated_cost, created_at")
      .order("created_at", { ascending: false });

    if (apiLogs && !apiErr) {
      usageSummary.apiLogsCount = apiLogs.length;
      for (const log of apiLogs) {
        if (log.status === "success") usageSummary.successApiLogsCount++;
        else if (log.status === "failed") usageSummary.failedApiLogsCount++;

        if (log.estimated_cost) {
          usageSummary.totalCostUsd += Number(log.estimated_cost);
        }
      }
      usageSummary.recentApiLogs = apiLogs.slice(0, 10).map((l) => ({
        operation: l.operation,
        status: l.status,
        estimated_cost: l.estimated_cost ? Number(l.estimated_cost) : null,
        created_at: l.created_at,
      }));
    }

    // 4. Fetch Rate Limits
    const { data: rateLimits, error: rateErr } = await supabase
      .from("rate_limits")
      .select("key_hash, action_type, attempts, locked_until, updated_at")
      .order("updated_at", { ascending: false });

    if (rateLimits && !rateErr) {
      usageSummary.rateLimitsCount = rateLimits.length;
      const now = new Date();
      for (const rl of rateLimits) {
        if (rl.locked_until && new Date(rl.locked_until) > now) {
          usageSummary.activeRateLimits.push({
            key_hash: rl.key_hash,
            action_type: rl.action_type,
            attempts: rl.attempts,
            locked_until: rl.locked_until,
          });
        }
      }
    }

    // 5. Fetch Payments Summary (Midtrans status check only)
    const { data: payments, error: payErr } = await supabase
      .from("payments")
      .select("amount, status");

    if (payments && !payErr) {
      paymentsSummary.total = payments.length;
      for (const p of payments) {
        if (p.status === "paid") {
          paymentsSummary.paidCount++;
          paymentsSummary.totalAmountIdr += Number(p.amount);
        } else if (p.status === "pending") {
          paymentsSummary.pendingCount++;
        }
      }
    }
  } catch (err) {
    console.error("Error gathering founder monitoring data:", err);
  }

  return {
    readiness,
    reportsSummary,
    feedbackSummary,
    usageSummary,
    paymentsSummary,
  };
}
