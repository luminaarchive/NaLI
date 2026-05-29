# NaLI Sprint 9 - Baseline Audit Report

This baseline audit report documents the state of the NaLI application prior to implementing the Sprint 9 enhancements.

## 1. Auth Pages Current State
- Routes `/login` and `/register` exist and load successfully.
- Google OAuth is integrated with a "Masuk dengan Google" button.
- If Google OAuth configuration is missing/inactive, the page sets `error` to `"BLOCKED BY DASHBOARD CONFIG"`, which is rendered directly in the UI.

## 2. Logout/Session UI Current State
- The `PublicAppShell.tsx` component correctly detects active Supabase sessions, displays the user's email address, and renders a "Keluar" (Logout) button.
- Logging out calls `supabase.auth.signOut()` and reloads the browser to return to a logged-out state.

## 3. History Ownership Current State
- History queries in the workspace and `/api/reports` are fully isolated by `user_id` (for authenticated users) or composite check of `guest_session_id_hash` and `report_id` (for guests).
- Cross-tenant report access is restricted at the API layer.

## 4. SEO Metadata Gaps
- **Page Layout Metadata**: Gaps exist for the `/login`, `/register`, and `/field-notes` routes, which currently use the fallback metadata defined in `src/app/layout.tsx`.
- **Sitemap**: `/sitemap.xml` includes `/`, `/learn-report`, `/create-report`, `/pricing`, and `/field-intelligence`, but excludes `/field-notes`.
- **JSON-LD Schema**: The structured schema builder (`src/lib/seo/site.ts`) defines `WebSite`, `SoftwareApplication`, and `Organization`, but does not include a `BreadcrumbList` representation for key routes.

## 5. Favicon/Logo Gaps
- `/public/icon.svg` contains a generic organic leaf icon path (`d="M32 11c10 7 16 15..."`) that does not match the official brand logo leaf vector path (`d="M11 72 C8 60 13 48..."`).
- `public/manifest.json` only specifies `/icon.svg` and does not link to the pre-rendered official PNG files (`192x192` or `512x512`).
- `src/app/layout.tsx` lacks modern `icons` metadata tags (e.g. apple touch icons).

## 6. Mobile Layout Gaps
- Desktop layouts scale down correctly, but checkups for input forms and modal options under narrow viewports (360px, 390px, 430px) require validation to ensure clean margins, wrap behavior for buttons, and touch target accessibility (min 44px).

## 7. Cloudflare Access Available or Unavailable
- Cloudflare CLI/API access is **UNAVAILABLE** in the local environment and workspace context.
- Status: `MANUAL CLOUDFLARE DASHBOARD STEP REQUIRED`.

## 8. Forbidden Public Term Scan Result Before Changes
- Live scan of `https://naliai.vercel.app` routes is clean: zero occurrences of `mock` (case-insensitive), `CP1`, `—` (em dash), `AI_ENGINE_UNAVAILABLE`, or `provider capacity` are present in the public facing pages.
