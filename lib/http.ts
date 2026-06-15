/**
 * Same-origin guard for public write endpoints (page-view tracking, newsletter).
 * These use the public anon key, so we reject cross-site browser POSTs and
 * Origin-less clients to cut drive-by abuse. Works across all deployment domains
 * because it compares the request Origin to the request Host, not a hardcoded URL.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Serialize a value for a <script type="application/ld+json"> block, escaping the
 * characters that could otherwise break out of the script element (a title that
 * happens to contain "</script>" or HTML). Use instead of bare JSON.stringify.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
