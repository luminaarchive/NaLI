# Google OAuth Setup for NaLI

## Step 1: Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create project or select existing one
3. Go to APIs & Services > Credentials
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Application type: Web application
6. Name: NaLI Production
7. Authorized redirect URIs — add BOTH:
   - https://wvpplfjrbndzxlgpuicn.supabase.co/auth/v1/callback
   - http://localhost:3000/auth/callback (for local dev)
8. Save. Copy Client ID and Client Secret.

## Step 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard/project/wvpplfjrbndzxlgpuicn
2. Authentication > Providers > Google
3. Toggle Enable to ON
4. Paste Client ID and Client Secret
5. Save

## Step 3: Verify
Open naliai.vercel.app/login and click "Lanjutkan dengan Google"
