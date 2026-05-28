# Operational Runbook: GCP and Supabase Google OAuth Integration

This runbook describes the configuration steps needed to activate Google OAuth login for NaLI in production and local development environments.

## Google Cloud Console Configuration

To allow users to authenticate with their Google accounts:

1. **Create/Select Project**: Log in to the [Google Cloud Console](https://console.cloud.google.com/) and select the NaLI project.
2. **OAuth Consent Screen**:
   - User Type: **External**.
   - App Name: **NaLI Learn & Report**.
   - User Support Email: Support email address.
   - Developer Contact: Administrator email.
   - Scopes: Request `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
3. **Credentials Creation**:
   - Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID**.
   - Application Type: **Web Application**.
   - Name: `NaLI Production` (or `NaLI Local`).
   - **Authorized JavaScript Origins**:
     - Local: `http://localhost:3000`
     - Production: `https://naliai.vercel.app`
   - **Authorized Redirect URIs** (retrieve from your Supabase Project Auth dashboard):
     - Format: `https://<supabase-project-id>.supabase.co/auth/v1/callback`
4. **Copy Client Credentials**: Copy the generated **Client ID** and **Client Secret**.

---

## Supabase Dashboard Configuration

1. Go to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Navigate to **Authentication** -> **Providers** -> **Google**.
3. Toggle Google Auth to **Enabled**.
4. Paste the **Client ID** and **Client Secret** copied from the Google Cloud Console.
5. In **Redirect URLs** (under URL Configuration), add the callback address:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://naliai.vercel.app/auth/callback`
6. Save changes.

---

## Environment Variables Setup

Ensure that the following variables are declared in your hosting environment (Vercel/Self-hosted):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# (Optional) For Local Development Checks
# If these variables are not present or set to default/dummy values,
# the login/register client UI will display a helpful fallback warning message instead of crashing.
```

---

## Verification and Monitoring

- **OAuth Test**: Navigate to `/login` and click **Lanjutkan dengan Google**. It should redirect to Google's sign-in panel and, upon authentication, route back to `/auth/callback?code=...` and exchange it for a session.
- **Log Monitoring**: Check Supabase Auth Logs for any `oauth_callback` failures or code exchange errors.
- **Redirect Path safety**: The system prevents redirection to domains other than the origin site.
