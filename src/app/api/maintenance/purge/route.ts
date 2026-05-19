import { NextRequest, NextResponse } from "next/server";
import { purgeExpiredReports } from "@/lib/maintenance/purge";
import { checkRateLimit, RATE_LIMITED_MESSAGE, rateLimitHeaders } from "@/lib/rateLimit/limit";

export const dynamic = "force-dynamic";

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

function secretConfigured() {
  return hasValue(process.env.CRON_SECRET) || hasValue(process.env.MAINTENANCE_SECRET);
}

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const maintenanceHeader = req.headers.get("x-maintenance-secret") ?? "";

  return (
    (hasValue(process.env.CRON_SECRET) && bearer === process.env.CRON_SECRET) ||
    (hasValue(process.env.MAINTENANCE_SECRET) && maintenanceHeader === process.env.MAINTENANCE_SECRET)
  );
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "false") return false;
    if (value.toLowerCase() === "true") return true;
  }
  return undefined;
}

function parseLimit(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  if (!secretConfigured()) {
    return NextResponse.json(
      {
        error: "Maintenance secret not configured.",
      },
      { status: 503 },
    );
  }

  if (!isAuthorized(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized maintenance request.",
      },
      { status: 401 },
    );
  }

  const rateLimit = await checkRateLimit({
    actionType: "maintenance_purge",
    request: req,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { headers: rateLimitHeaders(rateLimit), status: 429 });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    body = {};
  }

  const url = new URL(req.url);
  const dryRun = parseBoolean(body.dryRun) ?? parseBoolean(url.searchParams.get("dryRun")) ?? true;
  const limit = parseLimit(body.limit) ?? parseLimit(url.searchParams.get("limit"));
  const result = await purgeExpiredReports({ dryRun, limit });

  return NextResponse.json(result, { status: 200 });
}
