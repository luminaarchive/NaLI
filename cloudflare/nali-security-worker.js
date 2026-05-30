// NaLI Security Worker
// Deploy: wrangler deploy --env production (from the cloudflare/ directory)
// Purpose: Rate limit, block bad bots, add security headers when custom domain is active
//
// To activate:
//   1. Register naliai.id domain
//   2. Add to Cloudflare as a zone
//   3. Run: wrangler deploy --env production

const ORIGIN = "https://naliai.vercel.app";

const ipRequestCounts = new Map();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const userAgent = request.headers.get("User-Agent") || "";
    const now = Date.now();

    // Block obvious bad bots
    const blockedAgents = ["sqlmap", "nikto", "masscan", "zgrab", "nmap", "dirbuster"];
    if (blockedAgents.some((bot) => userAgent.toLowerCase().includes(bot))) {
      return new Response("Forbidden", { status: 403 });
    }

    // Rate limit /api/generate-report: 20 req/min per IP
    if (url.pathname === "/api/generate-report" && request.method === "POST") {
      const key = `${ip}:${Math.floor(now / 60000)}`;
      const count = (ipRequestCounts.get(key) || 0) + 1;
      ipRequestCounts.set(key, count);
      if (count > 20) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    // Proxy request to Vercel
    const proxyUrl = new URL(url.pathname + url.search, ORIGIN);
    const proxyRequest = new Request(proxyUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: "follow",
    });

    const response = await fetch(proxyRequest);
    const newResponse = new Response(response.body, response);

    // Add security headers
    newResponse.headers.set("X-Frame-Options", "DENY");
    newResponse.headers.set("X-Content-Type-Options", "nosniff");
    newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    newResponse.headers.set("X-Powered-By", "NaLI");

    return newResponse;
  },
};
