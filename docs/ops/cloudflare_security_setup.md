# Manual Cloudflare Security Setup Guidelines

As Cloudflare API/CLI access is handled directly via the founder's Cloudflare Dashboard, follow these steps to connect and configure Cloudflare security protections for the NaLI production deployment.

## Final Status
`MANUAL CLOUDFLARE DASHBOARD STEP REQUIRED`

---

## Configuration Steps

### 1. DNS and SSL Configuration
1. Log in to the Cloudflare Dashboard.
2. Select your domain (e.g. `naliai.vercel.app` or your custom domain).
3. Navigate to **SSL/TLS** -> **Overview**:
   - Change the encryption mode to **Full (strict)**.
4. Navigate to **SSL/TLS** -> **Edge Certificates**:
   - Enable **Always Use HTTPS** (redirects all HTTP traffic to HTTPS).
   - Enable **Opportunistic Encryption** and **HTTP Strict Transport Security (HSTS)** if applicable.

### 2. Managed WAF Rulesets
1. Navigate to **Security** -> **WAF** -> **Managed Rules**:
   - Enable **Cloudflare Managed Ruleset** with standard default sensitivity to filter SQL injection, XSS, and remote code execution attempts.
   - Set the action to **Block** or **Log** for evaluation.

### 3. Custom Rate Limiting Rules
Create custom rate limiting rules under **Security** -> **WAF** -> **Rate limiting rules**:

- **Rule 1: Report Generation Endpoint**
  - **Expression**: `(http.request.uri.path eq "/api/reports/generate")`
  - **Action**: Block / Rate Limit
  - **Threshold**: 5 requests per 1 minute.

- **Rule 2: Auth Endpoints**
  - **Expression**: `(http.request.uri.path eq "/api/auth/link-guest") or (http.request.uri.path eq "/login") or (http.request.uri.path eq "/register")`
  - **Action**: Block / Rate Limit or Challenge (Managed Challenge / Turnstile)
  - **Threshold**: 10 requests per 1 minute.

- **Exclusions**:
  - Whitelist/exclude requests from known search crawlers (like `Googlebot`) to prevent blocking search engines.

### 4. Bot Fight Mode
1. Navigate to **Security** -> **Bots**:
   - Toggle **Bot Fight Mode** to **On**. This challenges automated crawlers and scrapers while whitelisting verified search bots (Google, Bing).

### 5. Whitelisting Critical Redirects
Ensure that the firewall or challenge rules do not block:
- `/auth/callback` (Supabase authentication redirect)
- Vercel preview branch deployment checks.
- Supabase REST API domains (`*.supabase.co`).
