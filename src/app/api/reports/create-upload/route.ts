import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { createReportUploadRequest } from "@/lib/reports/uploads";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        code: "INVALID_JSON",
        error: "Format permintaan tidak valid. Kirim metadata upload sebagai JSON.",
      },
      { status: 400 },
    );
  }

  const input = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const rateLimit = await checkRateLimit({
    actionType: "create_upload",
    guestSessionId: input.guestSessionId,
    request: req,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { headers: rateLimitHeaders(rateLimit), status: 429 });
  }

  const result = await createReportUploadRequest({
    contentType: input.contentType,
    fileName: input.fileName,
    fileSizeBytes: input.fileSizeBytes,
    guestSessionId: input.guestSessionId,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: result.status });
  }

  return NextResponse.json(
    {
      ...result,
      report_access_key: result.report_access_token,
    },
    { status: 200 },
  );
}
