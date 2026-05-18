import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  buildMockEvidenceReport,
  buildReportPrompt,
  normalizeProviderReport,
  validateReportRequest,
  type EvidenceReport,
} from "@/lib/reports/reportGenerator";
import { checkRateLimit, rateLimitHeaders } from "@/lib/security/rate-limit";

function parseProviderJson(text: string): Partial<EvidenceReport> | null {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(withoutFence) as Partial<EvidenceReport>;
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");

    if (start < 0 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(withoutFence.slice(start, end + 1)) as Partial<EvidenceReport>;
    } catch {
      return null;
    }
  }
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
        error: "Terlalu banyak permintaan. Tunggu sebentar sebelum membuat draft lagi.",
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

  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!anthropicKey) {
    const report = buildMockEvidenceReport(validated.data);

    return NextResponse.json(
      {
        id: report.id,
        mode: "mock",
        notice:
          "ANTHROPIC_API_KEY belum dikonfigurasi. Ini adalah DEMO/MOCK yang aman, bukan output AI provider.",
        report,
      },
      { headers, status: 200 },
    );
  }

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const response = await anthropic.messages.create({
      max_tokens: 2600,
      messages: [
        {
          content: buildReportPrompt(validated.data),
          role: "user",
        },
      ],
      model: process.env.NALI_REPORT_MODEL ?? "claude-sonnet-4-20250514",
      system:
        "You are NaLI Learn & Report. Produce evidence-bound Indonesian draft reports. Never fabricate citations, DOI, statistics, observations, coordinates, or field data. Return only valid JSON.",
      temperature: 0.2,
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("\n")
      .trim();
    const parsed = parseProviderJson(text);

    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "AI provider mengembalikan format yang belum bisa dibaca. Coba lagi, atau gunakan mode mock saat pengembangan lokal.",
        },
        { headers, status: 502 },
      );
    }

    const report = normalizeProviderReport(parsed, validated.data);

    return NextResponse.json(
      {
        id: report.id,
        mode: "ai",
        report,
      },
      { headers, status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Report generator belum bisa menghubungi AI provider. Periksa ANTHROPIC_API_KEY atau coba lagi nanti.",
      },
      { headers, status: 502 },
    );
  }
}
