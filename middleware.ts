import { NextResponse, type NextRequest } from "next/server";
import { proxy, config as proxyConfig } from "@/proxy";

// Simple in-memory rate limiter for /api/generate-report
// Persists across warm edge-function invocations within the same instance
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limit AI generation endpoint: 10 requests per minute per IP
  if (pathname === "/api/generate-report" && request.method === "POST") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const allowed = checkRateLimit(ip, 10, 60_000);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Terlalu banyak permintaan. Tunggu 1 menit." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  return proxy(request);
}

export const config = proxyConfig;
