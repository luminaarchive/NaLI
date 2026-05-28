# QA Audit: NaLI Auth, Persistence, and Manus-like Login Readiness

This document outlines the current state of authentication and persistence in NaLI, comparing it against the desired Manus-like design and setting the blueprint for implementation.

## 1. Authentication Current State
- **Files**:
  - `src/app/(auth)/login/page.tsx` (Current standard split panel login form)
  - `src/app/(auth)/register/page.tsx` (Current register form with heavy role selection cards)
  - `src/proxy.ts` (Next.js 16 Proxy that intercepts requests and handles route redirect rules)
  - `src/lib/supabase/client.ts` (Supabase Browser Client)
  - `src/lib/supabase/server.ts` (Supabase Server Component Client)
- **Deficiencies**:
  - **No Google OAuth Button**: No button is present to start a Google login flow.
  - **Auth Redirects**: Redirecting back to `/create-report` or saving `next` parameters is not fully wired.
  - **UX Quality**: Spacing, layout, and copy are generic rather than feeling like a premium, sleek AI workflow platform (e.g. Manus). Role cards on `/register` are heavy and cluttered.
  - **Callback Route**: No `/auth/callback` endpoint exists to exchange authorization codes for sessions.

## 2. Google Login & Supabase Env Readiness
- **Supabase URLs & Keys**:
  - Configured locally in `.env.local` using `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- **Google OAuth Config Status**:
  - Real Google login requires configuring client IDs, secrets, and redirect URIs in the Google Cloud Platform Console and enabling the provider inside Supabase Auth.
  - The client UI needs to dynamically adapt to missing or unconfigured OAuth variables (by showing a clean fallback/warning rather than faking success).

## 3. Persistence Current State
- **Guest Identity**: Stored as a hashed guest session ID in local storage (`nali-guest-session-id`) and mapped server-side.
- **Continuous Chat**: Revisions and generation use `localStorage` and a memory-based mock store (`globalThis._mockDb`) on the server.
- **Database Tables**:
  - `reports` (Stores generated document outputs, access tokens, and metadata)
  - `payments` (Entitlements and monetization truth)
  - `energy_ledger` (Balance logs for guest tokens)
  - `rate_limits` (Rate limiting composite keys)
- **RLS Status**: Row Level Security is active on Supabase tables to ensure users can only access records matching their `auth.uid()` or guest token authorization.

## 4. UI Comparison vs. Manus-like Auth Quality

| Feature | Current UI | Manus-like UX Target |
| :--- | :--- | :--- |
| **Theme** | Generic dark bg (#09090b) with white cards | Premium dark layout, subtle glass/radial gradients, sleek boundaries |
| **NaLI Branding** | Small icon and text block | Centered, high-contrast, minimalist logo header |
| **Form Spacing** | Cluttered panels, mismatched labels | Breathable spacing, ultra-clean inputs, minimal copy |
| **Social Auth** | Missing | Centered, prominent "Lanjutkan dengan Google" button |
| **Redirect back** | Always routes to `/archive` | Resolves query param `next` and routes back to previous workspace |

## 5. Risks
- **Takeover Vulnerabilities**: Linking guest reports to users must be token-authenticated to prevent attackers from hijacking other guest threads.
- **Database Fallback Timing**: Supabase connectivity timeout must degrade cleanly to localStorage mock patterns if the database is unreachable, without hanging or showing console errors.
- **OAuth Callback Security**: Unsafe external URLs in redirect queries (`next`) must be validated and blocked (no open redirect vulnerability).

## 6. Implementation Plan
1. **Manus-like Login/Register UI**: Redesign `/login` and `/register` to use centered dark cards, minimalist forms, and a prominent Google OAuth button.
2. **Auth Callback Endpoint**: Add `src/app/auth/callback/route.ts` with code-to-session exchange.
3. **Guest Thread Linking**: Write `/api/auth/link-guest` to query the HTTP-only guest session cookie and assign matching threads to the authenticated user ID.
4. **Workspace Auth Integration**: Add user avatar dropdown / guest state link in header.
5. **E2E Validation**: Create a regression spec in `tests/e2e/nali-auth-persistence.spec.ts`.
