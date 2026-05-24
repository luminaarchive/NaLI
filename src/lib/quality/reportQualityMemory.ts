import type { FounderMonitoringData } from "@/lib/system/monitoring";
import { classifyComment } from "@/lib/system/monitoring";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RiskLevel = "P0" | "P1" | "P2" | "P3" | "none";

export interface QualityTheme {
  key: string;
  label: string;
  count: number;
  severity: RiskLevel;
}

export interface AttentionItem {
  severity: RiskLevel;
  title: string;
  detail: string;
  metric: number | string;
}

export interface SuggestedFix {
  priority: RiskLevel;
  title: string;
  reason: string;
}

export interface ReportQualityMemory {
  qualityScore: number;
  riskLevel: RiskLevel;
  themes: QualityTheme[];
  weakEvidenceCount: number;
  strongEvidenceCount: number;
  totalReportsScored: number;
  attentionQueue: AttentionItem[];
  suggestedFixes: SuggestedFix[];
  safeSummary: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_MEMORY: ReportQualityMemory = {
  qualityScore: -1,
  riskLevel: "none",
  themes: [],
  weakEvidenceCount: 0,
  strongEvidenceCount: 0,
  totalReportsScored: 0,
  attentionQueue: [],
  suggestedFixes: [],
  safeSummary: "No quality memory signals collected yet.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sanitizes any string to ensure no access tokens, hashes, keys, or
 * sensitive content leaks into quality memory output.
 */
export function sanitizeForQualityMemory(text: string): string {
  if (!text) return "";
  return text
    .replace(/sk-[a-zA-Z0-9_-]{24,}/gi, "[REDACTED]")
    .replace(/[a-fA-F0-9]{40,}/g, "[HASH]")
    .replace(/(guest_session_id|access_key|secret|token|api_key)\s*[:=]\s*\S+/gi, "[REDACTED]")
    .replace(/\/Users\/[^\s]+/g, "[PATH]")
    .replace(/(openrouter|supabase|midtrans|openai|claude|gpt)/gi, "[PROVIDER]")
    .trim();
}

/**
 * Maps classifyComment flags into labeled QualityTheme entries.
 */
function feedbackFlagsToThemes(
  keywords: FounderMonitoringData["feedbackSummary"]["keywords"]
): QualityTheme[] {
  const mapping: Array<{ key: keyof typeof keywords; label: string; severity: RiskLevel }> = [
    { key: "bugError", label: "Bug / Error Laporan", severity: "P1" },
    { key: "confusing", label: "Teks Membingungkan", severity: "P2" },
    { key: "outputNotUseful", label: "Output Tidak Berguna", severity: "P1" },
    { key: "evidenceUnclear", label: "Bukti / Sumber Tidak Jelas", severity: "P2" },
    { key: "exportPaymentConfusion", label: "Ekspor / Pembayaran Bingung", severity: "P2" },
    { key: "mobile", label: "Masalah Mobile UX", severity: "P2" },
    { key: "rateLimit", label: "Rate Limit Tercapai", severity: "P3" },
  ];

  return mapping
    .filter((m) => keywords[m.key] > 0)
    .map((m) => ({
      key: m.key,
      label: m.label,
      count: keywords[m.key],
      severity: m.severity,
    }))
    .sort((a, b) => {
      const severityOrder: Record<RiskLevel, number> = { P0: 0, P1: 1, P2: 2, P3: 3, none: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity] || b.count - a.count;
    });
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

/**
 * Compute a deterministic quality score from 0–100.
 *
 * Dimensions and weights:
 *   - Evidence quality   (40%): ratio of strong evidence vs weak/missing
 *   - Failure rate       (25%): ratio of failed reports to total
 *   - Feedback sentiment (20%): ratio of helpful vs not helpful
 *   - Friction absence   (15%): fewer friction signals = higher score
 */
function computeQualityScore(data: FounderMonitoringData): number {
  const { reportsSummary, feedbackSummary, usageSummary } = data;
  const totalReports = reportsSummary.total;
  const totalFeedback = feedbackSummary.total;

  if (totalReports === 0 && totalFeedback === 0) return -1; // no data

  // 1. Evidence dimension (40 points max)
  const evidenceCounts = reportsSummary.evidenceStrength;
  const strongCount = (evidenceCounts["strong"] || 0) + (evidenceCounts["high"] || 0);
  const mediumCount = evidenceCounts["medium"] || 0;
  const weakCount = (evidenceCounts["weak"] || 0) + (evidenceCounts["low"] || 0) + (evidenceCounts["none"] || 0);
  const totalEvidence = strongCount + mediumCount + weakCount;

  let evidenceScore = 40; // default if no evidence data
  if (totalEvidence > 0) {
    evidenceScore = Math.round(((strongCount * 1.0 + mediumCount * 0.6 + weakCount * 0.1) / totalEvidence) * 40);
  }

  // 2. Failure rate dimension (25 points max)
  let failureScore = 25;
  if (totalReports > 0) {
    const successRate = 1 - reportsSummary.failedCount / totalReports;
    failureScore = Math.round(successRate * 25);
  }

  // 3. Feedback sentiment (20 points max)
  let feedbackScore = 20;
  if (totalFeedback > 0) {
    const helpfulRate = feedbackSummary.helpfulCount / totalFeedback;
    feedbackScore = Math.round(helpfulRate * 20);
  }

  // 4. Friction absence (15 points max)
  const totalFriction =
    feedbackSummary.keywords.bugError +
    feedbackSummary.keywords.confusing +
    feedbackSummary.keywords.outputNotUseful +
    feedbackSummary.keywords.evidenceUnclear +
    feedbackSummary.keywords.exportPaymentConfusion +
    feedbackSummary.keywords.rateLimit +
    feedbackSummary.keywords.mobile;

  let frictionScore = 15;
  if (totalFeedback > 0 && totalFriction > 0) {
    const frictionRate = Math.min(totalFriction / totalFeedback, 1);
    frictionScore = Math.round((1 - frictionRate) * 15);
  }

  return Math.max(0, Math.min(100, evidenceScore + failureScore + feedbackScore + frictionScore));
}

// ─── Risk Level ──────────────────────────────────────────────────────────────

function computeRiskLevel(data: FounderMonitoringData, themes: QualityTheme[]): RiskLevel {
  // P0: integrity/security issues — check for high failure rate + evidence of abuse
  if (data.reportsSummary.failedCount > 0) {
    const failureReasons = data.reportsSummary.recentFailures
      .map((f) => (f.failure_reason || "").toLowerCase())
      .join(" ");
    if (
      failureReasons.includes("integrity") ||
      failureReasons.includes("security") ||
      failureReasons.includes("abuse")
    ) {
      return "P0";
    }
  }

  // P1: generation unusable or severe quality failure
  if (data.reportsSummary.total > 0) {
    const failureRate = data.reportsSummary.failedCount / data.reportsSummary.total;
    if (failureRate > 0.3) return "P1";
  }
  if (themes.some((t) => t.severity === "P1" && t.count >= 2)) return "P1";

  // P2: confusing/wrong format/weak evidence/mobile friction
  if (themes.some((t) => t.severity === "P2" && t.count >= 2)) return "P2";

  // P3: polish
  if (themes.some((t) => t.severity === "P3" && t.count >= 1)) return "P3";

  return "none";
}

// ─── Attention Queue ─────────────────────────────────────────────────────────

function buildAttentionQueue(data: FounderMonitoringData, themes: QualityTheme[]): AttentionItem[] {
  const items: AttentionItem[] = [];

  // High failure rate
  if (data.reportsSummary.total > 0 && data.reportsSummary.failedCount > 0) {
    const failRate = Math.round((data.reportsSummary.failedCount / data.reportsSummary.total) * 100);
    items.push({
      severity: failRate > 30 ? "P1" : "P2",
      title: "Report generation failures detected",
      detail: `${data.reportsSummary.failedCount} of ${data.reportsSummary.total} reports failed (${failRate}%).`,
      metric: `${failRate}%`,
    });
  }

  // Weak evidence dominance
  const weakCount = (data.reportsSummary.evidenceStrength["weak"] || 0) +
    (data.reportsSummary.evidenceStrength["low"] || 0) +
    (data.reportsSummary.evidenceStrength["none"] || 0);
  if (weakCount > 0) {
    items.push({
      severity: "P2",
      title: "Reports with weak/missing evidence",
      detail: `${weakCount} reports have weak or missing evidence strength.`,
      metric: weakCount,
    });
  }

  // Not-helpful feedback
  if (data.feedbackSummary.notHelpfulCount > 0) {
    items.push({
      severity: data.feedbackSummary.notHelpfulCount >= 3 ? "P1" : "P2",
      title: "Not-helpful feedback received",
      detail: `${data.feedbackSummary.notHelpfulCount} users marked output as not helpful.`,
      metric: data.feedbackSummary.notHelpfulCount,
    });
  }

  // Friction themes
  for (const theme of themes) {
    if (theme.count >= 2) {
      items.push({
        severity: theme.severity,
        title: theme.label,
        detail: `${theme.count} mentions detected in user feedback.`,
        metric: theme.count,
      });
    }
  }

  // Active rate limits
  if (data.usageSummary.activeRateLimits.length > 0) {
    items.push({
      severity: "P3",
      title: "Active rate limit blocks",
      detail: `${data.usageSummary.activeRateLimits.length} user sessions currently rate-limited.`,
      metric: data.usageSummary.activeRateLimits.length,
    });
  }

  // Sort by severity
  const severityOrder: Record<RiskLevel, number> = { P0: 0, P1: 1, P2: 2, P3: 3, none: 4 };
  items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return items;
}

// ─── Suggested Fixes ─────────────────────────────────────────────────────────

function buildSuggestedFixes(data: FounderMonitoringData, themes: QualityTheme[]): SuggestedFix[] {
  const fixes: SuggestedFix[] = [];

  // High failure rate → investigate failure stages
  if (data.reportsSummary.total > 0) {
    const failRate = data.reportsSummary.failedCount / data.reportsSummary.total;
    if (failRate > 0.1) {
      const topStage = Object.entries(data.reportsSummary.failureStages)
        .sort(([, a], [, b]) => b - a)[0];
      fixes.push({
        priority: failRate > 0.3 ? "P1" : "P2",
        title: "Investigate report generation failures",
        reason: topStage
          ? `Most failures at stage: ${sanitizeForQualityMemory(topStage[0])} (${topStage[1]} times).`
          : `${data.reportsSummary.failedCount} failures without clear stage data.`,
      });
    }
  }

  // Weak evidence → improve draft prompts or input guidance
  const weakCount = (data.reportsSummary.evidenceStrength["weak"] || 0) +
    (data.reportsSummary.evidenceStrength["low"] || 0) +
    (data.reportsSummary.evidenceStrength["none"] || 0);
  const totalEvidence = Object.values(data.reportsSummary.evidenceStrength).reduce((s, v) => s + v, 0);
  if (totalEvidence > 0 && weakCount / totalEvidence > 0.4) {
    fixes.push({
      priority: "P2",
      title: "Strengthen evidence guidance for users",
      reason: `${Math.round((weakCount / totalEvidence) * 100)}% of reports have weak/missing evidence. Consider improving input prompts.`,
    });
  }

  // Output not useful theme
  const outputTheme = themes.find((t) => t.key === "outputNotUseful");
  if (outputTheme && outputTheme.count >= 2) {
    fixes.push({
      priority: "P1",
      title: "Improve report output quality/usefulness",
      reason: `${outputTheme.count} users flagged output as not useful. Review report templates and generation logic.`,
    });
  }

  // Evidence unclear theme
  const evidenceTheme = themes.find((t) => t.key === "evidenceUnclear");
  if (evidenceTheme && evidenceTheme.count >= 2) {
    fixes.push({
      priority: "P2",
      title: "Clarify evidence presentation in reports",
      reason: `${evidenceTheme.count} users found evidence/source sections unclear.`,
    });
  }

  // Mobile issues
  const mobileTheme = themes.find((t) => t.key === "mobile");
  if (mobileTheme && mobileTheme.count >= 2) {
    fixes.push({
      priority: "P2",
      title: "Address mobile UX friction",
      reason: `${mobileTheme.count} mobile-related complaints detected.`,
    });
  }

  // Export/payment confusion (note: Midtrans deferred)
  const exportTheme = themes.find((t) => t.key === "exportPaymentConfusion");
  if (exportTheme && exportTheme.count >= 1) {
    fixes.push({
      priority: "P3",
      title: "Clarify export/payment status messaging",
      reason: `${exportTheme.count} users confused about export/payment. Midtrans remains deferred — ensure locked state messaging is clear.`,
    });
  }

  // API cost rising fast
  if (data.usageSummary.totalCostUsd > 5) {
    fixes.push({
      priority: "P2",
      title: "Review API cost trajectory",
      reason: `Estimated total cost is $${data.usageSummary.totalCostUsd.toFixed(2)}. Monitor burn rate before scaling.`,
    });
  }

  // Sort by priority
  const severityOrder: Record<RiskLevel, number> = { P0: 0, P1: 1, P2: 2, P3: 3, none: 4 };
  fixes.sort((a, b) => severityOrder[a.priority] - severityOrder[b.priority]);

  return fixes;
}

// ─── Safe Summary ────────────────────────────────────────────────────────────

function buildSafeSummary(score: number, riskLevel: RiskLevel, themes: QualityTheme[], totalReports: number): string {
  if (score === -1) return "No quality memory signals collected yet.";

  const scoreLabel = score >= 80 ? "Baik" : score >= 50 ? "Perlu Perhatian" : "Perlu Tindakan";
  const themeList = themes.slice(0, 3).map((t) => t.label).join(", ");
  const themeSuffix = themeList ? ` Tema utama: ${themeList}.` : "";

  return `Skor kualitas: ${score}/100 (${scoreLabel}). Risiko: ${riskLevel}. ${totalReports} laporan dievaluasi.${themeSuffix}`;
}

// ─── Main Entry ──────────────────────────────────────────────────────────────

/**
 * Computes a deterministic quality memory from existing monitoring data.
 * No LLM calls. No external services. Pure metadata analysis.
 */
export function computeReportQualityMemory(data: FounderMonitoringData): ReportQualityMemory {
  // Guard: completely empty data
  if (data.reportsSummary.total === 0 && data.feedbackSummary.total === 0 && data.usageSummary.apiLogsCount === 0) {
    return { ...EMPTY_MEMORY };
  }

  const themes = feedbackFlagsToThemes(data.feedbackSummary.keywords);
  const qualityScore = computeQualityScore(data);
  const riskLevel = computeRiskLevel(data, themes);
  const attentionQueue = buildAttentionQueue(data, themes);
  const suggestedFixes = buildSuggestedFixes(data, themes);

  const weakEvidenceCount =
    (data.reportsSummary.evidenceStrength["weak"] || 0) +
    (data.reportsSummary.evidenceStrength["low"] || 0) +
    (data.reportsSummary.evidenceStrength["none"] || 0);

  const strongEvidenceCount =
    (data.reportsSummary.evidenceStrength["strong"] || 0) +
    (data.reportsSummary.evidenceStrength["high"] || 0);

  const safeSummary = buildSafeSummary(qualityScore, riskLevel, themes, data.reportsSummary.total);

  return {
    qualityScore,
    riskLevel,
    themes,
    weakEvidenceCount,
    strongEvidenceCount,
    totalReportsScored: data.reportsSummary.total,
    attentionQueue,
    suggestedFixes,
    safeSummary,
  };
}
