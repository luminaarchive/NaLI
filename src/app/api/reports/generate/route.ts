import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requestOpenRouterJson } from "@/lib/ai/openrouter";
import { guardReportOutput } from "@/lib/integrity/outputGuard";
import { evaluateIntegrityPolicy } from "@/lib/integrity/policy";
import { logReportEvent } from "@/lib/operations/logging";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { persistGeneratedReport } from "@/lib/reports/persistence";
import {
  buildMockResult,
  buildReportPrompt,
  normalizeProviderResult,
  type ReportRequestInput,
  type ReportResult,
  validateReportRequest,
} from "@/lib/reports/reportGenerator";
import { getCostProtectionStatus } from "@/lib/usage/costProtection";
import { logUsageEvent } from "@/lib/usage/logging";
import { evaluateModelEntitlement, PREMIUM_MODEL_LOCK_MESSAGE } from "@/lib/entitlements/modelEntitlements";
import { resolveInternalPremiumQaEntitlement } from "@/lib/entitlements/internalEntitlementResolver";
import {
  recordPremiumEntitlementAttempt,
  type PremiumEntitlementAuditDecision,
} from "@/lib/entitlements/premiumEntitlementAudit";
import { evaluateReportGenerationAccess, type PublicReportType } from "@/lib/billing/reportBalances";
import { getReportBalance, normalizeReportOwner } from "@/lib/billing/reportBalanceLedger";
import { getGuestSessionIdHash, isUsableGuestSessionId } from "@/lib/reports/access";

const systemPrompt = [
  "You are NaLI (NatIve Learning & Intelligence) by NatIve, a professional AI field intelligence and evidence-based learning assistant.",
  "Your task is to analyze the user's input and generate highly structured Indonesian evidence-based report drafts (for draft_from_materials mode) or starting guidance (for start-from-zero mode).",
  "Operate deterministically and transparently. You must first output your 'understanding' of the task and a clear 'plan' of how you are structuring the result.",
  "Strictly use ONLY user-provided materials for facts, figures, locations, and claims in draft mode.",
  "Never invent or fabricate data, citations, DOIs, specific field observations, coordinates, statistics, or publication details. If the user provided URLs, explicitly label them as user-provided and unverified.",
  "Source verification remains inactive in this MVP. Explicitly note that. Every generated draft MUST feature an explicit uncertainty note, list of additional evidence needed, and the required academic integrity disclaimer.",
  "For start-from-zero mode, do NOT generate any report draft or findings. Only provide initial guidance, observation questions, outline suggestions, and the guidance disclaimer.",
  "Assess the evidence strength ('weak' | 'medium' | 'strong') and source coverage ('limited' | 'adequate' | 'strong') objectively based on input detail.",
  "Ensure all sections match the classified task type's expected headings. Avoid repeating generic AI preamble or fluffy conversational filler.",
  "You must output valid JSON only.",
].join(" ");

function getInputObject(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}

function getInputSize(input: {
  fileDescription: string;
  location: string;
  mainText: string;
  sourceUrls: string[];
  title: string;
  topic: string;
}) {
  return [input.title, input.mainText, input.topic, input.location, input.fileDescription, ...input.sourceUrls].join(
    "\n",
  ).length;
}

function guardOutput(report: ReportResult) {
  return guardReportOutput(report, { sourceVerificationActive: false });
}

function hasClientSuppliedPremiumClaim(input: Record<string, unknown>) {
  return [
    "internalPremiumQaToken",
    "localStoragePremiumEntitlement",
    "premiumAccess",
    "verifiedPremiumCredit",
    "verifiedPremiumEntitlement",
  ].some((field) => Object.prototype.hasOwnProperty.call(input, field));
}

function getRequestedPublicReportType(input: Record<string, unknown>): PublicReportType {
  return input.reportType === "basic" || input.reportType === "pro" ? input.reportType : "starter_free";
}

async function getPublicReportAccess(input: Record<string, unknown>, reportType: PublicReportType) {
  if (reportType === "starter_free") {
    return {
      access: evaluateReportGenerationAccess({ reportType }),
      balanceSource: "starter_free" as const,
    };
  }

  const owner = isUsableGuestSessionId(input.guestSessionId)
    ? normalizeReportOwner({ ownerId: getGuestSessionIdHash(input.guestSessionId), ownerType: "guest" })
    : null;
  const persistedBalance = await getReportBalance(owner);

  return {
    access: evaluateReportGenerationAccess({
      balance: {
        ...persistedBalance.balance,
        paidBalanceVerified: persistedBalance.ok && persistedBalance.source === "database",
      },
      reportType,
    }),
    balanceSource: persistedBalance.source,
  };
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Format permintaan tidak valid. Kirim data form sebagai JSON.",
      },
      { status: 400 },
    );
  }

  const input = getInputObject(body);

  // Resolve cookie-based guest session & authenticated user session
  const cookieStore = await cookies();
  let guestSessionId = cookieStore.get("nali_guest_session")?.value;

  if (!guestSessionId) {
    if (typeof input.guestSessionId === "string" && input.guestSessionId.trim().length >= 16) {
      guestSessionId = input.guestSessionId.trim();
    } else {
      guestSessionId = `guest-${Date.now().toString(36)}-${randomBytes(16).toString("hex")}`;
    }
    cookieStore.set("nali_guest_session", guestSessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  const rateLimit = await checkRateLimit({
    actionType: "generate_report",
    guestSessionId: guestSessionId,
    request: req,
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: RATE_LIMITED_MESSAGE,
        code: "RATE_LIMIT",
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
      { headers, status: 429 },
    );
  }

  const integrityDecision = evaluateIntegrityPolicy(input as ReportRequestInput);

  if (!integrityDecision.allowed) {
    return NextResponse.json(
      {
        code: integrityDecision.reasonCode,
        error: integrityDecision.userMessage,
        matchedSignals: integrityDecision.matchedSignals,
        severity: integrityDecision.severity,
      },
      { headers, status: 400 },
    );
  }

  const validated = validateReportRequest(input as ReportRequestInput);

  if (!validated.success) {
    return NextResponse.json(
      {
        error: validated.error,
        field: validated.field,
      },
      { headers, status: 400 },
    );
  }

  const selectedModelId = validated.data.selectedModel || "peregrine";
  const internalPremiumQa = selectedModelId === "peregrine" ? null : resolveInternalPremiumQaEntitlement(req.headers);
  // This server-validated QA entitlement opens model access only. Public
  // payment, export, upload, and source verification remain independently locked.
  const entitlement = evaluateModelEntitlement(selectedModelId, {
    verifiedInternalPremiumQaEntitlement: internalPremiumQa?.allowed === true,
  });
  if (selectedModelId !== "peregrine") {
    const auditDecision: PremiumEntitlementAuditDecision = internalPremiumQa?.allowed
      ? "allowed_internal_qa"
      : internalPremiumQa?.status === "invalid"
        ? "denied_invalid_entitlement"
        : hasClientSuppliedPremiumClaim(input)
          ? "denied_public_premium_inactive"
          : "denied_missing_entitlement";

    await recordPremiumEntitlementAttempt({
      decision: auditDecision,
      integrityStatus: "allowed",
      modelId: selectedModelId,
      rateStatus: "allowed",
      request: req,
    });
  }

  if (!entitlement.allowed) {
    return NextResponse.json(
      {
        code: "MODEL_ENTITLEMENT_REQUIRED",
        entitlement,
        error: PREMIUM_MODEL_LOCK_MESSAGE,
        internalPremiumQaStatus: internalPremiumQa?.status,
      },
      { headers, status: 403 },
    );
  }

  const internalPremiumQaAllowed = selectedModelId !== "peregrine" && internalPremiumQa?.allowed === true;
  if (!internalPremiumQaAllowed) {
    const requestedPublicReportType = getRequestedPublicReportType(input);
    const { access: reportAccess, balanceSource } = await getPublicReportAccess(input, requestedPublicReportType);

    if (!reportAccess.allowed) {
      return NextResponse.json(
        {
          code: "REPORT_BALANCE_REQUIRED",
          error: "Laporan kamu habis. Pilih paket untuk lanjut. Pembayaran dan checkout belum aktif di CP1.",
          paymentActivation: "disabled",
          reason: "laporan_habis",
          reportAccess,
        },
        { headers, status: 403 },
      );
    }

    if (requestedPublicReportType !== "starter_free") {
      return NextResponse.json(
        {
          balanceSource,
          code: "PUBLIC_PAID_GENERATION_INACTIVE",
          error:
            "Paket Laporan belum aktif untuk penggunaan publik di CP1. Pembayaran dan checkout tetap dinonaktifkan.",
          paymentActivation: "disabled",
          publicPremiumActivation: "disabled",
          reason: "payment_not_active",
          reportAccess,
        },
        { headers, status: 403 },
      );
    }
  }

  const internalQaLabels: Record<string, string> = {
    obsidian: "NaLI Obsidian",
    zephyr: "NaLI Zephyr",
  };
  const modelLabel = internalPremiumQaAllowed ? internalQaLabels[selectedModelId] : "NaLI Starter Report";

  const costProtection = await getCostProtectionStatus();
  if (costProtection.active) {
    return NextResponse.json(
      {
        error: "Sistem sedang membatasi pemrosesan berat hari ini untuk menjaga stabilitas layanan.",
        status: "cost_protection_active",
      },
      { headers, status: 429 },
    );
  }

  const openRouterResult = await requestOpenRouterJson({
    prompt: buildReportPrompt(validated.data),
    system: systemPrompt,
  });

  if (openRouterResult) {
    const rawReport =
      openRouterResult.json && typeof openRouterResult.json === "object"
        ? (openRouterResult.json as Record<string, unknown>)
        : {};
    const guarded = guardOutput(normalizeProviderResult(rawReport, validated.data, modelLabel));

    if (!guarded.allowed) {
      return NextResponse.json(
        {
          code: guarded.reasonCode,
          error: guarded.userMessage,
        },
        { headers, status: 502 },
      );
    }

    const report = guarded.report;
    const persistence = await persistGeneratedReport({
      guestSessionId,
      userId,
      input: validated.data,
      report,
    });
    void logReportEvent({
      eventType: "REPORT_CREATED",
      metadata: {
        mode: validated.data.mode,
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        template: validated.data.reportTemplate,
      },
      reportId: report.id,
      status: persistence.persisted ? "success" : "skipped",
    });
    void logReportEvent({
      eventType: "PREVIEW_GENERATED",
      metadata: {
        mode: validated.data.mode,
        result_kind: "provider",
        template: validated.data.reportTemplate,
      },
      reportId: report.id,
      status: "success",
    });
    void logUsageEvent({
      actionType: validated.data.mode === "start_from_zero" ? "start_from_zero_guidance" : "report_preview",
      guestSessionId,
      inputSize: getInputSize(validated.data),
      metadata: {
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        result_kind: "provider",
      },
      mode: validated.data.mode,
      reportId: report.id,
      status: "generated",
    });

    return NextResponse.json(
      {
        id: report.id,
        report_id: report.id,
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        report_access_key: persistence.persisted ? persistence.reportAccessToken : undefined,
        mode: "ai",
        provider: "nali",
        report,
      },
      { headers, status: 200 },
    );
  }

  // OpenRouter failed (returned null)
  // Check if explicit mock fallback is enabled via process.env.NALI_ALLOW_MOCK_GENERATION === "true"
  if (process.env.NALI_ALLOW_MOCK_GENERATION === "true") {
    const guarded = guardOutput(buildMockResult(validated.data, modelLabel));
    if (!guarded.allowed) {
      return NextResponse.json(
        {
          code: guarded.reasonCode,
          error: guarded.userMessage,
        },
        { headers, status: 502 },
      );
    }

    const report = guarded.report;
    const persistence = await persistGeneratedReport({
      guestSessionId,
      userId,
      input: validated.data,
      report,
    });
    void logReportEvent({
      eventType: "REPORT_CREATED",
      metadata: {
        mode: validated.data.mode,
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        template: validated.data.reportTemplate,
      },
      reportId: report.id,
      status: persistence.persisted ? "success" : "skipped",
    });
    void logReportEvent({
      eventType: "PREVIEW_GENERATED",
      metadata: {
        mode: validated.data.mode,
        result_kind: "mock",
        template: validated.data.reportTemplate,
      },
      reportId: report.id,
      status: "success",
    });
    void logUsageEvent({
      actionType: validated.data.mode === "start_from_zero" ? "start_from_zero_guidance" : "report_preview",
      guestSessionId,
      inputSize: getInputSize(validated.data),
      metadata: {
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        result_kind: "mock",
      },
      mode: validated.data.mode,
      reportId: report.id,
      status: "generated",
    });

    return NextResponse.json(
      {
        id: report.id,
        report_id: report.id,
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        report_access_key: persistence.persisted ? persistence.reportAccessToken : undefined,
        mode: "mock",
        notice: "DEMO/MOCK - NaLI preview engine unavailable or not configured.",
        provider: "nali",
        report,
      },
      { headers, status: 200 },
    );
  }

  // Otherwise, return a controlled non-200 error response (503 Service Unavailable)
  return NextResponse.json(
    {
      code: "AI_ENGINE_UNAVAILABLE",
      error: "AI engine belum tersedia. Coba lagi nanti.",
    },
    { headers, status: 503 }
  );
}
