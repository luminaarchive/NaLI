import { NextRequest, NextResponse } from "next/server";
import { requestOpenRouterJson } from "@/lib/ai/openrouter";
import { evaluateIntegrityPolicy } from "@/lib/integrity/policy";
import { persistGeneratedReport } from "@/lib/reports/persistence";
import {
  buildMockResult,
  buildReportPrompt,
  normalizeProviderResult,
  type ReportRequestInput,
  validateReportRequest,
} from "@/lib/reports/reportGenerator";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";
import { logUsageEvent } from "@/lib/usage/logging";

const systemPrompt = [
  "You are NaLI by NatIve.",
  "Generate Indonesian evidence-based report drafts or start-from-zero guidance.",
  "Use only user-provided materials for draft mode.",
  "For start-from-zero mode, generate only guidance, not report findings.",
  "You may structure, clarify, suggest missing evidence, and infer safe titles/topics from user-provided text.",
  "Do not invent citations, DOI, statistics, field observations, coordinates, source verification, or final scientific claims.",
  "If URLs are provided, label them as user-provided and not yet verified.",
  "Source verification is not active in this MVP.",
  "Every draft output must include additional evidence needed, user review checklist, uncertainty note, and disclaimer.",
  "Every start-from-zero output must include outline, observation questions, field note template, evidence checklist, source search checklist, and disclaimer.",
  "Return JSON only.",
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
  return [
    input.title,
    input.mainText,
    input.topic,
    input.location,
    input.fileDescription,
    ...input.sourceUrls,
  ].join("\n").length;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const rateLimit = checkRateLimit(`report-generate:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Terlalu banyak permintaan. Tunggu sebentar sebelum melanjutkan.",
      },
      { headers, status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        error: "Format permintaan tidak valid. Kirim data form sebagai JSON.",
      },
      { headers, status: 400 },
    );
  }

  const input = getInputObject(body);
  const integrityDecision = evaluateIntegrityPolicy(input as ReportRequestInput);

  if (!integrityDecision.allowed) {
    return NextResponse.json(
      {
        code: integrityDecision.code,
        error: integrityDecision.message,
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

  const openRouterResult = await requestOpenRouterJson({
    prompt: buildReportPrompt(validated.data),
    system: systemPrompt,
  });

  if (openRouterResult) {
    const rawReport =
      openRouterResult.json && typeof openRouterResult.json === "object"
        ? (openRouterResult.json as Record<string, unknown>)
        : {};
    const report = normalizeProviderResult(rawReport, validated.data, "NaLI Preview Engine");
    const persistence = await persistGeneratedReport({
      guestSessionId: input.guestSessionId,
      input: validated.data,
      report,
    });
    void logUsageEvent({
      actionType: validated.data.mode === "start_from_zero" ? "start_from_zero_guidance" : "report_preview",
      guestSessionId: input.guestSessionId,
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
        persistence: persistence.persisted ? "supabase" : persistence.reason,
        report_access_key: persistence.persisted ? persistence.reportAccessToken : undefined,
        mode: "ai",
        provider: "nali",
        report,
      },
      { headers, status: 200 },
    );
  }

  const report = buildMockResult(validated.data);
  const persistence = await persistGeneratedReport({
    guestSessionId: input.guestSessionId,
    input: validated.data,
    report,
  });
  void logUsageEvent({
    actionType: validated.data.mode === "start_from_zero" ? "start_from_zero_guidance" : "report_preview",
    guestSessionId: input.guestSessionId,
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
