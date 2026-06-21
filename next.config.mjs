/** @type {import('next').NextConfig} */
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xxwzufdezpyabqkwrcbz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // ensure MDX content ships with the (now dynamic) serverless functions
  experimental: {
    outputFileTracingIncludes: {
      "/**": ["./content/**/*"],
    },
  },
  async headers() {
    // Pragmatic Content-Security-Policy: locks framing and plugins, restricts
    // origins to self + the services actually used (Supabase, Vercel insights).
    // script/style keep 'unsafe-inline' because the theme bootstrap is an inline
    // script and Next injects inline styles; rendered content is plain Markdown
    // (no raw HTML), so stored-XSS surface stays low.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com${__impeccableLiveDev}`,
      `connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com${__impeccableLiveDev}`,
      "frame-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    const securityHeaders = [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
