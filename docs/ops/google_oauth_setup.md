# Google OAuth Setup & Verification Guide

This document details the dashboard steps required to configure and activate Google OAuth login for NaLI.

## Current Setup Status
`BLOCKED BY DASHBOARD CONFIG`

---

## 1. Google Cloud Console Configuration

To allow users to log in with Google, you must register NaLI as an OAuth 2.0 application in the Google Cloud Console:

1. Log in to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project for NaLI.
3. Navigate to **APIs & Services** -> **OAuth consent screen**:
   - Set User Type to **External**.
   - Fill in application details (App Name: `NaLI`, User support email, Developer contact email).
   - Set authorized domains: Add `supabase.co` and `vercel.app`.
4. Navigate to **APIs & Services** -> **Credentials**:
   - Click **Create Credentials** -> **OAuth client ID**.
   - Set Application type to **Web application**.
   - Add Authorized JavaScript origins:
     - `https://naliai.vercel.app`
     - `http://localhost:3000` (for local development testing)
   - Add Authorized redirect URIs:
     - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
5. Copy the generated **Client ID** and **Client Secret**.

---

## 2. Supabase Dashboard Activation

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. Navigate to **Authentication** -> **Providers**:
   - Select **Google** from the list of auth providers.
   - Toggle **Enable Google provider** to **On**.
   - Input the **Client ID** and **Client Secret** copied from the Google Cloud Console.
   - Leave "Skip nonce check" unchecked (for maximum security).
4. Save the configuration.
5. In **Authentication** -> **URL Configuration**:
   - Verify that **Site URL** is set to `https://naliai.vercel.app` (or your custom domain).
   - In **Redirect URLs**, add:
     - `https://naliai.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

---

## 3. Production Environment Variables (Vercel)

Ensure the following environment variable is configured in Vercel to activate the Google button interface:

```env
NEXT_PUBLIC_GOOGLE_OAUTH_ACTIVE=true
```

If this variable is not set or set to `false`, the application will display a clean warning in the UI:
`"Login Google belum dikonfigurasi. Hubungi admin."`
rather than displaying raw API/Supabase authorization errors to the user.
