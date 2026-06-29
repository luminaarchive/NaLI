/* -------------------------------------------------------------------------- */
/*  Lightweight in-memory rate limiter (app-layer defense in depth).           */
/*                                                                            */
/*  Sliding-window counter keyed by client IP + bucket name. Zero deps. On     */
/*  Vercel Fluid Compute instances are reused and shared across concurrent     */
/*  requests, so this throttles per warm instance, layered on top of Vercel's  */
/*  platform DDoS/WAF. For a hard global limit, back it with Upstash/Vercel KV */
/*  later; this already stops casual flooding and runaway AI-endpoint cost.     */
/* -------------------------------------------------------------------------- */

interface Bucket {
  hits: number[]; // request timestamps (ms) within the window
}

const store = new Map<string, Bucket>();
let lastSweep = 0;

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds until the window frees up (0 when ok)
}

/**
 * Record a hit and report whether it is within `limit` per `windowMs`.
 * `key` should combine a route bucket with the client IP, e.g. `chat:1.2.3.4`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Occasionally evict stale buckets so the map cannot grow unbounded.
  if (now - lastSweep > 60_000) {
    for (const [k, b] of store) {
      if (b.hits.length === 0 || now - b.hits[b.hits.length - 1]! > windowMs) store.delete(k);
    }
    lastSweep = now;
  }

  const bucket = store.get(key) ?? { hits: [] };
  // drop timestamps outside the window
  const cutoff = now - windowMs;
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0]!;
    store.set(key, bucket);
    return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }

  bucket.hits.push(now);
  store.set(key, bucket);
  return { ok: true, remaining: limit - bucket.hits.length, retryAfter: 0 };
}

/** Standard 429 JSON response with a Retry-After header. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(
    JSON.stringify({ error: "Terlalu banyak permintaan. Coba lagi sebentar lagi.", code: "rate_limited" }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfter),
      },
    },
  );
}
