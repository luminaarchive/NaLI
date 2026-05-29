# Manual Cloudflare Security Setup Guidelines

As Cloudflare API/CLI access is handled directly via the founder's Cloudflare Dashboard, follow these steps to connect and configure Cloudflare security protections for the NaLI production domain.

## Current Setup Status
`MANUAL CLOUDFLARE DASHBOARD STEP REQUIRED`

---

## Configuration Steps

### 1. DNS and SSL Configuration
1. Log in to the Cloudflare Dashboard.
2. Select your domain.
3. Navigate to **SSL/TLS** -> **Overview**:
   - Change the encryption mode to **Full (strict)**.
4. Navigate to **SSL/TLS** -> **Edge Certificates**:
   - Enable **Always Use HTTPS** (redirects all HTTP traffic to HTTPS).
   - Enable **Opportunistic Encryption** and **HTTP Strict Transport Security (HSTS)** if applicable.

---

### 2. Managed WAF Rulesets & Safe Routing Warnings

Navigate to **Security** -> **WAF** -> **Managed Rules**:
- Enable **Cloudflare Managed Ruleset** with standard default sensitivity to filter SQL injection, XSS, and remote code execution attempts.
- **CRITICAL SAFE ROUTING WARNING**: Ensure WAF or Managed Rulesets do NOT block or challenge legitimate crawler or authentication flows. Set up bypass or skip rules for the following contexts:
  - **Googlebot / Search Engine Crawlers**: Never challenge verified search bots (Google, Bing, Yahoo). Check the "Verified Bots" skip condition.
  - **Supabase Auth Callback**: Exclude `/auth/callback` to prevent blocking auth session exchange requests.
  - **Google OAuth Redirect**: Allow the callback redirects from Google auth domain referrers.
  - **Vercel Deployment Checks**: Exclude paths used by Vercel to check serverless health or deploy previews.
  - **Sitemaps & Robots**: Exclude `/sitemap.xml` and `/robots.txt` from WAF challenges to keep the site crawlable.
  - **Static Next.js Assets**: Exclude `/_next/static/*` from challenges.

---

### 3. Custom Rate Limiting Rules

Create custom rate limiting rules under **Security** -> **WAF** -> **Rate limiting rules** with the following parameters:

- **Rule 1: Report Generation Endpoint**
  - **Expression**: `(http.request.uri.path eq "/api/reports/generate")`
  - **Action**: Block / Rate Limit
  - **Threshold**: 5 requests per 1 minute per IP.
  - **Bypass**: Verified Search Bots.

- **Rule 2: Auth Endpoints**
  - **Expression**: `(http.request.uri.path eq "/login") or (http.request.uri.path eq "/register")`
  - **Action**: Rate Limit / Managed Challenge
  - **Threshold**: 10 requests per 1 minute per IP (protects against credential brute-forcing).

- **Rule 3: Guest Account Linking Endpoint**
  - **Expression**: `(http.request.uri.path eq "/api/auth/link-guest")`
  - **Action**: Block / Rate Limit
  - **Threshold**: 3 requests per 1 minute per IP (very strict to protect database resource mappings).

---

### 4. Bot Fight Mode
1. Navigate to **Security** -> **Bots**:
   - Toggle **Bot Fight Mode** to **On**. This challenges automated scrapers and bad bots while automatically whitelisting verified search bots (Googlebot, Bingbot).
