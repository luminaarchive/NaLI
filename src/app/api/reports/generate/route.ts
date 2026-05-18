import { NextRequest, NextResponse } from "next/server";
import { requestOpenRouterJson } from "@/lib/ai/openrouter";
import {
  buildMockResult,
  buildReportPrompt,
  normalizeProviderResult,
  validateReportRequest,
} from "@/lib/reports/reportGenerator";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

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

  const validated = validateReportRequest(body && typeof body === "object" ? body : {});

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
    const report = normalizeProviderResult(
      rawReport,
      validated.data,
      openRouterResult.model,
    );

    return NextResponse.json(
      {
        id: report.id,
        mode: "ai",
        provider: "openrouter",
        report,
      },
      { headers, status: 200 },
    );
  }

  const report = buildMockResult(validated.data);

  return NextResponse.json(
    {
      id: report.id,
      mode: "mock",
      notice: "DEMO/MOCK - OpenRouter unavailable or not configured.",
      provider: "mock",
      report,
    },
    { headers, status: 200 },
  );
}
