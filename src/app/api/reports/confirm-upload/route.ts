import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";
import { confirmReportUpload } from "@/lib/reports/uploads";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        code: "INVALID_JSON",
        error: "Format permintaan tidak valid. Kirim data konfirmasi upload sebagai JSON.",
      },
      { status: 400 },
    );
  }

  const input = body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  const rateLimit = await checkRateLimit({
    actionType: "confirm_upload",
    guestSessionId: input.guestSessionId,
    request: req,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { headers: rateLimitHeaders(rateLimit), status: 429 });
  }

  const result = await confirmReportUpload({
    reportAccessToken:
      typeof input.report_access_key === "string"
        ? input.report_access_key
        : typeof input.reportAccessToken === "string"
          ? input.reportAccessToken
          : undefined,
    reportId:
      typeof input.report_id === "string" ? input.report_id : typeof input.reportId === "string" ? input.reportId : undefined,
  });

  if (!result.ok) {
    const statusCode = typeof result.status === "number" ? result.status : result.status === "failed" ? 422 : 500;
    return NextResponse.json(result, { status: statusCode });
  }

  return NextResponse.json(result, { status: 200 });
}
