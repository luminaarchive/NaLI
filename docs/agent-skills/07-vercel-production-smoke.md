# Vercel Production Smoke Checks

Guidelines to verify production deployments.

## Flow Details

Verify deployment health, check public routes, and validate content types without exposing credentials.

## Verification Checklist

1. **Deploy status**: Verify that the latest main commit build succeeds on the Vercel dashboard.
2. **Execute route smoke tests**: Run `npm run agent:prod-smoke` to hit the public endpoints and check HTTP status codes.
3. **Route targets**:
   - `/` (200 OK)
   - `/create-report` (200 OK)
   - `/login` (200 OK)
   - `/register` (200 OK)
   - `/pricing` (200 OK)
   - `/robots.txt` (200 OK, returns plain text)
   - `/sitemap.xml` (200 OK, returns XML)
4. **No fake verification**: Never claim the site is healthy unless checked by the production route smoke script.
