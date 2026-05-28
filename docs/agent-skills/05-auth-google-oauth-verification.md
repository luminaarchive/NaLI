# Google OAuth & Callback Verification

Guidelines to check authentication redirects and linking.

## OAuth Flow

1. User clicks **Lanjutkan dengan Google**.
2. Initiates `supabase.auth.signInWithOAuth` targeting the `google` provider with redirect set to `/auth/callback?next=<target_url>`.
3. `/auth/callback` handles the authentication code:
   - Exchanges code for session.
   - Redirects safely to the `next` target (validated relative paths only).
4. If `linkGuest` query parameter is set, the client workspace triggers a POST to `/api/auth/link-guest` which updates database report owner mappings and clears the local guest session cookies.

## Verification Checklist

- **Unit tests**: Execute `node --test tests/reports/auth-persistence-linking.test.cjs`.
- **Redirect Path safety**: Ensure that passing absolute URIs (e.g. `https://malicious.com`) to `/auth/callback` redirects to `/create-report` instead.
- **Unauthorized checks**: Check that calling `/api/auth/link-guest` without an active Supabase user session returns a `401 Unauthorized` response.
